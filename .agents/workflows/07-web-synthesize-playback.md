# Workflow 07: Web Synthesize Playback

## Mục tiêu
- Kết nối synthesize flow và playback audio trên web demo.

## Prerequisite
- Hoàn tất workflow `06-web-foundation`.

## Các bước
### Bước 1: Form synthesize
- Validate text và submit `POST /v1/synthesize`.
- Artifact đầu ra:
  - synthesize request thành công

### Bước 2: Audio result
- Nhận blob và gắn vào audio element.
- Artifact đầu ra:
  - play/stop hoạt động

### Bước 3: Download WAV
- Cho tải file kết quả gần nhất.
- Artifact đầu ra:
  - download WAV dùng được

## Checkpoint kỹ thuật
- Không giữ state audio rối giữa nhiều request.
- UI không bị kẹt khi request fail.

## Điều kiện dừng
- Dừng nếu synthesize success path chưa phát được audio.

## Handoff
- Bàn giao result panel cho workflow `08-web-clone-export`.
