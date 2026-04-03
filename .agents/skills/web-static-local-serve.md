# Skill: web-static-local-serve

## Trigger
- Dùng khi cần chạy hoặc kiểm thử web demo trong local environment.

## Mục tiêu
- Bảo đảm web static có thể serve đơn giản và test được với desktop API.

## Input cần có
- Source `web/`.
- Base URL backend local.

## Checklist bắt buộc
- Chạy web qua local static server đơn giản.
- Kiểm tra:
  - load CSS/JS đúng path
  - gọi được `health`
  - synthesize trả audio blob
  - clone upload multipart đúng
- Ghi chú rõ nếu backend cần CORS/header hỗ trợ.

## Nguyên tắc không được vi phạm
- Không thêm build pipeline chỉ để serve local.
- Không phụ thuộc môi trường IDE riêng.

## Output kỳ vọng
- Có hướng dẫn ngắn để dev/QA mở web demo và test ngay.

## Definition of done
- Người khác chạy static server đơn giản là dùng được web demo với desktop local API.
