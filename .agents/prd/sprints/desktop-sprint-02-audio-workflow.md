# Sprint PRD: Desktop Sprint 02 - Audio Workflow

> PRD tổng: [desktop-local-first-prd.md](../desktop-local-first-prd.md)

## 1. Mục tiêu sprint
- Hoàn thiện luồng người dùng chính trên desktop: synthesize, clone giọng, playback và export WAV.

## 2. Phụ thuộc
- Hoàn tất [desktop-sprint-01-foundation.md](./desktop-sprint-01-foundation.md)

## 3. Phạm vi
- Thêm input cho `ref_audio` và `ref_text`.
- Thêm validate file audio mẫu.
- Lưu audio kết quả ra temp file.
- Thêm playback `play/stop`.
- Thêm export WAV từ kết quả gần nhất.

## 4. Không làm trong sprint này
- Local API server.
- LAN dev mode.
- Packaging Win/Mac.

## 5. Deliverables
- Clone giọng chạy được từ UI với audio mẫu 3-5 giây.
- Có nút play/stop cho kết quả gần nhất.
- Có nút export WAV.
- Error path cho file audio không hợp lệ hoặc clone lỗi được chuẩn hóa.

## 6. Công việc triển khai
### 6.1 Clone flow
- Thêm picker file cho `ref_audio`.
- Bắt buộc nhập `ref_text` trước khi submit clone.
- Chặn file không đúng định dạng whitelist.

### 6.2 Audio result handling
- Sau khi infer xong, lưu WAV vào temp path.
- Cập nhật trạng thái UI để bật playback/export.

### 6.3 Playback service
- Tách player khỏi widget UI.
- Hỗ trợ play/stop cho một kết quả gần nhất.

### 6.4 Export
- Cho người dùng chọn nơi lưu file WAV.
- Nếu chưa có kết quả thì disable nút export.

## 7. Acceptance criteria
- Clone giọng thành công với audio mẫu hợp lệ.
- Playback hoạt động ổn định cho audio vừa tạo.
- Export ra file WAV dùng được.
- Input thiếu `ref_text` hoặc file audio lỗi không làm crash app.
- Error message hiển thị rõ ở UI và có log.

## 8. Điều kiện hoàn thành
- Có smoke path: chọn audio mẫu -> nhập `ref_text` -> clone -> play -> export.
- Không có logic audio/playback nằm lẫn trong widget event handler phức tạp.
