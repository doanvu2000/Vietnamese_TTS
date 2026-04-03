# Sprint PRD: Android Sprint 01 - Client Foundation

> PRD tổng: [android-integration-prd.md](../android-integration-prd.md)

## 1. Mục tiêu sprint
- Dựng nền Android client Kotlin XML để kết nối backend TTS ổn định.

## 2. Phạm vi
- Tạo màn hình TTS bằng XML.
- Tạo `ViewModel + Repository + Retrofit/OkHttp`.
- Thêm config `base_url` cho emulator, LAN hoặc server.
- Gọi `GET /health` và `GET /v1/voices`.

## 3. Không làm trong sprint này
- Clone giọng.
- Playback audio hoàn chỉnh.
- Native on-device.

## 4. Deliverables
- Màn hình load được trạng thái backend.
- Tải được danh sách voices.
- Có UI state `idle/loading/success/error` ở mức foundation.

## 5. Công việc triển khai
### 5.1 Networking foundation
- Tạo `TtsApiService`.
- Tạo model cho `health`, `voices` và error schema.
- Cấu hình timeout cơ bản và debug logging.

### 5.2 Screen foundation
- Dựng form text + voice picker + trạng thái backend.
- Ràng buộc dữ liệu từ `ViewModel`.

### 5.3 Error mapping
- Map lỗi network và lỗi JSON backend thành UI message ổn định.

## 6. Acceptance criteria
- App gọi được `GET /health`.
- App load được `GET /v1/voices`.
- Đổi base URL mà không cần sửa flow nghiệp vụ.
- Mất kết nối backend không làm crash app.

## 7. Điều kiện hoàn thành
- Có nền Android đủ ổn định để sprint sau chỉ tập trung vào synthesize/playback.
