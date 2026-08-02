# AEOS – Phase 2.4: API Contract Design

# 2. Nguyên tắc thiết kế API của AEOS

AEOS sử dụng:

```text
RESTful API

+

OpenAPI Specification

+

Versioning

+

Standard Error Format
```

---

# 3. API Architecture

Kiến trúc giao tiếp:

```
                    Client

                      |

                      |

              API Gateway

                      |

        -------------------------

        |          |            |

    Identity   Workspace    Project

        |          |            |

        -------------------------

                      |

                 Database
```

---

# 4. API Versioning Strategy

Không thiết kế:

```
/users
/projects
```

Vì sau này khó thay đổi.

AEOS sử dụng:

```
/api/v1/users

/api/v1/workspaces

/api/v1/projects
```

---

Khi có breaking change:

```
/api/v2/workspaces
```

Version cũ vẫn có thể tồn tại.

---

# 5. Authentication Design

AEOS sử dụng:

## JWT Authentication

Flow:

```
User

↓

Login API

↓

Validate Credential

↓

Generate Token

↓

Return Access Token

↓

Client Attach Token
```

---

Request:

```
Authorization: Bearer <access_token>
```

---

JWT Payload:

```json
{
 "sub":"user_001",
 "email":"user@example.com",
 "organizationId":"org_001",
 "roles":[
    "OWNER"
 ],
 "iat":123456,
 "exp":123999
}
```

---

# 6. Refresh Token Flow

Access Token:

* Thời gian ngắn.
* Dùng gọi API.

Refresh Token:

* Thời gian dài.
* Dùng cấp lại Access Token.

Flow:

```
Access Token Expired

↓

Send Refresh Token

↓

Validate

↓

Generate New Access Token
```

---

# 7. Authorization Design

Authentication trả lời:

> "Bạn là ai?"

Authorization trả lời:

> "Bạn được làm gì?"

AEOS sử dụng RBAC:

```
User

↓

Organization Member

↓

Workspace Member

↓

Role

↓

Permission

↓

Action
```

---

Ví dụ:

Request:

```
POST /api/v1/projects
```

Permission required:

```
PROJECT.CREATE
```

Flow:

```
Request

↓

JWT Validate

↓

Permission Guard

↓

Allow / Reject
```

---

# 8. API Naming Convention

## Resource Based

Đúng:

```
GET /api/v1/workspaces
```

Không:

```
GET /api/v1/getAllWorkspace
```

---

## CRUD Mapping

| Action | HTTP   |
| ------ | ------ |
| Create | POST   |
| Read   | GET    |
| Update | PATCH  |
| Delete | DELETE |

---

# 9. Standard Response Format

AEOS dùng format thống nhất.

## Success Response

```json
{
 "success":true,
 "data":{
    "id":"ws_001",
    "name":"Engineering"
 },
 "meta":null
}
```

---

## List Response

```json
{
 "success":true,
 "data":[
 ],
 "meta":{
    "page":1,
    "limit":20,
    "total":100
 }
}
```

---

# 10. Error Response Design

Không trả:

```json
{
 "message":"error"
}
```

Mà:

```json
{
 "success":false,
 "error":{
    "code":"WORKSPACE_NOT_FOUND",
    "message":"Workspace does not exist",
    "details":null
 },
 "traceId":"abc123"
}
```

---

# 11. Error Code Convention

Format:

```
DOMAIN_ACTION_REASON
```

Ví dụ:

Identity:

```
AUTH_INVALID_PASSWORD

AUTH_ACCOUNT_LOCKED
```

Workspace:

```
WORKSPACE_NOT_FOUND

WORKSPACE_ALREADY_EXISTS

WORKSPACE_PERMISSION_DENIED
```

Project:

```
PROJECT_NOT_FOUND

PROJECT_ARCHIVED
```

---

# 12. Pagination Design

Không trả toàn bộ dữ liệu.

Ví dụ:

```
GET /api/v1/projects?page=1&limit=20
```

Response:

```json
{
"data":[
],
"meta":{
 "page":1,
 "limit":20,
 "total":200,
 "totalPages":10
}
}
```

---

# 13. Filtering Design

Ví dụ:

Tìm Task theo trạng thái:

```
GET /api/v1/tasks?status=IN_PROGRESS
```

---

Tìm Project theo Owner:

```
GET /api/v1/projects?ownerId=user_001
```

---

# 14. Sorting Design

Ví dụ:

```
GET /api/v1/tasks?sort=-createdAt
```

Ý nghĩa:

```
- createdAt

↓

DESC
```

---

# 15. Validation Design

Validation xảy ra ở API Boundary.

Ví dụ:

Create Workspace Request:

```json
{
"name":""
}
```

Reject:

```json
{
"code":"VALIDATION_ERROR",
"fields":{
"name":"Name is required"
}
}
```

---

# 16. API Contract Example

## Workspace Module

---

# Create Workspace

## Endpoint

```
POST /api/v1/workspaces
```

---

## Permission

```
WORKSPACE.CREATE
```

---

## Request

```json
{
"name":"Engineering",
"description":"Backend Team"
}
```

---

## Validation

```
name:

required

minLength:3

maxLength:100
```

---

## Response

HTTP 201

```json
{
"success":true,
"data":{
"id":"ws_001",
"name":"Engineering",
"status":"ACTIVE"
}
}
```

---

# Get Workspace Detail

## Endpoint

```
GET /api/v1/workspaces/{workspaceId}
```

Permission:

```
WORKSPACE.READ
```

Response:

```json
{
"id":"ws_001",
"name":"Engineering",
"memberCount":25
}
```

---

# Update Workspace

## Endpoint

```
PATCH /api/v1/workspaces/{workspaceId}
```

Permission:

```
WORKSPACE.UPDATE
```

Request:

```json
{
"name":"New Name"
}
```

---

# Delete Workspace

## Endpoint

```
DELETE /api/v1/workspaces/{workspaceId}
```

Permission:

```
WORKSPACE.DELETE
```

---

# 17. API Design cho Authentication

## Register

```
POST /api/v1/auth/register
```

Request:

```json
{
"email":"user@gmail.com",
"password":"12345678"
}
```

---

## Login

```
POST /api/v1/auth/login
```

Request:

```json
{
"email":"user@gmail.com",
"password":"12345678"
}
```

Response:

```json
{
"accessToken":"jwt...",
"refreshToken":"jwt..."
}
```

---

# 18. API Documentation Standard

AEOS sử dụng:

```
OpenAPI 3.0
```

Structure:

```
docs/

 └── api/

      ├── auth.yaml

      ├── workspace.yaml

      ├── project.yaml

      └── task.yaml
```

---

# 19. API Security Requirement

Bao gồm:

## Authentication

* JWT.
* Refresh Token.

## Authorization

* RBAC.
* Permission Guard.

## Protection

* Rate Limit.
* Input Validation.
* SQL Injection Prevention.
* Audit Logging.

---

# 20. API Contract Output

Sau Phase 2.4 chúng ta có:

## API Documentation

✅ Endpoint List

✅ Request Schema

✅ Response Schema

✅ Validation Rule

✅ Error Code

## Security

✅ Authentication Flow

✅ Authorization Flow

## Developer Input

✅ Frontend Contract

✅ Backend Implementation Contract

---

# Kết quả sau Phase 2.1 → 2.4

AEOS hiện tại đã có:

```
Business Requirement

↓

Functional Requirement

↓

User Story

↓

Use Case

↓

API Contract
```

Chúng ta đã xác định:

* Vì sao xây dựng.
* Xây dựng chức năng gì.
* User thao tác như thế nào.
* API giao tiếp ra sao.

---

# Bước tiếp theo

Sau khi có API Contract, chúng ta mới bước sang:

# Phase 2.5 – Database Design

Đây sẽ là một trong những phần quan trọng nhất.

Chúng ta sẽ thiết kế:

* Database Strategy.
* Database per Context.
* ERD.
* Entity Relationship.
* Table Design.
* Column Definition.
* Data Type.
* Primary Key.
* Foreign Key.
* Unique Constraint.
* Index Strategy.
* Transaction Boundary.
* Migration Strategy.
* Prisma Schema.

Và chúng ta sẽ không làm kiểu "tạo vài bảng User, Workspace rồi xong".

Mỗi Bounded Context của AEOS sẽ được phân tích từ:

```
Business Entity

↓

Domain Entity

↓

Persistence Model

↓

Database Schema
```

để đảm bảo Database phục vụ đúng Domain.
