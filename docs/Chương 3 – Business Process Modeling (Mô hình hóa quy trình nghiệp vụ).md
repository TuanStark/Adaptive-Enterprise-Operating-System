# Senior Fullstack Engineer Residency

# Chương 3 – Business Process Modeling (Mô hình hóa quy trình nghiệp vụ)

> **"Chúng ta không thiết kế phần mềm. Chúng ta mô hình hóa cách doanh nghiệp vận hành, sau đó phần mềm chỉ là công cụ để hiện thực hóa mô hình đó."**

Sau Chương 2, chúng ta đã biết:

* AEOS giải quyết vấn đề gì.
* Doanh nghiệp đang gặp những khó khăn nào.
* Những Business Capability mà hệ thống cần có.
* Các Actor sẽ sử dụng hệ thống.

Nhưng chúng ta vẫn chưa biết:

> **Doanh nghiệp sẽ vận hành trên AEOS như thế nào?**

Đó chính là mục tiêu của chương này.

---

# Mục tiêu của chương

Chúng ta sẽ mô hình hóa toàn bộ quy trình nghiệp vụ của AEOS.

Không phải quy trình kỹ thuật.

Mà là quy trình mà người dùng thực hiện hằng ngày.

Ví dụ:

* Tạo Workspace.
* Mời thành viên.
* Tạo Project.
* Quản lý Task.
* Quản lý tài liệu.
* Tìm kiếm tri thức.
* Tự động hóa quy trình.
* AI hỗ trợ làm việc.

Những quy trình này sẽ trở thành nền tảng cho toàn bộ Domain Model sau này.

---

# Quy trình số 1 – Workspace Lifecycle

Workspace là đơn vị vận hành cao nhất của AEOS.

Một doanh nghiệp có thể có nhiều Workspace.

Ví dụ:

* Engineering.
* Product.
* Marketing.
* Customer Success.

Quy trình tạo Workspace.

```text
Create Workspace

↓

Configure Workspace

↓

Invite Members

↓

Assign Roles

↓

Create Initial Projects

↓

Enable Integrations

↓

Workspace Ready
```

### Business Rules

* Workspace Name phải duy nhất trong Organization.
* Chỉ Owner mới được xóa Workspace.
* Workspace chỉ được xóa khi không còn Project hoạt động.
* Workspace phải có ít nhất một Owner.

---

# Quy trình số 2 – Member Collaboration

Sau khi có Workspace.

Người dùng sẽ bắt đầu cộng tác.

```text
Invite Member

↓

Accept Invitation

↓

Join Workspace

↓

Assign Role

↓

Join Project

↓

Receive Notifications
```

### Business Rules

* Invitation có thời hạn.
* Một Email không được nhận hai lời mời đang còn hiệu lực trong cùng Workspace.
* Guest không được tạo Project.
* Member chỉ thấy dữ liệu mình có quyền truy cập.

---

# Quy trình số 3 – Project Management

Project là nơi tập hợp các mục tiêu và công việc.

```text
Create Project

↓

Configure Project

↓

Add Members

↓

Create Milestone

↓

Create Task

↓

Execute Project

↓

Archive Project
```

### Business Rules

* Project phải thuộc một Workspace.
* Chỉ Project Lead mới được Archive Project.
* Project Archive không được tạo Task mới.

---

# Quy trình số 4 – Task Lifecycle

Task là đơn vị công việc nhỏ nhất.

```text
Create Task

↓

Assign Member

↓

Start Progress

↓

Review

↓

Complete

↓

Archive
```

### State Machine

```text
Todo

↓

In Progress

↓

Review

↓

Done

↓

Archived
```

### Business Rules

* Task chỉ có thể ở một trạng thái tại một thời điểm.
* Task hoàn thành không được chỉnh sửa trực tiếp.
* Task có thể có Subtask.
* Task có thể phụ thuộc vào Task khác.

---

# Quy trình số 5 – Document Lifecycle

Document là trung tâm của Knowledge Management.

```text
Create Document

↓

Edit

↓

Save Version

↓

Review

↓

Publish

↓

Archive
```

### State Machine

```text
Draft

↓

In Review

↓

Published

↓

Archived
```

### Business Rules

* Không được chỉnh sửa Published Version.
* Mỗi lần chỉnh sửa tạo Version mới.
* Version cũ không được xóa.
* Document phải lưu Audit History.

---

# Quy trình số 6 – Search

Search không đơn thuần là tìm kiếm theo từ khóa.

AEOS hỗ trợ Unified Search.

```text
Search Keyword

↓

Collect Data

↓

Permission Filtering

↓

Ranking

↓

Display Result
```

Kết quả có thể bao gồm:

* Task.
* Document.
* Project.
* Comment.
* Wiki.
* Attachment.

Người dùng chỉ nhìn thấy dữ liệu mà họ có quyền truy cập.

---

# Quy trình số 7 – Workflow Automation

Một trong những điểm khác biệt lớn nhất của AEOS là Workflow Engine.

Ví dụ.

```text
Document Published

↓

Notify Team

↓

Generate AI Summary

↓

Create Review Task

↓

Assign Reviewer

↓

Send Email
```

Toàn bộ quy trình diễn ra tự động.

Không cần thao tác thủ công.

---

# Quy trình số 8 – AI Assistant

AI không phải Chatbot.

AI là một Actor của hệ thống.

Ví dụ.

```text
User Ask Question

↓

Collect Context

↓

Permission Check

↓

Retrieve Knowledge

↓

Generate Answer

↓

Return Result
```

Hoặc.

```text
Meeting Finished

↓

Generate Transcript

↓

Extract Action Items

↓

Create Tasks

↓

Notify Participants
```

AI phải tuân thủ đúng quyền truy cập của từng người dùng.

---

# Mối quan hệ giữa các quy trình

Đến đây chúng ta bắt đầu thấy sự liên kết.

```text
Workspace

│

├── Project

│     ├── Task

│     ├── Document

│     └── Workflow

│

├── Search

├── AI

├── Notification

└── Integration
```

Đây vẫn chưa phải Database.

Đây là mô hình nghiệp vụ.

---

# Những vấn đề cần giải quyết

Sau khi mô hình hóa quy trình, chúng ta nhận thấy nhiều câu hỏi mới.

Ví dụ.

* Document thuộc Workspace hay Project?
* AI đọc dữ liệu bằng cách nào?
* Notification được gửi đồng bộ hay bất đồng bộ?
* Workflow chạy ở đâu?
* Search Index được cập nhật khi nào?
* Nếu Workflow thất bại thì xử lý thế nào?
* Có cần Retry không?
* Có cần Audit cho mọi hành động không?

Đây là những câu hỏi sẽ dẫn chúng ta đến việc thiết kế Domain.

---

# Deliverables của Chương 3

Sau chương này, chúng ta phải có:

* Business Process Map.
* Business Flow cho từng Capability.
* State Machine của các đối tượng chính.
* Business Rules Catalogue.
* Relationship giữa các quy trình.
* Danh sách các vấn đề cần giải quyết ở tầng Domain.

---

# Engineering Mindset

Một Junior nhìn thấy:

> "Task."

Một Senior nhìn thấy:

> **"Task là một quy trình nghiệp vụ có vòng đời, trạng thái, quy tắc và mối quan hệ với nhiều Capability khác."**

Chỉ khi hiểu được vòng đời của nghiệp vụ, chúng ta mới có thể thiết kế Domain chính xác.

---

# Chuẩn đầu ra của Chương 3

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Mô hình hóa quy trình nghiệp vụ của một hệ thống Enterprise.
* Thiết kế Business Flow cho từng Business Capability.
* Xây dựng State Machine cho các đối tượng quan trọng.
* Xác định Business Rules và mối quan hệ giữa các quy trình.
* Chuẩn bị đầy đủ đầu vào để bước sang **Domain Discovery**.

> **Chương 4 sẽ là Domain Discovery Workshop. Chúng ta sẽ bắt đầu Event Storming, xây dựng Ubiquitous Language, xác định Bounded Context, Aggregate, Domain Event và Context Map. Đây là lúc bài toán nghiệp vụ được chuyển hóa thành mô hình Domain của hệ thống.**
