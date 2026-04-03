# Sprint PRD: Desktop Sprint 03 - Local API MVP

> PRD tổng: [desktop-local-first-prd.md](../desktop-local-first-prd.md)

## 1. Mục tiêu sprint
- Expose local HTTP API dùng chung engine với desktop shell để Android hoặc client khác gọi được.

## 2. Phụ thuộc
- Hoàn tất [desktop-sprint-01-foundation.md](./desktop-sprint-01-foundation.md)
- Nên hoàn tất [desktop-sprint-02-audio-workflow.md](./desktop-sprint-02-audio-workflow.md) để tái dùng flow inference ổn định

## 3. Phạm vi
- Triển khai 4 endpoint:
  - `GET /health`
  - `GET /v1/voices`
  - `POST /v1/synthesize`
  - `POST /v1/clone`
- Chuẩn hóa lỗi JSON.
- Dùng cùng adapter và job queue với UI.
- Cho bật/tắt API từ desktop app.

## 4. Không làm trong sprint này
- Public Internet exposure.
- Auth/phân quyền.
- Streaming audio chunk-by-chunk.

## 5. Deliverables
- API bind mặc định `127.0.0.1`.
- Android emulator hoặc client mẫu gọi được cả 4 endpoint.
- Error schema ổn định, có `request_id`.

## 6. Công việc triển khai
### 6.1 API host lifecycle
- Tạo local server gắn với app lifecycle.
- Đồng bộ state bật/tắt API với settings.

### 6.2 Endpoint implementation
- Trả `health` và `voices` theo schema PRD tổng.
- `synthesize` trả WAV binary.
- `clone` nhận multipart và trả WAV binary.

### 6.3 Error handling
- Normalize các lỗi:
  - `VALIDATION_ERROR`
  - `ENGINE_NOT_READY`
  - `UNSUPPORTED_AUDIO`
  - `INFERENCE_FAILED`
  - `TIMEOUT`
  - `INTERNAL_ERROR`

### 6.4 Logging và timeout
- Gắn `request_id` cho từng request.
- Thêm timeout cho inference request.

## 7. Acceptance criteria
- `GET /health` và `GET /v1/voices` trả đúng schema.
- `POST /v1/synthesize` và `POST /v1/clone` trả WAV hợp lệ với input đúng.
- Input thiếu `text` hoặc audio lỗi trả JSON lỗi chuẩn hóa.
- Một request timeout hoặc fail không làm hỏng request sau.

## 8. Điều kiện hoàn thành
- Có sample request để Android team dùng ngay.
- API không tạo model instance mới cho từng request.
