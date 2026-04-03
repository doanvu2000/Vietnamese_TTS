# Sprint PRD: Desktop Sprint 01 - Foundation Shell

> PRD tổng: [desktop-local-first-prd.md](../desktop-local-first-prd.md)

## 1. Mục tiêu sprint
- Dựng nền desktop app `PySide6` chạy được trên môi trường dev.
- Khóa cấu trúc code, settings store, engine lifecycle và màn hình chính.
- Chưa cần local API, clone giọng hay export hoàn chỉnh.

## 2. Phạm vi
- Tạo app shell với một màn hình chính.
- Thêm các vùng UI:
  - nhập `text`
  - chọn `voice preset`
  - trạng thái engine
  - nút synthesize
  - vùng kết quả/audio state
- Tạo `VieneuAdapter` hoặc interface adapter cho upstream.
- Tạo `SettingsStore` cho các setting cơ bản:
  - `base_model_mode`
  - output directory
  - API host/port mặc định
- Tạo `JobRunner` nền để inference không block UI.

## 3. Không làm trong sprint này
- Clone giọng.
- Local API server.
- Packaging production.
- Playback/export hoàn chỉnh.

## 4. Deliverables
- App desktop mở được vào màn hình chính.
- Engine có state rõ: `loading`, `ready`, `error`.
- Synthesize preset voice chạy được với text ngắn.
- Settings cục bộ được lưu và load lại.

## 5. Công việc triển khai
### 5.1 App skeleton
- Tạo entrypoint desktop app.
- Tạo cấu trúc module cho UI, services, settings, logging.

### 5.2 Engine integration tối thiểu
- Kết nối `VieNeu-TTS` ở `turbo` mode.
- Chuẩn hóa lỗi load model và inference.

### 5.3 UI state
- Disable submit khi engine chưa sẵn sàng.
- Hiển thị thông báo lỗi khi model load hoặc synthesize thất bại.

### 5.4 Persistence
- Ghi settings cục bộ vào file/app data.
- Khôi phục settings khi mở lại app.

## 6. Acceptance criteria
- App khởi động được mà không crash.
- Người dùng nhập text và synthesize thành công bằng preset mặc định.
- UI vẫn responsive trong lúc đang infer.
- Nếu engine lỗi, app hiển thị lỗi rõ ràng và cho phép retry/reopen.
- Restart app vẫn load lại settings đã lưu.

## 7. Điều kiện hoàn thành
- Có smoke path: mở app -> nhập text -> synthesize -> nhận kết quả.
- Cấu trúc code đủ rõ để sprint sau thêm clone, playback và API mà không phải refactor lớn.
