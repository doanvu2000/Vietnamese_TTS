# Workflow 06: Web Foundation

## Mục tiêu
- Dựng web static shell và nối health/voices với desktop local API.

## Prerequisite
- Có desktop local API contract đã khóa.
- Có PRD web và spec web.

## Các bước
### Bước 1: Tạo cấu trúc web
- Tạo `index.html`, CSS và JS modules.
- Artifact đầu ra:
  - web shell render đúng layout

### Bước 2: Tạo config và state
- Tạo `API_BASE_URL` và state store đơn giản.
- Artifact đầu ra:
  - app boot được với config local

### Bước 3: Nối health và voices
- Gọi `GET /health` và `GET /v1/voices`.
- Artifact đầu ra:
  - backend status và voice selector hoạt động

## Checkpoint kỹ thuật
- Không dùng framework.
- Không hardcode API URL ở nhiều nơi.

## Điều kiện dừng
- Dừng nếu health/voices chưa gọi được ổn định.

## Handoff
- Bàn giao shell + API base cho workflow `07-web-synthesize-playback`.
