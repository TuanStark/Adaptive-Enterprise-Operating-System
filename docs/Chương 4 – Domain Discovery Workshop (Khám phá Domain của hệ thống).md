# Senior Fullstack Engineer Residency

# Chương 4 – Domain Discovery Workshop (Khám phá Domain của hệ thống)

> **"Đến thời điểm này, chúng ta vẫn chưa viết một dòng code nào. Nhưng chúng ta đã hiểu doanh nghiệp vận hành như thế nào. Bây giờ là lúc chuyển kiến thức về nghiệp vụ thành mô hình Domain."**

Đây là chương quan trọng nhất của toàn bộ dự án.

Rất nhiều lập trình viên nghĩ rằng Domain-Driven Design là:

* Tạo Entity.
* Tạo Repository.
* Tạo Aggregate.

Đó chỉ là phần cuối.

Domain Discovery bắt đầu bằng việc hiểu **ngôn ngữ của doanh nghiệp**.

---

# Mục tiêu của chương

Sau chương này chúng ta phải trả lời được:

* Hệ thống thực sự gồm những Domain nào?
* Các Domain giao tiếp với nhau như thế nào?
* Ranh giới của từng Domain ở đâu?
* Điều gì thuộc Domain này nhưng không thuộc Domain khác?
* Domain nào là Core Domain?
* Domain nào là Supporting Domain?
* Domain nào có thể thay thế bằng sản phẩm bên ngoài?

Đây là nền móng cho toàn bộ kiến trúc phần mềm.

---

# 1. Ubiquitous Language

Một trong những nguyên nhân lớn nhất khiến dự án trở nên hỗn loạn là mỗi nhóm sử dụng một thuật ngữ khác nhau cho cùng một khái niệm.

Ví dụ.

Business gọi là:

> Workspace

Developer gọi là:

> Organization

Database đặt tên:

> Company

Frontend lại gọi:

> Team

Bốn cái tên.

Một khái niệm.

Đây là dấu hiệu của một Domain chưa được chuẩn hóa.

Trong AEOS, mọi người phải sử dụng cùng một ngôn ngữ.

Ví dụ.

| Thuật ngữ    | Ý nghĩa                                                   |
| ------------ | --------------------------------------------------------- |
| Workspace    | Không gian làm việc độc lập của một tổ chức hoặc nhóm     |
| Project      | Một tập hợp công việc nhằm đạt một mục tiêu               |
| Task         | Đơn vị công việc nhỏ nhất có thể giao cho người thực hiện |
| Knowledge    | Tri thức của doanh nghiệp dưới dạng Wiki hoặc Document    |
| Document     | Một tài liệu có Version và vòng đời riêng                 |
| Workflow     | Chuỗi các bước tự động hóa                                |
| Automation   | Hệ thống thực thi Workflow                                |
| Integration  | Kết nối với hệ thống bên ngoài                            |
| AI Assistant | Thành phần AI hỗ trợ người dùng                           |

Kể từ bây giờ, toàn bộ tài liệu, code và cuộc họp đều phải sử dụng các thuật ngữ này.

---

# 2. Event Storming

Thay vì bắt đầu bằng Entity, chúng ta bắt đầu bằng câu hỏi:

> **Điều gì xảy ra trong doanh nghiệp?**

Mỗi câu trả lời sẽ là một Domain Event.

Ví dụ.

## Workspace

* Workspace Created.
* Workspace Updated.
* Workspace Archived.

---

## Member

* Member Invited.
* Invitation Accepted.
* Member Joined Workspace.
* Member Removed.

---

## Project

* Project Created.
* Project Archived.
* Project Member Added.

---

## Task

* Task Created.
* Task Assigned.
* Task Started.
* Task Completed.
* Task Reopened.

---

## Document

* Document Uploaded.
* Document Updated.
* Document Published.
* Document Archived.

---

## Workflow

* Workflow Created.
* Workflow Executed.
* Workflow Failed.

---

## AI

* AI Summary Generated.
* AI Question Answered.
* AI Action Suggested.

Điểm cần nhớ là:

Event mô tả **điều đã xảy ra**.

Không phải hành động sẽ xảy ra.

---

# 3. Phân loại Domain

Không phải Domain nào cũng quan trọng như nhau.

Theo Domain-Driven Design, chúng ta chia thành ba nhóm.

## Core Domain

Đây là phần tạo nên giá trị khác biệt của AEOS.

Bao gồm:

* Knowledge Management.
* Workflow Automation.
* AI Assistant.
* Unified Search.

Đây là nơi chúng ta đầu tư nhiều nhất.

---

## Supporting Domain

Bao gồm:

* Project.
* Task.
* Notification.
* Analytics.

Chúng quan trọng nhưng không tạo lợi thế cạnh tranh.

---

## Generic Domain

Bao gồm:

* Authentication.
* Email.
* File Storage.
* Payment (nếu có).

Đây là các chức năng phổ biến, có thể sử dụng giải pháp có sẵn thay vì tự phát triển.

---

# 4. Bounded Context

Sau khi xác định Domain, chúng ta cần xác định ranh giới.

```text id="5d0rpn"
Identity

Workspace

Knowledge

Project

Task

Workflow

Automation

Search

AI

Notification

Integration

Analytics
```

Mỗi Bounded Context có:

* Business Rule riêng.
* Database Model riêng (nếu cần).
* API riêng.
* Domain Event riêng.
* Không được truy cập trực tiếp dữ liệu của Context khác.

Ví dụ.

Task Context không được chỉnh sửa trực tiếp Document.

Nó phải giao tiếp thông qua Domain Event hoặc Application Service.

---

# 5. Context Mapping

Bây giờ chúng ta xác định các Context liên kết với nhau như thế nào.

```text id="m3pc9d"
Workspace
     │
     ├──────────────┐
     │              │
     ▼              ▼
Project         Knowledge
     │              │
     ▼              ▼
Task         Unified Search
     │              │
     └──────┬───────┘
            ▼
      Workflow Engine
            │
            ▼
      AI Assistant
            │
            ▼
     Notification
```

Mỗi mũi tên thể hiện sự phụ thuộc về nghiệp vụ.

Không phải phụ thuộc về code.

---

# 6. Aggregate Discovery

Chúng ta chưa thiết kế Aggregate chi tiết.

Nhưng đã có thể xác định các Aggregate Root.

Ví dụ.

| Bounded Context | Aggregate Root |
| --------------- | -------------- |
| Workspace       | Workspace      |
| Project         | Project        |
| Task            | Task           |
| Knowledge       | Document       |
| Workflow        | Workflow       |
| AI              | Conversation   |
| Notification    | Notification   |

Đây sẽ là trung tâm của từng Domain.

---

# 7. Value Object Discovery

Không phải mọi thứ đều là Entity.

Ví dụ.

Trong Task.

Priority.

Deadline.

Estimate.

Status.

Đây là các Value Object.

Trong Document.

Version.

Author.

Permission.

Metadata.

Đây cũng là Value Object.

Việc phân biệt đúng Entity và Value Object giúp Domain rõ ràng và dễ bảo trì hơn.

---

# 8. Domain Service Discovery

Có những nghiệp vụ không thuộc riêng Entity nào.

Ví dụ.

Khi Publish một Document.

Hệ thống phải:

* Kiểm tra quyền.
* Tạo Version.
* Gửi Event.
* Cập nhật Search Index.
* Kích hoạt AI Summary.
* Thông báo cho người theo dõi.

Đây là nghiệp vụ liên quan nhiều Aggregate.

Đó là ứng viên cho Domain Service hoặc Application Service, tùy theo phạm vi của Business Rule.

---

# 9. Những câu hỏi còn bỏ ngỏ

Sau Domain Discovery, chúng ta đã hiểu cấu trúc nghiệp vụ.

Nhưng vẫn còn nhiều câu hỏi cần giải quyết.

Ví dụ.

* Task và Document liên kết như thế nào?
* Workflow lưu trạng thái ở đâu?
* Search cập nhật theo thời gian thực hay bất đồng bộ?
* AI lấy dữ liệu từ Context nào?
* Notification được kích hoạt bởi Event nào?
* Context nào được phép giao tiếp trực tiếp?

Những câu hỏi này sẽ được giải quyết ở chương tiếp theo.

---

# Deliverables của Chương 4

Sau khi hoàn thành chương này, chúng ta phải có:

* Ubiquitous Language Dictionary.
* Domain Event Catalogue.
* Core Domain Map.
* Supporting Domain Map.
* Generic Domain Map.
* Bounded Context Diagram.
* Context Map.
* Aggregate Candidate List.
* Value Object Candidate List.

Đây là nền móng của toàn bộ Domain Model.

---

# Engineering Mindset

Một Junior thường nghĩ:

> "Entity của tôi sẽ có những trường nào?"

Một Senior sẽ hỏi:

> **"Đâu là ranh giới của Domain, và Business Rule này thuộc về Context nào?"**

Nếu ranh giới Domain không rõ ràng, hệ thống sẽ nhanh chóng xuất hiện Coupling, Circular Dependency và Technical Debt.

---

# Chuẩn đầu ra của Chương 4

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Chuẩn hóa ngôn ngữ nghiệp vụ bằng Ubiquitous Language.
* Khám phá Domain thông qua Event Storming.
* Phân chia Core, Supporting và Generic Domain.
* Xác định Bounded Context và Context Map.
* Nhận diện Aggregate Root và Value Object.
* Chuẩn bị đầy đủ đầu vào để thiết kế Domain Model chi tiết.

> **Chương 5 sẽ là Domain Modeling. Chúng ta sẽ đi sâu vào từng Bounded Context, thiết kế Aggregate, Entity, Value Object, Domain Service, Repository Interface và Domain Event để xây dựng mô hình nghiệp vụ hoàn chỉnh của AEOS trước khi nghĩ đến Database hay Framework.**
