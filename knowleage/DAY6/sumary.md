# Senior Fullstack Engineer Residency

## Phase 1 – Foundation Engineering

# Day 6 – Engineering Design: Repository Strategy, Coding Standards & Team Collaboration

> **"Một dự án không trở nên hỗn loạn vì lập trình viên kém. Nó trở nên hỗn loạn vì không có tiêu chuẩn."**

Sau Day 5, chúng ta đã biết **xây cái gì**.

Hôm nay, chúng ta sẽ quyết định **xây nó như thế nào**.

Đây là ngày đầu tiên chúng ta suy nghĩ như một **Tech Lead**.

Một Tech Lead không chỉ quan tâm đến việc code chạy được.

Họ quan tâm đến việc:

* Team có làm việc cùng nhau hiệu quả không?
* Sáu tháng sau người mới vào dự án có hiểu code không?
* Mười lập trình viên có thể phát triển song song mà không xung đột không?
* Dự án có thể mở rộng trong nhiều năm không?

---

# 1. Engineering First

Có một sự thật mà rất nhiều lập trình viên bỏ qua.

Code chỉ chiếm khoảng **20%** vòng đời của phần mềm.

80% thời gian còn lại dành cho:

* Đọc code.
* Review code.
* Sửa bug.
* Refactor.
* Thêm tính năng.
* Onboarding thành viên mới.

Điều đó có nghĩa.

> **Code dễ đọc luôn quan trọng hơn code thông minh.**

---

# 2. Repository Strategy

Đây là quyết định đầu tiên.

Chúng ta sẽ dùng:

## Monorepo

Không phải.

```text
frontend/
backend/
mobile/
shared/
```

là bốn repository khác nhau.

Mà sẽ là một Repository duy nhất.

```text
aeos/

├── apps/
│   ├── web
│   ├── api
│   ├── worker
│   └── admin
│
├── packages/
│   ├── ui
│   ├── config
│   ├── types
│   ├── eslint-config
│   ├── tsconfig
│   ├── shared
│   └── sdk
│
├── infrastructure/
│   ├── docker
│   ├── kubernetes
│   ├── helm
│   └── terraform
│
├── docs/
│
└── scripts/
```

---

## Tại sao Monorepo?

Ưu điểm.

* Shared Code.
* Shared Types.
* Đồng bộ Version.
* Refactor dễ.
* CI/CD đơn giản hơn.
* Atomic Commit.

Nhược điểm.

* Repository lớn.
* CI cần tối ưu.

Đối với AEOS.

Monorepo là lựa chọn phù hợp.

---

# 3. Module Structure

Một Module không phải chỉ là Controller và Service.

Ví dụ.

```text
project/

├── application/
│
├── domain/
│
├── infrastructure/
│
├── presentation/
│
└── tests/
```

---

## Domain

Chứa.

* Entity.
* Aggregate.
* Value Object.
* Domain Service.
* Domain Event.
* Repository Interface.

Domain **không được phép** phụ thuộc NestJS.

---

## Application

Chứa.

* Use Case.
* Command.
* Query.
* DTO.
* Application Service.

Application điều phối Domain.

---

## Infrastructure

Chứa.

* Prisma.
* PostgreSQL.
* Redis.
* Kafka.
* OpenSearch.
* External API.

Infrastructure chỉ là chi tiết triển khai.

---

## Presentation

Chứa.

* REST Controller.
* GraphQL Resolver.
* Validation.
* Authentication Guard.

Presentation không chứa Business Logic.

---

# 4. Dependency Rule

Đây là luật quan trọng nhất.

```text
Presentation

↓

Application

↓

Domain

↑

Infrastructure
```

Infrastructure phụ thuộc Domain.

Domain không được phụ thuộc Infrastructure.

Ví dụ.

Sai.

```typescript
UserEntity

↓

PrismaClient
```

Đúng.

```typescript
UserRepository

↓

Interface
```

Prisma chỉ implement Interface đó.

---

# 5. Naming Convention

Đây là điều giúp dự án dễ đọc.

Ví dụ.

Class.

```text
CreateProjectCommand
```

Không phải.

```text
ProjectCreate
```

---

Repository.

```text
ProjectRepository
```

Không phải.

```text
ProjectRepo
```

---

Event.

```text
TaskAssignedEvent
```

Không phải.

```text
TaskAssign
```

---

Command.

```text
CreateTaskCommand
```

---

Query.

```text
GetTaskQuery
```

---

Handler.

```text
CreateTaskHandler
```

---

Controller.

```text
TaskController
```

---

Tên phải thể hiện rõ mục đích.

---

# 6. Folder Naming

Luôn dùng.

```text
kebab-case
```

Ví dụ.

```text
task-management
```

Không dùng.

```text
TaskManagement
```

Không dùng.

```text
taskManagement
```

---

# 7. Git Workflow

Đây là phần mà rất nhiều Junior chưa từng được học.

Chúng ta sử dụng.

```text
main

↓

develop

↓

feature/*
```

---

Ví dụ.

```text
feature/authentication

feature/task-module

feature/search

bugfix/login

hotfix/security
```

---

Không commit trực tiếp lên main.

---

# 8. Commit Convention

Chúng ta sử dụng Conventional Commits.

Ví dụ.

```text
feat(auth): implement workspace invitation
```

```text
fix(task): resolve duplicate assignment bug
```

```text
refactor(project): simplify aggregate validation
```

```text
test(document): add upload integration tests
```

```text
docs(api): update authentication guide
```

Điều này giúp:

* Sinh CHANGELOG tự động.
* Semantic Versioning.
* CI/CD Automation.

---

# 9. Branch Protection

Không ai được merge trực tiếp.

Muốn Merge.

Phải.

* Pull Request.
* Code Review.
* CI Passing.
* Approval.
* Conflict Resolved.

---

# 10. Code Review Checklist

Một Pull Request phải được kiểm tra.

## Business

* Đúng yêu cầu?

---

## Architecture

* Có vi phạm Boundary không?

---

## Performance

* Có N+1 Query?

---

## Security

* Validate Input?

---

## Readability

* Tên rõ ràng?

---

## Test

* Có Test?

---

## Logging

* Có Log khi cần?

---

## Monitoring

* Có Metric nếu cần?

---

# 11. API Versioning

Không bao giờ.

```text
/api/users
```

Luôn.

```text
/api/v1/users
```

Sau này.

```text
/api/v2/users
```

Không làm hỏng Client cũ.

---

# 12. Error Handling Standard

Không trả về.

```json
{
  "error": "Wrong"
}
```

Chúng ta sẽ chuẩn hóa.

```json
{
  "timestamp": "...",
  "path": "/api/v1/projects",
  "code": "PROJECT_NOT_FOUND",
  "message": "Project does not exist.",
  "traceId": "..."
}
```

Đây là nền tảng cho Logging và Tracing sau này.

---

# 13. Coding Standards

Toàn bộ dự án thống nhất.

* ESLint.
* Prettier.
* Husky.
* lint-staged.
* Commitlint.

Không ai được format theo ý mình.

Máy sẽ làm việc đó.

---

# 14. Documentation First

Mỗi Module đều phải có.

```text
README.md
```

Mô tả.

* Module làm gì.
* Public API.
* Event.
* Dependency.
* Business Rule.

---

# 15. Engineering Metrics

Một Tech Lead không chỉ nhìn số dòng code.

Họ nhìn.

* Pull Request Size.
* Review Time.
* Bug Rate.
* Test Coverage.
* Deployment Frequency.
* Lead Time.
* Change Failure Rate.
* Mean Time To Recovery (MTTR).

Đây là các chỉ số của **DORA Metrics**.

---

# 16. Anti-Patterns

Không đặt Business Logic trong Controller.

Không để Service dài hàng nghìn dòng.

Không dùng Shared Utils cho mọi thứ.

Không copy code giữa các Module.

Không phụ thuộc vòng tròn (Circular Dependency).

Không tạo God Module.

Không để Repository trả về DTO.

Không để Domain biết Database.

---

# 17. Deliverables của Day 6

Sau Day 6 chúng ta phải có:

## Repository Structure

Cấu trúc Monorepo hoàn chỉnh.

---

## Module Template

Template chuẩn cho mọi Module.

---

## Git Workflow

Chiến lược Branch.

---

## Commit Convention

Quy ước Commit.

---

## Code Review Checklist

Checklist Review.

---

## Coding Standards

Quy chuẩn Coding.

---

## API Standards

Quy chuẩn API.

---

## Error Handling Standards

Chuẩn hóa Error Response.

---

## Engineering Handbook

Tài liệu dành cho mọi thành viên mới tham gia dự án.

---

# Engineering Mindset

Một Junior nghĩ:

> "Làm sao để code chạy?"

Một Mid nghĩ:

> "Làm sao để code sạch?"

Một Senior nghĩ:

> "Làm sao để cả đội có thể phát triển hệ thống này trong 5 năm mà vẫn dễ bảo trì?"

Đó chính là mục tiêu của Engineering Design.

---

# Chuẩn đầu ra của Day 6

Sau khi hoàn thành Day 6, bạn sẽ có khả năng:

* Thiết kế Monorepo cho một hệ thống Enterprise.
* Tổ chức Module theo Clean Architecture.
* Thiết lập Git Workflow chuyên nghiệp.
* Áp dụng Conventional Commits và Branch Protection.
* Xây dựng Coding Standards và Code Review Checklist.
* Chuẩn hóa API, Error Response và Logging.
* Thiết kế Engineering Handbook cho toàn bộ đội phát triển.

> **Ngày 7 sẽ là cột mốc quan trọng đầu tiên của chương trình. Chúng ta sẽ bắt đầu tạo repository thực tế, khởi tạo Monorepo, thiết lập toàn bộ môi trường phát triển, CI nền tảng, các quy tắc chất lượng mã nguồn và cấu trúc dự án của AEOS. Đây sẽ là ngày chúng ta viết những dòng code đầu tiên, nhưng trên một nền móng đã được thiết kế kỹ lưỡng trong sáu ngày trước.**
