# Phase 2.11 – Quality Assurance & Software Engineering Governance

# Tổng quan

Sau khi hoàn thành:

- Business Analysis
- Domain Design
- Detailed Design
- User Story & Use Case Specification
- API Contract Design
- Database Deep Design
- System Architecture Design
- Backend Implementation Blueprint
- Frontend Architecture & UX Engineering Design
- Security Architecture Design
- DevOps & Cloud Architecture Design

AEOS gần như đã hoàn thiện toàn bộ thiết kế kỹ thuật.

Tuy nhiên, vẫn còn một câu hỏi rất quan trọng.

> Làm thế nào để một đội ngũ 10, 20 hay 100 Developer cùng phát triển hệ thống mà chất lượng code vẫn được duy trì?

Đó chính là nhiệm vụ của **Software Engineering Governance**.

Nếu các Phase trước tập trung vào việc **xây dựng hệ thống**, thì Phase này tập trung vào **xây dựng quy trình để hệ thống có thể phát triển bền vững trong nhiều năm**.

---

# 1. Mục tiêu của Phase 2.11

Sau Phase này chúng ta sẽ hoàn thiện:

- Coding Standards.
- Git Workflow.
- Branching Strategy.
- Pull Request Process.
- Code Review Guidelines.
- Testing Strategy.
- Documentation Standards.
- ADR (Architecture Decision Record).
- Engineering Workflow.
- Release Governance.
- Technical Debt Management.
- Development Checklist.
- Team Collaboration Guidelines.

---

# 2. Software Engineering Principles

AEOS tuân theo các nguyên tắc:

- Clean Code.
- SOLID.
- DRY.
- KISS.
- YAGNI.
- Domain Driven Design.
- Clean Architecture.
- Twelve-Factor App.
- Cloud Native Principles.

Mọi quyết định kỹ thuật đều phải phù hợp với các nguyên tắc này.

---

# 3. Coding Standards

Toàn bộ dự án sử dụng chung quy ước.

## Naming Convention

Class:

```text
WorkspaceService
```

Interface:

```text
WorkspaceRepository
```

Enum:

```text
WorkspaceStatus
```

Constant:

```text
MAX_UPLOAD_SIZE
```

Variable:

```text
workspaceId
```

Boolean:

```text
isArchived

hasPermission

canDelete
```

---

## Folder Convention

Không đặt:

```text
utils2

new-folder

abc
```

Tên thư mục phải phản ánh đúng nghiệp vụ.

Ví dụ:

```text
workspace

identity

organization

notification
```

---

# 4. Git Workflow

AEOS sử dụng Git Flow đơn giản hóa.

```text
main

↓

develop

↓

feature/*

↓

Pull Request

↓

develop

↓

release

↓

main
```

Branch `main` luôn ở trạng thái có thể phát hành.

---

# 5. Branch Naming Convention

Ví dụ:

```text
feature/create-workspace

feature/task-comment

feature/user-profile

bugfix/login-refresh-token

hotfix/session-expired

refactor/workspace-module

docs/api-documentation
```

Không sử dụng:

```text
new

abc

fix1

test
```

---

# 6. Commit Convention

Tuân theo Conventional Commits.

Ví dụ:

```text
feat(identity): implement refresh token rotation

fix(project): resolve optimistic locking issue

refactor(task): simplify task aggregate

docs(api): update authentication endpoints

test(workspace): add unit tests

chore(ci): upgrade GitHub Actions
```

Lịch sử Git phải phản ánh rõ nội dung thay đổi.

---

# 7. Pull Request Process

Mỗi Pull Request phải:

- Có mô tả.
- Liên kết User Story hoặc Issue.
- Giải thích lý do thay đổi.
- Có ảnh chụp màn hình (nếu thay đổi UI).
- Đã vượt qua CI.

Template:

```text
Summary

Business Context

Technical Changes

Testing

Checklist
```

---

# 8. Code Review Guidelines

Code Review không chỉ kiểm tra lỗi.

Reviewer cần đánh giá:

- Business Logic.
- Domain Rule.
- Naming.
- Readability.
- Performance.
- Security.
- Test Coverage.
- Architecture.
- Khả năng bảo trì.

Không Review chỉ dựa trên việc "code chạy được".

---

# 9. Definition of Done (DoD)

Một User Story chỉ được xem là hoàn thành khi:

- Đã code xong.
- Đã Unit Test.
- Đã Integration Test.
- Đã Review.
- Đã Merge.
- Đã Deploy Staging.
- Đã QA.
- Documentation đã cập nhật.
- Không còn lỗi nghiêm trọng.

---

# 10. Testing Pyramid

AEOS áp dụng Testing Pyramid.

```text
            E2E

       Integration

Unit Test
```

Tỷ lệ tham khảo:

- Unit Test: ~70%
- Integration Test: ~20%
- End-to-End Test: ~10%

---

# 11. Test Coverage Policy

Coverage tối thiểu:

- Domain Layer: ≥ 90%
- Application Layer: ≥ 80%
- Infrastructure Layer: Theo mức độ cần thiết.
- Frontend Components: Theo mức độ quan trọng.

Coverage cao không thay thế cho chất lượng Test.

---

# 12. Documentation Standards

Mọi thành phần quan trọng đều phải có tài liệu.

Bao gồm:

- API.
- Database.
- Architecture.
- Deployment.
- ADR.
- Runbook.
- Troubleshooting.

Không để kiến thức chỉ tồn tại trong đầu một Developer.

---

# 13. ADR (Architecture Decision Record)

Mỗi quyết định kiến trúc quan trọng cần được ghi lại.

Ví dụ:

```text
ADR-001

Why PostgreSQL?

Decision

Consequences
```

```text
ADR-002

Why CQRS?

Decision

Trade-offs
```

Điều này giúp đội ngũ hiểu được lý do của các quyết định trong tương lai.

---

# 14. Technical Debt Management

Technical Debt phải được quản lý.

Phân loại:

- Refactoring.
- Legacy Code.
- Temporary Solution.
- Performance Improvement.
- Security Improvement.

Mỗi khoản nợ kỹ thuật cần có kế hoạch xử lý.

---

# 15. Static Code Analysis

CI phải tự động chạy:

- ESLint.
- TypeScript Check.
- Formatting Check.
- Dependency Scan.
- Secret Scan.

Không Merge nếu các bước này thất bại.

---

# 16. Dependency Management

Theo dõi:

- Package Version.
- Security Advisory.
- Deprecated Package.
- License Compliance.

Cập nhật Dependency định kỳ.

---

# 17. Engineering Metrics

Theo dõi các chỉ số:

- Build Success Rate.
- Deployment Frequency.
- Lead Time.
- Change Failure Rate.
- Mean Time To Recovery (MTTR).
- Test Coverage.
- Code Review Time.

Những chỉ số này giúp đánh giá quy trình phát triển thay vì chỉ đánh giá cá nhân.

---

# 18. Incident Management

Khi xảy ra sự cố:

```text
Incident

↓

Investigation

↓

Root Cause Analysis

↓

Fix

↓

Postmortem

↓

Preventive Action
```

Không chỉ sửa lỗi mà còn phải ngăn lỗi tái diễn.

---

# 19. Release Governance

Một phiên bản chỉ được phát hành khi:

- Đã hoàn thành CI/CD.
- Đã QA.
- Đã Security Review.
- Đã Performance Test.
- Đã Backup.
- Đã có Rollback Plan.

Mỗi Release phải có Release Note.

---

# 20. Knowledge Sharing

Đội ngũ cần duy trì:

- Technical Documentation.
- Brown Bag Session.
- Internal Workshop.
- Pair Programming.
- Code Walkthrough.
- Architecture Review.

Mục tiêu là giảm phụ thuộc vào cá nhân.

---

# 21. Team Collaboration Guidelines

Quy tắc làm việc:

- Tôn trọng Code Review.
- Trao đổi dựa trên dữ liệu và tài liệu.
- Không bỏ qua CI.
- Không Merge khi chưa Review.
- Không Push trực tiếp lên `main`.
- Mọi thay đổi lớn phải có ADR.

---

# 22. Development Checklist

Trước khi Merge:

- Code đạt Coding Standards.
- Unit Test đạt yêu cầu.
- Integration Test thành công.
- Không còn Security Warning.
- Documentation đã cập nhật.
- Pull Request được phê duyệt.
- CI/CD thành công.

---

# 23. Output của Phase 2.11

Sau khi hoàn thành chúng ta sẽ có:

## Engineering Governance

- Coding Standards.
- Git Workflow.
- Branching Strategy.
- Pull Request Process.
- Code Review Guidelines.

## Quality Assurance

- Testing Strategy.
- Coverage Policy.
- Static Analysis.

## Documentation

- ADR.
- Technical Documentation.
- Runbook.

## Team Collaboration

- Development Workflow.
- Release Governance.
- Knowledge Sharing.
- Technical Debt Management.

AEOS không chỉ có một kiến trúc tốt mà còn có một quy trình phát triển phần mềm chuyên nghiệp, phù hợp với môi trường Enterprise.

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
Backend Implementation Blueprint
        ↓
Frontend Architecture
        ↓
Security Architecture
        ↓
DevOps & Cloud Architecture
        ↓
Quality Assurance & Software Engineering Governance ✅
```

---

# Hoàn thành Phase 2 – Detailed Design

Đến đây, AEOS đã có đầy đủ tài liệu thiết kế ở cấp độ Enterprise, bao gồm:

- Tài liệu nghiệp vụ.
- Domain Model.
- User Story.
- Use Case.
- API Contract.
- Database Design.
- System Architecture.
- Backend Blueprint.
- Frontend Blueprint.
- Security Architecture.
- DevOps & Cloud Architecture.
- Engineering Governance.

Toàn bộ đội ngũ phát triển giờ đây có thể bắt đầu xây dựng hệ thống mà không cần đưa ra các quyết định kiến trúc lớn trong quá trình lập trình.

---

# Bước tiếp theo

## Phase 3 – Implementation

Từ Phase này trở đi, chúng ta sẽ không còn thiết kế trên giấy.

Chúng ta sẽ xây dựng AEOS như một sản phẩm thực tế theo đúng Blueprint đã hoàn thành, bắt đầu từ:

1. Monorepo Initialization.
2. Repository Setup.
3. Development Environment.
4. Shared Kernel.
5. Backend Foundation.
6. Frontend Foundation.
7. Database Migration.
8. Identity Module.
9. Organization Module.
10. Workspace Module.
11. RBAC Module.
12. Các module nghiệp vụ còn lại.
13. CI/CD Pipeline.
14. Kubernetes Deployment.
15. Production Release.