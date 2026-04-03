# Skill: android-kotlin-xml-tts-client

## Trigger
- Dùng khi tích hợp TTS vào app Android Kotlin XML.
- Dùng khi triển khai networking, upload audio mẫu, playback, cache hoặc UI state cho màn hình TTS.

## Mục tiêu
- Tạo Android client ổn định cho backend TTS mà không phụ thuộc native engine.
- Giữ flow đơn giản, dễ nhúng vào app Android hiện hữu.

## Input cần có
- PRD Android integration.
- Base URL mục tiêu.
- Contract API backend.
- Quyết định màn hình sẽ dùng `Fragment` hay `Activity`.

## Checklist bắt buộc
- Dùng `ViewModel + Repository`.
- Dùng Retrofit/OkHttp cho HTTP.
- Map JSON lỗi backend thành model lỗi nội bộ.
- Có các UI state:
  - `idle`
  - `loading`
  - `success`
  - `empty`
  - `error`
- Dùng picker hiện đại để chọn audio mẫu.
- Upload `multipart/form-data` đúng field name.
- Lưu WAV trả về vào cache file trước khi playback.
- Retry có giới hạn cho lỗi mạng tạm thời.
- Không retry cho validation error hoặc `4xx`.

## Nguyên tắc không được vi phạm
- Không nhét logic mạng trực tiếp trong `Activity` hoặc `Fragment`.
- Không giữ binary audio lớn lâu trong memory nếu có thể lưu file cache.
- Không hardcode base URL trong nhiều nơi.
- Không chặn UI thread khi đọc file hoặc phát audio.
- Không giả định backend luôn chạy trên `localhost`; phải hỗ trợ emulator, LAN hoặc server URL.

## Output kỳ vọng
- Màn hình Android có thể:
  - load health/voices
  - synthesize bằng preset
  - clone bằng audio mẫu + `ref_text`
  - phát lại audio kết quả
  - hiển thị lỗi ổn định
- Có lớp cấu hình rõ để đổi backend mà không sửa luồng nghiệp vụ.

## Definition of done
- Chạy được end-to-end trên emulator hoặc thiết bị thật với backend hợp lệ.
- Lỗi backend hoặc lỗi mạng không làm crash app.
- UI state chuyển đúng trong success path và error path.
