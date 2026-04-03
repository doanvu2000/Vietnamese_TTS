# Spec: Web Static Demo Architecture

## Mục tiêu
- Khóa cấu trúc frontend tĩnh cho web demo local.

## Kiến trúc
- Một trang `index.html`.
- CSS tập trung trong `assets/css/main.css`.
- JS chia module:
  - `config.js`: cấu hình public
  - `api.js`: wrapper gọi desktop local API
  - `state.js`: state store đơn giản
  - `audio.js`: playback/download blob audio
  - `app.js`: bind DOM, event và render

## DOM sections bắt buộc
- `backend status`
- `global error banner`
- `synthesize form`
- `clone form`
- `result panel`

## Data flow
1. `app.js` boot và đọc `window.APP_CONFIG`.
2. Gọi `health` và `voices`.
3. Render state ra UI.
4. Submit synthesize/clone gọi `api.js`.
5. Blob audio chuyển qua `audio.js`, cập nhật result panel.

## Nguyên tắc
- Không inline JS trong HTML.
- Không trộn fetch logic vào DOM template.
- Không thêm framework hoặc bundler.
