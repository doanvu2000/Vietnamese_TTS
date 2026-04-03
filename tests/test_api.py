from __future__ import annotations

import http.client
import json
import threading
import time
import unittest
import uuid

from backend.api_server import LocalTtsApiServer, configure_logging
from backend.config import AppConfig


def build_multipart(fields: dict[str, str], file_field: tuple[str, str, bytes, str]) -> tuple[bytes, str]:
    boundary = f"----CodexBoundary{uuid.uuid4().hex}"
    chunks: list[bytes] = []

    for key, value in fields.items():
        chunks.extend(
            [
                f"--{boundary}\r\n".encode(),
                f'Content-Disposition: form-data; name="{key}"\r\n\r\n'.encode(),
                value.encode(),
                b"\r\n",
            ]
        )

    field_name, filename, content, content_type = file_field
    chunks.extend(
        [
            f"--{boundary}\r\n".encode(),
            f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'.encode(),
            f"Content-Type: {content_type}\r\n\r\n".encode(),
            content,
            b"\r\n",
            f"--{boundary}--\r\n".encode(),
        ]
    )
    return b"".join(chunks), boundary


class LocalApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        configure_logging()
        cls.server = LocalTtsApiServer(
            AppConfig(host="127.0.0.1", port=0, request_timeout_seconds=5)
        )
        cls.host, cls.port = cls.server.server_address
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        time.sleep(0.1)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.thread.join(timeout=2)

    def request(
        self,
        method: str,
        path: str,
        body: bytes | None = None,
        headers: dict[str, str] | None = None,
    ) -> tuple[int, dict[str, str], bytes]:
        connection = http.client.HTTPConnection(self.host, self.port, timeout=5)
        connection.request(method, path, body=body, headers=headers or {})
        response = connection.getresponse()
        payload = response.read()
        response_headers = {key.lower(): value for key, value in response.getheaders()}
        connection.close()
        return response.status, response_headers, payload

    def test_health(self) -> None:
        status, headers, payload = self.request("GET", "/health")
        self.assertEqual(status, 200)
        self.assertEqual(headers["content-type"], "application/json; charset=utf-8")
        body = json.loads(payload.decode())
        self.assertEqual(body["status"], "ok")
        self.assertTrue(body["model_loaded"])

    def test_voices(self) -> None:
        status, _, payload = self.request("GET", "/v1/voices")
        self.assertEqual(status, 200)
        body = json.loads(payload.decode())
        self.assertGreaterEqual(len(body["voices"]), 1)
        self.assertEqual(body["voices"][0]["language"], "vi")

    def test_synthesize_returns_wav(self) -> None:
        payload = json.dumps(
            {
                "text": "Xin chao Anh",
                "voice_id": "xuan_vinh",
                "speed": 1.0,
                "format": "wav",
            }
        ).encode()
        status, headers, body = self.request(
            "POST",
            "/v1/synthesize",
            body=payload,
            headers={"Content-Type": "application/json"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(headers["content-type"], "audio/wav")
        self.assertTrue(body.startswith(b"RIFF"))

    def test_clone_returns_wav(self) -> None:
        body, boundary = build_multipart(
            {
                "text": "Noi dung moi",
                "ref_text": "Mau tham chieu",
                "speed": "1.0",
                "format": "wav",
            },
            ("ref_audio", "sample.wav", b"RIFFdemoaudio", "audio/wav"),
        )
        status, headers, response_body = self.request(
            "POST",
            "/v1/clone",
            body=body,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(headers["content-type"], "audio/wav")
        self.assertTrue(response_body.startswith(b"RIFF"))

    def test_validation_error(self) -> None:
        payload = json.dumps({"text": "", "format": "wav"}).encode()
        status, _, body = self.request(
            "POST",
            "/v1/synthesize",
            body=payload,
            headers={"Content-Type": "application/json"},
        )
        self.assertEqual(status, 400)
        data = json.loads(body.decode())
        self.assertEqual(data["error"]["code"], "VALIDATION_ERROR")
        self.assertIn("request_id", data["error"])


if __name__ == "__main__":
    unittest.main()
