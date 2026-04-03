# Sprint PRD: Web Sprint 03 - Clone, Export and States

> PRD tổng: [web-static-local-prd.md](../web-static-local-prd.md)

## 1. Mục tiêu sprint
- Bổ sung clone giọng, hoàn thiện export và state handling cho toàn bộ trang web.

## 2. Phụ thuộc
- Hoàn tất [web-sprint-02-synthesize-playback.md](./web-sprint-02-synthesize-playback.md)

## 3. Phạm vi
- Thêm form clone với `text`, `ref_text`, `ref_audio`, `speed`.
- Thêm chọn định dạng output `wav/mp3`.
- Upload `multipart/form-data` tới `POST /v1/clone`.
- Chuẩn hóa state `idle/loading/success/error`.
- Hợp nhất result panel cho synthesize và clone.

## 4. Deliverables
- Clone giọng chạy end-to-end.
- Download/export WAV/MP3 dùng chung cho cả synthesize và clone.
- Button enable/disable đúng theo state.

## 5. Acceptance criteria
- Audio mẫu hợp lệ + `ref_text` đúng -> clone thành công với `wav` và `mp3`.
- File audio thiếu hoặc sai định dạng -> báo lỗi rõ ràng.
- Sau request fail, có thể submit lại mà không cần reload trang.

## 6. Điều kiện hoàn thành
- Có smoke path clone hoàn chỉnh.
- State chuyển đúng giữa loading, success và error.
