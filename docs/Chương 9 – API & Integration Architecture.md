# Senior Fullstack Engineer Residency

# Chương 9 – API & Integration Architecture

> **"Một hệ thống Enterprise không tồn tại độc lập. Nó phải giao tiếp được với thế giới bên ngoài một cách an toàn, ổn định và có thể mở rộng."**

Sau Chương 8, chúng ta đã hoàn thành kiến trúc tổng thể của AEOS.

Chúng ta đã biết:

* Kiến trúc hệ thống.
* Các Bounded Context.
* Kiến trúc dữ liệu.
* Module giao tiếp với nhau như thế nào.
* Transaction Boundary.

Nhưng vẫn còn một câu hỏi rất lớn.

> **Làm thế nào để Frontend, Mobile App, AI Agent và các hệ thống bên ngoài giao tiếp với AEOS?**

Đó chính là mục tiêu của chương này.

---

# Mục tiêu của chương

Sau chương này, chúng ta phải thiết kế được:

* Public API.
* Internal API.
* Integration API.
* Event Contract.
* Webhook.
* API Versioning.
* Authentication.
* Authorization.
* Idempotency.
* Error Handling.
* API Governance.

Đây sẽ là "cổng giao tiếp" của toàn bộ nền tảng.

---

# 1. API First Design

Một sai lầm phổ biến.

Code trước.

Viết API sau.

AEOS sẽ làm ngược lại.

Quy trình đúng.

```text id="fh83mk"
Business Requirement

↓

Use Case

↓

API Contract

↓

Review

↓

Implementation
```

API là Contract.

Backend và Frontend cùng phát triển dựa trên Contract này.

---

# 2. API Classification

Không phải API nào cũng giống nhau.

AEOS chia thành bốn nhóm.

## Public API

Dành cho:

* Web.
* Mobile.
* Desktop.

Ví dụ.

```text id="ka92pd"
GET /projects

POST /tasks

PATCH /documents/{id}

DELETE /workspaces/{id}
```

---

## Internal API

Chỉ dùng giữa các Module.

Ví dụ.

```text id="wx91lt"
PermissionService

WorkspaceService

ProjectService
```

Không public ra Internet.

---

## Event API

Module giao tiếp bằng Event.

Ví dụ.

```text id="e4qncm"
TaskCreated

↓

Notification Module

↓

Analytics Module

↓

Search Module
```

---

## Integration API

Cho hệ thống bên ngoài.

Ví dụ.

* GitHub.
* GitLab.
* Slack.
* Microsoft Teams.
* Google Workspace.
* Calendar.
* AI Provider.

---

# 3. API Design Principles

Mọi API phải tuân thủ các nguyên tắc.

* Resource Oriented.
* Stateless.
* Idempotent khi phù hợp.
* Predictable.
* Consistent.
* Backward Compatible.

Ví dụ.

Không dùng.

```text id="kz0mft"
POST /createTask
```

Mà dùng.

```text id="s4jplx"
POST /tasks
```

API phải phản ánh tài nguyên.

Không phản ánh hành động.

---

# 4. API Versioning

API sẽ thay đổi theo thời gian.

Không được phá vỡ Client cũ.

Ví dụ.

```text id="v8czqs"
/api/v1

/api/v2
```

Hoặc.

```text id="4r2myn"
Accept:

application/vnd.aeos.v1+json
```

Việc lựa chọn chiến lược phải nhất quán cho toàn hệ thống.

---

# 5. Authentication

AEOS hỗ trợ nhiều hình thức xác thực.

Ví dụ.

* Email + Password.
* OAuth2.
* OpenID Connect.
* Google Login.
* GitHub Login.
* Microsoft Login.
* Passkey (WebAuthn).

Authentication trả lời câu hỏi.

> Người này là ai?

---

# 6. Authorization

Sau khi xác thực.

Hệ thống phải quyết định.

Người này được phép làm gì?

AEOS áp dụng RBAC kết hợp ABAC.

Ví dụ.

```text id="n5af1v"
Workspace Owner

↓

Workspace Admin

↓

Project Lead

↓

Member

↓

Guest
```

Ngoài Role.

Còn xét:

* Workspace.
* Project.
* Resource Owner.
* Permission.
* Context.

Authorization trả lời.

> Người này có quyền thực hiện hành động này trên tài nguyên này không?

---

# 7. Idempotency

Một số API phải an toàn khi gửi nhiều lần.

Ví dụ.

Thanh toán.

Tạo Workflow.

Tạo Subscription.

Client gửi.

```text id="w1xz7h"
Idempotency-Key

↓

abc-123
```

Nếu Request được gửi lại.

Server trả về cùng kết quả.

Không tạo dữ liệu trùng lặp.

---

# 8. Error Handling

Error phải thống nhất.

Ví dụ.

```text id="p6bg8s"
{
  code

  message

  details

  traceId

  timestamp
}
```

Không trả về:

```text id="z4nv3a"
Error
```

Hoặc.

```text id="k2xf5p"
Unknown Exception
```

Error phải giúp Client xử lý được.

---

# 9. Pagination Strategy

Không trả về.

```text id="j8ow3q"
100000 Tasks
```

AEOS hỗ trợ.

* Offset Pagination.
* Cursor Pagination.

Đối với dữ liệu lớn.

Cursor là lựa chọn mặc định.

---

# 10. Filtering & Sorting

API phải hỗ trợ.

Ví dụ.

```text id="u9hy7m"
status=IN_PROGRESS

priority=HIGH

assignee=me

sort=updatedAt

order=desc
```

Không tạo hàng chục Endpoint khác nhau cho từng trường hợp.

---

# 11. Webhook Architecture

AEOS không chỉ gọi API.

AEOS còn gửi Event ra ngoài.

Ví dụ.

```text id="m7tx2c"
Task Completed

↓

Webhook Dispatcher

↓

Customer Endpoint
```

Webhook cần.

* Retry.
* Signature.
* Timeout.
* Dead Letter Queue.
* Delivery Log.

---

# 12. Event Contract

Không chỉ REST.

Module còn giao tiếp bằng Event.

Ví dụ.

```text id="a2rq6p"
TaskCompleted

{

taskId

completedBy

completedAt

version

}
```

Event Contract phải bất biến.

Nếu thay đổi.

Phải tạo Version mới.

---

# 13. Rate Limiting

Một hệ thống Enterprise phải chống lạm dụng.

Ví dụ.

* Login.
* Search.
* AI.
* Upload.

Đều cần Rate Limit.

Có thể theo.

* User.
* IP.
* API Key.
* Workspace.

---

# 14. API Security

API phải được bảo vệ.

Ví dụ.

* HTTPS.
* JWT Validation.
* CSRF (nếu dùng Cookie).
* CORS.
* Input Validation.
* Output Encoding.
* Payload Size Limit.
* Request Timeout.

Bảo mật phải được thiết kế từ đầu.

Không bổ sung sau.

---

# 15. API Documentation

Mọi API đều phải có tài liệu.

Bao gồm.

* Endpoint.
* Method.
* Request.
* Response.
* Error.
* Example.
* Permission.
* Version.

Tài liệu API là Contract giữa các đội phát triển.

---

# 16. API Governance

Một hệ thống lớn không thể để mỗi nhóm thiết kế API theo một kiểu.

AEOS sẽ có tiêu chuẩn chung.

Ví dụ.

* Quy ước đặt tên Endpoint.
* Quy ước HTTP Status.
* Quy ước Error Code.
* Quy ước Version.
* Quy ước Pagination.
* Quy ước Authentication.
* Quy ước Logging.

Điều này giúp toàn bộ hệ thống nhất quán.

---

# Deliverables của Chương 9

Sau khi hoàn thành chương này, chúng ta phải có:

* API Design Guideline.
* API Contract Standard.
* Authentication Strategy.
* Authorization Strategy.
* API Versioning Strategy.
* Error Handling Standard.
* Pagination Standard.
* Event Contract Catalogue.
* Webhook Specification.
* Integration Strategy.
* API Governance Document.

Đây là nền tảng để các nhóm Frontend, Mobile và Backend có thể phát triển song song mà không phụ thuộc lẫn nhau.

---

# Những gì chúng ta vẫn chưa làm

Đến cuối chương này, chúng ta vẫn chưa:

* Viết Controller.
* Viết DTO.
* Viết Endpoint.
* Sinh OpenAPI.
* Tích hợp Gateway.

Bởi vì chúng ta vẫn đang ở giai đoạn thiết kế.

---

# Engineering Mindset

Một Junior thường hỏi:

> "API này trả về JSON như thế nào?"

Một Mid thường hỏi:

> "REST hay GraphQL?"

Một Senior sẽ hỏi:

> **"API này có còn tương thích sau ba năm, khi hàng chục ứng dụng và đối tác đang sử dụng nó không?"**

API là một hợp đồng dài hạn.

Một khi đã công bố, việc thay đổi sẽ ảnh hưởng đến rất nhiều hệ thống khác.

---

# Chuẩn đầu ra của Chương 9

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Thiết kế API theo phương pháp API First.
* Xây dựng Public API, Internal API và Integration API.
* Thiết kế Authentication và Authorization cho hệ thống Enterprise.
* Chuẩn hóa Error Handling, Pagination và Versioning.
* Xây dựng Event Contract và Webhook cho kiến trúc hướng sự kiện.
* Thiết lập API Governance để nhiều đội phát triển có thể làm việc đồng thời trên cùng một nền tảng.

> **Chương 10 sẽ là Security Architecture. Chúng ta sẽ thiết kế toàn bộ mô hình bảo mật của AEOS: Identity, IAM, RBAC/ABAC, Secrets Management, Encryption, Zero Trust, Audit, Threat Modeling và Security by Design để hệ thống sẵn sàng cho môi trường Production.**
