# AEOS – Phase 2.3: User Story & Use Case Specification

# Tổng quan

Sau khi hoàn thành:

# Phase 2.1 – Business Requirement Document (BRD)

Chúng ta đã biết:

* Doanh nghiệp cần giải quyết vấn đề gì.
* Ai là Stakeholder.
* Mục tiêu kinh doanh của AEOS.
* Business Capability của hệ thống.

---

# Phase 2.2 – Functional Requirement Document (FRD)

Chúng ta đã xác định:

* Hệ thống có những Module nào.
* Những Feature nào cần xây dựng.
* Những chức năng nào phải hỗ trợ.
* Business Rule cấp cao.

---

Tuy nhiên Developer vẫn chưa thể bắt đầu code.

Vì chúng ta vẫn chưa trả lời được:

* User thực sự sử dụng chức năng như thế nào?
* Một chức năng bắt đầu từ đâu?
* Các bước xử lý cụ thể là gì?
* Khi nào thành công?
* Khi nào thất bại?
* Những trường hợp ngoại lệ nào xảy ra?

Đây là nhiệm vụ của:

# User Story & Use Case Specification

---

# 1. User Story là gì?

User Story mô tả nhu cầu của hệ thống từ góc nhìn người sử dụng.

Công thức:

```
As a [Actor]

I want [Action]

So that [Business Value]
```

Ví dụ:

```
As a Workspace Admin

I want to invite members

So that my team can collaborate inside workspace.
```

---

# 2. Use Case là gì?

Nếu User Story trả lời:

> "User muốn làm gì?"

Thì Use Case trả lời:

> "Hệ thống phải xử lý việc đó như thế nào?"

User Story là góc nhìn Business.

Use Case là góc nhìn System.

---

Ví dụ:

User Story:

```
Admin muốn mời thành viên vào Workspace.
```

Use Case:

```
System nhận email.

↓

Kiểm tra quyền Admin.

↓

Kiểm tra User tồn tại.

↓

Tạo Invitation.

↓

Gửi Notification.

↓

User Accept.

↓

Tạo Workspace Membership.
```

---

# 3. User Story Structure

Mỗi User Story trong AEOS sẽ có:

```
Story ID

Title

Actor

Goal

Business Value

Pre-condition

Acceptance Criteria

Business Rule

Priority

Related Domain
```

---

# 4. Use Case Structure

Mỗi Use Case sẽ có:

```
Use Case ID

Name

Actor

Description

Trigger

Pre-condition

Main Flow

Alternative Flow

Exception Flow

Post-condition

Business Rule

Related API

Related Event
```

---

# 5. AEOS User Story Map

Toàn bộ AEOS sẽ được phân rã:

```
AEOS

|

├── Identity Epic

├── Organization Epic

├── Workspace Epic

├── Project Epic

├── Task Epic

├── Document Epic

├── Notification Epic

├── Audit Epic

└── Workflow Epic
```

---

# EPIC 1: Identity Management

---

# US-IDENTITY-001

# Register Account

## Actor

Guest User

## User Story

```
As a guest user

I want to create an account

So that I can access AEOS.
```

---

# Business Value

Cho phép người dùng tham gia hệ thống.

---

# Pre-condition

* Email chưa tồn tại.
* Registration đang mở.

---

# Acceptance Criteria

## Scenario 1: Register Successfully

Given:

User nhập email hợp lệ.

When:

User submit registration.

Then:

System:

* Create User.
* Hash Password.
* Set status PENDING.
* Send Verification Email.

---

## Scenario 2: Email existed

Given:

Email đã tồn tại.

Then:

Return:

```
EMAIL_ALREADY_EXISTS
```

---

# Use Case

## UC-IDENTITY-001

## Register User

Actor:

Guest

Trigger:

Submit registration form.

Main Flow:

```
1. Receive Registration Request

2. Validate Input

3. Check Email Existing

4. Hash Password

5. Create User Aggregate

6. Save User

7. Publish UserRegistered Event

8. Send Verification Email
```

---

Post-condition:

User tồn tại trong hệ thống.

---

Related Event:

```
UserRegistered
```

---

# EPIC 2: Organization Management

---

# US-ORG-001

# Create Organization

## Actor

User

## User Story

```
As a user

I want to create an organization

So that I can manage my company.
```

---

# Acceptance Criteria

## Success

System phải:

* Create Organization.
* Assign Owner.
* Create Default Setting.

---

## Failure

Nếu User vượt quá giới hạn:

Return:

```
ORGANIZATION_LIMIT_EXCEEDED
```

---

# Use Case

## UC-ORG-001

## Create Organization

Trigger:

User click Create Organization.

Flow:

```
User

↓

Submit Organization Data

↓

Validate Permission

↓

Create Organization Aggregate

↓

Assign Owner Role

↓

Save

↓

Publish OrganizationCreated Event
```

---

# EPIC 3: Workspace Management

Workspace là Core Domain của AEOS.

---

# US-WORKSPACE-001

# Create Workspace

## Actor

Organization Owner

## User Story

```
As an organization owner

I want to create workspace

So that teams can collaborate.
```

---

# Acceptance Criteria

## Scenario Success

Given:

User có quyền CREATE_WORKSPACE.

When:

User gửi Workspace information.

Then:

System:

* Create Workspace.
* Create Default Role.
* Assign Owner.
* Publish Event.

---

# Use Case

## UC-WORKSPACE-001

## Create Workspace

Trigger:

POST /workspaces

---

Main Flow:

```
1. Receive Request

2. Authenticate User

3. Check Permission

4. Validate Workspace Name

5. Create Workspace Entity

6. Create Owner Membership

7. Create Default Roles

8. Save Transaction

9. Publish WorkspaceCreated Event
```

---

Alternative Flow:

Workspace name duplicate.

```
System Reject

Return:

WORKSPACE_ALREADY_EXISTS
```

---

Exception:

Database unavailable.

```
Rollback Transaction

Return SYSTEM_ERROR
```

---

# US-WORKSPACE-002

# Invite Member

## Actor

Workspace Admin

## User Story

```
As a workspace admin

I want to invite members

So that my team can join workspace.
```

---

# Acceptance Criteria

System phải:

* Validate permission.
* Check member existing.
* Create invitation.
* Send notification.

---

# Use Case

## UC-WORKSPACE-002

## Invite Member

Flow:

```
Admin

↓

Enter Email

↓

Permission Check

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

# EPIC 4: Project Management

---

# US-PROJECT-001

# Create Project

## Actor

Workspace Member

## User Story

```
As a project manager

I want to create project

So that I can manage project work.
```

---

# Acceptance Criteria

Project được tạo khi:

* User có quyền.
* Workspace tồn tại.
* Name hợp lệ.

---

# Use Case

## UC-PROJECT-001

Flow:

```
Create Project Request

↓

Check Workspace Permission

↓

Create Project Aggregate

↓

Assign Owner

↓

Save Project

↓

Publish ProjectCreated Event
```

---

# EPIC 5: Task Management

---

# US-TASK-001

# Create Task

## Actor

Project Member

## User Story

```
As a project member

I want to create task

So that work can be tracked.
```

---

# Acceptance Criteria

Task phải có:

* Title.
* Project.
* Creator.

Optional:

* Assignee.
* Deadline.

---

# Use Case

## UC-TASK-001

Flow:

```
User

↓

Create Task

↓

Validate Project Access

↓

Create Task Entity

↓

Save

↓

Notify Assignee
```

---

# EPIC 6: Document Management

---

# US-DOCUMENT-001

# Upload Document

## Actor

Workspace Member

## User Story

```
As a member

I want to upload documents

So that team can share information.
```

---

# Use Case

Flow:

```
Upload Request

↓

Permission Check

↓

Upload Storage

↓

Create Document Metadata

↓

Save

↓

Publish DocumentUploaded Event
```

---

# 7. Acceptance Criteria Standard

Tất cả User Story của AEOS phải dùng chuẩn:

## Given

Điều kiện ban đầu.

## When

Hành động xảy ra.

## Then

Kết quả mong muốn.

---

Ví dụ:

```
Given User has PROJECT_CREATE permission

When User creates Project

Then Project is created successfully
```

---

# 8. User Story Priority

AEOS sử dụng:

## Must Have

Core System.

Bao gồm:

* Authentication.
* Organization.
* Workspace.
* RBAC.

---

## Should Have

* Project.
* Task.
* Notification.

---

## Could Have

* AI.
* Workflow.
* Analytics.

---

# 9. User Story Dependency

Một số Feature phụ thuộc nhau.

Ví dụ:

```
Identity

↓

Organization

↓

Workspace

↓

RBAC

↓

Project

↓

Task

↓

Document

↓

Workflow
```

---

# 10. Output của Phase 2.3

Sau Phase này chúng ta có:

## User Requirement

✅ User Story

✅ Epic Breakdown

✅ Acceptance Criteria

## System Behavior

✅ Use Case

✅ Main Flow

✅ Alternative Flow

✅ Exception Flow

## Engineering Input

✅ API Requirement

✅ Domain Interaction

✅ Event Trigger

---

# Kết quả sau Phase 2.1 → 2.3

AEOS hiện tại đã có:

```
Business Requirement

↓

Functional Requirement

↓

User Story

↓

Use Case
```

Chúng ta đã biết:

* Tại sao xây dựng.
* Xây dựng cái gì.
* Ai sử dụng.
* User thao tác như thế nào.
* System phản ứng ra sao.

---

# Bước tiếp theo

Sau khi có User Story & Use Case Specification, chúng ta chuyển sang:

# Phase 2.4 – API Contract Design

Tại đây chúng ta bắt đầu thiết kế:

* REST API.
* Request/Response.
* DTO.
* Validation.
* Error Code.
* Authentication Flow.
* Authorization Flow.
* OpenAPI Specification.

Đây sẽ là bước cuối trước khi bước vào Database Design.
