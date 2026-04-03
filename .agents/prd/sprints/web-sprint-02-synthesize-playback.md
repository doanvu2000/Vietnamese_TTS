# Sprint PRD: Web Sprint 02 - Synthesize and Playback

> PRD tổng: [web-static-local-prd.md](../web-static-local-prd.md)

## 1. Mục tiêu sprint
- Hoàn thiện luồng synthesize preset voice và phát audio trên web.

## 2. Phụ thuộc
- Hoàn tất [web-sprint-01-foundation.md](./web-sprint-01-foundation.md)

## 3. Phạm vi
- Submit `POST /v1/synthesize`.
- Cho người dùng chọn `wav` hoặc `mp3`.
- Nhận audio blob theo định dạng đã chọn.
- Gắn blob vào audio element.
- Thêm nút play/stop và download kết quả gần nhất.

## 4. Deliverables
- Synthesize text bằng preset voice.
- Playback kết quả bằng audio element.
- Download WAV/MP3 của kết quả gần nhất.

## 5. Acceptance criteria
- Text hợp lệ -> synthesize thành công -> audio phát được với cả `wav` và `mp3`.
- Text rỗng bị chặn từ client.
- Request fail hoặc timeout hiển thị lỗi rõ ràng và không làm UI kẹt.

## 6. Điều kiện hoàn thành
- Có smoke path: load voices -> nhập text -> chọn format -> synthesize -> play -> download.
