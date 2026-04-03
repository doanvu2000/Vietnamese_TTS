# Workflow 09: Web Hardening Local Serve

## Mục tiêu
- Ổn định web demo cho môi trường local serve và kiểm thử nội bộ.

## Prerequisite
- Hoàn tất workflow `08-web-clone-export`.

## Các bước
### Bước 1: Local serve notes
- Chốt cách mở web bằng static server đơn giản.
- Artifact đầu ra:
  - hướng dẫn serve local

### Bước 2: Error path review
- Rà lại timeout, backend down, invalid file.
- Artifact đầu ra:
  - regression checklist

### Bước 3: Demo polish
- Rà copy, trạng thái và hành vi button.
- Artifact đầu ra:
  - web demo sẵn cho dev/QA dùng

## Checkpoint kỹ thuật
- Không yêu cầu build step.
- Không có UI state kẹt sau request lỗi.

## Điều kiện dừng
- Dừng nếu web còn phụ thuộc thao tác thủ công mơ hồ để chạy local.

## Handoff
- Bàn giao web demo local hoàn chỉnh cho vòng test tích hợp với desktop API.
