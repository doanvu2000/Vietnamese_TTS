from __future__ import annotations

import io
import importlib
import math
import os
import threading
import time
import wave
from dataclasses import asdict, dataclass
from queue import Queue

from .config import AppConfig
from .errors import ApiError


@dataclass(slots=True)
class Voice:
    id: str
    name: str
    type: str = "preset"
    language: str = "vi"


class BaseTtsAdapter:
    def list_voices(self) -> list[Voice]:
        raise NotImplementedError

    def synthesize(
        self,
        *,
        text: str,
        voice_id: str,
        speed: float,
        audio_format: str,
        cancel_event: threading.Event,
    ) -> bytes:
        raise NotImplementedError

    def clone(
        self,
        *,
        text: str,
        ref_text: str,
        ref_audio_name: str,
        ref_audio_bytes: bytes,
        speed: float,
        audio_format: str,
        cancel_event: threading.Event,
    ) -> bytes:
        raise NotImplementedError


class MockVieneuAdapter(BaseTtsAdapter):
    def __init__(self) -> None:
        self._voices = [
            Voice(id="xuan_vinh", name="Xuân Vĩnh"),
            Voice(id="mai_linh", name="Mai Linh"),
            Voice(id="minh_quan", name="Minh Quân"),
        ]

    def list_voices(self) -> list[Voice]:
        return list(self._voices)

    def synthesize(
        self,
        *,
        text: str,
        voice_id: str,
        speed: float,
        audio_format: str,
        cancel_event: threading.Event,
    ) -> bytes:
        return self._render_demo_wav(
            text=text,
            seed=f"synth:{voice_id}:{speed}",
            speed=speed,
            cancel_event=cancel_event,
        )

    def clone(
        self,
        *,
        text: str,
        ref_text: str,
        ref_audio_name: str,
        ref_audio_bytes: bytes,
        speed: float,
        audio_format: str,
        cancel_event: threading.Event,
    ) -> bytes:
        fingerprint = f"clone:{ref_audio_name}:{len(ref_audio_bytes)}:{ref_text}:{speed}"
        return self._render_demo_wav(
            text=text,
            seed=fingerprint,
            speed=speed,
            cancel_event=cancel_event,
        )

    def _render_demo_wav(
        self,
        *,
        text: str,
        seed: str,
        speed: float,
        cancel_event: threading.Event,
    ) -> bytes:
        sample_rate = 24000
        duration_seconds = min(max(len(text) / max(speed, 0.1) * 0.055, 0.8), 8.0)
        total_frames = int(sample_rate * duration_seconds)
        base_frequency = 170 + (sum(ord(ch) for ch in seed) % 180)
        amplitude = 11000
        buffer = io.BytesIO()

        with wave.open(buffer, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)

            frames = bytearray()
            fade_frames = min(sample_rate // 8, total_frames // 5 or 1)

            for index in range(total_frames):
                if cancel_event.is_set():
                    raise ApiError(
                        code="CANCELLED",
                        message="Yêu cầu suy luận đã bị hủy.",
                        status_code=499,
                    )

                if index % 2048 == 0:
                    time.sleep(0.001)

                fade = 1.0
                if index < fade_frames:
                    fade = index / fade_frames
                elif index > total_frames - fade_frames:
                    fade = max((total_frames - index) / fade_frames, 0.0)

                sample = int(
                    amplitude
                    * fade
                    * math.sin(2 * math.pi * base_frequency * index / sample_rate)
                )
                frames.extend(sample.to_bytes(2, byteorder="little", signed=True))

            wav_file.writeframes(frames)

        return buffer.getvalue()


class UnsupportedUpstreamAdapter(BaseTtsAdapter):
    def list_voices(self) -> list[Voice]:
        raise ApiError(
            code="ENGINE_NOT_READY",
            message="Backend upstream chưa được cắm vào repo hiện tại. Dùng mock adapter hoặc tích hợp VieNeu-TTS.",
            status_code=503,
        )

    def synthesize(self, **_: object) -> bytes:
        self.list_voices()
        raise AssertionError("unreachable")

    def clone(self, **_: object) -> bytes:
        self.list_voices()
        raise AssertionError("unreachable")


class VieneuSdkAdapter(BaseTtsAdapter):
    def __init__(self, config: AppConfig) -> None:
        try:
            vieneu_module = importlib.import_module("vieneu")
        except ModuleNotFoundError as error:
            raise ApiError(
                code="ENGINE_NOT_READY",
                message="Chưa cài SDK `vieneu`. Cài package này hoặc dùng mock backend.",
                status_code=503,
            ) from error

        try:
            self._sdk = vieneu_module.Vieneu(
                backbone_repo=config.vieneu_backbone_repo,
                backbone_filename=config.vieneu_backbone_filename,
                decoder_repo=config.vieneu_decoder_repo,
                decoder_filename=config.vieneu_decoder_filename,
                encoder_repo=config.vieneu_encoder_repo,
                encoder_filename=config.vieneu_encoder_filename,
                hf_token=config.hf_token,
            )
        except Exception as error:  # noqa: BLE001
            raise ApiError(
                code="ENGINE_NOT_READY",
                message="Không thể khởi tạo VieNeu-TTS. Kiểm tra model local/Hugging Face và dependency runtime.",
                status_code=503,
                details={"reason": str(error)},
            ) from error

    def list_voices(self) -> list[Voice]:
        voices = []
        for description, voice_id in self._sdk.list_preset_voices():
            voices.append(Voice(id=str(voice_id), name=str(description)))
        return voices

    def synthesize(
        self,
        *,
        text: str,
        voice_id: str,
        speed: float,
        audio_format: str,
        cancel_event: threading.Event,
    ) -> bytes:
        voice_payload = self._resolve_voice(voice_id)
        audio = self._sdk.infer(text=text, voice=voice_payload, speed=speed)
        return self._save_to_wav_bytes(audio)

    def clone(
        self,
        *,
        text: str,
        ref_text: str,
        ref_audio_name: str,
        ref_audio_bytes: bytes,
        speed: float,
        audio_format: str,
        cancel_event: threading.Event,
    ) -> bytes:
        temp_path = None
        try:
            import tempfile

            suffix = os.path.splitext(ref_audio_name)[1] or ".wav"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(ref_audio_bytes)
                temp_path = temp_file.name

            try:
                reference_voice = self._sdk.encode_reference(temp_path)
                audio = self._sdk.infer(text=text, voice=reference_voice, speed=speed)
            except TypeError:
                # Một số phiên bản upstream dùng ref_audio/ref_text trực tiếp.
                audio = self._sdk.infer(
                    text=text,
                    ref_audio=temp_path,
                    ref_text=ref_text,
                    speed=speed,
                )

            return self._save_to_wav_bytes(audio)
        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)

    def _resolve_voice(self, voice_id: str):
        try:
            return self._sdk.get_preset_voice(voice_id)
        except Exception as error:  # noqa: BLE001
            raise ApiError(
                code="VALIDATION_ERROR",
                message="voice_id không hợp lệ.",
                status_code=400,
                details={"voice_id": voice_id, "reason": str(error)},
            ) from error

    def _save_to_wav_bytes(self, audio) -> bytes:
        import tempfile

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_path = temp_file.name

        try:
            self._sdk.save(audio, temp_path)
            with open(temp_path, "rb") as saved_file:
                return saved_file.read()
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)


def build_adapter(config: AppConfig) -> BaseTtsAdapter:
    if config.engine_backend == "mock":
        return MockVieneuAdapter()
    if config.engine_backend == "vieneu":
        return VieneuSdkAdapter(config)
    if config.engine_backend == "auto":
        try:
            return VieneuSdkAdapter(config)
        except ApiError:
            return MockVieneuAdapter()
    return UnsupportedUpstreamAdapter()


class EngineService:
    def __init__(self, config: AppConfig) -> None:
        self._config = config
        self._adapter = build_adapter(config)
        self._lock = threading.RLock()
        self._state_lock = threading.Lock()
        self._default_voice = "xuan_vinh"
        self._model_loaded = not isinstance(self._adapter, UnsupportedUpstreamAdapter)
        self._current_request_id: str | None = None
        self._current_action: str | None = None
        self._current_cancel_event: threading.Event | None = None

    def health(self, *, api_enabled: bool) -> dict[str, object]:
        active_backend = "mock"
        if isinstance(self._adapter, VieneuSdkAdapter):
            active_backend = "vieneu"
        elif isinstance(self._adapter, UnsupportedUpstreamAdapter):
            active_backend = "unsupported"

        return {
            "status": "ok" if self._model_loaded else "error",
            "engine_mode": self._config.engine_mode,
            "engine_backend": self._config.engine_backend,
            "active_backend": active_backend,
            "model_loaded": self._model_loaded,
            "api_enabled": api_enabled,
            "version": self._config.version,
        }

    def list_voices(self) -> dict[str, object]:
        voices = [asdict(voice) for voice in self._adapter.list_voices()]
        if voices and self._default_voice not in {voice["id"] for voice in voices}:
            self._default_voice = str(voices[0]["id"])
        return {"voices": voices}

    def synthesize(
        self,
        *,
        request_id: str,
        text: str,
        voice_id: str | None,
        speed: float,
        audio_format: str,
    ) -> bytes:
        self._ensure_ready()
        selected_voice = voice_id or self._default_voice
        return self._run_with_timeout(
            lambda cancel_event: self._adapter.synthesize(
                text=text,
                voice_id=selected_voice,
                speed=speed,
                audio_format=audio_format,
                cancel_event=cancel_event,
            ),
            request_id=request_id,
            action="synthesize",
        )

    def clone(
        self,
        *,
        request_id: str,
        text: str,
        ref_text: str,
        ref_audio_name: str,
        ref_audio_bytes: bytes,
        speed: float,
        audio_format: str,
    ) -> bytes:
        self._ensure_ready()
        return self._run_with_timeout(
            lambda cancel_event: self._adapter.clone(
                text=text,
                ref_text=ref_text,
                ref_audio_name=ref_audio_name,
                ref_audio_bytes=ref_audio_bytes,
                speed=speed,
                audio_format=audio_format,
                cancel_event=cancel_event,
            ),
            request_id=request_id,
            action="clone",
        )

    def cancel_current(self, request_id: str | None = None) -> dict[str, object]:
        with self._state_lock:
            current_cancel_event = self._current_cancel_event
            current_request_id = self._current_request_id
            current_action = self._current_action

            if current_cancel_event is None or current_request_id is None or current_action is None:
                return {
                    "cancelled": False,
                    "request_id": request_id or "",
                    "message": "Không có request đang chạy.",
                }

            if request_id and request_id != current_request_id:
                return {
                    "cancelled": False,
                    "request_id": current_request_id,
                    "message": "Request đang chạy không khớp với request_id cần hủy.",
                }

            current_cancel_event.set()
            return {
                "cancelled": True,
                "request_id": current_request_id,
                "action": current_action,
                "message": "Đã gửi lệnh hủy tới backend.",
            }

    def _ensure_ready(self) -> None:
        if not self._model_loaded:
            raise ApiError(
                code="ENGINE_NOT_READY",
                message="Engine chưa sẵn sàng để xử lý request.",
                status_code=503,
            )

    def _run_with_timeout(self, operation, *, request_id: str, action: str) -> bytes:
        result_queue: Queue[object] = Queue(maxsize=1)
        cancel_event = threading.Event()

        def worker() -> None:
            try:
                with self._lock:
                    result_queue.put(operation(cancel_event))
            except Exception as error:  # noqa: BLE001
                result_queue.put(error)

        thread = threading.Thread(target=worker, daemon=True)
        with self._state_lock:
            self._current_request_id = request_id
            self._current_action = action
            self._current_cancel_event = cancel_event
        thread.start()
        thread.join(timeout=self._config.request_timeout_seconds)

        try:
            if thread.is_alive():
                cancel_event.set()
                raise ApiError(
                    code="TIMEOUT",
                    message="Suy luận vượt quá thời gian chờ của server.",
                    status_code=504,
                )

            result = result_queue.get()
            if isinstance(result, Exception):
                if isinstance(result, ApiError):
                    raise result
                raise ApiError(
                    code="INFERENCE_FAILED",
                    message="Không thể tạo audio từ engine TTS.",
                    status_code=500,
                    details={"reason": str(result)},
                ) from result

            return result
        finally:
            with self._state_lock:
                if self._current_request_id == request_id:
                    self._current_request_id = None
                    self._current_action = None
                    self._current_cancel_event = None


def is_supported_audio_file(filename: str, content_type: str) -> bool:
    allowed_extensions = {".wav", ".mp3", ".m4a"}
    _, extension = os.path.splitext(filename.lower())
    if extension in allowed_extensions:
        return True
    return content_type.startswith("audio/")
