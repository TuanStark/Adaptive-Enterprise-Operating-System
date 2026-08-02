# AEOS – Phase 2: Detailed Design

# Tổng quan

Sau khi hoàn thành:

* Business Analysis.
* Domain Design.

Chúng ta đã biết:

* AEOS giải quyết vấn đề gì.
* Ai sử dụng hệ thống.
* Các Bounded Context.
* Các Aggregate.
* Các Entity quan trọng.
* Các Domain Event.

Nhưng hiện tại hệ thống vẫn chỉ tồn tại ở mức **mô hình nghiệp vụ**.

Chúng ta chưa biết:

* Database lưu dữ liệu như thế nào?
* API giao tiếp ra sao?
* Request đi qua những Layer nào?
* Transaction xử lý thế nào?
* Permission kiểm tra ở đâu?
* Event được publish khi nào?
* Code structure sẽ tổ chức ra sao?

Đó chính là nhiệm vụ của **Detailed Design**.

---

# 1. Detailed Design là gì?

Detailed Design là bước chuyển đổi:

```
Domain Model

↓

Software Design

↓

Database Design

↓

API Design

↓

Implementation Blueprint
```

Nếu Domain Design trả lời:

> "Hệ thống có những khái niệm nghiệp vụ nào?"

Thì Detailed Design trả lời:

> "Chúng ta sẽ xây dựng những khái niệm đó trong phần mềm như thế nào?"

---

# 2. Nguyên tắc thiết kế

AEOS sẽ tuân theo các nguyên tắc:

## Domain First

Database không quyết định nghiệp vụ.

Domain Model quyết định Database.

---

## API Contract First

API phải được thiết kế trước khi code.

Frontend và Backend giao tiếp thông qua Contract.

---

## Loose Coupling

Các Module không phụ thuộc trực tiếp.

Giao tiếp thông qua:

* Interface.
* Event.
* Contract.

---

## Evolution Friendly

Thiết kế phải cho phép thay đổi.

Ví dụ:

Hôm nay:

```
Modular Monolith
```

Ngày mai:

```
Microservice
```

mà không phải viết lại toàn bộ hệ thống.

---

# 3. Architecture Blueprint

AEOS sử dụng kiến trúc:

```
                 Client

                   |

              API Gateway

                   |

        Application Layer

                   |

             Domain Layer

                   |

        Infrastructure Layer

                   |

             Database
```

---

# 4. Application Layer Design

Application Layer chịu trách nhiệm điều phối Use Case.

Không chứa Business Rule.

Ví dụ:

Use Case:

```
Create Workspace
```

Flow:

```
Controller

↓

CreateWorkspaceCommand

↓

Application Service

↓

Workspace Aggregate

↓

Repository

↓

Database
```

---

# 5. Domain Layer Design

Domain Layer chứa:

* Entity.
* Aggregate.
* Value Object.
* Domain Service.
* Domain Event.

Ví dụ:

Workspace Aggregate:

```
Workspace

Properties:

- id
- name
- status
- owner


Behavior:

- addMember()
- removeMember()
- changePermission()
- archive()
```

Không phải:

```
workspace.status = "ARCHIVED"
```

Mà:

```
workspace.archive()
```

Bởi vì Domain phải bảo vệ Business Rule.

---

# 6. Infrastructure Layer Design

Infrastructure chịu trách nhiệm:

* Database.
* Cache.
* Message Queue.
* External API.
* File Storage.

Ví dụ:

Domain có:

```
WorkspaceRepository Interface
```

Infrastructure triển khai:

```
PrismaWorkspaceRepository
```

---

# 7. Database Design Strategy

Database không thiết kế toàn bộ một lần.

Chúng ta thiết kế theo Bounded Context.

Ví dụ:

```
Identity Database Area

Organization Database Area

Workspace Database Area

Project Database Area

Task Database Area
```

---

# 8. Database Modeling Process

Mỗi Context sẽ đi qua:

```
Business Entity

↓

Domain Entity

↓

Database Entity

↓

ERD

↓

Schema

↓

Index

↓

Migration
```

---

# 9. Database Design Example

## Workspace Context

Domain Model:

```
Workspace

WorkspaceMember

Role

Permission
```

Database:

```
workspace

----------------
id
name
status
owner_id
created_at
updated_at



workspace_member

----------------
id
workspace_id
user_id
role_id
joined_at



role

----------------
id
workspace_id
name



permission

----------------
id
role_id
resource
action
```

---

# 10. Relationship Design

Ví dụ:

```
Organization

      1

      |

      N

Workspace


Workspace

      1

      |

      N

WorkspaceMember


User

      1

      |

      N

WorkspaceMember
```

---

# 11. Database Constraints

Senior không chỉ tạo Column.

Phải thiết kế Constraint.

Ví dụ:

## Unique

Một User không thể join cùng Workspace hai lần.

```
UNIQUE(workspace_id, user_id)
```

---

## Foreign Key

Member phải thuộc Workspace tồn tại.

---

## Check Constraint

Ví dụ:

Status chỉ được:

```
ACTIVE
ARCHIVED
SUSPENDED
```

---

# 12. Index Strategy

Không tạo Index tùy ý.

Phải dựa trên Query Pattern.

Ví dụ:

Query:

```
Find all workspace members
```

Cần:

```
INDEX(workspace_id)
```

---

Query:

```
Find user's workspace
```

Cần:

```
INDEX(user_id)
```

---

Query:

```
Check membership permission
```

Cần:

```
INDEX(workspace_id,user_id)
```

---

# 13. Prisma Schema Design

Sau khi Database Design hoàn thành.

Chúng ta mapping sang ORM.

Ví dụ:

```prisma
model Workspace {

 id String @id

 name String

 status WorkspaceStatus

 members WorkspaceMember[]

 createdAt DateTime

 updatedAt DateTime

}
```

Nhưng Prisma chỉ là công cụ.

Không được để Prisma quyết định Domain.

---

# 14. API Design

Mỗi Use Case có API Contract.

Ví dụ:

Create Workspace.

Request:

```
POST /api/v1/workspaces
```

Body:

```json
{
 "name":"Engineering"
}
```

Response:

```json
{
 "id":"ws_123",
 "name":"Engineering",
 "status":"ACTIVE"
}
```

---

# 15. API Design Rules

API phải có:

* Versioning.
* Validation.
* Error Format.
* Pagination.
* Filtering.
* Authorization.

Ví dụ:

```
GET /api/v1/projects?page=1&limit=20
```

---

# 16. Error Design

Không trả lỗi ngẫu nhiên.

Chuẩn hóa:

```json
{
 "code":"WORKSPACE_NOT_FOUND",
 "message":"Workspace does not exist",
 "traceId":"abc123"
}
```

---

# 17. Sequence Diagram

Trước khi code phải biết Flow.

Ví dụ:

Create Workspace.

```
User

↓

Controller

↓

Application Service

↓

Workspace Aggregate

↓

Repository

↓

Database

↓

Publish Event

↓

Notification
```

---

# 18. Event Design

Domain Event phải được định nghĩa rõ.

Ví dụ:

WorkspaceCreatedEvent

```
{
 workspaceId,
 ownerId,
 createdAt
}
```

Consumer:

```
Notification Service

Audit Service

Analytics Service
```

---

# 19. Transaction Design

Không tạo Transaction quá lớn.

Ví dụ:

Sai:

```
Create User

Create Organization

Create Workspace

Send Email

Create Permission
```

một transaction.

---

Đúng:

```
Create User

↓

UserCreated Event

↓

Create Organization

↓

OrganizationCreated Event

↓

Create Workspace
```

---

# 20. Permission Design

AEOS sử dụng RBAC.

Mô hình:

```
User

↓

Workspace Member

↓

Role

↓

Permission

↓

Action
```

Ví dụ:

```
PROJECT.CREATE

TASK.DELETE

DOCUMENT.READ
```

---

# 21. File Storage Design

File không lưu trong PostgreSQL.

Architecture:

```
Client

↓

Upload API

↓

Object Storage

↓

Metadata Database
```

Database lưu:

```
file_id

filename

size

mime_type

storage_url
```

---

# 22. Cache Design

Không cache tất cả.

Xác định:

## Cache Candidate

Ví dụ:

* User Profile.
* Permission.
* Workspace Configuration.

---

## Không Cache

Ví dụ:

* Transaction.
* Audit Log.

---

# 23. Background Job Design

Các tác vụ lâu:

Không xử lý trong Request.

Ví dụ:

```
Upload File

↓

Create Processing Job

↓

Worker

↓

Generate Preview

↓

Notify User
```

---

# 24. Testing Design

Mỗi Use Case phải có:

## Unit Test

Domain Rule.

---

## Integration Test

Database + Application.

---

## Contract Test

API.

---

## E2E Test

Business Flow.

---

# 25. Detailed Design Output

Sau Phase này chúng ta có:

## Database

✅ ERD

✅ Schema Design

✅ Relationship

✅ Constraint

✅ Index Strategy

✅ Migration Plan

## Backend

✅ Module Structure

✅ Use Case Design

✅ Sequence Diagram

✅ API Contract

✅ Error Standard

## Domain

✅ Aggregate Implementation Plan

✅ Domain Event Catalogue

## Security

✅ Permission Matrix

## Testing

✅ Test Strategy

---

# Kết quả cuối Phase 2

Sau khi hoàn thành Detailed Design:

AEOS không còn là một ý tưởng.

Chúng ta đã có một bản thiết kế đủ chi tiết để Developer bắt đầu code.

---

# Bước tiếp theo

Chúng ta sẽ bước sang:

# Phase 3 – Implementation

Bắt đầu xây dựng hệ thống thật:

1. Repository Setup.
2. Monorepo Initialization.
3. Backend Foundation.
4. Frontend Foundation.
5. Database Migration.
6. Identity Module.
7. Workspace Module.

Từ Phase này trở đi, chúng ta sẽ bắt đầu viết code thật.
