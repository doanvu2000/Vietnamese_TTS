# Spec: Web File Structure

## Cấu trúc
- `web/index.html`: layout và DOM id cố định
- `web/assets/css/main.css`: toàn bộ style
- `web/assets/js/config.js`: config public
- `web/assets/js/api.js`: request wrapper và endpoint functions
- `web/assets/js/state.js`: state store/subscription
- `web/assets/js/audio.js`: audio playback + download
- `web/assets/js/app.js`: boot, event handlers, render
- `web/assets/icons/`: chỗ đặt icon/static asset nếu phát sinh

## Naming conventions
- DOM id dùng kebab-case.
- JS function dùng camelCase.
- File JS tách theo trách nhiệm, không có file tiện ích tổng hợp mơ hồ.

## Ràng buộc
- Không thêm build tool.
- Không thêm thư viện state management.
- Không thêm CSS framework.
