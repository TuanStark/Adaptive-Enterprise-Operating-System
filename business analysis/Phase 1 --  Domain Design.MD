# AEOS – Phase 1: Domain Design

# Tổng quan

Sau khi hoàn thành **Business Analysis Phase**, chúng ta đã biết:

* AEOS giải quyết vấn đề gì.
* Ai sử dụng hệ thống.
* Các khả năng nghiệp vụ chính.
* Các Bounded Context sơ bộ.
* Các Business Rule cấp cao.

Tuy nhiên, chúng ta vẫn chưa trả lời được các câu hỏi quan trọng:

* Nghiệp vụ thực sự vận hành như thế nào?
* Những sự kiện nào xảy ra trong hệ thống?
* Đâu là đối tượng quan trọng nhất?
* Đâu là ranh giới của từng Domain?
* Entity nào cần tồn tại lâu dài?
* Entity nào chỉ là dữ liệu phụ?
* Logic nghiệp vụ nên đặt ở đâu?

Đây chính là nhiệm vụ của **Domain Design**.

---

# 1. Domain Design là gì?

Domain Design là quá trình chuyển đổi:

```
Business Requirement

↓

Business Concept

↓

Domain Model

↓

Software Model
```

Nói cách khác:

Chúng ta biến những khái niệm trong thế giới thực của doanh nghiệp thành mô hình mà phần mềm có thể triển khai.

---

# 2. Tư duy Domain-Driven Design

AEOS không được thiết kế xoay quanh Database.

Sai lầm phổ biến:

```
Table

↓

CRUD API

↓

Service

↓

UI
```

Cách này tạo ra hệ thống CRUD nhưng thiếu nghiệp vụ.

AEOS sẽ đi theo hướng:

```
Business

↓

Domain Model

↓

Use Case

↓

Application Service

↓

Database
```

Database chỉ là nơi lưu trữ Domain Model.

Không phải trung tâm của hệ thống.

---

# 3. Event Storming – Bắt đầu khám phá Domain

Trước khi tạo Entity, chúng ta phải hiểu các hoạt động trong hệ thống.

Event Storming tập trung vào:

> "Điều gì đã xảy ra trong hệ thống?"

Ví dụ với AEOS.

---

## Organization Lifecycle

Các Domain Event:

```
OrganizationRegistered

OrganizationCreated

OwnerAssigned

MemberInvited

MemberJoined

MemberRemoved

OrganizationSuspended
```

---

## Workspace Lifecycle

Các Domain Event:

```
WorkspaceCreated

WorkspaceConfigured

MemberAddedToWorkspace

RoleAssigned

PermissionChanged

WorkspaceArchived
```

---

## Project Lifecycle

Các Domain Event:

```
ProjectCreated

ProjectMemberAdded

MilestoneCreated

TaskCreated

TaskAssigned

ProjectCompleted

ProjectArchived
```

---

## Document Lifecycle

Các Domain Event:

```
DocumentUploaded

DocumentShared

DocumentUpdated

DocumentApproved

DocumentArchived
```

---

# 4. Xác định Aggregate Boundary

Một trong những quyết định quan trọng nhất của Senior Developer.

Câu hỏi:

> "Đối tượng nào chịu trách nhiệm bảo vệ Business Rule?"

Đối tượng đó trở thành Aggregate Root.

---

Ví dụ:

## Workspace Aggregate

Không phải:

```
Workspace Table
```

mà là:

```
Workspace Aggregate

        |
        |
        +-- Workspace Member

        +-- Workspace Role

        +-- Workspace Setting
```

Workspace chịu trách nhiệm:

* Ai được tham gia.
* Ai có quyền.
* Workspace còn hoạt động hay không.

---

## Project Aggregate

```
Project Aggregate

        |
        |
        +-- Project Member

        +-- Milestone

        +-- Project Setting
```

Project chịu trách nhiệm:

* Ai tham gia Project.
* Project Status.
* Project Lifecycle.

---

## Task Aggregate

```
Task Aggregate

        |
        |
        +-- Task Comment

        +-- Task Attachment

        +-- Task History
```

Task chịu trách nhiệm:

* Task Status.
* Assignment.
* Workflow Transition.

---

# 5. Bounded Context Design

Một lỗi phổ biến:

Tạo một User Service khổng lồ.

Ví dụ:

```
User

- Authentication
- Profile
- Employee
- Permission
- Billing
- Notification
```

Đây là God Object.

---

AEOS chia theo Business Context.

---

# Identity Context

Chịu trách nhiệm:

* Authentication.
* Credential.
* Session.
* Identity Verification.

Không chịu trách nhiệm:

* Project.
* Task.
* Permission Business Rule.

---

# Organization Context

Chịu trách nhiệm:

* Company.
* Department.
* Organization Member.

---

# Workspace Context

Chịu trách nhiệm:

* Workspace.
* Team.
* Role.
* Permission Scope.

---

# Project Context

Chịu trách nhiệm:

* Project.
* Milestone.
* Project Lifecycle.

---

# Task Context

Chịu trách nhiệm:

* Task.
* Assignment.
* Status.
* Workflow.

---

# Document Context

Chịu trách nhiệm:

* Document.
* Version.
* Sharing.

---

# Notification Context

Chịu trách nhiệm:

* Email.
* Push Notification.
* In-app Notification.

---

# 6. Context Mapping

Các Domain không tồn tại độc lập.

Chúng giao tiếp với nhau thông qua Contract.

Ví dụ:

```
Identity

      |

      |

Organization

      |

      |

Workspace

      |

      |

Project

      |

      |

Task
```

---

# Ví dụ:

Khi User đăng ký.

Không phải:

```
Identity INSERT User

INSERT Organization

INSERT Workspace

INSERT Role
```

Một Transaction khổng lồ.

Mà là:

```
UserRegistered Event

        |

        |

Organization listens

        |

        |

Create Organization

        |

        |

Workspace listens

        |

        |

Create Default Workspace
```

Đây là tư duy Event-Driven.

---

# 7. Entity Design

Entity là đối tượng có Identity.

Ví dụ:

## User

Có:

```
userId
email
status
createdAt
```

Không quan trọng việc email thay đổi.

User vẫn là User đó.

---

## Workspace

Có:

```
workspaceId
name
status
ownerId
```

Workspace tồn tại xuyên suốt vòng đời hệ thống.

---

# 8. Value Object Design

Value Object không có Identity.

Ví dụ:

## Email

Không phải:

```
Email Table
```

Mà:

```
Email Value Object
```

---

## Money

Không phải:

```
amount INT
currency VARCHAR
```

Mà:

```
Money

{
 amount,
 currency
}
```

---

## Permission

Có thể là:

```
Permission

{
 resource,
 action
}
```

---

# 9. Domain Service

Một số logic không thuộc Entity.

Ví dụ:

Permission Calculation.

Không nên:

```
Workspace.calculatePermission()
```

Nếu quá phức tạp.

Tạo:

```
PermissionDomainService
```

---

# 10. Domain Event

Domain Event đại diện cho sự thay đổi quan trọng.

Ví dụ:

```
TaskCompletedEvent
```

Có thể kích hoạt:

```
Notification

↓

Audit

↓

Analytics

↓

AI Recommendation
```

Task không cần biết những hệ thống kia tồn tại.

---

# 11. Aggregate Rule

Nguyên tắc quan trọng.

## Rule 1

Một Transaction chỉ nên thay đổi một Aggregate.

Ví dụ:

Đúng:

```
Complete Task

↓

Task Aggregate Update
```

---

Sai:

```
Complete Task

↓

Update Task

↓

Update Project

↓

Update Notification

↓

Update Analytics

```

---

## Rule 2

Aggregate giao tiếp qua Event.

Không truy cập trực tiếp.

---

# 12. AEOS Domain Model tổng quan

Sau Phase này, chúng ta có:

```
AEOS

├── Identity
│
├── Organization
│
├── Workspace
│
├── Project
│
├── Task
│
├── Document
│
├── Workflow
│
├── Notification
│
├── Search
│
├── AI
│
├── Billing
│
└── Audit
```

---

# Deliverables của Phase 1

Sau khi hoàn thành Domain Design, chúng ta có:

✅ Event Storming Board

✅ Domain Event Catalogue

✅ Bounded Context Map

✅ Aggregate Design

✅ Entity Definition

✅ Value Object Definition

✅ Domain Service Definition

✅ Context Mapping

✅ Domain Rules

✅ Ubiquitous Language

---

# Bước tiếp theo

Sau khi có Domain Model, chúng ta bước sang:

# Phase 2 – Detailed Design

Ở Phase này chúng ta bắt đầu thiết kế cụ thể:

* Database Schema.
* ERD.
* Table Relationship.
* Index Strategy.
* Prisma Model.
* Migration Strategy.
* API Contract.
* Sequence Diagram.

Đây là lúc AEOS bắt đầu biến từ một mô hình nghiệp vụ thành một hệ thống có thể triển khai.
