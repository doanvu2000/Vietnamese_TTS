# Skill: upstream-vieneu-integration

## Trigger
- Dùng khi cần tích hợp hoặc cập nhật từ upstream `VieNeu-TTS`.
- Dùng khi cần xác nhận mode hỗ trợ, dependency strategy, model path hoặc giới hạn tính năng.

## Mục tiêu
- Giữ implementation bám đúng nhánh ổn định của upstream.
- Tránh dùng assumption không có trong README/code hiện tại.
- Ghi lại rõ phần nào là support thật, phần nào chỉ là roadmap.

## Input cần có
- Repo local hiện tại.
- Link hoặc commit/tag upstream muốn bám.
- Mục tiêu runtime: desktop local, server remote hay Android client.

## Checklist bắt buộc
- Đọc README upstream và xác nhận:
  - local `turbo` path
  - `remote` mode
  - tình trạng mobile support
- Chốt version hoặc commit upstream sẽ bám.
- Liệt kê dependency bắt buộc cho mode đang làm.
- Xác định chính xác feature nào là:
  - supported now
  - experimental
  - roadmap only
- Ghi ràng buộc license nếu dùng model không mặc định.

## Nguyên tắc không được vi phạm
- Không mô tả Android native như capability đã sẵn sàng nếu upstream chưa hỗ trợ chính thức.
- Không chọn GPU-only path cho MVP desktop local-first.
- Không thêm contract API trái với khả năng hiện có mà không ghi rõ lớp adapter cần bù.
- Không assume preset voice, model name hoặc field schema nếu chưa xác minh.

## Output kỳ vọng
- Baseline integration note gồm:
  - upstream version/commit
  - mode được phép dùng
  - dependency strategy
  - model strategy
  - known risks
- Danh sách assumption cần giữ đồng nhất trong PRD, skills khác và workflows.

## Definition of done
- Người triển khai đọc skill này biết chính xác:
  - nên bám mode nào
  - không được dùng mode nào
  - cần kiểm tra gì trước khi code
  - cần cập nhật tài liệu nào nếu upstream đổi
