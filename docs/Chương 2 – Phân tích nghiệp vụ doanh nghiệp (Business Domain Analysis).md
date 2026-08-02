# Senior Fullstack Engineer Residency

# Chương 2 – Phân tích nghiệp vụ doanh nghiệp (Business Domain Analysis)

> **"Nếu Chương 1 trả lời doanh nghiệp là ai, thì Chương 2 sẽ trả lời doanh nghiệp hoạt động như thế nào."**

Đến thời điểm này, chúng ta vẫn chưa được phép nói về:

* Database.
* API.
* NestJS.
* React.
* PostgreSQL.
* Kubernetes.

Bởi vì chúng ta vẫn chưa hiểu rõ nghiệp vụ.

Một Solution Architect luôn tuân theo nguyên tắc:

> **Không thiết kế hệ thống cho đến khi hiểu được cách doanh nghiệp vận hành.**

---

# 1. Hiểu mô hình doanh nghiệp

Trước khi xây AEOS, chúng ta cần hiểu khách hàng của mình.

Giả sử khách hàng đầu tiên là **ABC Technology**, một công ty phát triển phần mềm với khoảng 150 nhân viên.

Cơ cấu tổ chức như sau:

```text
CEO
│
├── Human Resources
├── Engineering
│   ├── Backend Team
│   ├── Frontend Team
│   ├── Mobile Team
│   ├── QA Team
│   └── DevOps Team
├── Marketing
├── Sales
└── Finance
```

Mỗi phòng ban có quy trình làm việc khác nhau, nhưng tất cả đều cần:

* Quản lý nhân sự.
* Quản lý tài liệu.
* Quản lý công việc.
* Phân quyền.
* Theo dõi lịch sử.
* Cộng tác.

Đây chính là phạm vi của AEOS.

---

# 2. Phân tích các quy trình nghiệp vụ

Một doanh nghiệp không chỉ có một quy trình.

Chúng ta cần liệt kê toàn bộ các quy trình chính.

Ví dụ:

## Identity

* Đăng ký doanh nghiệp.
* Tạo Workspace.
* Mời thành viên.
* Đăng nhập.
* Đăng xuất.
* Đặt lại mật khẩu.
* Xác thực hai lớp.

---

## Quản lý nhân sự

* Thêm nhân viên.
* Chuyển phòng ban.
* Nghỉ việc.
* Khóa tài khoản.
* Kích hoạt lại.

---

## Quản lý dự án

* Tạo Project.
* Thêm thành viên.
* Phân công Leader.
* Đóng Project.
* Lưu trữ Project.

---

## Quản lý công việc

* Tạo Task.
* Giao Task.
* Cập nhật tiến độ.
* Đánh dấu hoàn thành.
* Mở lại Task.

---

## Quản lý tài liệu

* Upload.
* Chia sẻ.
* Phân quyền.
* Versioning.
* Khôi phục phiên bản.

---

## Thông báo

* Gửi Email.
* Push Notification.
* In-App Notification.

---

Đây mới chỉ là các quy trình cấp cao.

Sau này chúng ta sẽ đi sâu từng quy trình.

---

# 3. Phân tích Actor

Không phải mọi người dùng đều giống nhau.

Trong AEOS, chúng ta xác định các Actor sau:

| Actor           | Vai trò                  |
| --------------- | ------------------------ |
| Owner           | Chủ sở hữu Workspace     |
| Administrator   | Quản trị hệ thống        |
| Manager         | Quản lý phòng ban        |
| Team Leader     | Quản lý nhóm             |
| Member          | Nhân viên                |
| Guest           | Người dùng được mời      |
| AI Agent        | Thực hiện tác vụ AI      |
| Scheduler       | Thực hiện tác vụ định kỳ |
| External System | Hệ thống tích hợp        |

Mỗi Actor có:

* Quyền hạn.
* Trách nhiệm.
* Luồng nghiệp vụ riêng.

---

# 4. Phân tích Business Capability

Một sai lầm phổ biến là chia hệ thống theo bảng dữ liệu.

Ví dụ:

* User.
* Task.
* Document.

Đó là tư duy Database.

Chúng ta sẽ chia theo **Business Capability**.

```text
Enterprise Collaboration
│
├── Identity & Access
├── Workspace Management
├── Project Management
├── Task Management
├── Knowledge Management
├── Communication
├── Search
├── Notification
├── Automation
├── AI Platform
├── Audit
└── Administration
```

Business Capability phản ánh khả năng mà doanh nghiệp cần, không phải cách lưu trữ dữ liệu.

---

# 5. Business Process Mapping

Ví dụ quy trình **Onboarding nhân viên mới**.

```text
HR tạo hồ sơ

↓

Manager phê duyệt

↓

Tạo tài khoản

↓

Mời vào Workspace

↓

Gán Department

↓

Gán Role

↓

Thêm vào Project

↓

Cấp quyền Document

↓

Gửi Email chào mừng

↓

Ghi Audit Log
```

Ở bước này, chúng ta chưa quan tâm hệ thống thực hiện như thế nào.

Chúng ta chỉ mô tả đúng quy trình của doanh nghiệp.

---

# 6. Xác định Pain Points

Một Solution Architect không chỉ ghi nhận quy trình.

Họ phải tìm ra vấn đề.

Ví dụ:

## Pain Point 1

Nhân viên mới mất nhiều giờ mới được cấp đủ quyền.

---

## Pain Point 2

Thông tin nằm ở nhiều hệ thống khác nhau.

---

## Pain Point 3

Không biết ai đã chỉnh sửa tài liệu.

---

## Pain Point 4

Không có quy trình tự động.

---

## Pain Point 5

Quản lý quyền truy cập quá phức tạp.

---

Những Pain Point này sẽ quyết định các tính năng cần xây dựng.

---

# 7. Opportunity Analysis

Sau khi xác định vấn đề, chúng ta tìm cơ hội cải thiện.

Ví dụ:

| Pain Point              | Giải pháp            |
| ----------------------- | -------------------- |
| Onboarding thủ công     | Workflow Automation  |
| Nhiều tài khoản         | Single Sign-On       |
| Không tìm được tài liệu | AI Search            |
| Thiếu lịch sử           | Audit Log            |
| Thiếu cộng tác          | Workspace thống nhất |

Mỗi giải pháp phải giải quyết một vấn đề cụ thể.

---

# 8. Business Rules Catalogue

Đây là phần rất quan trọng.

Ví dụ:

### Workspace

* Mỗi Organization có ít nhất một Workspace.
* Workspace không được xóa nếu còn Project đang hoạt động.

### Member

* Một Email chỉ thuộc một Member trong cùng Workspace.
* Member bị khóa không thể đăng nhập.

### Project

* Chỉ Owner hoặc Admin được Archive Project.
* Không được Archive Project nếu còn Task đang thực hiện.

### Document

* Chỉ người có quyền Edit mới được tạo Version mới.
* Document bị xóa vẫn phải lưu trong Audit Log.

Business Rule sẽ là nền tảng cho Domain Model ở các chương sau.

---

# 9. Event Identification

Mặc dù chưa bước vào Event Storming, chúng ta đã có thể nhận diện các sự kiện nghiệp vụ.

Ví dụ:

* Workspace Created.
* Member Invited.
* Invitation Accepted.
* Project Created.
* Task Assigned.
* Task Completed.
* Document Uploaded.
* Document Shared.
* Notification Sent.
* Audit Recorded.

Những Event này phản ánh những gì xảy ra trong doanh nghiệp.

---

# 10. Deliverables của Chương 2

Sau khi hoàn thành chương này, chúng ta phải có:

* Danh sách Actor.
* Danh sách Business Capability.
* Business Process Mapping.
* Pain Point Analysis.
* Opportunity Analysis.
* Business Rules Catalogue.
* Business Event Catalogue.

Đây là toàn bộ đầu vào để bước sang giai đoạn thiết kế Domain.

---

# Engineering Mindset

Một Junior thường hỏi:

> "Database sẽ có bao nhiêu bảng?"

Một Solution Architect sẽ hỏi:

> "Doanh nghiệp đang vận hành như thế nào?"

Một Senior Engineer hiểu rằng:

> **Nếu phân tích nghiệp vụ sai, mọi thiết kế phía sau đều sẽ sai theo.**

Đó là lý do Business Analysis luôn là nền móng của mọi hệ thống Enterprise.

---

# Chuẩn đầu ra của Chương 2

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Phân tích mô hình hoạt động của doanh nghiệp.
* Xác định Business Capability thay vì chỉ nhìn vào Entity.
* Mô hình hóa Business Process.
* Phân tích Pain Point và Opportunity.
* Xây dựng Business Rules Catalogue.
* Nhận diện các Business Event trước khi thiết kế Domain.
* Chuẩn bị đầy đủ đầu vào cho Domain-Driven Design.

> **Chương 3 sẽ là bước ngoặt đầu tiên của dự án. Chúng ta sẽ bắt đầu xây dựng Domain Model của AEOS bằng Event Storming, Ubiquitous Language, Bounded Context, Aggregate và Context Map. Đây là lúc nghiệp vụ được chuyển hóa thành nền tảng cho toàn bộ kiến trúc phần mềm.**
