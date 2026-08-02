# AEOS – Phase 2.5: Database Design

# 1. Database Design là gì?

Database Design là quá trình chuyển đổi:

```text
Business Model

↓

Domain Model

↓

Persistence Model

↓

Database Schema
```

---

Một Senior Developer không bắt đầu bằng:

> "Tạo bảng User trước."

Mà bắt đầu bằng:

> "User trong nghiệp vụ là gì? Nó có lifecycle như thế nào? Những hành vi nào tác động lên User?"

---

# 2. Nguyên tắc Database Design của AEOS

## 2.1 Domain First

Database phục vụ Domain.

Không để Database quyết định Business.

Sai:

```text
Database Table

↓

Code

↓

Business Rule
```

---

Đúng:

```text
Business Requirement

↓

Domain Model

↓

Database Design
```

---

# 2.2 Bounded Context Database

AEOS không thiết kế một database khổng lồ.

Chúng ta chia theo Domain.

```text
AEOS Database

|

├── Identity Context

├── Organization Context

├── Workspace Context

├── Project Context

├── Task Context

├── Document Context

├── Notification Context

├── Audit Context

└── Billing Context
```

---

Trong giai đoạn đầu:

AEOS sử dụng:

```text
Modular Monolith

+

Single PostgreSQL Database

+

Schema Separation
```

---

Ví dụ:

```text
PostgreSQL

|

├── identity_schema

├── organization_schema

├── workspace_schema

├── project_schema

└── audit_schema
```

---

Sau này có thể tách:

```text
Workspace Service

        |

 Workspace Database
```

mà không thay đổi Domain.

---

# 3. Database Design Process

Mỗi Context sẽ đi qua:

```text
Business Entity

↓

Domain Entity

↓

Aggregate

↓

Database Entity

↓

ERD

↓

Table Definition

↓

Constraint

↓

Index

↓

Migration

↓

ORM Mapping
```

---

# 4. Database Technology Selection

AEOS sử dụng:

## Primary Database

PostgreSQL

Lý do:

* ACID Transaction.
* Strong Consistency.
* JSON Support.
* Index mạnh.
* Extension phong phú.
* Phù hợp Enterprise.

---

## Cache

Redis

Dùng cho:

* Session.
* Permission Cache.
* Rate Limit.
* Temporary Data.

---

## Object Storage

S3 Compatible Storage

Dùng cho:

* File.
* Document.
* Attachment.

---

# 5. Database Architecture Overview

```text
                 Application Layer

                        |

                  Repository Layer

                        |

              --------------------

              PostgreSQL

              --------------------

                 |          |

            Schema       Schema

          Identity     Workspace

```

---

# 6. AEOS Core Database Context

Trong Phase đầu, chúng ta tập trung Core Domain:

```text
Identity

+

Organization

+

Workspace

+

RBAC
```

Vì toàn bộ hệ thống phụ thuộc vào 4 Context này.

---

# 7. Identity Context Database Design

## 7.1 Domain Model

Identity chịu trách nhiệm:

* User.
* Authentication.
* Credential.
* Session.

Aggregate:

```text
User Aggregate
```

---

# 7.2 Entity: User

Business Meaning:

User là một cá nhân có thể truy cập hệ thống.

---

Database:

## users

| Column         | Type      | Constraint |
| -------------- | --------- | ---------- |
| id             | UUID      | PK         |
| email          | VARCHAR   | UNIQUE     |
| password_hash  | VARCHAR   | NOT NULL   |
| status         | ENUM      | NOT NULL   |
| email_verified | BOOLEAN   |            |
| created_at     | TIMESTAMP |            |
| updated_at     | TIMESTAMP |            |

---

# 7.3 User Status

```text
PENDING_VERIFICATION

ACTIVE

LOCKED

DISABLED
```

---

# 7.4 User Constraint

Email:

```sql
UNIQUE(email)
```

Không cho phép:

```text
user@gmail.com

user@gmail.com
```

trùng nhau.

---

# 7.5 Index Strategy

Query:

Login:

```sql
SELECT *
FROM users
WHERE email = ?
```

Index:

```sql
CREATE UNIQUE INDEX idx_users_email
ON users(email);
```

---

# 8. Organization Context Database Design

## 8.1 Domain Model

Organization Aggregate:

```text
Organization

|

├── Member

├── Setting

└── Subscription
```

---

# 8.2 Organization Table

## organizations

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| name       | VARCHAR   |
| status     | ENUM      |
| owner_id   | UUID      |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# Organization Status

```text
ACTIVE

SUSPENDED

DELETED
```

---

# 8.3 Organization Member

Vì:

Một User có thể thuộc nhiều Organization.

Quan hệ:

```text
User

  N

  |

  N

Organization
```

Cần bảng trung gian.

## organization_members

| Column          | Type      |
| --------------- | --------- |
| id              | UUID      |
| organization_id | UUID      |
| user_id         | UUID      |
| role            | ENUM      |
| joined_at       | TIMESTAMP |

---

Constraint:

Một User không join Organization 2 lần.

```sql
UNIQUE(
organization_id,
user_id
)
```

---

# 9. Workspace Context Database Design

Workspace là Core Domain.

---

# 9.1 Workspace Aggregate

```text
Workspace

|

├── WorkspaceMember

├── Role

└── Permission
```

---

# 9.2 Workspace Table

## workspace

| Column          | Type      |
| --------------- | --------- |
| id              | UUID      |
| organization_id | UUID      |
| name            | VARCHAR   |
| description     | TEXT      |
| status          | ENUM      |
| owner_id        | UUID      |
| created_at      | TIMESTAMP |
| updated_at      | TIMESTAMP |

---

# 9.3 Workspace Relationship

```text
Organization

      1

      |

      N

Workspace
```

---

# 9.4 Workspace Constraint

Tên Workspace không trùng trong Organization.

```sql
UNIQUE(
organization_id,
name
)
```

---

# 10. RBAC Database Design

AEOS sử dụng:

```text
Role Based Access Control
```

Model:

```text
User

↓

Membership

↓

Role

↓

Permission
```

---

# 10.1 Role Table

## roles

| Column       | Type      |
| ------------ | --------- |
| id           | UUID      |
| workspace_id | UUID      |
| name         | VARCHAR   |
| created_at   | TIMESTAMP |

---

# 10.2 Permission Table

## permissions

| Column   | Type    |
| -------- | ------- |
| id       | UUID    |
| resource | VARCHAR |
| action   | VARCHAR |

Ví dụ:

```text
RESOURCE        ACTION

PROJECT         CREATE

TASK            DELETE

DOCUMENT        READ
```

---

# 10.3 Role Permission

Quan hệ:

Role:

N-N

Permission

Table:

## role_permissions

| Column        | Type |
| ------------- | ---- |
| role_id       | UUID |
| permission_id | UUID |

Constraint:

```sql
PRIMARY KEY(
role_id,
permission_id
)
```

---

# 11. Workspace Member

## workspace_members

| Column       | Type      |
| ------------ | --------- |
| id           | UUID      |
| workspace_id | UUID      |
| user_id      | UUID      |
| role_id      | UUID      |
| joined_at    | TIMESTAMP |

Constraint:

```sql
UNIQUE(
workspace_id,
user_id
)
```

---

# 12. ERD Tổng Quan

```text
users

 |

 |

organization_members

 |

 |

organizations

 |

 |

workspace

 |

 |

workspace_members

 |

 |

roles

 |

 |

role_permissions

 |

 |

permissions
```

---

# 13. Transaction Boundary

Senior cần xác định transaction.

Ví dụ:

Create Workspace.

Không phải:

```text
INSERT workspace

INSERT member

INSERT role

INSERT permission
```

rời rạc.

Mà:

```text
BEGIN TRANSACTION


Create Workspace


Create Owner Membership


Create Default Role


Assign Permission


COMMIT
```

Nếu lỗi:

```text
ROLLBACK
```

---

# 14. Soft Delete Strategy

AEOS không xóa trực tiếp dữ liệu quan trọng.

Sai:

```sql
DELETE FROM users
```

Đúng:

```text
status = DELETED
```

---

Áp dụng cho:

* User.
* Organization.
* Workspace.
* Project.

---

# 15. Audit Requirement

Mọi thay đổi quan trọng phải lưu:

## audit_logs

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| actor_id    | UUID      |
| action      | VARCHAR   |
| resource    | VARCHAR   |
| resource_id | UUID      |
| metadata    | JSONB     |
| created_at  | TIMESTAMP |

---

# 16. Migration Strategy

AEOS sử dụng migration version.

Ví dụ:

```text
migration

001_create_users

002_create_organizations

003_create_workspace

004_create_rbac

005_create_audit
```

---

# 17. ORM Mapping

Sau khi Database Design hoàn thành mới mapping ORM.

Ví dụ Prisma:

```prisma
model User {

 id String @id @default(uuid())

 email String @unique

 passwordHash String

 status UserStatus

}
```

---

# 18. Database Design Output

Sau Phase 2.5 chúng ta có:

## Database Architecture

✅ Database Strategy

✅ Context Separation

✅ Schema Design

## Data Model

✅ ERD

✅ Entity Relationship

✅ Aggregate Mapping

## Implementation

✅ Table Definition

✅ Constraint

✅ Index

✅ Migration Plan

✅ ORM Mapping

---

# Kết quả sau Phase 2.1 → 2.5

AEOS hiện tại đã có:

```text
Business Requirement

↓

Functional Requirement

↓

User Story

↓

Use Case

↓

API Contract

↓

Database Design
```

Chúng ta đã biết:

* Xây dựng hệ thống gì.
* User dùng như thế nào.
* API giao tiếp ra sao.
* Dữ liệu lưu trữ thế nào.

---

# Bước tiếp theo

Sau Database Design, chúng ta tiếp tục:

# Phase 2.6 – System Architecture & Application Design

Trong phần này sẽ thiết kế:

* Backend Architecture.
* Module Structure.
* Layer Architecture.
* Dependency Rule.
* Domain Layer.
* Application Layer.
* Infrastructure Layer.
* Repository Pattern.
* Event Architecture.
* Queue Design.
* Cache Design.
* Logging.
* Monitoring.

Đây chính là bản thiết kế để Developer bắt đầu tạo Repository và viết code.
