# PRD: Web Static Local Demo

## Liên kết sprint triển khai
- [Web Sprint 01 - Foundation](./sprints/web-sprint-01-foundation.md)
- [Web Sprint 02 - Synthesize and Playback](./sprints/web-sprint-02-synthesize-playback.md)
- [Web Sprint 03 - Clone, Export and States](./sprints/web-sprint-03-clone-export-states.md)
- [Web Sprint 04 - Hardening and Local Serve](./sprints/web-sprint-04-hardening-local-serve.md)

## 1. Mục tiêu
- Tạo web app local bằng HTML/CSS/JS thuần để demo và kiểm tra nhanh desktop local API.
- Web hỗ trợ đầy đủ luồng MVP: backend status, load voices, synthesize, clone giọng, playback, export WAV.
- Không tạo backend riêng; web chỉ là client local gọi đúng contract desktop API đã có.

## 2. Vai trò sản phẩm
- Web là `demo UI local`.
- Phục vụ kiểm tra API nhanh, demo luồng người dùng trên browser và hỗ trợ QA/dev nội bộ.

## 3. User journeys
### 3.1 Backend check
1. Người dùng mở web local.
2. Trang hiển thị `API_BASE_URL`.
3. Trang gọi `GET /health` và `GET /v1/voices`.
4. Người dùng thấy backend đang sẵn sàng hay lỗi.

### 3.2 Synthesize
1. Người dùng chọn preset voice.
2. Người dùng nhập text.
3. Trang gọi `POST /v1/synthesize`.
4. Trang phát audio và cho phép tải WAV.

### 3.3 Clone giọng
1. Người dùng chọn file audio mẫu.
2. Người dùng nhập `ref_text` và `text`.
3. Trang gọi `POST /v1/clone`.
4. Trang phát audio và cho phép tải WAV.

## 4. In-scope MVP
- HTML/CSS/JS thuần, không framework, không bundler.
- Một trang duy nhất.
- Các section:
  - backend status
  - synthesize form
  - clone form
  - result panel
  - error/status banner
- Cấu hình API qua `window.APP_CONFIG.API_BASE_URL`.
- Playback bằng browser audio element.
- Download WAV từ blob kết quả.

## 5. Out of scope MVP
- SSR, SPA router hoặc build pipeline.
- Auth hoặc user account.
- Backend proxy riêng cho web.
- Streaming TTS.
- Lịch sử kết quả dài hạn.

## 6. Contract API dùng lại
- `GET /health`
- `GET /v1/voices`
- `POST /v1/synthesize`
- `POST /v1/clone`

Web giữ đúng mapping field:
- `text`
- `voice_id`
- `speed`
- `format`
- `ref_text`
- `ref_audio`

## 7. Phi chức năng
- Mở được bằng local static server đơn giản.
- Không phụ thuộc build step.
- UI không bị kẹt state khi request fail.
- Lỗi backend/network phải hiển thị rõ.

## 8. Acceptance criteria
- Trang hiển thị được backend status và danh sách voices.
- Người dùng synthesize được text và nghe lại audio.
- Người dùng clone được bằng audio mẫu hợp lệ.
- Người dùng tải được WAV của kết quả gần nhất.
- Khi backend timeout hoặc fail, UI vẫn usable sau khi retry.

## 9. Roadmap
### Phase 1
- Foundation shell, config, health, voices

### Phase 2
- Synthesize + playback

### Phase 3
- Clone + export + state hardening

### Phase 4
- Local serve notes, demo polish, smoke checklist
