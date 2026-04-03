# Workflow 04: Android MVP Integration

## Mục tiêu
- Tích hợp app Android Kotlin XML với desktop/server API để ra tính năng TTS usable.

## Prerequisite
- Hoàn tất workflow `03-desktop-api-hardening`.
- Có base URL dev ổn định và sample requests.

## Các bước
### Bước 1: Dựng lớp network và config
- Tạo `Retrofit`, `OkHttp`, model request/response, error mapper.
- Tạo cấu hình base URL cho emulator, LAN hoặc server.
- Artifact đầu ra:
  - Android client gọi được `health`

### Bước 2: Load voices và trạng thái backend
- Gọi `GET /v1/voices`.
- Map vào UI picker hoặc danh sách.
- Artifact đầu ra:
  - màn hình load voices thành công

### Bước 3: Tích hợp synthesize
- Submit text + voice preset.
- Lưu WAV trả về vào cache file.
- Artifact đầu ra:
  - synthesize path phát lại được trên Android

### Bước 4: Tích hợp clone giọng
- Chọn audio mẫu bằng picker.
- Upload multipart với `ref_text`.
- Artifact đầu ra:
  - clone path chạy được từ Android

### Bước 5: Hoàn thiện UX lỗi và retry
- Thêm state `idle/loading/success/empty/error`.
- Retry có giới hạn cho lỗi mạng tạm thời.
- Artifact đầu ra:
  - màn hình ổn định ở success và error path

## Checkpoint kỹ thuật
- Không có logic mạng trực tiếp trong XML controller.
- Audio playback đọc từ cache file.
- Emulator local và LAN backend đều có thể cấu hình được.

## Điều kiện dừng
- Dừng nếu synthesize success path chưa chạy trên emulator hoặc thiết bị thật.
- Dừng nếu clone path chưa gửi đúng multipart field.

## Handoff
- Bàn giao app Android MVP chạy được cho kiểm thử tích hợp.
- Ghi lại backlog cho native phase nếu cần.
