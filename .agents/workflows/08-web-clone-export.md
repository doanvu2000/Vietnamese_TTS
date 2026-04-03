# Workflow 08: Web Clone Export

## Mục tiêu
- Hoàn thiện clone giọng, export và đồng nhất state cho web demo.

## Prerequisite
- Hoàn tất workflow `07-web-synthesize-playback`.

## Các bước
### Bước 1: Clone form
- Thêm picker audio mẫu và `ref_text`.
- Artifact đầu ra:
  - form clone đầy đủ

### Bước 2: Multipart request
- Gửi `POST /v1/clone` đúng field name.
- Artifact đầu ra:
  - clone request thành công

### Bước 3: Hợp nhất result/export/state
- Dùng chung result panel và download flow.
- Artifact đầu ra:
  - synthesize và clone dùng chung state ổn định

## Checkpoint kỹ thuật
- Error path clone không phá result cũ.
- Multipart field đúng contract.

## Điều kiện dừng
- Dừng nếu clone success path chưa chạy end-to-end.

## Handoff
- Bàn giao web demo đầy đủ cho workflow `09-web-hardening-local-serve`.
