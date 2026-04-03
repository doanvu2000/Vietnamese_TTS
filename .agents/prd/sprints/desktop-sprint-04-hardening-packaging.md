# Sprint PRD: Desktop Sprint 04 - Hardening and Packaging

> PRD tổng: [desktop-local-first-prd.md](../desktop-local-first-prd.md)

## 1. Mục tiêu sprint
- Ổn định desktop app cho môi trường demo/nội bộ và tạo đường đóng gói Win/Mac cơ bản.

## 2. Phụ thuộc
- Hoàn tất [desktop-sprint-03-local-api.md](./desktop-sprint-03-local-api.md)

## 3. Phạm vi
- Hardening logs, recovery và settings.
- Thêm `LAN dev mode` có cảnh báo rõ.
- Chuẩn hóa script/package path cho `PyInstaller`.
- Đo baseline runtime và artifact size.

## 4. Deliverables
- Bản build desktop dev-distributable cho Windows.
- Bản build thử cho macOS nếu môi trường build có sẵn.
- Tài liệu known issues và baseline đo được.

## 5. Công việc triển khai
### 5.1 Reliability
- Rà lại startup error, model missing, bad config.
- Đảm bảo app không crash ở các error path phổ biến.

### 5.2 LAN dev mode
- Cho phép người dùng bật bind host khác `127.0.0.1`.
- Hiển thị cảnh báo rõ đây chỉ là dev mode.

### 5.3 Packaging
- Tạo cấu hình `PyInstaller`.
- Xử lý path model/assets/settings cho app packaged.

### 5.4 Baseline measurement
- Ghi nhận:
  - cold start
  - synthesize text ngắn
  - kích thước app packaged

## 6. Acceptance criteria
- App packaged chạy được trên ít nhất 1 máy Windows dev.
- Nếu có môi trường macOS, bản build thử mở được app shell.
- LAN dev mode hoạt động và không bật mặc định.
- Log đủ để truy vết lỗi startup, inference và API.

## 7. Điều kiện hoàn thành
- Có bản build đủ dùng cho Android team hoặc QA nội bộ kết nối test.
- Baseline runtime được ghi lại để làm mốc tối ưu sau này.
