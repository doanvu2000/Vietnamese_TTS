from __future__ import annotations

import os
from dataclasses import dataclass

from .errors import ApiError


@dataclass(slots=True)
class AppConfig:
    host: str = "127.0.0.1"
    port: int = 8000
    request_timeout_seconds: float = 30.0
    allow_lan: bool = False
    version: str = "0.1.0"
    engine_mode: str = "turbo"
    engine_backend: str = "mock"
    vieneu_backbone_repo: str = "pnnbao-ump/VieNeu-TTS-v2-Turbo-GGUF"
    vieneu_backbone_filename: str = "vieneu-tts-v2-turbo.gguf"
    vieneu_decoder_repo: str = "pnnbao-ump/VieNeu-Codec"
    vieneu_decoder_filename: str = "vieneu_decoder.onnx"
    vieneu_encoder_repo: str = "pnnbao-ump/VieNeu-Codec"
    vieneu_encoder_filename: str = "vieneu_encoder.onnx"
    hf_token: str | None = None

    @classmethod
    def from_env(cls) -> "AppConfig":
        config = cls(
            host=os.getenv("TTS_API_HOST", "127.0.0.1"),
            port=int(os.getenv("TTS_API_PORT", "8000")),
            request_timeout_seconds=float(os.getenv("TTS_REQUEST_TIMEOUT_SECONDS", "30")),
            allow_lan=os.getenv("TTS_ALLOW_LAN", "false").lower() in {"1", "true", "yes", "on"},
            version=os.getenv("TTS_API_VERSION", "0.1.0"),
            engine_mode=os.getenv("TTS_ENGINE_MODE", "turbo"),
            engine_backend=os.getenv("TTS_ENGINE_BACKEND", "mock"),
            vieneu_backbone_repo=os.getenv("TTS_VIENEU_BACKBONE_REPO", "pnnbao-ump/VieNeu-TTS-v2-Turbo-GGUF"),
            vieneu_backbone_filename=os.getenv("TTS_VIENEU_BACKBONE_FILENAME", "vieneu-tts-v2-turbo.gguf"),
            vieneu_decoder_repo=os.getenv("TTS_VIENEU_DECODER_REPO", "pnnbao-ump/VieNeu-Codec"),
            vieneu_decoder_filename=os.getenv("TTS_VIENEU_DECODER_FILENAME", "vieneu_decoder.onnx"),
            vieneu_encoder_repo=os.getenv("TTS_VIENEU_ENCODER_REPO", "pnnbao-ump/VieNeu-Codec"),
            vieneu_encoder_filename=os.getenv("TTS_VIENEU_ENCODER_FILENAME", "vieneu_encoder.onnx"),
            hf_token=os.getenv("HF_TOKEN"),
        )
        config.validate()
        return config

    def validate(self) -> None:
        local_hosts = {"127.0.0.1", "localhost"}
        if self.host not in local_hosts and not self.allow_lan:
            raise ApiError(
                code="VALIDATION_ERROR",
                message="LAN dev mode chưa được bật. Chỉ được bind 127.0.0.1 hoặc localhost.",
                status_code=400,
                details={"host": self.host},
            )
