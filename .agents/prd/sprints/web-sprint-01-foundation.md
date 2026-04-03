# Sprint PRD: Web Sprint 01 - Foundation

> PRD tổng: [web-static-local-prd.md](../web-static-local-prd.md)

## 1. Mục tiêu sprint
- Dựng shell web tĩnh local, khóa layout, config API và backend status flow.

## 2. Phạm vi
- Tạo `web/index.html`.
- Tạo CSS base và layout section.
- Tạo `config.js`, `api.js`, `state.js`, `app.js` skeleton.
- Gọi `GET /health` và `GET /v1/voices`.

## 3. Không làm trong sprint này
- Clone giọng.
- Export WAV.
- Hardening local serve.

## 4. Deliverables
- Trang render đúng layout.
- Hiển thị `API_BASE_URL`.
- Gọi được health và voices.
- Có banner lỗi và status card.

## 5. Acceptance criteria
- Mở trang local qua static server và thấy đủ section chính.
- `GET /health` và `GET /v1/voices` hoạt động.
- Khi backend không sẵn sàng, UI báo lỗi rõ ràng và không crash.

## 6. Điều kiện hoàn thành
- Nền web đủ rõ để sprint sau chỉ tập trung vào action flow và audio result.
