# AEOS – Phase 2.2: Functional Requirement Document (FRD)

# 1. Mục tiêu của FRD

FRD giúp thống nhất giữa:

```text
Business

↓

Product Owner

↓

Solution Architect

↓

Developer

↓

QA
```

Tránh tình trạng:

Business nghĩ một kiểu.

Developer hiểu một kiểu.

QA test một kiểu.

---

# 2. Functional Scope của AEOS

Dựa trên Business Capability:

AEOS gồm các Functional Module:

```text
AEOS

├── Identity Management

├── Organization Management

├── Workspace Management

├── Member Management

├── Role & Permission Management

├── Project Management

├── Task Management

├── Document Management

├── Notification Management

├── Audit Management

├── Workflow Management

└── AI Assistant
```

---

# 3. Functional Requirement Format

Mỗi chức năng sẽ được mô tả theo format:

```
Requirement ID

Feature Name

Description

Actor

Pre-condition

Main Flow

Alternative Flow

Business Rule

Exception

Priority
```

---

# 4. Module 1: Identity Management

# FR-IDENTITY-001

# User Registration

---

## Description

Hệ thống cho phép người dùng tạo tài khoản mới.

---

## Actor

Guest User

---

## Pre-condition

* Email chưa tồn tại.
* Hệ thống đang hoạt động.

---

## Main Flow

```text
1. User nhập email.

2. User nhập password.

3. User submit form.

4. System validate dữ liệu.

5. System tạo User Account.

6. System gửi email verification.

7. User kích hoạt tài khoản.
```

---

## Business Rules

* Email là duy nhất.
* Password phải đáp ứng security policy.
* Account mới có trạng thái:

```
PENDING_VERIFICATION
```

---

## Exception

Email đã tồn tại:

```
EMAIL_ALREADY_EXISTS
```

---

# FR-IDENTITY-002

# User Login

---

## Description

Cho phép User đăng nhập hệ thống.

---

## Actor

User

---

## Flow

```text
User nhập credential

↓

Authentication Service

↓

Verify Password

↓

Generate Token

↓

Return Access Token
```

---

## Business Rules

* User bị khóa không được đăng nhập.
* Sai password quá nhiều lần có thể lock account.

---

# 5. Module 2: Organization Management

# FR-ORG-001

# Create Organization

---

## Description

Cho phép User tạo doanh nghiệp mới.

---

## Actor

User

---

## Pre-condition

* User đã đăng nhập.

---

## Main Flow

```text
1. User chọn Create Organization.

2. Nhập thông tin Organization.

3. Submit.

4. System validate.

5. Create Organization.

6. Assign User as Owner.

7. Create default configuration.
```

---

## Result

Organization được tạo.

User trở thành:

```
ORGANIZATION_OWNER
```

---

# FR-ORG-002

# Invite Member

---

## Description

Cho phép Organization Owner mời User tham gia.

---

## Actor

Organization Owner

---

## Flow

```text
Owner nhập email

↓

System check user

↓

Create Invitation

↓

Send Email

↓

User Accept

↓

Create Membership
```

---

## Business Rules

* Email invitation có thời hạn.
* User đã là member không được invite lại.

---

# 6. Module 3: Workspace Management

Workspace là một Domain Core của AEOS.

---

# FR-WORKSPACE-001

# Create Workspace

---

## Description

Cho phép Organization tạo Workspace.

---

## Actor

Organization Owner

Workspace Admin

---

## Flow

```text
Create Workspace Request

↓

Validate Permission

↓

Create Workspace

↓

Assign Owner

↓

Create Default Role

↓

Publish WorkspaceCreated Event
```

---

## Business Rules

Workspace:

* Phải thuộc Organization.
* Phải có Owner.
* Name không được trùng trong cùng Organization.

---

# FR-WORKSPACE-002

# Add Member To Workspace

---

## Description

Thêm User vào Workspace.

---

## Flow

```text
Admin chọn User

↓

Select Role

↓

Validate Permission

↓

Create Workspace Member

↓

Notify User
```

---

## Rules

Member phải thuộc Organization trước.

---

# 7. Module 4: Role & Permission Management

# FR-RBAC-001

# Create Role

---

## Description

Cho phép Admin tạo Role tùy chỉnh.

---

## Example

```text
Backend Lead

QA Manager

Project Manager
```

---

## Flow

```text
Admin Create Role

↓

Select Permission

↓

Save Role
```

---

# FR-RBAC-002

# Assign Permission

---

## Description

Gán quyền cho Role.

---

## Example

Role:

```
Project Manager
```

Permission:

```
PROJECT_CREATE

PROJECT_UPDATE

TASK_ASSIGN
```

---

# 8. Module 5: Project Management

# FR-PROJECT-001

# Create Project

---

## Actor

Workspace Member

---

## Flow

```text
Create Project

↓

Validate Workspace Permission

↓

Create Project

↓

Assign Owner

↓

Notify Members
```

---

## Rules

Project:

* Thuộc Workspace.
* Có Owner.
* Có Status.

---

# Project Status

State:

```text
DRAFT

↓

ACTIVE

↓

COMPLETED

↓

ARCHIVED
```

---

# 9. Module 6: Task Management

# FR-TASK-001

# Create Task

---

## Actor

Project Member

---

## Flow

```text
Create Task

↓

Select Assignee

↓

Set Priority

↓

Save Task

↓

Notify Assignee
```

---

## Task Information

Bao gồm:

* Title.
* Description.
* Priority.
* Status.
* Assignee.
* Due Date.

---

# Task Status

```text
TODO

↓

IN_PROGRESS

↓

REVIEW

↓

DONE
```

---

# 10. Module 7: Document Management

# FR-DOCUMENT-001

# Upload Document

---

## Flow

```text
User Upload File

↓

Validate Permission

↓

Store File

↓

Create Metadata

↓

Generate Audit Log
```

---

## Rules

File:

* Không lưu trực tiếp Database.
* Có version.
* Có Permission.

---

# 11. Module 8: Notification Management

# FR-NOTIFICATION-001

# Send Notification

---

## Trigger

Ví dụ:

```text
Task Assigned

Member Invited

Document Shared
```

---

## Flow

```text
Domain Event

↓

Notification Service

↓

Create Notification

↓

Deliver
```

---

# 12. Module 9: Audit Management

# FR-AUDIT-001

# Record User Activity

---

## Các hành động cần Audit:

* Login.
* Permission Change.
* Delete Data.
* Update Important Information.

---

## Audit Data

```text
Actor

Action

Resource

Timestamp

IP

Metadata
```

---

# 13. Non Functional Requirement

Mặc dù FRD tập trung Functional, vẫn cần các yêu cầu hệ thống.

---

# Performance

Ví dụ:

API thông thường:

< 300ms

---

# Security

Yêu cầu:

* JWT Authentication.
* RBAC Authorization.
* Password Encryption.
* Audit Logging.

---

# Availability

Mục tiêu:

99.9% uptime.

---

# Scalability

Hỗ trợ:

* Multi Organization.
* Multi Workspace.
* Large User Base.

---

# 14. Functional Requirement Output

Sau Phase 2.2 chúng ta có:

## Functional Specification

✅ Module Definition

✅ Feature List

✅ Actor

✅ Workflow

✅ Business Rule

✅ Exception Case

✅ State Transition

---

# Kết quả sau BRD + FRD

Hiện tại AEOS đã có:

```
Business Requirement

↓

Functional Requirement

↓

Domain Model
```

Chúng ta đã biết:

* Xây dựng cái gì.
* Ai sử dụng.
* Hệ thống hoạt động như thế nào.

---

# Bước tiếp theo

Tiếp theo chúng ta chưa đi Database.

Chúng ta sẽ đi:

# Phase 2.3 – User Story & Use Case Specification

Ở bước này chúng ta sẽ chuyển từng Functional Requirement thành tài liệu mà Developer có thể nhận task:

Ví dụ:

* US-WORKSPACE-001: Create Workspace.
* US-WORKSPACE-002: Invite Member.
* US-PROJECT-001: Create Project.

Mỗi User Story sẽ có:

* Actor.
* Goal.
* Acceptance Criteria.
* Main Flow.
* Alternative Flow.
* Exception.
* API Requirement.

Đây là tài liệu mà một Team Agile/Scrum thực tế sử dụng trước khi bắt đầu Sprint.
