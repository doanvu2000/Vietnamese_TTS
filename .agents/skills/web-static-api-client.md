# Skill: web-static-api-client

## Trigger
- Dùng khi tích hợp desktop local API vào web static demo.

## Mục tiêu
- Tạo lớp gọi API nhỏ, rõ và ổn định cho 4 endpoint hiện có.

## Input cần có
- Contract desktop local API.
- `API_BASE_URL`.
- Spec API integration.

## Checklist bắt buộc
- Có wrapper request với timeout.
- Có functions riêng cho:
  - `getHealth`
  - `getVoices`
  - `synthesize`
  - `cloneVoice`
- Chuẩn hóa lỗi network và lỗi JSON backend.
- Nhận synthesize/clone dưới dạng `Blob`.

## Nguyên tắc không được vi phạm
- Không hardcode URL ở nhiều file.
- Không auto retry synthesize/clone.
- Không log binary audio vào console như debug mặc định.

## Output kỳ vọng
- Tầng API đủ sạch để UI chỉ quan tâm state và render.

## Definition of done
- Có thể đổi `API_BASE_URL` mà không sửa logic form hay player.
