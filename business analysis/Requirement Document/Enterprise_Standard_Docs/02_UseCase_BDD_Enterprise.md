# AEOS - Đặc tả Use Case & BDD (Tập trung Core Domains)

Thay vì đi sâu vào các tính năng CRUD đơn giản của Workspace hay Identity, tài liệu này tập trung đặc tả hành vi của các **Core Domains** tạo nên giá trị riêng biệt của AEOS: Knowledge Management (Quản lý Tri thức), Workflow Automation, và AI Assistant.

---

## 1. Module: Knowledge Management (Quản lý Tri thức)

### UC-KNW-001: Phát hành Tài liệu (Publish Document)

**1. Thông tin cơ bản**
- **Actor**: `DOCUMENT_AUTHOR` hoặc `WORKSPACE_ADMIN`.
- **Trigger**: Actor nhấn nút "Publish".
- **Mục tiêu**: Chốt phiên bản tài liệu hiện tại và đưa vào kho tìm kiếm chung (Unified Search) để mọi người có quyền đều có thể đọc.

**2. Điều kiện**
- **Pre-conditions**:
  - Tài liệu (Aggregate Root) đang ở trạng thái `DRAFT` hoặc `IN_REVIEW`.
  - Actor có quyền `DOCUMENT_PUBLISH`.
- **Post-conditions**:
  - Version của tài liệu tăng lên (VD: v1.0 -> v1.1).
  - Trạng thái chuyển thành `PUBLISHED`. Không ai được chỉnh sửa trực tiếp version này (mọi thay đổi sau đó phải tạo Draft mới).
  - Hệ thống publish Domain Event: `DocumentPublishedEvent`.

**3. Luồng Thành công Chính (Cross-Context Interactions)**
1. Knowledge Context xác thực quyền và cập nhật trạng thái Document thành `PUBLISHED` (Lưu Transaction Database nội bộ).
2. Knowledge Context bắn sự kiện `DocumentPublishedEvent` ra Internal Event Bus.
3. Search Context bắt Event -> Parse nội dung -> Cập nhật Index trong OpenSearch.
4. AI Context bắt Event -> Bắt đầu chạy ngầm job tạo AI Summary (Tóm tắt).
5. Notification Context bắt Event -> Gửi thông báo đến những người "Follow" tài liệu này.

---

## 2. Module: Workflow Automation (Tự động hóa)

### UC-WFA-001: Tự động hóa dựa trên sự kiện (Event-driven Workflow)

**1. Thông tin cơ bản**
- **Actor**: System (Workflow Engine chạy tự động).
- **Trigger**: Có một Domain Event xảy ra trong hệ thống (Ví dụ: `DocumentPublishedEvent`).

**2. Luồng Ngoại lệ Chính (Trọng tâm)**
- **EX-1: Hành động (Action) trong Workflow thất bại**
  - Workflow được cấu hình: *Khi Document Published -> Gửi Slack Message -> Tạo Task Review*.
  - Nếu bước Gửi Slack bị lỗi mạng (Timeout).
  - Hệ thống Workflow Engine áp dụng **Retry Pattern** (Ví dụ: thử lại 3 lần với exponential backoff). 
  - Nếu vẫn thất bại, trạng thái Workflow Execution bị đánh dấu `FAILED` và bắn `WorkflowFailedEvent` để báo cho chủ sở hữu Workspace. Hệ thống dừng bước "Tạo Task".

---

## 3. Đặc tả BDD (Behavior-Driven Development)

### BDD-AI-001: AI Trả lời câu hỏi tuân thủ Phân quyền (Permission-aware AI)

**Scenario**: Một nhân viên hỏi AI về thông tin tài chính nhưng không có quyền xem thư mục tài chính.
- **Given** (Cho trước):
  - Tài khoản "John" là `MEMBER` của Workspace "Acme".
  - Có một Document tên là "Báo cáo Doanh thu Q1" nằm trong thư mục Finance.
  - Thư mục Finance chỉ cho phép `MANAGER` và `OWNER` đọc (John không có quyền).
- **When** (Khi):
  - "John" mở AI Assistant và hỏi: "Doanh thu Q1 của công ty là bao nhiêu?"
- **Then** (Thì):
  - AI Context sẽ gọi Sang Identity/Knowledge Context để lấy Access Context của John.
  - AI Query Engine truy vấn Vector Database có đính kèm bộ lọc `permission=John_access`.
  - AI không nhìn thấy "Báo cáo Doanh thu Q1".
  - Hệ thống trả lời: "Tôi không tìm thấy thông tin nào liên quan đến Doanh thu Q1 mà bạn có quyền truy cập."
  - Hệ thống (AI Context) ghi Audit Log về câu hỏi bị từ chối do thiếu quyền.

### BDD-SRC-001: Tìm kiếm hợp nhất (Unified Search)

**Scenario**: Người dùng tìm kiếm một từ khóa tồn tại ở cả Document, Task và Comment.
- **Given**:
  - Người dùng nhập từ khóa "Roadmap 2026".
- **When**:
  - Search Context nhận request.
- **Then**:
  - Hệ thống truy vấn OpenSearch Cluster.
  - Hệ thống tự động filter ra các kết quả mà người dùng không có quyền truy cập (Dựa vào ACL - Access Control List lưu trên OpenSearch).
  - Hệ thống trả về list hỗn hợp (Mixed list) bao gồm: Document A, Task B, và Comment C.
  - Kết quả được phân trang (Pagination) và sắp xếp (Ranking) theo độ liên quan (Relevance).
