# PRD: Android Kotlin XML Integration

## Liên kết sprint triển khai
- [Android Sprint 01 - Client Foundation](./sprints/android-sprint-01-client-foundation.md)
- [Android Sprint 02 - Synthesize and Playback](./sprints/android-sprint-02-synthesize-playback.md)
- [Android Sprint 03 - Voice Cloning](./sprints/android-sprint-03-voice-clone.md)
- [Android Sprint 04 - Native Feasibility Spike](./sprints/android-sprint-04-native-feasibility.md)

## 1. Mục tiêu
- Tích hợp TTS vào app Android Kotlin XML bằng API của desktop app hoặc server tương thích.
- Cho phép người dùng nhập text, chọn voice preset, upload audio mẫu để clone giọng, nhận audio WAV và phát lại ngay trên app.
- Tách riêng một phase nghiên cứu Android native on-device với tiêu chí go/no-go rõ ràng.

## 2. Nguyên tắc sản phẩm
- MVP Android không chạy engine native trong app.
- Android chỉ là client gọi backend TTS qua HTTP.
- Base URL phải cấu hình được cho:
  - emulator local (`10.0.2.2`)
  - máy desktop cùng LAN
  - server nội bộ/public
- Nếu backend không sẵn sàng, app báo lỗi rõ ràng thay vì cố fallback âm thầm.

## 3. Bối cảnh và ràng buộc
- Upstream `VieNeu-TTS` chưa có Mobile SDK chính thức.
- Android native với ONNX/JNI/llama.cpp có rủi ro lớn về:
  - kích thước model
  - RAM footprint
  - cold start
  - audio codec path
  - effort đóng gói ABI
- Vì vậy MVP phải ưu tiên luồng API trước, native chỉ là phase spike.

## 4. Người dùng mục tiêu
- Người dùng Android cần tạo audio tiếng Việt nhanh từ text.
- Người dùng nâng cao muốn thử clone giọng bằng audio mẫu ngắn.
- Developer cần một integration path ổn định để nhúng tính năng vào app Android hiện hữu dùng Kotlin XML.

## 5. User journeys
### 5.1 Synthesize preset voice
1. Người dùng mở màn hình TTS.
2. App gọi `GET /health` và `GET /v1/voices`.
3. Người dùng nhập text, chọn preset.
4. App gọi `POST /v1/synthesize`.
5. App lưu audio tạm, phát lại và cho phép chia sẻ/lưu nếu màn hình cần.

### 5.2 Clone giọng
1. Người dùng chọn audio mẫu từ máy.
2. Người dùng nhập `ref_text`.
3. App gọi `POST /v1/clone` dạng multipart.
4. App phát audio trả về và cập nhật trạng thái thành công/thất bại.

## 6. In-scope MVP
- Kotlin XML UI.
- Kiến trúc `ViewModel + Repository`.
- Tích hợp HTTP với Retrofit/OkHttp.
- Load danh sách voices.
- Synthesize preset voice.
- Clone giọng bằng upload multipart.
- Playback WAV từ file cache.
- Retry có giới hạn cho lỗi mạng tạm thời.
- UI states: `idle`, `loading`, `success`, `empty`, `error`.
- Cấu hình base URL theo build config hoặc settings nội bộ.

## 7. Out of scope MVP
- Chạy model on-device.
- Streaming audio chunk-by-chunk.
- Queue nhiều request nền.
- Đồng bộ cloud preset hoặc lịch sử sâu.
- Tự động discovery backend trong LAN.

## 8. Contract backend bắt buộc
Android client phải giả định đúng các endpoint sau:
- `GET /health`
- `GET /v1/voices`
- `POST /v1/synthesize`
- `POST /v1/clone`

### 8.1 `GET /health`
- Dùng để xác nhận backend sẵn sàng trước khi mở màn hình hoặc trước khi submit.
- Nếu `model_loaded = false`, UI hiển thị trạng thái backend chưa sẵn sàng.

### 8.2 `GET /v1/voices`
- Trả danh sách voice preset cho dropdown hoặc recycler view.
- Nếu lỗi, cho phép retry thủ công.

### 8.3 `POST /v1/synthesize`
Request JSON:
```json
{
  "text": "Xin chào Anh",
  "voice_id": "xuan_vinh",
  "speed": 1.0,
  "format": "wav"
}
```
Response:
- Binary WAV

### 8.4 `POST /v1/clone`
Multipart fields:
- `text`
- `ref_text`
- `ref_audio`
- `speed`
- `format`

Response:
- Binary WAV

### 8.5 Lỗi chuẩn hóa
Response lỗi:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "text is required",
    "details": {},
    "request_id": "req-123"
  }
}
```

## 9. Kiến trúc Android
### 9.1 Thành phần
- `TtsFragment` hoặc `TtsActivity` dùng XML
- `TtsViewModel`
- `TtsRepository`
- `TtsApiService` (Retrofit)
- `AudioCacheStore`
- `WavPlaybackController`
- `UiState mapper`

### 9.2 Luồng dữ liệu
- UI phát event sang `ViewModel`.
- `ViewModel` validate input cơ bản.
- `Repository` gọi API, lưu audio vào cache file.
- `ViewModel` phát state mới cho UI.
- Player phát từ cache file thay vì giữ byte array lớn lâu trong memory.

### 9.3 Networking
- Timeouts rõ ràng cho connect/read/write.
- Retry tối đa 1-2 lần cho lỗi mạng tạm thời, không retry cho `4xx`.
- Có interceptor log ở debug build, không log audio binary.

## 10. UX và hành vi lỗi
- Disable nút submit khi request đang chạy.
- Hiển thị loading rõ ràng.
- Lỗi validation hiển thị ngay ở form nếu xác định được từ client.
- Lỗi backend hiển thị message ngắn gọn + nút retry.
- Nếu playback lỗi, vẫn giữ file cache để người dùng retry phát.

## 11. Permissions và file handling
- Ưu tiên Android Storage Access Framework hoặc picker hiện đại để chọn audio.
- Không yêu cầu quyền đọc storage toàn cục nếu có thể tránh.
- File audio trả về được lưu vào cache app.
- Xóa cache cũ theo policy đơn giản: chỉ giữ kết quả gần nhất hoặc dọn khi vượt ngưỡng dung lượng.

## 12. Acceptance criteria MVP
- App gọi được `health` và `voices` từ backend cấu hình.
- Người dùng synthesize được text thành audio phát được.
- Người dùng upload audio mẫu + `ref_text` và clone thành công.
- UI xử lý được `loading`, `success`, `empty`, `error`.
- Retry hoạt động cho lỗi mạng tạm thời.
- Lỗi từ backend được map thành thông báo ổn định, không crash app.

## 13. Test scenarios
- Backend sống, voices load thành công.
- Backend chết, màn hình báo lỗi kết nối.
- Submit synthesize với text rỗng bị chặn từ client.
- Submit synthesize hợp lệ nhận WAV hợp lệ.
- Submit clone với file không hợp lệ nhận lỗi chuẩn hóa.
- Playback sau khi xoay màn hình vẫn không crash; có thể chọn giữ hoặc reset state theo thiết kế màn hình.
- Base URL đổi giữa emulator local, LAN IP, server URL mà không cần sửa code luồng nghiệp vụ.

## 14. Phase 2: Android native on-device spike
### 14.1 Mục tiêu spike
- Xác minh khả năng chạy inference native trên Android.
- So sánh ít nhất 3 hướng:
  - ONNX Runtime Mobile
  - llama.cpp / GGUF bridge
  - JNI bridge tới native runtime khác nếu cần

### 14.2 Artifact bắt buộc
- Bảng benchmark cho mỗi hướng:
  - app size tăng thêm
  - model size
  - RAM peak
  - cold start
  - thời gian synthesize text ngắn
  - độ phức tạp đóng gói ABI
  - khả năng hỗ trợ clone giọng

### 14.3 Exit criteria để được phép sang native implementation
- Có ít nhất 1 hướng chạy được trên thiết bị Android mục tiêu.
- Peak RAM nằm trong ngưỡng chấp nhận của thiết bị mục tiêu.
- Artifact size và cold start không phá vỡ UX/phân phối.
- Chứng minh được đường encode/decode audio và clone path khả thi.
- Có kế hoạch fallback khi thiết bị không đủ tài nguyên.

### 14.4 Go/No-Go
- Nếu không đạt exit criteria, giữ Android ở remote API mode.
- Không được ép native implementation chỉ vì đã có spike.
