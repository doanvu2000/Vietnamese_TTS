# Workflow 01: Upstream Baseline

## Mục tiêu
- Chốt sự thật kỹ thuật từ `VieNeu-TTS` trước khi viết code desktop hoặc Android.

## Prerequisite
- Có link upstream hoặc repo clone cục bộ.
- Có PRD desktop và Android trong `.agents/prd`.

## Các bước
### Bước 1: Đọc và khóa baseline
- Đọc README, package entrypoints, mode support và notes về mobile.
- Artifact đầu ra:
  - baseline note gồm version/commit upstream
  - mode được phép dùng cho MVP

### Bước 2: Chốt dependency strategy
- Xác định dependency tối thiểu cho desktop local-first.
- Xác định phần nào là optional cho GPU hoặc remote.
- Artifact đầu ra:
  - dependency matrix cho dev và package

### Bước 3: Chốt model strategy
- Mặc định dùng đường `turbo`/CPU-friendly cho desktop MVP.
- Ghi rõ model source, cách resolve path và fallback behavior.
- Artifact đầu ra:
  - model selection note

### Bước 4: Ghi known risks
- Liệt kê giới hạn upstream ảnh hưởng trực tiếp đến:
  - desktop shell
  - local API
  - Android client
  - native spike
- Artifact đầu ra:
  - risk list có owner hoặc hướng xử lý

## Checkpoint kỹ thuật
- Không còn mơ hồ về desktop dùng mode nào.
- Không còn mơ hồ về Android MVP là API client.
- Có danh sách feature roadmap-only để tránh implement nhầm.

## Điều kiện dừng
- Dừng nếu chưa xác minh được upstream version hoặc mode support thật.

## Handoff
- Bàn giao baseline note cho workflow `02-desktop-mvp-build`.
- Bàn giao risk list cho workflow `05-android-native-feasibility`.
