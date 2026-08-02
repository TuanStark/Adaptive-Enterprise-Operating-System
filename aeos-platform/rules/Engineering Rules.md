# AEOS Backend Engineering Rules

> Version: 1.0
>
> Status: Mandatory
>
> Mọi Developer tham gia dự án đều phải tuân thủ tài liệu này.
>
> Đây là Architecture Rule, không phải Coding Guideline.

---

# 1. Core Principles

AEOS được xây dựng dựa trên các nguyên tắc sau:

- Domain-Driven Design (DDD)
- Clean Architecture
- SOLID
- Clean Code
- Twelve-Factor App
- Cloud Native
- Event-Driven Architecture
- CQRS (Selective)
- Modular Monolith First
- API Contract First
- Database Last

Không được đưa ra quyết định kỹ thuật trái với các nguyên tắc trên nếu chưa có ADR (Architecture Decision Record).

---

# 2. Dependency Rule

Dependency chỉ được đi theo một chiều.

```text
Presentation
        ↓
Application
        ↓
Domain
        ↓
Infrastructure
```

Không được phép import ngược.

Ví dụ:

❌ Domain → Application

❌ Domain → Infrastructure

❌ Application → Presentation

---

# 3. Layer Responsibilities

## Presentation

Chỉ xử lý:

- HTTP
- Validation
- Authentication
- Authorization
- Serialization
- Response Mapping

Không chứa Business Logic.

---

## Application

Chỉ điều phối Use Case.

Bao gồm:

- Command
- Query
- Handler
- Transaction
- Repository Coordination

Không chứa Business Rule.

---

## Domain

Là trái tim của hệ thống.

Bao gồm:

- Aggregate
- Entity
- Value Object
- Domain Service
- Domain Event
- Business Rule

Domain không được phụ thuộc vào bất kỳ Framework nào.

---

## Infrastructure

Triển khai các Interface.

Bao gồm:

- Prisma
- Redis
- Kafka
- Email
- Storage
- External API

Infrastructure không chứa Business Logic.

---

# 4. Module Independence

Mỗi Module phải độc lập.

Module A không được truy cập trực tiếp Database của Module B.

Nếu cần giao tiếp:

- Interface
- Domain Event
- Integration Event

---

# 5. Business Logic Rule

Business Rule chỉ được phép nằm trong:

- Aggregate
- Domain Service

Không được viết Business Logic trong:

- Controller
- Service của NestJS
- Repository
- Prisma

---

# 6. Repository Rule

Repository Interface nằm trong Domain.

Repository Implementation nằm trong Infrastructure.

Ví dụ:

```text
Domain

WorkspaceRepository
```

```text
Infrastructure

PrismaWorkspaceRepository
```

Application chỉ biết Interface.

---

# 7. Entity Rule

Entity:

- Có Identity.
- Có Behavior.
- Có Business Rule.

Không tạo Entity chỉ để chứa dữ liệu.

Sai:

```ts
workspace.status = "ACTIVE";
```

Đúng:

```ts
workspace.activate();
```

---

# 8. Value Object Rule

Value Object:

- Immutable.
- Không có Identity.
- So sánh bằng Value.

Ví dụ:

- Email
- Money
- Address
- WorkspaceName

---

# 9. Aggregate Rule

Mỗi Aggregate có:

- Một Root.
- Transaction Boundary.
- Business Consistency.

Không được cập nhật Aggregate khác trong cùng Transaction nếu không thật sự cần thiết.

---

# 10. CQRS Rule

Không áp dụng CQRS cho toàn bộ hệ thống.

Chỉ sử dụng khi:

- Query phức tạp.
- Read Model khác Write Model.
- Có nhu cầu tối ưu hiệu năng.

CRUD đơn giản không bắt buộc dùng CQRS.

---

# 11. Domain Event Rule

Business Event phải phát sinh từ Domain.

Ví dụ:

```text
WorkspaceCreated

MemberInvited

TaskCompleted
```

Không publish Event từ Controller.

---

# 12. Transaction Rule

Transaction chỉ bao quanh một Use Case.

Không mở Transaction xuyên nhiều Aggregate nếu có thể tránh.

Nếu cần xử lý nhiều Aggregate:

- Domain Event
- Outbox Pattern
- Saga (khi tách Microservice)

---

# 13. Database Rule

Database không quyết định Domain.

Domain quyết định Database.

Không thiết kế Entity theo bảng dữ liệu.

---

# 14. API Rule

Mọi API phải:

- Có Version.
- Có Validation.
- Có Pagination.
- Có Error Standard.
- Có OpenAPI Documentation.

Không trả dữ liệu trực tiếp từ ORM.

---

# 15. DTO Rule

DTO chỉ tồn tại ở Presentation/Application.

Domain không biết DTO.

Infrastructure không trả DTO.

---

# 16. Mapper Rule

Không Mapping trong Controller.

Mapping tập trung tại Mapper hoặc Presenter.

---

# 17. Exception Rule

Domain chỉ ném Domain Exception.

Application chuyển thành Application Exception khi cần.

Presentation chuyển thành HTTP Response.

Không throw HttpException trong Domain.

---

# 18. Logging Rule

Logger chỉ ghi nhận:

- Request.
- Response.
- Error.
- Audit.
- Business Event.

Không log:

- Password.
- Access Token.
- Refresh Token.
- Secret.
- Thông tin nhạy cảm.

---

# 19. Configuration Rule

Không đọc trực tiếp:

```ts
process.env
```

Mọi cấu hình phải đi qua Configuration Module.

---

# 20. Testing Rule

Mỗi Use Case phải có:

- Unit Test.
- Integration Test.

Business Rule phải được Unit Test.

---

# 21. Security Rule

Mọi API mặc định yêu cầu Authentication.

Các API Public phải khai báo rõ ràng.

Permission luôn kiểm tra ở Backend.

Frontend chỉ hỗ trợ hiển thị.

---

# 22. Naming Convention

Module:

```text
workspace
identity
organization
```

Aggregate:

```text
Workspace
```

Entity:

```text
WorkspaceMember
```

Value Object:

```text
WorkspaceName
```

Repository:

```text
WorkspaceRepository
```

Command:

```text
CreateWorkspaceCommand
```

Query:

```text
GetWorkspaceQuery
```

Handler:

```text
CreateWorkspaceHandler
```

---

# 23. Code Review Checklist

Pull Request sẽ bị từ chối nếu:

- Vi phạm Dependency Rule.
- Business Logic nằm sai Layer.
- Domain phụ thuộc Framework.
- Thiếu Test.
- Thiếu Validation.
- Thiếu Error Handling.
- Không tuân thủ Naming Convention.

---

# 24. Architecture Decision Record

Mọi thay đổi ảnh hưởng đến kiến trúc phải có ADR.

Không thay đổi Rule bằng trao đổi miệng hoặc trong Pull Request.

---

# 25. Golden Rules

1. Domain là trung tâm của hệ thống.
2. Business quyết định Architecture.
3. Database phục vụ Domain.
4. Framework chỉ là công cụ.
5. Mọi Module phải có khả năng tách thành Microservice trong tương lai.
6. Không đánh đổi tính đúng đắn của Domain để tối ưu ngắn hạn.
7. Ưu tiên khả năng bảo trì hơn tối ưu sớm.
8. Mọi quyết định kiến trúc phải có lý do và tài liệu đi kèm.