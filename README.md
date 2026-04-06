# Vietnamese TTS Local API

Backend local để web app gọi đúng contract PRD desktop/web.

## Dùng web nhanh nhất

```powershell
# Neu may chua co Python/package, chay 1 lan:
.\scripts\setup_windows.cmd

# Terminal 1: chạy API với backend vieneu
py -3 scripts/start_vieneu.py

# Terminal 2: chạy web tĩnh
py -3 -m http.server 8080 -d web
```

Mở:

- Web demo: `http://127.0.0.1:8080`
- API mặc định: `http://127.0.0.1:8000`

Cách dùng nhanh:

1. Mở web demo.
2. Bấm `Refresh` để kiểm tra backend và tải danh sách voice.
3. Dùng `Flow 01 - Synthesize` để test text-to-speech nhanh.
4. Nếu cần, bấm `Hiện Flow 02` để mở phần `Clone Voice`.
5. Nghe trực tiếp ở block `Output` hoặc tải file WAV xuống.

Lưu ý:

- File cấu hình web đang trỏ sẵn API về `127.0.0.1:8000` trong [config.js](D:/work/python/Vietnamese_TTS/web/assets/js/config.js).
- `format` hiện hỗ trợ `wav`.
- Cách chạy ưu tiên trên Windows là `py -3 scripts/start_vieneu.py`.
- Nếu máy chưa có Python hoặc chưa cài package `vieneu`, chạy `.\scripts\setup_windows.cmd` trước.

## Biến môi trường

- `TTS_API_HOST`: host bind, mặc định `127.0.0.1`
- `TTS_API_PORT`: port bind, mặc định `8000`
- `TTS_REQUEST_TIMEOUT_SECONDS`: timeout inference, mặc định `180`
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
py -3 -m unittest tests.test_api tests.test_start_vieneu
```

## Ghi chú

- Launcher Python hỗ trợ:
  `--model-dir`, `--host`, `--port`, `--backbone-file`, `--decoder-file`, `--encoder-file`
- Bootstrap Windows sẽ:
  cài Python bằng `winget` nếu thiếu, nâng cấp `pip`, cài `requirements.txt` và `requirements-vieneu.txt`
- Có thể dùng:

```powershell
python scripts/start_vieneu.py
```

- Script PowerShell cũ vẫn giữ lại cho máy không bị chặn `ExecutionPolicy`:

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
- Nếu môi trường không truy cập được Hugging Face, Anh có thể trỏ các biến `TTS_VIENEU_*` về repo/file model nội bộ hoặc local mirror tương ứng.
