from __future__ import annotations

import cgi
import json
import logging
import uuid
from dataclasses import dataclass
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from .config import AppConfig
from .engine import EngineService, is_supported_audio_file
from .errors import ApiError


LOGGER = logging.getLogger("tts_api")


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )


@dataclass(slots=True)
class AppContext:
    config: AppConfig
    engine_service: EngineService


def build_handler(context: AppContext):
    class TtsApiHandler(BaseHTTPRequestHandler):
        server_version = "VietnameseTTSLocalAPI/0.1"

        def do_OPTIONS(self) -> None:  # noqa: N802
            self.send_response(HTTPStatus.NO_CONTENT)
            self._send_cors_headers()
            self.end_headers()

        def do_GET(self) -> None:  # noqa: N802
            request_id = self._request_id()
            try:
                if self.path == "/health":
                    self._write_json(
                        HTTPStatus.OK,
                        context.engine_service.health(api_enabled=True),
                        request_id,
                    )
                    return

                if self.path == "/v1/voices":
                    self._write_json(
                        HTTPStatus.OK,
                        context.engine_service.list_voices(),
                        request_id,
                    )
                    return

                raise ApiError(
                    code="NOT_FOUND",
                    message="Endpoint không tồn tại.",
                    status_code=404,
                )
            except Exception as error:  # noqa: BLE001
                self._handle_error(error, request_id)

        def do_POST(self) -> None:  # noqa: N802
            request_id = self._request_id()
            try:
                if self.path == "/v1/synthesize":
                    payload = self._read_json()
                    audio_bytes = context.engine_service.synthesize(
                        text=self._required_text(payload, "text"),
                        voice_id=self._optional_text(payload, "voice_id"),
                        speed=self._parse_speed(payload.get("speed", 1.0)),
                        audio_format=self._parse_format(payload.get("format", "wav")),
                    )
                    self._write_audio(audio_bytes, request_id)
                    return

                if self.path == "/v1/clone":
                    form = self._read_multipart()
                    ref_audio = form["ref_audio"] if "ref_audio" in form else None
                    if ref_audio is None or not getattr(ref_audio, "filename", ""):
                        raise ApiError(
                            code="VALIDATION_ERROR",
                            message="ref_audio là bắt buộc.",
                            status_code=400,
                        )

                    if not is_supported_audio_file(ref_audio.filename, ref_audio.type or ""):
                        raise ApiError(
                            code="UNSUPPORTED_AUDIO",
                            message="ref_audio phải là file .wav, .mp3 hoặc .m4a.",
                            status_code=400,
                            details={"filename": ref_audio.filename},
                        )

                    audio_bytes = context.engine_service.clone(
                        text=self._required_form_text(form, "text"),
                        ref_text=self._required_form_text(form, "ref_text"),
                        ref_audio_name=ref_audio.filename,
                        ref_audio_bytes=ref_audio.file.read(),
                        speed=self._parse_speed(self._optional_form_text(form, "speed", "1.0")),
                        audio_format=self._parse_format(self._optional_form_text(form, "format", "wav")),
                    )
                    self._write_audio(audio_bytes, request_id)
                    return

                raise ApiError(
                    code="NOT_FOUND",
                    message="Endpoint không tồn tại.",
                    status_code=404,
                )
            except Exception as error:  # noqa: BLE001
                self._handle_error(error, request_id)

        def log_message(self, format: str, *args) -> None:  # noqa: A003
            LOGGER.info("%s - %s", self.address_string(), format % args)

        def _read_json(self) -> dict[str, object]:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length)
            if not raw_body:
                raise ApiError(
                    code="VALIDATION_ERROR",
                    message="Body JSON không được để trống.",
                    status_code=400,
                )

            try:
                payload = json.loads(raw_body.decode("utf-8"))
            except json.JSONDecodeError as error:
                raise ApiError(
                    code="VALIDATION_ERROR",
                    message="Body JSON không hợp lệ.",
                    status_code=400,
                ) from error

            if not isinstance(payload, dict):
                raise ApiError(
                    code="VALIDATION_ERROR",
                    message="Body phải là JSON object.",
                    status_code=400,
                )

            return payload

        def _read_multipart(self):
            content_type = self.headers.get("Content-Type", "")
            if "multipart/form-data" not in content_type:
                raise ApiError(
                    code="VALIDATION_ERROR",
                    message="Content-Type phải là multipart/form-data.",
                    status_code=400,
                )

            return cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={
                    "REQUEST_METHOD": "POST",
                    "CONTENT_TYPE": content_type,
                },
            )

        def _required_text(self, payload: dict[str, object], field: str) -> str:
            value = str(payload.get(field, "")).strip()
            if not value:
                raise ApiError(
                    code="VALIDATION_ERROR",
                    message=f"{field} is required",
                    status_code=400,
                )
            return value

        def _optional_text(self, payload: dict[str, object], field: str) -> str | None:
            value = str(payload.get(field, "")).strip()
            return value or None

        def _required_form_text(self, form, field: str) -> str:
            value = self._optional_form_text(form, field, "")
            if not value:
                raise ApiError(
                    code="VALIDATION_ERROR",
                    message=f"{field} is required",
                    status_code=400,
                )
            return value

        def _optional_form_text(self, form, field: str, default: str = "") -> str:
            value = form.getfirst(field, default)
            return str(value).strip()

        def _parse_speed(self, value: object) -> float:
            try:
                speed = float(value)
            except (TypeError, ValueError) as error:
                raise ApiError(
                    code="VALIDATION_ERROR",
                    message="speed phải là số hợp lệ.",
                    status_code=400,
                ) from error

            if speed <= 0:
                raise ApiError(
                    code="VALIDATION_ERROR",
                    message="speed phải lớn hơn 0.",
                    status_code=400,
                )

            return speed

        def _parse_format(self, value: object) -> str:
            audio_format = str(value or "wav").strip().lower()
            if audio_format != "wav":
                raise ApiError(
                    code="VALIDATION_ERROR",
                    message="MVP hiện chỉ hỗ trợ format wav.",
                    status_code=400,
                    details={"format": audio_format},
                )
            return audio_format

        def _write_audio(self, audio_bytes: bytes, request_id: str) -> None:
            self.send_response(HTTPStatus.OK)
            self._send_cors_headers()
            self.send_header("Content-Type", "audio/wav")
            self.send_header("Content-Length", str(len(audio_bytes)))
            self.send_header("X-Request-Id", request_id)
            self.end_headers()
            self.wfile.write(audio_bytes)

        def _write_json(self, status: int, payload: dict[str, object], request_id: str) -> None:
            body = json.dumps(payload).encode("utf-8")
            self.send_response(status)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("X-Request-Id", request_id)
            self.end_headers()
            self.wfile.write(body)

        def _handle_error(self, error: Exception, request_id: str) -> None:
            api_error = error if isinstance(error, ApiError) else ApiError(
                code="INTERNAL_ERROR",
                message="Lỗi nội bộ khi xử lý request.",
                status_code=500,
            )
            LOGGER.exception(
                "request_failed request_id=%s path=%s code=%s message=%s",
                request_id,
                self.path,
                api_error.code,
                api_error.message,
            )
            self._write_json(api_error.status_code, api_error.to_payload(request_id), request_id)

        def _request_id(self) -> str:
            return self.headers.get("X-Request-Id", f"req-{uuid.uuid4().hex[:12]}")

        def _send_cors_headers(self) -> None:
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Request-Id")

    return TtsApiHandler


class LocalTtsApiServer:
    def __init__(self, config: AppConfig | None = None) -> None:
        self.config = config or AppConfig.from_env()
        self.context = AppContext(
            config=self.config,
            engine_service=EngineService(self.config),
        )
        self._server = ThreadingHTTPServer(
            (self.config.host, self.config.port),
            build_handler(self.context),
        )

    @property
    def server_address(self) -> tuple[str, int]:
        host, port = self._server.server_address[:2]
        return str(host), int(port)

    def serve_forever(self) -> None:
        LOGGER.info(
            "tts_api_started host=%s port=%s backend=%s timeout=%s",
            self.config.host,
            self.config.port,
            self.config.engine_backend,
            self.config.request_timeout_seconds,
        )
        self._server.serve_forever()

    def shutdown(self) -> None:
        self._server.shutdown()
        self._server.server_close()
