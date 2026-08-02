# AEOS Backend Engineering Handbook

## 03-application-rules.md

> Application Layer là lớp điều phối nghiệp vụ.
>
> Application không chứa Business Rule.
>
> Application chịu trách nhiệm kết nối Domain với thế giới bên ngoài thông qua Use Case.

---

# 1. Application Layer Philosophy

Application Layer trả lời câu hỏi:

```
Hệ thống cần thực hiện hành động gì?
```

Không trả lời:

```
Nghiệp vụ hoạt động như thế nào?
```

---

Ví dụ:

Use Case:

```
Create Workspace
```

Application chịu trách nhiệm:

```
Receive Request

↓

Load Required Data

↓

Call Domain Behavior

↓

Save Result

↓

Publish Event

↓

Return Response
```

Domain chịu trách nhiệm:

```
Workspace.create()

Validate Name

Check Business Rule

Generate Event
```

---

# 2. Application Layer Responsibility Rule

Application Layer chỉ chịu trách nhiệm:

- Use Case orchestration.
- Command execution.
- Query execution.
- Transaction boundary.
- Authorization coordination.
- Calling Domain Object.
- Calling Repository Interface.
- Publishing Domain Event.

---

Application không chịu trách nhiệm:

- Business Rule.
- SQL Query.
- HTTP Response.
- Database Mapping.
- External API Implementation.

---

# 3. Use Case First Rule

Mọi business action phải bắt đầu bằng Use Case.

Không thiết kế theo Database CRUD.

Sai:

```
UserController

UserService

UserRepository
```

Đúng:

```
CreateUser

UpdateUserProfile

DeactivateUser

InviteMember
```

---

# 4. Use Case Naming Rule

Use Case phải thể hiện hành động.

Đúng:

```
CreateWorkspace

InviteMember

ArchiveProject

ApproveLeaveRequest
```

Sai:

```
WorkspaceManager

UserHandler

DataProcessor
```

---

# 5. One Use Case One Responsibility Rule

Một Use Case chỉ xử lý một business action.

Sai:

```
RegisterUserUseCase

- Create User
- Create Organization
- Create Workspace
- Send Email
- Create Permission
```

Đúng:

```
RegisterUser

↓

UserRegistered Event

↓

Create Organization

↓

OrganizationCreated Event
```

---

# 6. Command Rule

Command đại diện cho một yêu cầu thay đổi trạng thái.

Ví dụ:

```
CreateWorkspaceCommand

UpdateProfileCommand

AssignTaskCommand
```

Command chỉ chứa input.

Không chứa:

- Business Logic.
- Database Access.
- Complex Validation.

Ví dụ:

```typescript
export class CreateWorkspaceCommand {
  constructor(
    public readonly name: string,
    public readonly ownerId: string,
  ) {}
}
```

---

# 7. Command Immutability Rule

Command phải immutable.

Sai:

```typescript
command.name = 'new name';
```

Đúng:

```typescript
readonly name:string;
```

---

# 8. Command Handler Rule

Mỗi Command phải có một Handler.

Ví dụ:

```
CreateWorkspaceCommand

↓

CreateWorkspaceHandler
```

Handler chịu trách nhiệm:

1. Nhận Command.
2. Load Aggregate.
3. Gọi Domain Behavior.
4. Persist.
5. Publish Event.

---

# 9. Handler Rule

Handler không được chứa Business Logic.

Sai:

```typescript
if (workspace.status === 'ARCHIVED') {
}
```

Đúng:

```typescript
workspace.archive();
```

---

# 10. Query Rule

Query chỉ đọc dữ liệu.

Không thay đổi state.

Ví dụ:

```
GetWorkspaceQuery

SearchProjectQuery

ListMembersQuery
```

Query không được:

- Trigger Event.
- Update Database.
- Execute Business Action.

---

# 11. CQRS Rule

AEOS sử dụng CQRS có chọn lọc.

Sử dụng CQRS khi:

- Read Model phức tạp.
- Search Engine.
- Dashboard.
- Reporting.
- Analytics.

Không cần CQRS cho:

- CRUD đơn giản.
- Configuration nhỏ.

---

# 12. Application Service Rule

Application Service chỉ orchestration.

Sai:

```typescript
class WorkspaceService {
  create() {
    validateName();

    checkPermission();

    calculateLimit();
  }
}
```

Đúng:

```typescript
class CreateWorkspaceHandler {
  execute() {
    workspace.create();
  }
}
```

---

# 13. Repository Usage Rule

Application chỉ sử dụng Repository Interface.

Đúng:

```typescript
constructor(
 private repository: WorkspaceRepository
){}
```

Sai:

```typescript
constructor(
 private prisma: PrismaService
){}
```

---

# 14. Transaction Boundary Rule

Transaction bắt đầu ở Application Layer.

Một transaction nên bao phủ:

```
One Use Case
```

Ví dụ:

```
Create Workspace Transaction

BEGIN

Create Workspace

Save Workspace

Save Outbox Event

COMMIT
```

---

# 15. Transaction Size Rule

Không tạo transaction quá lớn.

Sai:

```
Create Account

Create Organization

Create Workspace

Send Email

Generate Report
```

Đúng:

```
Create Account

↓

AccountCreated Event

↓

Create Organization
```

---

# 16. Domain Event Handling Rule

Application Layer chịu trách nhiệm:

- Collect Domain Event.
- Publish Event.
- Trigger Side Effect.

Domain:

```
WorkspaceCreatedEvent
```

Application:

```
Event Publisher

↓

Message Broker
```

---

# 17. Mapper Rule

Application không trả Entity ra ngoài.

Sai:

```typescript
return workspace;
```

Đúng:

```
Entity

↓

Mapper

↓

Response DTO
```

---

# 18. DTO Conversion Rule

Flow chuẩn:

```
HTTP Request DTO

↓

Command

↓

Domain Entity

↓

Response DTO
```

Không:

```
HTTP DTO

↓

Database Entity
```

---

# 19. Authorization Rule

Authorization chia thành hai lớp.

## Application Layer

Kiểm tra:

```
User có quyền thực hiện Use Case không?
```

## Domain Layer

Kiểm tra:

```
Business Rule có cho phép hành động này không?
```

Ví dụ:

Application:

```
User has Workspace Permission
```

Domain:

```
Archived Workspace cannot add Member
```

---

# 20. Validation Rule

Validation chia làm hai loại.

## Technical Validation

Application:

```
Required Field

Format

Length
```

---

## Business Validation

Domain:

```
Cannot archive completed project

Cannot invite duplicate member
```

---

# 21. External Service Rule

Application không tự implement External Service.

Sai:

```typescript
sendEmail(){

 smtp.connect()

}
```

Đúng:

```
EmailService Interface

↓

Email Adapter
```

---

# 22. Background Job Rule

Task lâu không chạy trong Request Flow.

Sai:

```
Upload File

Generate Thumbnail

Send Email
```

trong HTTP Request.

Đúng:

```
Create Job

↓

Worker

↓

Process

↓

Notify
```

---

# 23. Idempotency Rule

Các Use Case quan trọng phải hỗ trợ Idempotency.

Ví dụ:

- Payment.
- Invitation.
- External Integration.

Request:

```
idempotency-key: abc123
```

Hệ thống phải đảm bảo:

```
Một request không tạo ra nhiều kết quả.
```

---

# 24. Application Error Rule

Application Exception mô tả lỗi Use Case.

Ví dụ:

```
WorkspaceCreationFailed

PermissionDenied

ResourceUnavailable
```

Không dùng:

```
HttpException
```

trong Application.

---

# 25. Application Checklist

Mỗi Application Module phải đảm bảo:

- [ ] Có Use Case rõ ràng.
- [ ] Command/Query tách biệt.
- [ ] Handler không chứa Business Rule.
- [ ] Chỉ sử dụng Repository Interface.
- [ ] Không gọi Database trực tiếp.
- [ ] Transaction nằm ở Use Case.
- [ ] Mapping Entity → DTO rõ ràng.
- [ ] Có Test cho từng Use Case.

---

# Final Application Rule

Application Layer là người điều phối.

Không phải nơi chứa trí tuệ nghiệp vụ.

Business Intelligence thuộc Domain.

Application chỉ đảm bảo:

```
Đúng Use Case được gọi.
Đúng thứ tự được thực thi.
Đúng transaction được quản lý.
```

```

```
