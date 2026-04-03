# Skill: desktop-local-api

## Trigger
- Dùng khi desktop app cần expose HTTP API cho Android app hoặc client khác.
- Dùng khi harden request/response, timeout, cancellation, logging hoặc LAN dev mode.

## Mục tiêu
- Cung cấp API cục bộ ổn định, tối thiểu và an toàn cho MVP.
- Dùng chung engine với desktop shell để tránh lệch hành vi.

## Input cần có
- PRD desktop local-first.
- Contract API đã khóa.
- Quyết định bind host và port cho môi trường dev/test.

## Checklist bắt buộc
- Triển khai đúng 4 endpoint:
  - `GET /health`
  - `GET /v1/voices`
  - `POST /v1/synthesize`
  - `POST /v1/clone`
- Chuẩn hóa lỗi theo schema chung.
- Có timeout cho inference request.
- Có cơ chế cancel hoặc ít nhất giải phóng state job khi request fail.
- Dùng cùng adapter/job queue với UI desktop.
- Ghi log có `request_id`.
- Bind mặc định `127.0.0.1`.
- LAN dev mode phải là opt-in và có cảnh báo rõ.

## Nguyên tắc không được vi phạm
- Không expose API public Internet mặc định.
- Không tạo mỗi request một model instance mới nếu model load nặng.
- Không trả lỗi thô từ upstream ra client.
- Không nhận file audio mà không validate MIME hoặc extension tối thiểu.
- Không để request hỏng làm hỏng engine cho request kế tiếp.

## Output kỳ vọng
- Backend local trả schema ổn định để Android client tích hợp.
- Có smoke test bằng curl/Postman/script đơn giản cho cả success và error path.
- Có tài liệu chỉ rõ cách gọi từ emulator, desktop local và LAN.

## Definition of done
- Android emulator hoặc client mẫu gọi được đầy đủ 4 endpoint.
- Request lỗi vẫn trả JSON lỗi chuẩn hóa.
- Sau một request timeout/error, request kế tiếp vẫn chạy được.
