# Phase 2.9 – Security Architecture Design

# Tổng quan

Đến thời điểm này AEOS đã hoàn thành:

- Business Analysis
- Domain Design
- Detailed Design
- User Story & Use Case Specification
- API Contract Design
- Database Deep Design
- System Architecture Design
- Backend Implementation Blueprint
- Frontend Architecture & UX Engineering Design

Chúng ta đã có một hệ thống có thể bắt đầu phát triển.

Tuy nhiên, trước khi viết code, còn một lớp cực kỳ quan trọng cần được thiết kế:

**Security Architecture.**

Một hệ thống Enterprise không thể chỉ hoạt động đúng.

Nó còn phải:

- An toàn.
- Chống tấn công.
- Bảo vệ dữ liệu.
- Kiểm soát truy cập.
- Tuân thủ các tiêu chuẩn bảo mật.
- Có khả năng Audit.

Security không phải là một module.

Security là một lớp xuyên suốt toàn bộ hệ thống.

---

# 1. Mục tiêu của Phase 2.9

Sau Phase này chúng ta sẽ hoàn thành:

- Authentication Architecture.
- Authorization Architecture.
- RBAC Design.
- Permission Model.
- JWT Strategy.
- Session Management.
- OAuth2 Architecture.
- Password Policy.
- API Security.
- Secret Management.
- Data Encryption.
- Security Logging.
- Audit Trail.
- Security Monitoring.
- OWASP Top 10 Protection.

---

# 2. Security Layer Architecture

AEOS thiết kế Security theo nhiều lớp.

```text
Client

↓

HTTPS

↓

Load Balancer

↓

API Gateway

↓

Authentication

↓

Authorization

↓

Business Layer

↓

Database
```

Mỗi lớp đều có nhiệm vụ bảo vệ riêng.

Nếu một lớp bị vượt qua thì lớp tiếp theo vẫn tiếp tục kiểm tra.

Đây gọi là:

**Defense in Depth.**

---

# 3. Authentication Architecture

Authentication trả lời câu hỏi:

> Người dùng là ai?

AEOS hỗ trợ:

- Email & Password.
- OAuth2.
- Google Login.
- GitHub Login.
- Microsoft Login.
- Magic Link (có thể mở rộng).
- Multi-Factor Authentication (MFA).

Flow:

```text
Login

↓

Validate Credential

↓

Generate Access Token

↓

Generate Refresh Token

↓

Store Session

↓

Return Token
```

---

# 4. JWT Strategy

AEOS sử dụng hai loại Token.

## Access Token

- Thời gian sống ngắn.
- Ví dụ: 15 phút.
- Dùng để gọi API.

## Refresh Token

- Thời gian sống dài.
- Ví dụ: 7 ngày.
- Dùng để lấy Access Token mới.

Không lưu Refresh Token trong Local Storage.

Refresh Token được lưu trong HttpOnly Cookie.

---

# 5. Refresh Token Rotation

Mỗi lần Refresh Token được sử dụng:

```text
Old Refresh Token

↓

Validate

↓

Generate New Refresh Token

↓

Revoke Old Refresh Token

↓

Return New Refresh Token
```

Điều này giúp giảm nguy cơ Token bị đánh cắp.

---

# 6. Session Management

Mỗi lần đăng nhập sẽ tạo một Session.

Ví dụ:

```text
Session

- Session ID
- User ID
- Device
- Browser
- IP
- Created At
- Last Activity
- Expired At
```

Người dùng có thể xem:

- Danh sách thiết bị.
- Đăng xuất từng thiết bị.
- Đăng xuất tất cả thiết bị.

---

# 7. Password Policy

Password phải đáp ứng:

- Tối thiểu 8 ký tự.
- Có chữ hoa.
- Có chữ thường.
- Có số.
- Có ký tự đặc biệt.

Không lưu Password dạng Plain Text.

Sử dụng:

```text
Argon2id
```

để Hash Password.

Không sử dụng:

- MD5.
- SHA1.

---

# 8. Authorization Architecture

Authentication chỉ xác định người dùng.

Authorization quyết định:

> Người dùng được phép làm gì?

AEOS sử dụng:

```text
RBAC + Permission Based Access Control
```

Flow:

```text
Request

↓

JWT

↓

User

↓

Workspace Member

↓

Role

↓

Permission

↓

Business Logic
```

---

# 9. Permission Model

Permission được thiết kế theo:

```text
RESOURCE.ACTION
```

Ví dụ:

```text
PROJECT.CREATE

PROJECT.UPDATE

PROJECT.DELETE

TASK.CREATE

TASK.UPDATE

TASK.DELETE

DOCUMENT.READ

DOCUMENT.WRITE

MEMBER.INVITE

MEMBER.REMOVE
```

Không sử dụng Role Name trong Business Logic.

Luôn kiểm tra Permission.

---

# 10. Workspace Permission

AEOS là Multi-Tenant.

Permission luôn gắn với Workspace.

Ví dụ:

```text
Workspace A

Admin

Workspace B

Viewer
```

Một User có thể có nhiều Role khác nhau trên từng Workspace.

---

# 11. API Security

Tất cả API đều phải được bảo vệ.

Bao gồm:

- JWT Authentication.
- Permission Check.
- Input Validation.
- Rate Limiting.
- Request Size Limit.
- API Versioning.
- CORS.
- HTTPS Only.

---

# 12. Input Validation

Không tin tưởng dữ liệu từ Client.

Mọi Request đều phải Validate.

Ví dụ:

```text
Controller

↓

DTO Validation

↓

Application Layer

↓

Domain
```

Không truyền dữ liệu trực tiếp vào Domain.

---

# 13. Rate Limiting

Ngăn chặn Spam và Brute Force.

Ví dụ:

```text
Login

5 requests

/

1 minute
```

API thông thường:

```text
100 requests

/

1 minute
```

---

# 14. CSRF Protection

Đối với Cookie Authentication:

- CSRF Token.
- SameSite Cookie.
- Secure Cookie.

Nếu sử dụng Bearer Token thì nguy cơ CSRF thấp hơn nhưng vẫn cần cấu hình Cookie đúng cách.

---

# 15. XSS Protection

Không render HTML từ người dùng.

Escape toàn bộ dữ liệu.

Sử dụng:

- CSP (Content Security Policy).
- Output Encoding.
- HTML Sanitization.

---

# 16. SQL Injection Protection

Không viết SQL nối chuỗi.

Sai:

```sql
SELECT * FROM users WHERE email='${email}'
```

Đúng:

```text
Prepared Statement

↓

Parameterized Query

↓

ORM
```

---

# 17. Secret Management

Không lưu Secret trong Source Code.

Sai:

```text
JWT_SECRET="123456"
```

Đúng:

```text
Environment Variables

↓

Secret Manager

↓

Application
```

Production có thể sử dụng:

- AWS Secrets Manager.
- Kubernetes Secret.

---

# 18. Encryption Strategy

## Encryption In Transit

Toàn bộ Traffic:

```text
HTTPS (TLS 1.3)
```

## Encryption At Rest

Database.

Backup.

Object Storage.

Đều phải được mã hóa.

---

# 19. File Upload Security

Không tin tưởng File Upload.

Kiểm tra:

- MIME Type.
- File Extension.
- File Size.
- Virus Scan.

Không cho phép thực thi File Upload.

---

# 20. Audit Logging

Mọi thao tác quan trọng phải được ghi lại.

Ví dụ:

```text
User Login

Workspace Created

Role Changed

Permission Updated

Project Deleted

Task Archived
```

Audit Log không được chỉnh sửa.

---

# 21. Security Monitoring

Theo dõi:

- Login Failure.
- Permission Denied.
- Brute Force.
- Suspicious Activity.
- Token Abuse.
- API Abuse.

Kết hợp Alert khi vượt ngưỡng.

---

# 22. OWASP Top 10 Protection

AEOS được thiết kế để giảm thiểu các rủi ro theo OWASP Top 10.

Bao gồm:

- Broken Access Control.
- Cryptographic Failures.
- Injection.
- Insecure Design.
- Security Misconfiguration.
- Vulnerable Components.
- Authentication Failure.
- Software Integrity Failure.
- Logging Failure.
- SSRF.

---

# 23. Security Testing

Bao gồm:

## Static Analysis

- ESLint Security Rules.
- Dependency Scan.

## Dynamic Testing

- API Penetration Test.

## Dependency Scan

- npm audit.
- Container Scan.

## Manual Security Review

- Permission Review.
- Threat Modeling.

---

# 24. Security Checklist

Trước khi Release:

- HTTPS Enabled.
- JWT Rotation.
- Password Hashing.
- Rate Limit.
- Input Validation.
- Permission Check.
- Audit Logging.
- Secret Rotation.
- Database Encryption.
- Backup Encryption.
- Dependency Scan.
- Container Scan.

---

# 25. Output của Phase 2.9

Sau khi hoàn thành chúng ta sẽ có:

## Authentication

- JWT.
- Refresh Token.
- Session.
- OAuth2.
- MFA.

## Authorization

- RBAC.
- Permission Matrix.
- Workspace Permission.

## API Security

- Validation.
- Rate Limiting.
- CORS.
- CSRF.
- XSS Protection.
- SQL Injection Protection.

## Data Security

- Encryption.
- Secret Management.
- File Upload Security.

## Monitoring

- Audit Logging.
- Security Monitoring.
- Threat Detection.

AEOS đã có một kiến trúc bảo mật đủ tiêu chuẩn để triển khai trong môi trường Production.

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
Security Architecture Design ✅
```

---

# Bước tiếp theo

**Phase 2.10 – DevOps & Cloud Architecture Design**

Chúng ta sẽ thiết kế toàn bộ hạ tầng Production của AEOS:

- Cloud Architecture.
- Kubernetes Architecture.
- CI/CD Pipeline.
- Infrastructure as Code.
- Networking.
- Storage.
- High Availability.
- Disaster Recovery.
- Scaling Strategy.
- Multi Environment Deployment.
- GitOps.
- Production Release Strategy.

Đây là bước đưa AEOS từ một hệ thống có thể phát triển thành một hệ thống có thể vận hành ổn định trong môi trường Production.