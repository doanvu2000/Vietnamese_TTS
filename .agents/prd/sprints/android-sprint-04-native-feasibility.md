# Sprint PRD: Android Sprint 04 - Native Feasibility Spike

> PRD tổng: [android-integration-prd.md](../android-integration-prd.md)

## 1. Mục tiêu sprint
- Chạy spike kỹ thuật để ra quyết định có đầu tư Android native on-device hay không.

## 2. Phụ thuộc
- Hoàn tất [android-sprint-03-voice-clone.md](./android-sprint-03-voice-clone.md) hoặc ít nhất đã có Android MVP qua API để so sánh

## 3. Phạm vi
- So sánh ít nhất 3 hướng:
  - ONNX Runtime Mobile
  - llama.cpp / GGUF
  - JNI/native bridge khác nếu cần
- Đo benchmark thật trên thiết bị mục tiêu.

## 4. Deliverables
- Bảng benchmark:
  - model size
  - artifact size tăng thêm
  - RAM peak
  - cold start
  - latency text ngắn
  - clone support
  - độ khó ABI/package
  - độ khó audio codec path
- Kết luận `go`, `conditional go` hoặc `no-go`.

## 5. Công việc triển khai
### 5.1 Chuẩn hóa benchmark protocol
- Chốt thiết bị, text test, audio mẫu test, cách đo.

### 5.2 Prototype từng hướng
- Dựng prototype nhỏ nhất có thể.
- Nếu clone path chưa chạy được phải ghi blocker cụ thể.

### 5.3 Decision memo
- So sánh với Android API MVP hiện tại.
- Nêu rõ chi phí kỹ thuật nếu tiếp tục native.

## 6. Acceptance criteria
- Có benchmark lặp lại được trên thiết bị mục tiêu.
- Có kết luận rõ và lý do kỹ thuật đủ mạnh.
- Không dùng suy luận từ desktop để thay thế benchmark Android.

## 7. Điều kiện hoàn thành
- Nếu không đạt exit criteria thì đóng sprint với `no-go` và giữ Android ở API mode.
