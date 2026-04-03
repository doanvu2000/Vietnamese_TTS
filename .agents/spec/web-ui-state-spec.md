# Spec: Web UI State

## State chung
- `backend.status`: `idle | loading | ok | error`
- `voices`: danh sách preset voice
- `busy`: request đang chạy hay không
- `result`: `{ kind, filename, blob, objectUrl }`
- `error`: thông báo lỗi hiện tại

## Luật state
- Khi `busy = true`:
  - disable nút synthesize
  - disable nút clone
  - disable nút refresh status
- Khi chưa có `result.blob`:
  - disable play
  - disable stop
  - disable download
- Khi request thành công:
  - clear error banner
  - cập nhật `result`
- Khi request lỗi:
  - giữ kết quả cũ nếu có
  - chỉ cập nhật `error`

## Form rules
- Text synthesize không được rỗng.
- Clone cần đủ `text`, `ref_text`, `ref_audio`.
- `speed` mặc định `1.0`.

## UX rules
- Backend status luôn hiển thị ở đầu trang.
- Error banner là global, không được che mất result cũ.
- Result panel dùng chung cho synthesize và clone.
