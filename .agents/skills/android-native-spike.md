# Skill: android-native-spike

## Trigger
- Dùng khi cần đánh giá khả năng chạy `VieNeu-TTS` on-device trên Android.
- Chỉ dùng cho phase nghiên cứu, không dùng như skill triển khai MVP.

## Mục tiêu
- Đưa ra quyết định `go/no-go` dựa trên benchmark thật.
- So sánh các hướng native thay vì chọn theo cảm tính.

## Input cần có
- Thiết bị Android mục tiêu hoặc lớp thiết bị mục tiêu.
- Model/runtime candidate.
- Bộ text test và audio mẫu test cố định.

## Checklist bắt buộc
- Đánh giá ít nhất 3 hướng:
  - ONNX Runtime Mobile
  - llama.cpp / GGUF path
  - JNI/native bridge khác nếu cần
- Đo cho mỗi hướng:
  - artifact size tăng thêm
  - model size
  - RAM peak
  - cold start
  - thời gian synthesize text ngắn
  - độ phức tạp đóng gói ABI
  - mức hỗ trợ clone giọng
  - độ khó audio codec path
- Ghi rõ giả định phần cứng và phiên bản Android.
- Chốt rủi ro build, phân phối APK/AAB và bảo trì.

## Nguyên tắc không được vi phạm
- Không xem prototype chạy được một lần là đủ để sang implementation.
- Không bỏ qua benchmark RAM và cold start.
- Không đánh đồng khả năng synthesize text với khả năng clone giọng.
- Không dùng kết quả benchmark từ desktop để suy ra Android.

## Output kỳ vọng
- Báo cáo feasibility có bảng so sánh.
- Kết luận `go`, `conditional go` hoặc `no-go`.
- Danh sách blocker phải xử lý nếu muốn bước sang implementation native.

## Definition of done
- Có benchmark lặp lại được.
- Có quyết định rõ và lý do kỹ thuật đủ mạnh để bảo vệ quyết định đó.
