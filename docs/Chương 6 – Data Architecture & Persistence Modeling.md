# Senior Fullstack Engineer Residency

# Chương 6 – Data Architecture & Persistence Modeling

> **"Database không quyết định Domain. Domain quyết định Database."**

Sau Chương 5, chúng ta đã có một Domain Model hoàn chỉnh.

Chúng ta biết:

* Aggregate.
* Entity.
* Value Object.
* Domain Event.
* Aggregate Lifecycle.
* Business Rules.

Đây là thời điểm đầu tiên chúng ta bắt đầu nghĩ đến việc lưu trữ dữ liệu.

Lưu ý.

Chúng ta vẫn **chưa viết một dòng SQL nào**.

Chúng ta đang thiết kế **Data Architecture**, không phải tạo bảng.

---

# Mục tiêu của chương

Sau chương này, chúng ta phải xác định được:

* Chiến lược lưu trữ dữ liệu.
* Persistence Model.
* Database Boundary.
* Data Ownership.
* Data Consistency.
* Data Lifecycle.
* Indexing Strategy.
* Versioning Strategy.
* Audit Strategy.

Đây sẽ là nền tảng để thiết kế Database Schema ở chương tiếp theo.

---

# 1. Domain Model ≠ Persistence Model

Một sai lầm phổ biến là cố gắng lưu Aggregate giống hệt Domain.

Ví dụ.

```text id="kz3p71"
Workspace Aggregate

↓

Workspace

↓

Members

↓

Roles

↓

Invitations

↓

Settings
```

Trong Domain, đây là một Aggregate.

Nhưng trong Persistence.

Có thể được lưu thành nhiều bảng khác nhau.

```text id="gh7z8m"
workspaces

workspace_members

workspace_roles

workspace_invitations

workspace_settings
```

Persistence chỉ là cách lưu trữ.

Nó không làm thay đổi Domain.

---

# 2. Data Ownership

Một nguyên tắc rất quan trọng.

Mỗi dữ liệu chỉ có **một chủ sở hữu duy nhất**.

Ví dụ.

```text id="s8d3ja"
Workspace Context

↓

Workspace

↓

Workspace Member

↓

Workspace Settings
```

Project Context.

```text id="4g2qxp"
Project

↓

Milestone
```

Task Context.

```text id="8fj2ru"
Task

↓

Checklist

↓

Comment
```

Knowledge Context.

```text id="k4pq90"
Document

↓

Document Version

↓

Folder
```

Không Context nào được sở hữu dữ liệu của Context khác.

---

# 3. Persistence Boundary

Không phải Aggregate nào cũng lưu trong cùng một Database.

Ví dụ.

```text id="pq1g4c"
Identity Database

Workspace Database

Project Database

Knowledge Database

Workflow Database

Analytics Database
```

Hiện tại chúng ta có thể triển khai dưới dạng **Modular Monolith** với một PostgreSQL duy nhất.

Nhưng ngay từ bây giờ, chúng ta phải thiết kế ranh giới dữ liệu rõ ràng.

Đây là điều giúp hệ thống có thể tách thành Microservices sau này mà không phải thiết kế lại.

---

# 4. Data Consistency

Không phải mọi dữ liệu đều cần Strong Consistency.

Ví dụ.

## Strong Consistency

* Workspace.
* Member.
* Permission.
* Document Version.

---

## Eventual Consistency

* Notification.
* Search Index.
* Analytics.
* AI Embedding.
* Activity Feed.

Điều này giúp hệ thống mở rộng tốt hơn khi quy mô tăng lên.

---

# 5. Data Lifecycle

Mỗi loại dữ liệu đều có vòng đời riêng.

Ví dụ.

## Task

```text id="f3w8ds"
Created

↓

Updated

↓

Completed

↓

Archived

↓

Deleted
```

---

## Document

```text id="b5r2mn"
Draft

↓

Published

↓

Archived
```

---

## Notification

```text id="d7q1fa"
Created

↓

Delivered

↓

Read

↓

Expired
```

Không phải mọi dữ liệu đều bị xóa vật lý.

Nhiều dữ liệu sẽ được lưu để phục vụ Audit hoặc Analytics.

---

# 6. Soft Delete hay Hard Delete?

Trong AEOS.

Hầu hết dữ liệu sẽ sử dụng **Soft Delete**.

Ví dụ.

* Workspace.
* Project.
* Task.
* Document.

Lý do.

* Có thể khôi phục.
* Đảm bảo Audit.
* Không phá vỡ quan hệ dữ liệu.
* Phục vụ Compliance.

Hard Delete chỉ áp dụng cho dữ liệu tạm thời hoặc cache.

---

# 7. Versioning Strategy

Không phải dữ liệu nào cũng ghi đè.

Ví dụ.

Document.

```text id="x2p8hz"
Version 1

↓

Version 2

↓

Version 3

↓

Published Version
```

Mỗi phiên bản đều được lưu.

Điều này cho phép:

* Rollback.
* So sánh thay đổi.
* Theo dõi lịch sử.
* AI phân tích sự thay đổi của tài liệu.

---

# 8. Audit Strategy

Một hệ thống Enterprise phải trả lời được các câu hỏi:

* Ai thực hiện?
* Thực hiện lúc nào?
* Thay đổi điều gì?
* Giá trị cũ là gì?
* Giá trị mới là gì?

Ví dụ.

```text id="m4t8vr"
Task Updated

↓

User A

↓

2026-08-01 14:30

↓

Status

Todo → In Progress
```

Audit không phải Logging.

Audit là lịch sử nghiệp vụ.

---

# 9. Indexing Strategy

Khi dữ liệu tăng lên hàng triệu bản ghi.

Index sẽ quyết định hiệu năng.

Ví dụ.

Task.

* project_id
* assignee_id
* status
* priority
* due_date

Document.

* workspace_id
* folder_id
* published_at

Search.

* title
* content_embedding
* tags

Chúng ta chưa tạo Index.

Nhưng phải xác định ngay từ giai đoạn thiết kế.

---

# 10. File Storage Strategy

AEOS không lưu file trực tiếp trong Database.

Chiến lược chuẩn sẽ là:

```text id="w6y1lu"
User Upload

↓

Object Storage

↓

Metadata Database

↓

Search Index

↓

AI Embedding
```

Database chỉ lưu Metadata.

File thực tế sẽ nằm trên Object Storage.

---

# 11. Data Classification

Không phải dữ liệu nào cũng quan trọng như nhau.

Ví dụ.

## Critical

* Workspace.
* Permission.
* Document.
* Project.

---

## Important

* Task.
* Comment.
* Workflow.

---

## Rebuildable

* Search Index.
* AI Embedding.
* Cache.
* Analytics Snapshot.

Điều này sẽ ảnh hưởng đến chiến lược Backup và Disaster Recovery ở các chương sau.

---

# 12. Deliverables của Chương 6

Sau khi hoàn thành chương này, chúng ta phải có:

* Data Ownership Map.
* Persistence Boundary.
* Data Lifecycle Catalogue.
* Data Classification Matrix.
* Versioning Strategy.
* Soft Delete Strategy.
* Audit Strategy.
* Indexing Strategy.
* File Storage Strategy.
* Data Consistency Strategy.

Đây là bản thiết kế dữ liệu của toàn bộ AEOS.

---

# Những gì chúng ta vẫn chưa làm

Đến cuối chương này, chúng ta vẫn chưa có:

* Bảng Database.
* Prisma Schema.
* Migration.
* Foreign Key.
* SQL.
* ORM.

Đó là chủ ý.

Chúng ta đang thiết kế **kiến trúc dữ liệu**, không phải triển khai cơ sở dữ liệu.

---

# Engineering Mindset

Một Junior thường hỏi:

> "Bảng này có bao nhiêu cột?"

Một Mid thường hỏi:

> "Có cần thêm Index không?"

Một Senior sẽ hỏi:

> **"Dữ liệu này thuộc về Context nào, có vòng đời ra sao và cần mức nhất quán nào?"**

Đó là tư duy của một người thiết kế hệ thống có khả năng mở rộng.

---

# Chuẩn đầu ra của Chương 6

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Thiết kế Data Architecture dựa trên Domain.
* Xác định Data Ownership và Persistence Boundary.
* Lựa chọn chiến lược Strong Consistency và Eventual Consistency.
* Thiết kế Versioning, Audit và Soft Delete.
* Xây dựng chiến lược lưu trữ file và dữ liệu cho hệ thống Enterprise.

> **Chương 7 sẽ là Database Architecture & Physical Data Modeling. Đây là lần đầu tiên chúng ta chuyển từ thiết kế logic sang thiết kế vật lý: lựa chọn PostgreSQL, Redis, OpenSearch, Object Storage, xây dựng ERD, Prisma Schema, khóa chính, khóa ngoại, chỉ mục và chiến lược partitioning.**
