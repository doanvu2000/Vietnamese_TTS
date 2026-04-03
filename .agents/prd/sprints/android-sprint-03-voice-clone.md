# Sprint PRD: Android Sprint 03 - Voice Cloning

> PRD tổng: [android-integration-prd.md](../android-integration-prd.md)

## 1. Mục tiêu sprint
- Bổ sung luồng upload audio mẫu và clone giọng trên Android.

## 2. Phụ thuộc
- Hoàn tất [android-sprint-02-synthesize-playback.md](./android-sprint-02-synthesize-playback.md)

## 3. Phạm vi
- Chọn audio mẫu bằng picker hiện đại.
- Nhập `ref_text`.
- Gửi `POST /v1/clone` dạng multipart.
- Nhận WAV, lưu cache và playback như synthesize flow.

## 4. Không làm trong sprint này
- Streaming upload.
- Native on-device.

## 5. Deliverables
- Clone giọng từ Android hoạt động end-to-end.
- Xử lý lỗi file audio hoặc `ref_text` thiếu ổn định.

## 6. Công việc triển khai
### 6.1 File picking
- Dùng SAF hoặc picker hiện đại.
- Không yêu cầu quyền storage toàn cục nếu tránh được.

### 6.2 Multipart upload
- Gửi đúng field:
  - `text`
  - `ref_text`
  - `ref_audio`
  - `speed`
  - `format`

### 6.3 Error path
- Map lỗi `UNSUPPORTED_AUDIO`, `VALIDATION_ERROR`, `INFERENCE_FAILED`.
- Giữ UI nhất quán giữa synthesize và clone.

## 7. Acceptance criteria
- Chọn audio mẫu hợp lệ + `ref_text` -> clone thành công -> phát được audio.
- File không hợp lệ hoặc thiếu `ref_text` không làm crash app.
- Retry/lỗi mạng vẫn theo cùng policy của synthesize flow.

## 8. Điều kiện hoàn thành
- Có smoke path: chọn audio mẫu -> nhập `ref_text` -> submit clone -> play audio.
