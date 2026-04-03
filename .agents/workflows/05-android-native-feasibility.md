# Workflow 05: Android Native Feasibility

## Mục tiêu
- Chạy spike kỹ thuật có kiểm soát để quyết định có nên đầu tư Android native on-device hay không.

## Prerequisite
- Hoàn tất workflow `01-upstream-baseline`.
- Có thể chạy MVP Android qua API để so sánh trải nghiệm tối thiểu.

## Các bước
### Bước 1: Chọn candidate runtime
- Chốt tối thiểu 3 hướng:
  - ONNX Runtime Mobile
  - llama.cpp / GGUF
  - JNI/native bridge khác nếu cần
- Artifact đầu ra:
  - danh sách candidate và lý do chọn

### Bước 2: Chuẩn hóa bộ đo
- Chọn thiết bị test, text test, audio test và cách đo.
- Artifact đầu ra:
  - benchmark protocol

### Bước 3: Chạy prototype tối thiểu cho từng hướng
- Dựng prototype đủ để synthesize text ngắn.
- Nếu clone giọng chưa chạy được, phải ghi rõ blocker thay vì bỏ qua.
- Artifact đầu ra:
  - prototype notes cho từng hướng

### Bước 4: Benchmark và ghi rủi ro
- Đo:
  - app size tăng thêm
  - model size
  - RAM peak
  - cold start
  - latency text ngắn
  - complexity ABI/package
  - clone support
  - audio codec path
- Artifact đầu ra:
  - bảng benchmark so sánh

### Bước 5: Chốt quyết định
- Đưa ra `go`, `conditional go` hoặc `no-go`.
- Nêu rõ điều kiện cần nếu muốn tiếp tục.
- Artifact đầu ra:
  - feasibility report cuối cùng

## Checkpoint kỹ thuật
- Có dữ liệu benchmark thật, không suy luận từ desktop.
- Có đánh giá riêng cho clone path.
- Có so sánh với remote API MVP hiện tại.

## Điều kiện dừng
- Dừng nếu chưa có benchmark đáng tin hoặc chỉ có demo một lần.
- Dừng với `no-go` nếu memory, size hoặc cold start vượt ngưỡng chấp nhận mà không có cách giảm rõ ràng.

## Handoff
- Nếu `go`: tạo implementation backlog native riêng.
- Nếu `no-go`: giữ Android ở API mode và đóng phase spike.
