# Workflow 02: Desktop MVP Build

## Mục tiêu
- Dựng desktop app local-first bằng `PySide6` chạy end-to-end với `VieNeu-TTS`.

## Prerequisite
- Hoàn tất workflow `01-upstream-baseline`.
- Có baseline note, dependency strategy và model strategy.

## Các bước
### Bước 1: Dựng app skeleton
- Tạo cấu trúc app cho:
  - UI
  - engine adapter
  - settings
  - playback
  - background job runner
- Artifact đầu ra:
  - skeleton app chạy được tới màn hình chính

### Bước 2: Tích hợp engine local
- Wrap `Vieneu()` hoặc adapter tương đương cho synthesize preset.
- Bảo đảm chạy ngoài main thread.
- Artifact đầu ra:
  - synthesize preset thành công từ UI

### Bước 3: Tích hợp clone giọng
- Thêm input `ref_audio` và `ref_text`.
- Validate file và normalize lỗi.
- Artifact đầu ra:
  - clone path hoạt động từ UI

### Bước 4: Playback và export
- Lưu audio kết quả vào temp file.
- Phát lại và export WAV.
- Artifact đầu ra:
  - play/stop/export hoạt động

### Bước 5: Settings và engine status
- Lưu settings cục bộ.
- Hiển thị trạng thái `loading`, `ready`, `running`, `error`.
- Artifact đầu ra:
  - restart app vẫn khôi phục settings

## Checkpoint kỹ thuật
- UI không bị treo khi inference.
- Một job tại một thời điểm trong MVP.
- Mọi lỗi hiển thị rõ ràng và có log.

## Điều kiện dừng
- Dừng nếu synthesize preset chưa thành công ổn định.
- Không sang workflow API khi app còn crash ở success path cơ bản.

## Handoff
- Bàn giao shell desktop ổn định cho workflow `03-desktop-api-hardening`.
- Ghi lại smoke checklist và known issues.
