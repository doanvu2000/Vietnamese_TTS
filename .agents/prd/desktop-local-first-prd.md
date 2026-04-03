# PRD: Desktop Local-First TTS App (Win/Mac)

## Liên kết sprint triển khai
- [Desktop Sprint 01 - Foundation Shell](./sprints/desktop-sprint-01-foundation.md)
- [Desktop Sprint 02 - Audio Workflow](./sprints/desktop-sprint-02-audio-workflow.md)
- [Desktop Sprint 03 - Local API MVP](./sprints/desktop-sprint-03-local-api.md)
- [Desktop Sprint 04 - Hardening and Packaging](./sprints/desktop-sprint-04-hardening-packaging.md)

## 1. Mục tiêu
- Xây desktop app cho Windows và macOS dùng `VieNeu-TTS` local/offline làm engine mặc định.
- Cho phép người dùng nhập văn bản, chọn voice preset, clone giọng bằng audio mẫu ngắn, nghe thử và export file WAV.
- Có thể bật local HTTP API để Android app hoặc client khác gọi cùng một engine.
- Giữ kiến trúc đủ đơn giản để ra MVP sớm, nhưng không khóa đường mở rộng sang mode remote hoặc packaging production.

## 2. Bối cảnh và ràng buộc upstream
- Upstream repo: `https://github.com/pnnbao97/VieNeu-TTS`
- Theo README upstream hiện tại:
  - `Vieneu()` mặc định chạy `turbo` mode, ưu tiên CPU-friendly path.
  - Có `remote` mode để gọi API server từ SDK.
  - Mobile SDK chính thức chưa có, nên Android native không phải MVP.
- MVP desktop phải bám đường ổn định nhất của upstream:
  - Ưu tiên `turbo` local inference.
  - Không phụ thuộc vào feature GPU-only.
  - Không giả định mobile-native support đã sẵn sàng.

## 3. Người dùng mục tiêu
- Người dùng desktop cần tạo giọng nói tiếng Việt nhanh, offline, không cần terminal.
- Developer nội bộ cần một desktop app vừa dùng trực tiếp, vừa làm local backend để Android hoặc tool khác gọi API.

## 4. User journeys
### 4.1 Synthesize cơ bản
1. Người dùng mở app.
2. App load cấu hình và warm up engine.
3. Người dùng nhập text, chọn preset voice, nhấn synthesize.
4. App sinh audio, phát thử và cho phép export WAV.

### 4.2 Clone giọng
1. Người dùng chọn file audio mẫu dài 3-5 giây.
2. Người dùng nhập `ref_text` khớp audio mẫu.
3. App chạy clone + synthesize.
4. App phát audio kết quả và cho phép export.

### 4.3 Dùng như local backend
1. Người dùng bật `Enable Local API`.
2. App khởi động HTTP server cục bộ.
3. Android app hoặc client khác gọi `health`, `voices`, `synthesize`, `clone`.
4. App trả WAV hoặc lỗi JSON chuẩn hóa.

## 5. In-scope MVP
- Shell desktop dùng `PySide6`.
- Engine adapter cho `VieNeu-TTS` local `turbo`.
- Màn hình đơn cho:
  - nhập text
  - chọn voice preset
  - chọn file audio mẫu
  - nhập `ref_text`
  - synthesize / clone
  - playback
  - export WAV
  - xem trạng thái engine
  - bật/tắt local API
- Cấu hình cục bộ:
  - `base_model_mode`
  - output directory mặc định
  - host/port API
  - cờ cho phép bind LAN dev mode
- Logging cục bộ đủ để debug lỗi model/runtime/API.

## 6. Out of scope MVP
- Biên tập audio chuyên sâu.
- Hàng đợi nhiều job song song.
- Đồng bộ cloud account.
- Android on-device engine.
- GPU optimization riêng cho từng hãng máy.
- Auto-download model quá phức tạp hoặc launcher nhiều bước.

## 7. Chức năng chi tiết
### 7.1 Text synthesis
- Input bắt buộc: `text`
- Input tùy chọn: `voice_id`, `speed`
- Output: WAV 24 kHz hoặc format mà upstream trả về rồi chuẩn hóa thành WAV trước khi phát/export

### 7.2 Voice preset
- Load danh sách voice preset từ adapter SDK/upstream metadata.
- Nếu không load được preset, app phải hiển thị lỗi rõ ràng và fallback về preset mặc định nếu có.

### 7.3 Voice cloning
- Input bắt buộc:
  - `text`
  - `ref_audio`
  - `ref_text`
- App chỉ cho phép file âm thanh hợp lệ theo whitelist: `.wav`, `.mp3`, `.m4a`
- Clone failure không làm crash app; lỗi hiển thị ở UI và log.

### 7.4 Playback
- Có nút play/stop cho audio kết quả gần nhất.
- Không yêu cầu waveform view ở MVP.

### 7.5 Export
- Export audio kết quả gần nhất thành `.wav`.
- Nếu chưa có kết quả, nút export disabled.

### 7.6 Local API
- Bind mặc định `127.0.0.1`.
- `0.0.0.0` hoặc LAN host chỉ bật khi người dùng chủ động bật `LAN dev mode`.
- Không public Internet trực tiếp trong MVP.

## 8. Kiến trúc runtime
### 8.1 Thành phần
- `PySide6 UI`
- `Settings store`
- `VieneuAdapter`
- `Job runner` nền cho synthesize/clone
- `Audio playback service`
- `Local API server`
- `Structured logger`

### 8.2 Luồng chính
- UI gửi request nội bộ sang `VieneuAdapter` qua worker nền.
- Worker chạy tuần tự 1 job tại một thời điểm trong MVP.
- Audio kết quả được lưu temp file, cập nhật playback service và tùy chọn export.
- Local API dùng cùng adapter và cùng hàng đợi job để tránh tranh chấp model/runtime.

### 8.3 Nguyên tắc kỹ thuật
- Không block main thread của UI.
- Không giữ nhiều bản audio lớn trong RAM nếu không cần.
- Mọi lỗi từ upstream phải được normalize trước khi trả ra UI/API.
- Một nguồn sự thật cho settings và engine state.

## 9. Contract API MVP
### 9.1 `GET /health`
Response `200`:
```json
{
  "status": "ok",
  "engine_mode": "turbo",
  "model_loaded": true,
  "api_enabled": true,
  "version": "0.1.0"
}
```

### 9.2 `GET /v1/voices`
Response `200`:
```json
{
  "voices": [
    {
      "id": "xuan_vinh",
      "name": "Xuân Vĩnh",
      "type": "preset",
      "language": "vi"
    }
  ]
}
```

### 9.3 `POST /v1/synthesize`
Request JSON:
```json
{
  "text": "Xin chào Anh",
  "voice_id": "xuan_vinh",
  "speed": 1.0,
  "format": "wav"
}
```
- `text`: bắt buộc, chuỗi không rỗng
- `voice_id`: tùy chọn, fallback về preset mặc định
- `speed`: tùy chọn, mặc định `1.0`
- `format`: MVP chỉ hỗ trợ `wav`

Response `200`:
- `Content-Type: audio/wav`
- Body là binary WAV

### 9.4 `POST /v1/clone`
Request `multipart/form-data`:
- `text`: bắt buộc
- `ref_text`: bắt buộc
- `ref_audio`: bắt buộc
- `speed`: tùy chọn
- `format`: mặc định `wav`

Response `200`:
- `Content-Type: audio/wav`
- Body là binary WAV

### 9.5 Lỗi chuẩn hóa
Response `4xx/5xx`:
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

Error codes tối thiểu:
- `VALIDATION_ERROR`
- `ENGINE_NOT_READY`
- `UNSUPPORTED_AUDIO`
- `INFERENCE_FAILED`
- `TIMEOUT`
- `INTERNAL_ERROR`

## 10. Phi chức năng
- App không crash khi model load lỗi, thiếu dependency hoặc input xấu.
- UI phản hồi được trong lúc inference đang chạy.
- Mọi request API đều có timeout phía server và phía client.
- Log file cục bộ phải đủ để truy vết request lỗi.
- Packaging MVP:
  - Windows: `PyInstaller`
  - macOS: `PyInstaller` trước, notarization chưa nằm trong MVP

## 11. Acceptance criteria
### 11.1 Desktop UI
- Người dùng synthesize được một đoạn text ngắn bằng preset voice.
- Người dùng clone được giọng từ audio mẫu 3-5 giây + `ref_text`.
- Người dùng nghe lại audio kết quả và export được file WAV.
- App khởi động lại vẫn giữ settings cục bộ.
- Nếu model/runtime lỗi, app hiển thị trạng thái lỗi rõ ràng và không crash.

### 11.2 Local API
- `GET /health` và `GET /v1/voices` trả đúng schema.
- `POST /v1/synthesize` với input hợp lệ trả WAV phát được.
- `POST /v1/clone` với input hợp lệ trả WAV phát được.
- Input thiếu `text` hoặc file audio lỗi trả JSON lỗi chuẩn hóa.
- Request timeout hoặc bị hủy không làm treo engine cho request sau.

## 12. Đo lường MVP
- Có smoke test manual cho:
  - cold start app
  - synthesize preset
  - clone giọng
  - export WAV
  - enable API và gọi từ client mẫu
- Ghi nhận baseline:
  - thời gian cold start
  - thời gian synthesize text ngắn
  - kích thước app packaged
- Baseline được đo trên ít nhất 1 máy Windows và 1 máy macOS dev.

## 13. Roadmap
### Phase 1
- Desktop local-first MVP bằng `PySide6`
- Local API cục bộ cho Android/client

### Phase 2
- Hardening packaging, logs, recovery, LAN mode có kiểm soát
- Đóng gói remote/server deployment chuẩn hơn

### Phase 3
- Nghiên cứu Android native on-device nếu phase spike đạt tiêu chí go
