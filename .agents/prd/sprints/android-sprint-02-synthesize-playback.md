# Sprint PRD: Android Sprint 02 - Synthesize and Playback

> PRD tổng: [android-integration-prd.md](../android-integration-prd.md)

## 1. Mục tiêu sprint
- Hoàn thiện luồng synthesize preset voice và playback audio trên Android.

## 2. Phụ thuộc
- Hoàn tất [android-sprint-01-client-foundation.md](./android-sprint-01-client-foundation.md)

## 3. Phạm vi
- Gọi `POST /v1/synthesize`.
- Lưu WAV trả về vào cache file.
- Playback audio kết quả.
- Hoàn thiện UI state: `idle`, `loading`, `success`, `empty`, `error`.

## 4. Không làm trong sprint này
- Clone giọng.
- Native on-device.

## 5. Deliverables
- Người dùng nhập text, chọn voice, synthesize và nghe lại được.
- Có loading state, error state và retry cơ bản.

## 6. Công việc triển khai
### 6.1 Submit synthesize
- Validate `text` không rỗng từ client.
- Gửi request JSON đúng contract.

### 6.2 Audio cache
- Lưu WAV thành file cache.
- Chỉ giữ kết quả gần nhất hoặc policy dọn đơn giản.

### 6.3 Playback
- Phát WAV từ cache file.
- Không giữ audio binary lớn trong RAM lâu.

### 6.4 Error UX
- Không retry cho `4xx`.
- Retry tối đa 1-2 lần cho lỗi mạng tạm thời nếu phù hợp.

## 7. Acceptance criteria
- Submit synthesize hợp lệ trả audio phát được.
- Submit text rỗng bị chặn ở client.
- Khi backend lỗi hoặc timeout, UI báo lỗi rõ ràng và không crash.
- Playback sau khi có kết quả hoạt động ổn định.

## 8. Điều kiện hoàn thành
- Có smoke path: load voices -> nhập text -> synthesize -> play audio.
