from __future__ import annotations

import os
import tempfile
import unittest
import warnings
from pathlib import Path
from unittest import mock

from scripts import start_vieneu


class StartVieneuTests(unittest.TestCase):
    def create_model_dir(self, *, include_encoder: bool = True) -> Path:
        temp_dir = Path(tempfile.mkdtemp())
        (temp_dir / "vieneu-tts-v2-turbo.gguf").write_bytes(b"gguf")
        (temp_dir / "vieneu_decoder.onnx").write_bytes(b"onnx")
        (temp_dir / "voices.json").write_text("{}", encoding="utf-8")
        if include_encoder:
            (temp_dir / "vieneu_encoder.onnx").write_bytes(b"onnx")
        return temp_dir

    def test_validate_model_paths_success(self) -> None:
        model_dir = self.create_model_dir()
        paths = start_vieneu.validate_model_paths(
            model_dir,
            backbone_file="vieneu-tts-v2-turbo.gguf",
            decoder_file="vieneu_decoder.onnx",
            encoder_file="vieneu_encoder.onnx",
        )
        self.assertEqual(paths["backbone"], model_dir / "vieneu-tts-v2-turbo.gguf")
        self.assertEqual(paths["decoder"], model_dir / "vieneu_decoder.onnx")
        self.assertEqual(paths["encoder"], model_dir / "vieneu_encoder.onnx")

    def test_validate_model_paths_missing_required_file(self) -> None:
        model_dir = self.create_model_dir()
        (model_dir / "voices.json").unlink()

        with self.assertRaises(FileNotFoundError) as context:
            start_vieneu.validate_model_paths(
                model_dir,
                backbone_file="vieneu-tts-v2-turbo.gguf",
                decoder_file="vieneu_decoder.onnx",
                encoder_file="vieneu_encoder.onnx",
            )

        self.assertIn("Voices not found", str(context.exception))
        self.assertIn(str(model_dir / "voices.json"), str(context.exception))

    def test_validate_model_paths_warns_when_encoder_missing(self) -> None:
        model_dir = self.create_model_dir(include_encoder=False)

        with warnings.catch_warnings(record=True) as captured:
            warnings.simplefilter("always")
            start_vieneu.validate_model_paths(
                model_dir,
                backbone_file="vieneu-tts-v2-turbo.gguf",
                decoder_file="vieneu_decoder.onnx",
                encoder_file="vieneu_encoder.onnx",
            )

        self.assertEqual(len(captured), 1)
        self.assertIn("Encoder ONNX not found", str(captured[0].message))

    def test_configure_environment(self) -> None:
        model_dir = self.create_model_dir()
        paths = start_vieneu.validate_model_paths(
            model_dir,
            backbone_file="vieneu-tts-v2-turbo.gguf",
            decoder_file="vieneu_decoder.onnx",
            encoder_file="vieneu_encoder.onnx",
        )

        with mock.patch.dict(os.environ, {}, clear=True):
            start_vieneu.configure_environment(host="0.0.0.0", port=9000, paths=paths)
            self.assertEqual(os.environ["TTS_ENGINE_BACKEND"], "vieneu")
            self.assertEqual(os.environ["TTS_API_HOST"], "0.0.0.0")
            self.assertEqual(os.environ["TTS_API_PORT"], "9000")
            self.assertEqual(os.environ["TTS_VIENEU_BACKBONE_REPO"], str(paths["backbone"]))

    def test_main_resolves_model_dir_and_invokes_server(self) -> None:
        model_dir = self.create_model_dir()

        with mock.patch.dict(os.environ, {}, clear=True):
            with mock.patch("backend.server.main") as server_main:
                exit_code = start_vieneu.main(
                    [
                        "--model-dir",
                        str(model_dir),
                        "--host",
                        "127.0.0.1",
                        "--port",
                        "8010",
                    ]
                )
                self.assertEqual(os.environ["TTS_API_PORT"], "8010")

        self.assertEqual(exit_code, 0)
        server_main.assert_called_once_with()

    def test_resolve_model_dir_defaults_from_repo_root(self) -> None:
        expected = (start_vieneu.resolve_repo_root() / "models" / "vieneu").resolve()
        self.assertEqual(start_vieneu.resolve_model_dir(None), expected)


if __name__ == "__main__":
    unittest.main()
