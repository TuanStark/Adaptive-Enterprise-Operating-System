# AEOS – Business Analysis Phase

Đây là giai đoạn đầu tiên trước khi thiết kế Database, API hoặc viết bất kỳ dòng code nào.

Mục tiêu của giai đoạn này là hiểu rõ **toàn bộ sản phẩm**, xác định đúng phạm vi nghiệp vụ, các tác nhân tham gia, các luồng hoạt động chính và các quy tắc kinh doanh.

Một dự án Enterprise không bắt đầu bằng việc tạo bảng Database.

Nó bắt đầu bằng câu hỏi:

> "Chúng ta đang giải quyết vấn đề gì cho ai, bằng cách nào?"

---

# 1. Product Vision

## AEOS là gì?

AEOS (Enterprise Operation System) là một nền tảng quản lý vận hành doanh nghiệp.

Hệ thống giúp tổ chức:

* Quản lý thành viên.
* Quản lý phòng ban.
* Quản lý Workspace.
* Quản lý dự án.
* Quản lý công việc.
* Quản lý tài liệu.
* Tự động hóa quy trình.
* Cộng tác nội bộ.
* Theo dõi hoạt động doanh nghiệp.
* Hỗ trợ AI trong quá trình vận hành.

AEOS không chỉ là một ứng dụng quản lý Task.

Nó là một hệ thống Operating System cho doanh nghiệp.

---

# 2. Problem Statement

Các doanh nghiệp hiện nay thường gặp những vấn đề:

## Dữ liệu bị phân tán

Ví dụ:

* Task nằm trên Jira.
* Tài liệu nằm trên Google Drive.
* Chat nằm trên Slack.
* Báo cáo nằm trên Excel.
* Quy trình nằm trong email.

Không có một nơi thống nhất để quản lý vận hành.

---

## Thiếu khả năng kiểm soát

Doanh nghiệp khó trả lời:

* Ai đang làm gì?
* Công việc đang ở trạng thái nào?
* Ai có quyền truy cập dữ liệu?
* Quy trình có được tuân thủ không?

---

## Quy trình phụ thuộc con người

Nhiều hoạt động phải làm thủ công:

* Gửi thông báo.
* Duyệt tài liệu.
* Theo dõi tiến độ.
* Báo cáo.

---

# 3. Target Users

AEOS phục vụ nhiều nhóm người dùng.

---

# Platform Owner

Người vận hành toàn bộ nền tảng.

Quản lý:

* Tenant.
* Subscription.
* Billing.
* System Configuration.
* Platform Monitoring.

---

# Organization Owner

Chủ doanh nghiệp.

Quản lý:

* Organization.
* Thành viên.
* Subscription.
* Báo cáo tổng thể.

---

# Workspace Administrator

Người quản lý một Workspace.

Ví dụ:

* Engineering Team.
* Marketing Team.
* Product Team.

Có quyền:

* Quản lý thành viên.
* Cấu hình Role.
* Quản lý Permission.
* Quản lý Project.

---

# Member

Nhân viên sử dụng hệ thống hằng ngày.

Có thể:

* Tạo Task.
* Tham gia Project.
* Comment.
* Upload File.
* Cộng tác.

---

# Guest

Người dùng bên ngoài.

Ví dụ:

* Khách hàng.
* Đối tác.
* Freelancer.

Quyền truy cập giới hạn.

---

# 4. Business Capability Map

Toàn bộ khả năng nghiệp vụ của AEOS.

```
                         AEOS

------------------------------------------------

Identity Capability

- Authentication
- Authorization
- User Profile


Organization Capability

- Company Management
- Department
- Member Management


Workspace Capability

- Workspace
- Team
- Role
- Permission


Project Capability

- Project
- Milestone
- Progress Tracking


Work Management Capability

- Task
- Board
- Calendar
- Timeline


Knowledge Capability

- Document
- File
- Search


Automation Capability

- Workflow
- Rule Engine
- Automation


Communication Capability

- Comment
- Mention
- Notification


Intelligence Capability

- AI Assistant
- Recommendation


Business Capability

- Subscription
- Billing
- Invoice
```

---

# 5. Domain Boundary sơ bộ

Từ Business Capability, chúng ta xác định các Bounded Context.

```
AEOS

├── Identity Context
│
├── Organization Context
│
├── Workspace Context
│
├── Project Context
│
├── Task Management Context
│
├── Workflow Context
│
├── Document Context
│
├── Communication Context
│
├── Notification Context
│
├── Search Context
│
├── AI Context
│
├── Billing Context
│
└── Audit Context
```

Lưu ý:

Đây chưa phải Microservice.

Đây chỉ là ranh giới nghiệp vụ.

---

# 6. Core User Journey

## Flow 1: Doanh nghiệp đăng ký hệ thống

```
User Signup

↓

Create Organization

↓

Create Default Workspace

↓

Assign Owner Role

↓

Invite Members

↓

Start Working
```

---

## Flow 2: Quản lý Project

```
Create Workspace

↓

Create Project

↓

Add Members

↓

Create Task

↓

Assign Member

↓

Track Progress

↓

Complete Project
```

---

## Flow 3: Quản lý tài liệu

```
Upload Document

↓

Store File

↓

Create Metadata

↓

Apply Permission

↓

Share Document

↓

Collaborate
```

---

## Flow 4: Automation Workflow

```
Business Event Happens

↓

Evaluate Rule

↓

Execute Action

↓

Notify User
```

---

# 7. Core Business Entity

Đây chưa phải Database.

Đây là các khái niệm nghiệp vụ.

```
User

Organization

Workspace

Member

Role

Permission

Project

Task

Document

File

Comment

Notification

Workflow

Rule

Event

Subscription

Invoice

AuditLog
```

---

# 8. Business Rules sơ bộ

## Workspace Rules

* Một User có thể thuộc nhiều Workspace.
* Một Workspace phải có ít nhất một Owner.
* Member không thể tự nâng quyền.
* Permission được kiểm soát thông qua Role.
* Workspace là phạm vi cô lập dữ liệu chính.

---

## Project Rules

* Project thuộc một Workspace.
* Chỉ Member có quyền mới được truy cập Project.
* Task bắt buộc thuộc Project.
* Project có vòng đời riêng.

---

## Document Rules

* File vật lý không lưu trực tiếp trong Database.
* Database chỉ lưu Metadata.
* Quyền truy cập được kiểm tra trước khi Download.
* Mọi thay đổi quan trọng phải được Audit.

---

# 9. Functional Requirements

Hệ thống phải hỗ trợ:

## Identity

* Đăng ký.
* Đăng nhập.
* Quản lý Profile.
* Authentication.
* Authorization.

---

## Organization

* Tạo công ty.
* Quản lý thành viên.
* Quản lý phòng ban.

---

## Workspace

* Tạo Workspace.
* Quản lý Team.
* Quản lý Role.
* Quản lý Permission.

---

## Project

* Tạo Project.
* Theo dõi tiến độ.
* Quản lý thành viên.

---

## Task

* Tạo Task.
* Assign User.
* Comment.
* Theo dõi trạng thái.

---

# 10. Non-functional Requirements

## Scalability

Hệ thống hướng tới:

* Hàng triệu User.
* Hàng trăm nghìn Organization.
* Hàng triệu Task.

---

## Availability

Mục tiêu:

* 99.9% uptime.

---

## Performance

Ví dụ:

* API response < 300ms.
* Search response < 1s.

---

## Security

Bao gồm:

* Authentication.
* Authorization.
* Encryption.
* Audit Log.
* Data Isolation.

---

# 11. Domain Glossary

Một ngôn ngữ thống nhất giữa Business và Developer.

Ví dụ:

Không gọi:

```
User
Member
Employee
Account
```

một cách lẫn lộn.

Phải thống nhất:

```
User

Organization

Workspace Member

Role

Permission
```

Đây chính là Ubiquitous Language trong Domain Driven Design.

---

# Output của Business Analysis Phase

Sau khi hoàn thành Phase này, chúng ta có:

✅ Product Vision

✅ Problem Statement

✅ User Persona

✅ Actor Definition

✅ Business Capability Map

✅ Domain Boundary

✅ User Journey

✅ Functional Requirement

✅ Non-functional Requirement

✅ Business Rules

✅ Domain Glossary

---

# Bước tiếp theo

Sau khi hoàn thành Business Analysis, chúng ta mới bước sang:

# Phase 1 – Domain Design

Bao gồm:

* Event Storming.
* Domain Event.
* Aggregate.
* Entity.
* Value Object.
* Domain Service.
* Bounded Context Relationship.
* Context Mapping.

Sau đó mới đi tới:

* Database Design.
* ERD.
* Prisma Schema.
* API Contract.
* Implementation.
