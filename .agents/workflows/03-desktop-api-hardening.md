# Workflow 03: Desktop API Hardening

## Mục tiêu
- Expose local HTTP API ổn định từ desktop app để Android và client khác dùng.

## Prerequisite
- Hoàn tất workflow `02-desktop-mvp-build`.
- Desktop shell đã synthesize và clone ổn định.

## Các bước
### Bước 1: Dựng API server dùng chung engine
- Tạo server nội bộ và bind mặc định `127.0.0.1`.
- Dùng chung adapter/job queue với desktop shell.
- Artifact đầu ra:
  - `GET /health`
  - `GET /v1/voices`

### Bước 2: Mở synthesize endpoint
- Thêm `POST /v1/synthesize`.
- Validate input và trả WAV binary.
- Artifact đầu ra:
  - synthesize endpoint qua client mẫu

### Bước 3: Mở clone endpoint
- Thêm `POST /v1/clone` multipart.
- Validate audio mẫu, normalize lỗi.
- Artifact đầu ra:
  - clone endpoint qua client mẫu

### Bước 4: Timeout, logging, cancellation
- Thêm timeout server-side.
- Gắn `request_id` và structured logging.
- Đảm bảo request hỏng không phá state engine.
- Artifact đầu ra:
  - error path ổn định

### Bước 5: LAN dev mode
- Cho phép opt-in bind host khác `127.0.0.1`.
- Hiển thị cảnh báo rõ trong UI/settings.
- Artifact đầu ra:
  - hướng dẫn dev cho emulator, LAN IP hoặc server URL

## Checkpoint kỹ thuật
- Cả 4 endpoint đúng contract.
- Success path và error path đều có smoke test.
- Request timeout xong vẫn xử lý được request tiếp theo.

## Điều kiện dừng
- Dừng nếu schema lỗi chưa ổn định.
- Dừng nếu API dùng engine tách rời khỏi desktop shell.

## Handoff
- Bàn giao base URL, sample requests và known limitations cho workflow `04-android-mvp-integration`.
