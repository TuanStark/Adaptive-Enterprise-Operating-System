# AEOS Backend Engineering Handbook

## 02-domain-rules.md

> Domain Layer là trái tim của hệ thống.
>
> Đây là nơi chứa toàn bộ Business Knowledge của AEOS.
>
> Domain không phụ thuộc Framework, Database, Transport Layer hoặc External Service.

---

# 1. Domain Layer Philosophy

## Rule

Domain phải phản ánh đúng nghiệp vụ thực tế.

Domain Model không phải là bản sao Database.

Sai:

```
Database Table

↓

Entity

↓

Business Logic
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

# 2. Domain Independence Rule

Domain không được phụ thuộc vào:

- NestJS
- Prisma
- TypeORM
- Redis
- Kafka
- HTTP
- Message Broker
- External API
- Environment Variable

Ví dụ cấm:

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class Workspace {}
```

Domain Entity không phải Nest Provider.

Đúng:

```typescript
export class Workspace {}
```

---

# 3. Rich Domain Model Rule

AEOS sử dụng:

```
Rich Domain Model
```

Không sử dụng:

```
Anemic Domain Model
```

## Sai

Entity chỉ chứa dữ liệu:

```typescript
class Workspace {
  id: string;

  name: string;

  status: string;
}
```

Business Logic nằm bên ngoài.

---

## Đúng

Entity chứa:

- State
- Behavior
- Business Rule

Ví dụ:

```typescript
class Workspace {
  private status: WorkspaceStatus;

  archive() {
    if (this.status === WorkspaceStatus.ARCHIVED) {
      throw new WorkspaceAlreadyArchived();
    }

    this.status = WorkspaceStatus.ARCHIVED;
  }
}
```

---

# 4. Entity Rule

Entity là object có Identity.

Một Entity bao gồm:

- Unique Identifier
- State
- Behavior
- Business Rule

Ví dụ:

```
Workspace
```

Identity:

```
workspaceId
```

State:

```
name
status
owner
```

Behavior:

```
archive()

rename()

addMember()
```

---

# 5. Entity Identity Rule

Entity được xác định bởi Identity.

Không dựa vào toàn bộ properties.

Ví dụ:

Hai Workspace:

```
id = ws_001

name = Engineering
```

và:

```
id = ws_001

name = Engineering Team
```

vẫn là cùng một Entity.

Vì Identity giống nhau.

---

# 6. Entity Mutation Rule

Không cho phép thay đổi state trực tiếp.

Sai:

```typescript
workspace.status = 'ARCHIVED';
```

Đúng:

```typescript
workspace.archive();
```

Lý do:

Entity phải bảo vệ Business Rule.

---

# 7. Entity Constructor Rule

Không tạo Entity với trạng thái không hợp lệ.

Sai:

```typescript
new Workspace('', null, undefined);
```

Đúng:

```typescript
Workspace.create({
  name: 'Engineering',
});
```

---

# 8. Aggregate Rule

Aggregate là boundary của Business Consistency.

Một Aggregate gồm:

- Aggregate Root
- Internal Entity
- Value Object

Ví dụ:

```
Workspace Aggregate


Workspace (Root)

|

├── WorkspaceMember

├── WorkspaceSetting

└── WorkspacePolicy
```

---

# 9. Aggregate Root Rule

Chỉ Aggregate Root được phép thay đổi trạng thái bên trong Aggregate.

Sai:

```typescript
workspaceMember.remove();
```

Đúng:

```typescript
workspace.removeMember(memberId);
```

---

# 10. Aggregate Boundary Rule

Không truy cập trực tiếp Entity bên trong Aggregate.

Sai:

```typescript
workspace.members[0].role = 'ADMIN';
```

Đúng:

```typescript
workspace.changeMemberRole(memberId, role);
```

---

# 11. Aggregate Size Rule

Aggregate không được quá lớn.

Sai:

```
Company Aggregate

|
├── Employee
├── Payroll
├── Attendance
├── Leave
├── Project
├── Invoice
└── Report
```

Đúng:

```
Organization Aggregate

Employee Aggregate

Payroll Aggregate
```

---

# 12. Invariant Rule

Invariant là điều kiện luôn phải đúng.

Ví dụ:

```
Archived Workspace
cannot add new member
```

Code:

```typescript
addMember(member){

 if(this.status.isArchived()){
    throw new ArchivedWorkspaceError();
 }

}
```

---

# 13. Value Object Rule

Value Object:

- Không có Identity
- Immutable
- So sánh bằng Value

Ví dụ:

```
Email

Money

Address

PhoneNumber

WorkspaceName
```

---

# 14. Value Object Immutability Rule

Không thay đổi Value Object.

Sai:

```typescript
email.value = 'new@gmail.com';
```

Đúng:

```typescript
email = Email.create('new@gmail.com');
```

---

# 15. Domain Primitive Rule

Không sử dụng primitive type cho Business Concept quan trọng.

Sai:

```typescript
function createUser(email: string);
```

Đúng:

```typescript
function createUser(email: Email);
```

---

# 16. Domain Service Rule

Domain Service sử dụng khi:

Business Logic:

- Không thuộc Entity
- Không thuộc Value Object

Ví dụ:

```
PermissionCalculationService

PricingService

PolicyEvaluationService
```

Không tạo Service chỉ để gọi Repository.

---

# 17. Factory Rule

Factory chịu trách nhiệm tạo Object phức tạp.

Dùng khi:

- Constructor phức tạp
- Nhiều bước khởi tạo
- Cần validate

Ví dụ:

```typescript
WorkspaceFactory.create();
```

---

# 18. Specification Rule

Specification dùng để đóng gói Business Condition.

Ví dụ:

```
CanInviteMemberSpecification
```

Thay vì:

```typescript
if(
 user.role==="ADMIN"
 &&
 workspace.status==="ACTIVE"
)
```

Sử dụng:

```typescript
specification.isSatisfiedBy();
```

---

# 19. Domain Event Rule

Domain Event biểu diễn một việc đã xảy ra.

Tên Event phải ở quá khứ.

Đúng:

```
WorkspaceCreated

MemberInvited

TaskCompleted
```

Sai:

```
CreateWorkspaceEvent

InviteMemberEvent
```

---

# 20. Domain Event Content Rule

Event chỉ chứa dữ liệu cần thiết.

Đúng:

```typescript
WorkspaceCreatedEvent {

 workspaceId;

 ownerId;

 occurredAt;

}
```

Sai:

```typescript
WorkspaceCreatedEvent {

 entireWorkspaceObject;

 databaseConnection;

}
```

---

# 21. Domain Event Publishing Rule

Domain Entity chỉ tạo Event.

Không publish trực tiếp.

Sai:

```typescript
workspace.create(){

 kafka.publish()

}
```

Đúng:

```typescript
workspace.create(){

 addDomainEvent(
   new WorkspaceCreatedEvent()
 );

}
```

Application Layer chịu trách nhiệm publish.

---

# 22. Repository Interface Rule

Repository Interface thuộc Domain.

Ví dụ:

```typescript
interface WorkspaceRepository {
  findById(id: WorkspaceId): Promise<Workspace | null>;

  save(workspace: Workspace): Promise<void>;
}
```

Không:

```
PrismaWorkspaceRepository
```

trong Domain.

---

# 23. Domain Exception Rule

Domain Exception mô tả Business Failure.

Ví dụ:

```
WorkspaceArchivedError

InvalidWorkspaceNameError

MemberAlreadyExistsError
```

Không:

```
DatabaseError

HttpException
```

---

# 24. Domain Naming Rule

Entity:

```
Workspace
User
Project
```

Value Object:

```
Email
Money
Address
```

Domain Service:

```
PermissionPolicyService
```

Event:

```
WorkspaceCreatedEvent
```

Exception:

```
WorkspaceNotFoundError
```

---

# 25. Domain Checklist

Mỗi Domain Module phải đảm bảo:

- [ ] Không import Framework
- [ ] Không chứa Database Code
- [ ] Có Aggregate Boundary
- [ ] Có Entity Behavior
- [ ] Có Value Object cho Business Primitive
- [ ] Có Domain Exception
- [ ] Có Domain Event
- [ ] Có Repository Interface
- [ ] Có Unit Test cho Business Rule

---

# Final Domain Rule

Domain phải có khả năng tồn tại độc lập nếu:

- Thay NestJS bằng Framework khác.
- Thay PostgreSQL bằng Database khác.
- Thay Message Broker khác.

Nếu không làm được điều đó, Domain đang bị coupling sai.

```

```
