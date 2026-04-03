# Vietnamese TTS Local API

Backend local để web app gọi đúng contract PRD desktop/web.

## Chạy server

```powershell
py -3 -m backend.server
```

Server mặc định bind `127.0.0.1:8000`.

## Biến môi trường

- `TTS_API_HOST`: host bind, mặc định `127.0.0.1`
- `TTS_API_PORT`: port bind, mặc định `8000`
- `TTS_REQUEST_TIMEOUT_SECONDS`: timeout inference, mặc định `30`
- `TTS_ALLOW_LAN`: phải bật `true` nếu bind host khác localhost
- `TTS_ENGINE_BACKEND`: `mock` mặc định, ngoài ra hỗ trợ `vieneu`, `auto`
- `HF_TOKEN`: token Hugging Face nếu model riêng tư hoặc môi trường cần xác thực
- `TTS_VIENEU_BACKBONE_REPO`, `TTS_VIENEU_BACKBONE_FILENAME`
- `TTS_VIENEU_DECODER_REPO`, `TTS_VIENEU_DECODER_FILENAME`
- `TTS_VIENEU_ENCODER_REPO`, `TTS_VIENEU_ENCODER_FILENAME`

## Endpoint

- `GET /health`
- `GET /v1/voices`
- `POST /v1/synthesize`
- `POST /v1/clone`

## Smoke test

```powershell
py -3 -m unittest tests.test_api
```

## Chạy web demo

Mở thêm một terminal:

```powershell
py -3 -m http.server 8080 -d web
```

Sau đó mở `http://127.0.0.1:8080`.

Flow local:

1. Chạy API ở `127.0.0.1:8000`
2. Chạy static server cho thư mục `web/`
3. Mở web demo và bấm `Refresh`
4. Test `Synthesize` hoặc `Clone`

## Ghi chú

- `mock` là mặc định để web demo luôn lên ngay.
- `auto` sẽ ưu tiên SDK `vieneu` nếu máy đã cài và model truy cập được, nếu không sẽ fallback về mock.
- Nếu muốn ép dùng engine thật bằng model local, dùng script này:

```powershell
.\scripts\start-vieneu-local.ps1
```

- Thư mục model local nên có tối thiểu:
  `vieneu-tts-v2-turbo.gguf`
  `vieneu_decoder.onnx`
  `voices.json`
- Nếu muốn clone ổn định hơn, thêm:
  `vieneu_encoder.onnx`
- Nếu Anh muốn tự set env bằng tay, dùng mẫu ở [.env.vieneu.example](D:/work/python/Vietnamese_TTS/.env.vieneu.example).
- Model đã được tải vào [models/vieneu](D:/work/python/Vietnamese_TTS/models/vieneu), nên script trên chạy được ngay trong project hiện tại.
- Theo README upstream, SDK chính thức dùng `from vieneu import Vieneu`; local mode mặc định là Turbo, `list_preset_voices`, `get_preset_voice`, `infer`, `encode_reference` và `save` là các API tôi đã bám để tích hợp. Nguồn: [GitHub README](https://github.com/pnnbao97/VieNeu-TTS).
- Nếu môi trường không truy cập được Hugging Face, Anh có thể trỏ các biến `TTS_VIENEU_*` về repo/file model nội bộ hoặc local mirror tương ứng.
- Mock backend vẫn trả `audio/wav` hợp lệ để web demo gọi được ngay.
- `format` hiện chỉ hỗ trợ `wav`, đúng contract desktop MVP.
- Có thể thay mock adapter bằng tích hợp `VieNeu-TTS` thật trong `backend/engine.py`.
