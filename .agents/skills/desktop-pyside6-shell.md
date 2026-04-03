# Skill: desktop-pyside6-shell

## Trigger
- Dùng khi triển khai desktop app Win/Mac cho TTS local-first.
- Dùng khi build UI `PySide6`, app state, playback, export, settings hoặc packaging shell.

## Mục tiêu
- Tạo shell desktop đơn giản, ổn định, không block UI.
- Gom mọi tương tác với engine và audio vào các service rõ ràng.

## Input cần có
- PRD desktop local-first.
- Baseline integration note từ upstream.
- Quyết định packaging MVP: `PyInstaller`.

## Checklist bắt buộc
- Tách ít nhất các lớp sau:
  - UI layer
  - engine adapter/service
  - settings store
  - playback service
  - background job runner
- Chạy inference ngoài main thread.
- Có state rõ cho:
  - app startup
  - model loading
  - ready
  - running job
  - error
- Disable/enable control đúng theo state.
- Lưu settings cục bộ và load lại khi mở app.
- Có export WAV từ kết quả gần nhất.
- Có logging file cục bộ cho lỗi vận hành.

## Nguyên tắc không được vi phạm
- Không gọi SDK trực tiếp từ widget event handler nếu có thể block UI.
- Không trộn logic playback, settings và engine vào cùng một widget class.
- Không dùng global mutable state không kiểm soát.
- Không để API server và UI tự tạo mỗi nơi một engine riêng trong MVP.

## Output kỳ vọng
- Shell desktop có thể:
  - nhập text
  - chọn preset voice
  - chọn audio mẫu và nhập `ref_text`
  - synthesize/clone
  - play/stop
  - export WAV
  - xem trạng thái engine
  - bật/tắt local API
- Cấu trúc code rõ ràng để agent khác thêm tính năng mà không phá app loop.

## Packaging notes
- Ưu tiên đường đóng gói ít biến động.
- Windows và macOS dùng cùng kiến trúc app, chỉ tách script build khi cần.
- Asset/model path phải resolve được cả ở chế độ dev lẫn packaged app.

## Definition of done
- Có smoke path end-to-end từ mở app tới export WAV.
- App vẫn responsive trong lúc inference.
- Restart app giữ được settings và không làm hỏng state trước đó.
