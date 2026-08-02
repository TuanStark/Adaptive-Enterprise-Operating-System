# AEOS Backend Engineering Handbook

## 01 Architecture Rules

---

# 1. Architecture Style

AEOS sử dụng:

- Modular Monolith
- Clean Architecture
- Domain Driven Design
- Event Driven Architecture

Mục tiêu:

- Business logic độc lập.
- Module có boundary rõ ràng.
- Có khả năng scale.
- Có khả năng tách Microservice trong tương lai.

---

# 2. Dependency Rule

Dependency chỉ được phép đi theo một chiều:

Presentation

↓

Application

↓

Domain

↑

Infrastructure

Quy tắc:

- Domain không biết Application.
- Domain không biết Infrastructure.
- Domain không phụ thuộc Framework.
- Infrastructure implement interface của Domain.

---

# 3. Layer Responsibilities

## Presentation Layer

Chịu trách nhiệm:

- HTTP Request.
- Authentication.
- Authorization.
- Validation.
- Response Mapping.

Không được chứa:

- Business Logic.
- Database Access.
- Transaction Logic.

---

## Application Layer

Chịu trách nhiệm:

- Use Case Execution.
- Command Handling.
- Query Handling.
- Transaction Coordination.
- Domain Object Orchestration.

Không được chứa:

- Business Rule.
- SQL Query.
- Framework Logic.

---

## Domain Layer

Là trung tâm của hệ thống.

Bao gồm:

- Entity.
- Aggregate.
- Value Object.
- Domain Service.
- Domain Event.
- Repository Interface.

Domain không được import:

- NestJS.
- Prisma.
- Redis.
- Kafka.
- External API.

---

## Infrastructure Layer

Chịu trách nhiệm:

- Database.
- Cache.
- Message Queue.
- External Service.
- File Storage.

Infrastructure triển khai:

- Repository Implementation.
- Adapter.
- Provider.

---

# 4. Module Boundary Rule

Mỗi module đại diện cho một Business Capability.

Ví dụ:

```
Identity

Organization

Workspace

Project

Task

Notification
```

Không chia module theo technical layer:

Sai:

```
controllers/

services/

repositories/
```

Đúng:

```
workspace/

├── domain
├── application
├── infrastructure
└── presentation
```

---

# 5. Business Logic Rule

Business Rule chỉ được phép nằm trong:

- Aggregate.
- Entity.
- Domain Service.
- Specification.

Không được viết Business Logic trong:

- Controller.
- DTO.
- Repository.
- Prisma Model.

Ví dụ:

Sai:

```typescript
workspace.status = 'ARCHIVED';
```

Đúng:

```typescript
workspace.archive();
```

---

# 6. Database Rule

Database không quyết định Domain.

Domain quyết định Database.

Sai:

```
Database Table

↓

Entity

↓

Business
```

Đúng:

```
Business Concept

↓

Domain Model

↓

Persistence Model
```

---

# 7. ORM Rule

ORM chỉ tồn tại trong Infrastructure.

Không được:

```
Domain

import Prisma
```

Không được:

```
Application

query database trực tiếp
```

---

# 8. Repository Rule

Interface:

```
Domain Layer
```

Implementation:

```
Infrastructure Layer
```

Ví dụ:

Domain:

```typescript
interface WorkspaceRepository {
  save(workspace: Workspace): Promise<void>;
}
```

Infrastructure:

```typescript
class PrismaWorkspaceRepository implements WorkspaceRepository {}
```

---

# 9. DTO Rule

DTO chỉ tồn tại ở:

- Presentation.
- Application.

Domain không nhận DTO.

Sai:

```
Domain

WorkspaceCreateDTO
```

Đúng:

```
Request DTO

↓

Command

↓

Domain Entity
```

---

# 10. Cross Module Communication Rule

Thứ tự ưu tiên:

## Level 1

Interface Call

Dùng khi:

- Query dữ liệu.
- Logic đồng bộ.

---

## Level 2

Domain Event

Dùng khi:

- Có business state change.

Ví dụ:

```
WorkspaceCreated
```

---

## Level 3

Integration Event

Dùng khi:

- Giao tiếp giữa service.
- Chuẩn bị Microservice.

---

# 11. Transaction Rule

Transaction thuộc Application Layer.

Một transaction nên bao phủ:

```
One Use Case
```

Không:

```
Create User

Create Workspace

Send Email

Create Permission

```

trong một transaction.

---

# 12. Exception Rule

Luồng Error:

```
Domain Exception

↓

Application Exception

↓

HTTP Exception

↓

API Response
```

Domain không được throw:

```typescript
HttpException;
```

---

# 13. Configuration Rule

Không sử dụng trực tiếp:

```typescript
process.env;
```

Mọi config phải đi qua:

```
Config Module
```

---

# 14. Logging Rule

Mọi request phải có:

- requestId.
- traceId.
- userId.
- tenantId.

Không log:

- Password.
- Token.
- Secret.
- Sensitive Data.

---

# 15. Testing Rule

Mỗi module phải có:

## Domain Test

Kiểm tra:

- Business Rule.
- Aggregate.

## Application Test

Kiểm tra:

- Use Case.

## Integration Test

Kiểm tra:

- Database.
- External Dependency.

## E2E Test

Kiểm tra:

- Business Flow.

---

# 16. Code Review Rule

Pull Request bị reject nếu:

- Sai Dependency Rule.
- Business Logic sai Layer.
- Thiếu Test.
- Không có Documentation.
- Vi phạm Module Boundary.

---

# 17. ADR Rule

Mọi thay đổi kiến trúc phải tạo ADR.

Ví dụ:

```
docs/adr/

ADR-001-use-event-driven.md

ADR-002-multi-tenancy.md

ADR-003-use-kafka.md
```

---

# 18. Golden Rules

1. Domain là trung tâm.

2. Framework chỉ là công cụ.

3. Database không quyết định Business.

4. Module phải độc lập.

5. Business Logic không nằm ở Controller.

6. Không tối ưu trước khi có vấn đề.

7. Mọi quyết định lớn phải được ghi lại.

8. Code phải phục vụ Architecture.

```

```
