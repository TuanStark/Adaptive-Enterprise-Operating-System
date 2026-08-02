# Senior Fullstack Engineer Residency

# Chương 5 – Domain Modeling (Thiết kế mô hình Domain)

> **"Đây là chương đầu tiên chúng ta bắt đầu thiết kế hệ thống. Nhưng chúng ta vẫn chưa thiết kế Database."**

Sau Chương 4, chúng ta đã có:

* Ubiquitous Language.
* Business Capability.
* Business Process.
* Domain Event.
* Bounded Context.
* Context Map.

Bây giờ, chúng ta sẽ chuyển từ **Business** sang **Software Model**.

Đây là giai đoạn mà một Solution Architect và một Domain Expert sẽ cùng nhau thiết kế "bộ não" của hệ thống.

Điều quan trọng nhất cần nhớ:

> **Chúng ta đang thiết kế Domain, không phải Database.**

---

# Mục tiêu của chương

Sau chương này, chúng ta phải xác định được:

* Aggregate của từng Bounded Context.
* Entity.
* Value Object.
* Domain Service.
* Domain Event.
* Repository Interface.
* Invariant (quy tắc bất biến).
* Lifecycle của từng Aggregate.

Đây sẽ là nền móng cho toàn bộ source code sau này.

---

# 1. Từ Business Capability đến Aggregate

Ở chương trước, chúng ta xác định các Business Capability.

Bây giờ, mỗi Capability sẽ được chuyển thành một hoặc nhiều Aggregate.

Ví dụ:

| Business Capability | Aggregate                        |
| ------------------- | -------------------------------- |
| Workspace           | Workspace                        |
| Project             | Project                          |
| Task                | Task                             |
| Knowledge           | Document                         |
| Workflow            | Workflow                         |
| AI                  | Conversation                     |
| Notification        | Notification                     |
| Search              | Search Index (Logical Aggregate) |

Lưu ý.

Một Business Capability có thể có nhiều Aggregate.

Một Aggregate không đồng nghĩa với một bảng trong cơ sở dữ liệu.

---

# 2. Aggregate Root

Aggregate Root là điểm truy cập duy nhất vào Aggregate.

Ví dụ.

## Workspace Aggregate

Workspace sẽ quản lý:

* Members.
* Roles.
* Workspace Settings.
* Integrations.
* Workspace Metadata.

Mọi thay đổi đều phải đi qua Workspace Aggregate.

Ví dụ.

Không được phép:

```text id="k7n2ab"
Create Member

↓

Insert Member vào Workspace
```

Đúng phải là:

```text id="g6xv9q"
Workspace

↓

Invite Member()

↓

Accept Invitation()

↓

Remove Member()
```

Workspace chịu trách nhiệm đảm bảo mọi Business Rule luôn đúng.

---

# 3. Entity

Entity là đối tượng có Identity và vòng đời.

Ví dụ.

## Workspace Context

Entity:

* Workspace.
* WorkspaceMember.
* Invitation.

---

## Project Context

Entity:

* Project.
* Milestone.

---

## Task Context

Entity:

* Task.
* SubTask.
* ChecklistItem.
* Comment.

---

## Knowledge Context

Entity:

* Document.
* Folder.

---

Điểm quan trọng.

Entity được tạo ra vì nghiệp vụ cần.

Không phải vì Database cần.

---

# 4. Value Object

Value Object không có Identity.

Ví dụ.

## Trong Task

Priority.

Estimate.

DueDate.

Status.

---

## Trong Workspace

WorkspaceName.

WorkspaceSlug.

WorkspaceLogo.

---

## Trong Document

DocumentVersion.

DocumentTitle.

PermissionPolicy.

---

Nếu hai Value Object có cùng giá trị.

Chúng được xem là giống nhau.

---

# 5. Aggregate Invariant

Đây là phần quan trọng nhất của Aggregate.

Invariant là những quy tắc luôn phải đúng.

Ví dụ.

Workspace.

* Luôn có ít nhất một Owner.
* Không tồn tại hai Member có cùng Email trong một Workspace.
* Workspace Archived không được tạo Project mới.

---

Project.

* Project Archived không được tạo Task.
* Milestone phải thuộc Project.

---

Task.

* Không thể chuyển từ Todo sang Done nếu chưa qua In Progress.
* Không thể Assign Member ngoài Project.

---

Document.

* Published Version không được chỉnh sửa.
* Chỉ có một Published Version tại một thời điểm.

Aggregate tồn tại để bảo vệ các Invariant này.

---

# 6. Domain Event

Mỗi Aggregate sẽ phát sinh Domain Event.

Ví dụ.

Workspace.

```text id="evd91q"
WorkspaceCreated

MemberInvited

MemberJoined

WorkspaceArchived
```

---

Project.

```text id="u2l5hr"
ProjectCreated

ProjectArchived

ProjectMemberAdded
```

---

Task.

```text id="h8cn7t"
TaskCreated

TaskAssigned

TaskCompleted
```

---

Document.

```text id="x9ps0e"
DocumentPublished

DocumentArchived

DocumentVersionCreated
```

Event mô tả điều đã xảy ra trong Domain.

Không mô tả hành động của người dùng.

---

# 7. Repository Interface

Repository không thuộc Infrastructure.

Repository là một phần của Domain.

Ví dụ.

Workspace.

```text id="3safw8"
WorkspaceRepository

- save()
- findById()
- findBySlug()
- exists()
```

---

Task.

```text id="dfp6km"
TaskRepository

- save()
- findById()
- findByProject()
```

---

Document.

```text id="lqj3ow"
DocumentRepository

- save()
- findLatestVersion()
```

Infrastructure sẽ là nơi implement các Interface này.

---

# 8. Domain Service

Không phải nghiệp vụ nào cũng thuộc Aggregate.

Ví dụ.

Khi Publish Document.

Hệ thống cần:

* Kiểm tra Permission.
* Tạo Version.
* Publish Event.
* Cập nhật Search.
* Kích hoạt AI Summary.
* Gửi Notification.

Nghiệp vụ này liên quan nhiều Aggregate và nhiều Context.

Đây là ứng viên cho Domain Service hoặc Application Service.

Việc lựa chọn phụ thuộc vào phạm vi của Business Rule.

---

# 9. Aggregate Lifecycle

Mỗi Aggregate đều có vòng đời.

Ví dụ.

Workspace.

```text id="q4fyba"
Created

↓

Configured

↓

Active

↓

Archived

↓

Deleted
```

---

Document.

```text id="z0vdxr"
Draft

↓

Review

↓

Published

↓

Archived
```

---

Task.

```text id="9x1qws"
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

Lifecycle giúp xác định trạng thái hợp lệ của Domain.

---

# 10. Domain Dependency

Một Aggregate không được phép sửa Aggregate khác.

Ví dụ.

Task không được tự cập nhật Document.

Task chỉ phát Domain Event.

Document Context sẽ tự quyết định có phản ứng hay không.

Đây là nguyên tắc giúp giảm Coupling.

---

# 11. Deliverables của Chương 5

Sau chương này, chúng ta phải có:

* Aggregate Diagram.
* Aggregate Root Definition.
* Entity Catalogue.
* Value Object Catalogue.
* Domain Event Catalogue.
* Repository Interface Catalogue.
* Aggregate Lifecycle.
* Aggregate Invariant Catalogue.
* Domain Service Candidate List.

Đây là bản thiết kế Domain hoàn chỉnh của AEOS.

---

# Những gì chúng ta chưa làm

Đến cuối chương này, chúng ta vẫn chưa có:

* Database Schema.
* API.
* REST Endpoint.
* GraphQL.
* Prisma Schema.
* NestJS Module.
* Source Code.

Đây là chủ ý.

Một Domain Model tốt phải tồn tại độc lập với công nghệ.

Nếu ngày mai chuyển từ PostgreSQL sang MongoDB.

Hoặc từ NestJS sang Spring Boot.

Domain vẫn không thay đổi.

---

# Engineering Mindset

Một Junior thường hỏi:

> "Entity này sẽ có bao nhiêu cột?"

Một Mid thường hỏi:

> "Quan hệ One-to-Many hay Many-to-Many?"

Một Senior sẽ hỏi:

> **"Aggregate này chịu trách nhiệm bảo vệ Business Rule nào?"**

Đó là sự khác biệt giữa tư duy thiết kế hệ thống và tư duy thiết kế cơ sở dữ liệu.

---

# Chuẩn đầu ra của Chương 5

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Thiết kế Aggregate theo Domain-Driven Design.
* Xác định Entity và Value Object.
* Xây dựng Invariant cho từng Aggregate.
* Thiết kế Domain Event và Repository Interface.
* Phân biệt Domain Service với Application Service.
* Xây dựng Domain Model độc lập với Framework và Database.

> **Chương 6 sẽ là Data Architecture & Persistence Modeling. Lần đầu tiên chúng ta sẽ chuyển từ Domain sang Persistence, quyết định Aggregate nào được lưu như thế nào, thiết kế mô hình dữ liệu, chiến lược lưu trữ, indexing, versioning và chuẩn bị cho việc xây dựng Database Schema.**
