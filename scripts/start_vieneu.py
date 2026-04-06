from __future__ import annotations

import argparse
import os
import sys
import warnings
from pathlib import Path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Start local Vietnamese TTS API with VieNeu backend.",
    )
    parser.add_argument(
        "--model-dir",
        default=None,
        help="Thu muc chua model local. Mac dinh la models/vieneu tinh tu root repo.",
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host bind API.")
    parser.add_argument("--port", type=int, default=8000, help="Port bind API.")
    parser.add_argument(
        "--backbone-file",
        default="vieneu-tts-v2-turbo.gguf",
        help="Ten file backbone GGUF.",
    )
    parser.add_argument(
        "--decoder-file",
        default="vieneu_decoder.onnx",
        help="Ten file decoder ONNX.",
    )
    parser.add_argument(
        "--encoder-file",
        default="vieneu_encoder.onnx",
        help="Ten file encoder ONNX.",
    )
    return parser


def resolve_repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def resolve_model_dir(model_dir: str | None) -> Path:
    if model_dir:
        return Path(model_dir).expanduser().resolve()
    return (resolve_repo_root() / "models" / "vieneu").resolve()


def validate_model_paths(
    model_dir: Path,
    *,
    backbone_file: str,
    decoder_file: str,
    encoder_file: str,
) -> dict[str, Path]:
    paths = {
        "backbone": model_dir / backbone_file,
        "decoder": model_dir / decoder_file,
        "encoder": model_dir / encoder_file,
        "voices": model_dir / "voices.json",
    }

    required = (
        ("Turbo GGUF", paths["backbone"]),
        ("Decoder ONNX", paths["decoder"]),
        ("Voices", paths["voices"]),
    )
    for label, path in required:
        if not path.exists():
            raise FileNotFoundError(f"{label} not found: {path}")

    if not paths["encoder"].exists():
        warnings.warn(
            f"Encoder ONNX not found: {paths['encoder']}\nClone voice co the bi gioi han trong turbo mode.",
            stacklevel=2,
        )

    return paths


def configure_environment(*, host: str, port: int, paths: dict[str, Path]) -> None:
    os.environ["TTS_ENGINE_BACKEND"] = "vieneu"
    os.environ["TTS_API_HOST"] = host
    os.environ["TTS_API_PORT"] = str(port)
    os.environ["TTS_VIENEU_BACKBONE_REPO"] = str(paths["backbone"])
    os.environ["TTS_VIENEU_BACKBONE_FILENAME"] = str(paths["backbone"])
    os.environ["TTS_VIENEU_DECODER_REPO"] = str(paths["decoder"])
    os.environ["TTS_VIENEU_DECODER_FILENAME"] = str(paths["decoder"])
    os.environ["TTS_VIENEU_ENCODER_REPO"] = str(paths["encoder"])
    os.environ["TTS_VIENEU_ENCODER_FILENAME"] = str(paths["encoder"])


def main(argv: list[str] | None = None) -> int:
    repo_root = resolve_repo_root()
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))

    parser = build_parser()
    args = parser.parse_args(argv)

    model_dir = resolve_model_dir(args.model_dir)
    paths = validate_model_paths(
        model_dir,
        backbone_file=args.backbone_file,
        decoder_file=args.decoder_file,
        encoder_file=args.encoder_file,
    )
    configure_environment(host=args.host, port=args.port, paths=paths)

    print(f"Starting VieNeu local API with model dir: {model_dir}")
    print(f"Host: {args.host}")
    print(f"Port: {args.port}")

    from backend.server import main as server_main

    server_main()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
