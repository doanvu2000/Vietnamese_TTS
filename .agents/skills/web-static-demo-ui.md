# Skill: web-static-demo-ui

## Trigger
- Dùng khi dựng hoặc chỉnh UI cho web demo local bằng HTML/CSS/JS thuần.

## Mục tiêu
- Giữ web demo nhẹ, rõ, không framework, đủ dùng cho synthesize và clone flow.

## Input cần có
- PRD web tổng hoặc sprint PRD liên quan.
- Spec UI/state/file structure.

## Checklist bắt buộc
- Giữ một trang `index.html`.
- Tách CSS riêng.
- Tách JS module theo trách nhiệm.
- Có đủ section:
  - backend status
  - synthesize
  - clone
  - result
  - error banner
- Responsive cho desktop và mobile basic.

## Nguyên tắc không được vi phạm
- Không inline JS vào HTML.
- Không thêm framework hoặc bundler.
- Không trộn gọi API trực tiếp trong HTML.

## Output kỳ vọng
- Web demo có cấu trúc dễ đọc, dễ nối logic thật và dễ demo nội bộ.

## Definition of done
- Người khác mở source web là hiểu ngay entrypoint, style và event flow chính.
