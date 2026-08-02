# Senior Fullstack Engineer Residency

## Phase 1 – Foundation Engineering

# Day 3 – Event Storming & Strategic Domain-Driven Design

> **"Nếu Day 2 giúp chúng ta hiểu Business, thì Day 3 sẽ giúp chúng ta hiểu Business hoạt động như thế nào."**

Một sai lầm rất phổ biến khi thiết kế hệ thống là lập trình viên chỉ nhìn thấy **dữ liệu (Data)**.

Ví dụ.

```
User

Task

Project

Document
```

Nhưng doanh nghiệp không hoạt động bằng dữ liệu.

Doanh nghiệp hoạt động bằng **sự kiện (Events)**.

Một đơn hàng được tạo.

Một nhân viên được tuyển dụng.

Một tài liệu được tải lên.

Một nhiệm vụ được hoàn thành.

Một hợp đồng được ký.

Những sự kiện này mới là thứ làm cho doanh nghiệp vận hành.

Đó là lý do Event Storming ra đời.

---

# 1. Event Storming là gì?

Event Storming là kỹ thuật được giới thiệu bởi Alberto Brandolini nhằm khám phá toàn bộ nghiệp vụ của một hệ thống thông qua các **Domain Event**.

Thay vì bắt đầu bằng Database hoặc API, chúng ta bắt đầu bằng câu hỏi:

> **"Điều gì đã xảy ra trong doanh nghiệp?"**

Ví dụ.

Không phải:

```
Task Table
```

Mà là:

```
Task Created
```

Không phải:

```
Document Table
```

Mà là:

```
Document Uploaded
```

Đây chính là sự thay đổi lớn nhất trong tư duy thiết kế hệ thống.

---

# 2. Tư duy Event-Driven

Một hệ thống Enterprise không được xây dựng quanh CRUD.

Nó được xây dựng quanh các sự kiện.

Ví dụ.

```
Member Invited

↓

Invitation Accepted

↓

Workspace Joined

↓

Permission Granted

↓

Welcome Notification Sent
```

Mỗi sự kiện sẽ kích hoạt những hành động tiếp theo.

Điều này giúp hệ thống mở rộng dễ dàng mà không tạo ra sự phụ thuộc chặt chẽ giữa các module.

---

# 3. Event Storming của AEOS

Chúng ta sẽ mô tả toàn bộ hệ thống bằng các Domain Event.

## Identity & Access

* Organization Registered
* Workspace Created
* Owner Created
* Member Invited
* Invitation Accepted
* Member Joined
* Member Removed
* Role Assigned
* Permission Updated

---

## Workspace Management

* Workspace Renamed
* Workspace Archived
* Workspace Restored

---

## Project Management

* Project Created
* Project Updated
* Project Archived
* Project Deleted

---

## Task Management

* Task Created
* Task Assigned
* Task Reassigned
* Task Started
* Task Paused
* Task Completed
* Task Reopened
* Task Archived

---

## Document Management

* Folder Created
* Document Uploaded
* Document Updated
* Document Version Created
* Document Shared
* Document Deleted

---

## Communication

* Comment Added
* Comment Edited
* Comment Deleted
* Mention Created
* Message Sent
* Message Read

---

## Notification

* Notification Created
* Notification Delivered
* Notification Read

---

## Search

* Search Index Updated
* Search Index Removed
* Search Index Rebuilt

---

## AI Platform

* Embedding Generated
* Document Summarized
* AI Response Generated
* AI Workflow Executed

---

## Automation

* Workflow Triggered
* Workflow Completed
* Workflow Failed

---

## Audit

* Audit Log Recorded

---

# 4. Command → Event → Policy

Đây là mô hình mà rất nhiều hệ thống Enterprise sử dụng.

Ví dụ.

```
Command

↓

Create Task

↓

Domain Event

↓

Task Created

↓

Policy

↓

Assign Default Labels

↓

Send Notification

↓

Create Activity Log

↓

Update Search Index
```

Điều quan trọng là:

Command chỉ yêu cầu hệ thống làm việc.

Event thông báo rằng việc đó đã xảy ra.

Policy quyết định cần làm gì tiếp theo.

---

# 5. Aggregate

Aggregate là khái niệm trung tâm của Tactical DDD.

Một Aggregate là tập hợp các Entity được quản lý như một đơn vị thống nhất nhằm đảm bảo tính nhất quán của nghiệp vụ.

Ví dụ.

## Workspace Aggregate

Bao gồm:

* Workspace
* Member
* Role
* Invitation

Một Member không thể tồn tại nếu không thuộc một Workspace.

---

## Project Aggregate

Bao gồm:

* Project
* Milestone
* Sprint

---

## Task Aggregate

Bao gồm:

* Task
* Checklist
* Attachment

---

## Document Aggregate

Bao gồm:

* Document
* Version
* Permission

---

# 6. Aggregate Root

Mỗi Aggregate chỉ có một cửa ngõ duy nhất.

Ví dụ.

Không được sửa Checklist trực tiếp.

```
Task

↓

Checklist
```

Muốn thay đổi Checklist.

Phải thông qua Task.

Task chính là Aggregate Root.

Điều này giúp đảm bảo Business Rule luôn được thực thi.

---

# 7. Business Rule

Business Rule là lý do Aggregate tồn tại.

Ví dụ.

Task chỉ được hoàn thành khi:

* Có Assignee.
* Không bị Archived.
* Tất cả Checklist đã hoàn tất.

Nếu Business Rule nằm rải rác trong Controller hoặc Service thì hệ thống sẽ rất khó bảo trì.

Business Rule phải nằm trong Domain Model.

---

# 8. Context Mapping

Sau khi có Bounded Context, chúng ta cần xác định mối quan hệ giữa chúng.

Ví dụ.

```
Identity

↓

Workspace

↓

Project

↓

Task

↓

Notification

↓

Search

↓

Analytics
```

Notification không được truy vấn trực tiếp Database của Task.

Notification chỉ lắng nghe sự kiện.

```
Task Completed

↓

Notification Service

↓

Send Notification
```

Đây là nguyên tắc rất quan trọng trong hệ thống Event-Driven.

---

# 9. Anti-Pattern

Một số lỗi phổ biến.

## Database Sharing

Nhiều module cùng truy cập một bảng.

Điều này tạo ra sự phụ thuộc rất lớn.

---

## God Service

Một Service xử lý mọi thứ.

Ví dụ.

```
TaskService

↓

Notification

↓

Search

↓

Audit

↓

Email

↓

Analytics
```

TaskService sẽ trở thành "God Object".

---

## CRUD Thinking

Thiết kế API trước khi hiểu Business.

Đây là nguyên nhân khiến hệ thống ngày càng khó mở rộng.

---

# 10. Deliverables

Sau Day 3 chúng ta phải hoàn thành.

## Business Event Catalogue

Danh sách toàn bộ Domain Event.

---

## Aggregate Design

Danh sách Aggregate và Aggregate Root.

---

## Business Rules

Tài liệu mô tả toàn bộ Business Rule quan trọng.

---

## Context Relationship

Sơ đồ giao tiếp giữa các Context.

---

## Event Flow

Luồng Event của từng nghiệp vụ.

Ví dụ.

```
Upload Document

↓

Document Uploaded

↓

Virus Scan Started

↓

Virus Scan Completed

↓

OCR Started

↓

OCR Completed

↓

Embedding Generated

↓

Search Indexed

↓

Activity Recorded

↓

Notification Sent
```

---

# Engineering Mindset

Một Senior Engineer không nhìn thấy bảng dữ liệu.

Họ nhìn thấy **hành vi của hệ thống**.

Thay vì hỏi:

> "Database có bao nhiêu bảng?"

Họ sẽ hỏi:

> "Điều gì sẽ xảy ra khi người dùng thực hiện hành động này?"

Đó chính là sự khác biệt giữa lập trình theo CRUD và thiết kế hệ thống theo Domain-Driven Design.

---

# Chuẩn đầu ra của Day 3

Sau khi hoàn thành Day 3, bạn sẽ có khả năng:

* Áp dụng Event Storming để khám phá nghiệp vụ.
* Thiết kế hệ thống theo Event-Driven thay vì CRUD.
* Xác định Aggregate và Aggregate Root.
* Xây dựng Business Rule trong Domain Model.
* Thiết kế Context Mapping giữa các Business Domain.
* Phân tích Event Flow của một quy trình nghiệp vụ.
* Nhận diện các Anti-Pattern phổ biến trong thiết kế hệ thống Enterprise.

> **Ngày 4, chúng ta sẽ chuyển sang vai trò của một Software Architect để học về C4 Model, Architecture Decision Record (ADR), kiến trúc Monolith Modular, Modular Monolith và Microservices, cùng cách lựa chọn kiến trúc phù hợp cho từng giai đoạn phát triển của sản phẩm trước khi viết dòng code đầu tiên.**
