# Phase 2.7 – Backend Implementation Blueprint

# Tổng quan

Hiện tại AEOS đã hoàn thành:

- Business Analysis
- Domain Design
- User Story & Use Case Specification
- API Contract Design
- Database Deep Design
- System Architecture Design

Chúng ta đã thiết kế:

- Hệ thống giải quyết vấn đề gì.
- Các module nghiệp vụ.
- Database structure.
- API Contract.
- Architecture tổng thể.

Tuy nhiên vẫn còn một khoảng cách:

```text
Solution Architecture
        ↓
Implementation
```

Phase 2.7 có nhiệm vụ lấp khoảng cách này.

Mục tiêu của Phase này là biến toàn bộ kiến trúc hệ thống thành một **Implementation Blueprint** đủ chi tiết để bất kỳ Developer nào cũng có thể bắt đầu phát triển mà không phải tự quyết định lại kiến trúc.

---

# 1. Mục tiêu của Phase 2.7

Sau Phase này chúng ta phải xác định rõ:

- Repository Structure
- Monorepo Strategy
- Module Boundary
- Dependency Direction
- Coding Convention
- Development Workflow
- Local Development Environment
- Module Implementation Order
- Shared Library Strategy
- Backend Folder Structure

Nói cách khác:

```text
Architecture

↓

Implementation Blueprint

↓

Coding
```

---

# 2. Monorepo Architecture Design

AEOS sử dụng Monorepo.

Lý do:

- Backend và Frontend dùng chung Type.
- Chia sẻ package.
- Quản lý Prisma Schema tập trung.
- CI/CD đơn giản hơn.
- Version đồng bộ.
- Refactor dễ dàng.
- Tách Microservice sau này đơn giản.

Cấu trúc tổng thể:

```text
aeos-platform

├── apps
│   ├── api
│   ├── web
│   └── worker
│
├── packages
│   ├── shared-kernel
│   ├── database
│   ├── config
│   ├── logger
│   ├── validation
│   ├── event-bus
│   ├── ui
│   └── sdk
│
├── infrastructure
│   ├── docker
│   ├── kubernetes
│   ├── terraform
│   └── github
│
├── docs
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

# 3. Dependency Rule

AEOS áp dụng Clean Architecture.

Dependency luôn hướng vào Domain.

```text
Presentation
        │
        ▼
Application
        │
        ▼
Domain

Infrastructure
        │
        └──────────────► Application
```

Domain tuyệt đối không được biết:

- Prisma
- PostgreSQL
- Redis
- Kafka
- HTTP
- NestJS
- Express

Sai:

```text
Domain

↓

Prisma

↓

Database
```

Đúng:

```text
Domain

↓

Repository Interface

↓

Prisma Repository

↓

Database
```

---

# 4. Backend Architecture

Backend sử dụng:

- NestJS
- Clean Architecture
- Domain Driven Design
- CQRS
- Event Driven
- Repository Pattern
- Outbox Pattern

Cấu trúc:

```text
apps/api

src

├── app.module.ts

├── common
│   ├── decorators
│   ├── filters
│   ├── guards
│   ├── interceptors
│   ├── middleware
│   └── exceptions

├── database
│   ├── prisma.service.ts
│   └── prisma.module.ts

├── modules
│   ├── identity
│   ├── organization
│   ├── workspace
│   ├── project
│   ├── task
│   ├── document
│   ├── notification
│   └── audit
```

---

# 5. Module Architecture

Mỗi module đều có cùng một cấu trúc.

```text
workspace

├── domain
│   ├── entities
│   ├── value-objects
│   ├── events
│   ├── repositories
│   └── services
│
├── application
│   ├── commands
│   ├── queries
│   ├── handlers
│   ├── mappers
│   └── dto
│
├── infrastructure
│   ├── prisma
│   ├── repositories
│   ├── cache
│   └── events
│
└── presentation
    ├── controllers
    ├── dto
    └── presenters
```

---

# 6. Shared Kernel

Tất cả module dùng chung Shared Kernel.

```text
packages/shared-kernel

src

├── domain
│   ├── aggregate-root
│   ├── entity
│   ├── value-object
│   ├── domain-event
│   ├── repository
│   └── specification
│
├── application
│   ├── command
│   ├── query
│   ├── result
│   └── mediator
│
├── errors
│
├── utils
│
└── constants
```

---

# 7. Base Entity

Mọi Entity đều kế thừa BaseEntity.

```text
Properties

- id
- version
- createdAt
- updatedAt
- createdBy
- updatedBy

Methods

- equals()
- touch()
- increaseVersion()
```

Version được dùng cho Optimistic Locking.

---

# 8. Aggregate Design

Ví dụ Workspace Aggregate.

```text
Workspace

│

├── WorkspaceMember

├── WorkspaceRole

└── WorkspacePermission
```

Không được gọi Repository để sửa Member trực tiếp.

Sai:

```text
WorkspaceMemberRepository.save()
```

Đúng:

```text
workspace.addMember()

workspace.removeMember()

workspace.changeRole()
```

Aggregate Root chịu trách nhiệm bảo vệ Business Rule.

---

# 9. CQRS

Command:

```text
CreateWorkspaceCommand

InviteMemberCommand

CreateProjectCommand

CreateTaskCommand
```

Query:

```text
GetWorkspaceQuery

SearchProjectQuery

ListTaskQuery

GetDashboardQuery
```

Command thay đổi dữ liệu.

Query chỉ đọc dữ liệu.

---

# 10. Repository Pattern

Domain:

```typescript
interface WorkspaceRepository {

    save(workspace: Workspace): Promise<void>

    findById(id: WorkspaceId): Promise<Workspace>

    exists(id: WorkspaceId): Promise<boolean>

}
```

Infrastructure:

```text
PrismaWorkspaceRepository

implements WorkspaceRepository
```

Domain hoàn toàn không biết Prisma.

---

# 11. Event Driven

Flow:

```text
Aggregate

↓

Raise Domain Event

↓

Application Layer

↓

Outbox Table

↓

Kafka

↓

Consumer
```

Ví dụ:

```text
WorkspaceCreatedEvent

↓

Notification

↓

Audit

↓

Analytics
```

---

# 12. Transaction Boundary

Transaction luôn nằm ở Application Layer.

Ví dụ:

```text
BEGIN

Create Workspace

Create Default Role

Create Owner Member

Save Outbox Event

COMMIT
```

Không gửi Email hoặc gọi API bên ngoài trong cùng Transaction.

---

# 13. Authentication Architecture

Identity là module đầu tiên.

Bao gồm:

- Register
- Login
- Logout
- Refresh Token
- Session
- Password Reset
- Email Verification
- OAuth

Flow:

```text
Controller

↓

Application Service

↓

Domain

↓

Repository

↓

Database
```

---

# 14. Authorization Architecture

AEOS sử dụng RBAC.

```text
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

```text
PROJECT.CREATE

PROJECT.UPDATE

PROJECT.DELETE

TASK.CREATE

TASK.DELETE

DOCUMENT.READ
```

Permission được cache bằng Redis.

---

# 15. API Strategy

Thiết kế theo Contract First.

```text
Use Case

↓

OpenAPI

↓

DTO

↓

Controller

↓

Frontend SDK
```

Không viết Controller trước rồi mới viết tài liệu.

---

# 16. Local Development Environment

Developer chỉ cần:

```text
git clone

↓

pnpm install

↓

docker compose up -d

↓

pnpm dev
```

Docker Compose gồm:

```text
postgres

redis

kafka

zookeeper

minio

mailhog

api

worker
```

---

# 17. Coding Standard

Code Quality

- ESLint
- Prettier
- Husky
- lint-staged

Git Convention

```text
feat:

fix:

refactor:

perf:

test:

docs:

chore:
```

Environment

```text
.env

.env.local

.env.test

.env.production
```

---

# 18. Module Implementation Order

Không triển khai ngẫu nhiên.

```text
Foundation

↓

Shared Kernel

↓

Database

↓

Identity

↓

Tenant

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

Notification

↓

Audit

↓

Search

↓

AI

↓

Reporting
```

Mỗi module chỉ được triển khai khi các dependency của nó đã hoàn thành.

---

# 19. Output của Phase 2.7

Sau khi hoàn thành Phase này chúng ta có:

## Architecture

- Monorepo Structure
- Dependency Rule
- Module Boundary

## Backend

- Folder Structure
- Shared Kernel
- CQRS
- Repository Pattern
- Event Driven Pattern
- Transaction Strategy

## Development

- Coding Convention
- Local Development Environment
- Module Implementation Order

## Team

Developer có thể clone project và bắt đầu code mà không cần quyết định lại kiến trúc.

---

# Trạng thái hiện tại của AEOS

```text
Business Analysis
        ↓
Domain Design
        ↓
Detailed Design
        ↓
User Story
        ↓
API Contract
        ↓
Database Deep Design
        ↓
System Architecture
        ↓
Backend Implementation Blueprint ✅
```

---

# Bước tiếp theo

**Phase 2.7.1 – AEOS Monorepo Architecture Design**

Chúng ta sẽ đi sâu vào:

- Monorepo Design
- pnpm Workspace
- Turborepo
- Package Boundary
- Shared Package Design
- Internal SDK
- Docker Build Strategy
- CI/CD cho Monorepo
- Release Strategy
- Production Deployment Structure

Đây sẽ là bước cuối cùng trước khi bắt đầu **Phase 3 – Implementation**.