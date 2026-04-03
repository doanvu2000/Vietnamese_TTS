# Spec: Web API Integration

## Endpoint contract
- `GET /health`
- `GET /v1/voices`
- `POST /v1/synthesize`
- `POST /v1/clone`

## Request mapping
### Synthesize
```json
{
  "text": "Xin chào Anh",
  "voice_id": "xuan_vinh",
  "speed": 1.0,
  "format": "wav"
}
```

### Clone
- `text`
- `ref_text`
- `ref_audio`
- `speed`
- `format`

## Response handling
- Success của synthesize/clone là `audio/wav`.
- Frontend phải đọc response dưới dạng `Blob`.
- Blob được gắn vào audio element qua `Blob URL`.

## Error handling
- Nếu backend trả JSON lỗi chuẩn hóa, ưu tiên hiển thị `error.message`.
- Nếu network fail hoặc timeout, map sang thông báo ngắn gọn cho người dùng.
- Timeout mặc định phía frontend: 30 giây.

## Retry policy
- `GET /health` và `GET /v1/voices`: cho phép refresh thủ công.
- `POST /v1/synthesize` và `POST /v1/clone`: không auto retry.
