# Senior Fullstack Engineer Residency

# Chương 10 – Security Architecture (Thiết kế kiến trúc bảo mật)

> **"Một hệ thống Enterprise không được coi là hoàn thành khi nó hoạt động đúng. Nó chỉ thực sự hoàn thành khi nó hoạt động đúng ngay cả khi bị tấn công."**

Đến thời điểm này, AEOS đã có:

* Business Architecture.
* Domain Model.
* Data Architecture.
* System Architecture.
* API Architecture.

Nhưng tất cả những điều đó đều vô nghĩa nếu hệ thống không được bảo vệ.

Trong các công ty lớn như Google, Microsoft, Amazon hay Stripe, **Security không phải là một giai đoạn cuối dự án**.

Security là một yêu cầu xuyên suốt toàn bộ vòng đời phát triển phần mềm.

Đó chính là tư duy của **Security by Design**.

---

# Mục tiêu của chương

Sau chương này, chúng ta phải thiết kế được:

* Identity & Access Management (IAM).
* Authentication.
* Authorization.
* Secret Management.
* Encryption Strategy.
* Zero Trust Architecture.
* Threat Modeling.
* Audit & Compliance.
* Secure Communication.
* Security Governance.

Mục tiêu không phải là chống mọi cuộc tấn công.

Mà là giảm thiểu rủi ro xuống mức chấp nhận được và phát hiện sự cố sớm nhất có thể.

---

# 1. Security by Design

Security không được thêm vào sau.

Quy trình đúng.

```text id="a91pvt"
Business Requirement

↓

Threat Analysis

↓

Architecture

↓

Implementation

↓

Security Testing

↓

Deployment

↓

Monitoring
```

Nếu đợi đến khi code xong mới nghĩ đến bảo mật.

Thì đã quá muộn.

---

# 2. CIA Triad

Mọi quyết định bảo mật đều xoay quanh ba mục tiêu.

## Confidentiality

Chỉ người có quyền mới được truy cập dữ liệu.

Ví dụ.

* Permission.
* Encryption.
* MFA.

---

## Integrity

Dữ liệu không bị sửa trái phép.

Ví dụ.

* Digital Signature.
* Audit.
* Versioning.
* Optimistic Locking.

---

## Availability

Hệ thống luôn sẵn sàng phục vụ.

Ví dụ.

* Replication.
* Backup.
* Auto Scaling.
* Disaster Recovery.

---

# 3. Identity & Access Management (IAM)

IAM trả lời ba câu hỏi.

* Người dùng là ai?
* Họ có quyền gì?
* Họ đang thực hiện hành động nào?

Trong AEOS.

Identity.

```text id="r4mx8v"
User

↓

Workspace Membership

↓

Role

↓

Permission

↓

Resource Access
```

Identity không chỉ tồn tại ở cấp hệ thống.

Mà còn tồn tại theo từng Workspace.

---

# 4. Authentication

AEOS hỗ trợ nhiều phương thức xác thực.

* Email & Password.
* OAuth2.
* OpenID Connect.
* Google.
* GitHub.
* Microsoft.
* Passkey (WebAuthn).
* Multi-Factor Authentication (MFA).

Nguyên tắc.

Không tự xây dựng giao thức xác thực.

Ưu tiên sử dụng các chuẩn đã được kiểm chứng.

---

# 5. Authorization

AEOS không chỉ dùng RBAC.

Chúng ta kết hợp:

## RBAC

Quyền theo vai trò.

Ví dụ.

* Workspace Owner.
* Workspace Admin.
* Project Lead.
* Member.
* Guest.

---

## ABAC

Quyền dựa trên thuộc tính.

Ví dụ.

* Chủ sở hữu tài liệu.
* Thành viên của Project.
* Workspace hiện tại.
* Thời gian truy cập.
* Trạng thái tài nguyên.

Một yêu cầu chỉ được phép thực hiện khi vượt qua cả hai lớp kiểm tra nếu chính sách yêu cầu.

---

# 6. Principle of Least Privilege

Nguyên tắc.

Mỗi người chỉ được cấp đúng quyền họ cần.

Ví dụ.

Guest.

Có thể.

* Xem tài liệu được chia sẻ.

Không thể.

* Xóa Workspace.
* Tạo Workflow.
* Quản lý Permission.

Quyền mặc định phải là **không có quyền** cho đến khi được cấp.

---

# 7. Zero Trust Architecture

Không tin tưởng bất kỳ thành phần nào mặc định.

Mọi yêu cầu đều phải được xác minh.

```text id="t8w3nk"
User

↓

Authentication

↓

Authorization

↓

Policy Evaluation

↓

Access Resource
```

Ngay cả khi Request đến từ mạng nội bộ.

Nó vẫn phải được xác thực và phân quyền.

---

# 8. Secret Management

Không lưu Secret trong Source Code.

Không lưu trong Git.

Không ghi vào Log.

Secret bao gồm.

* JWT Secret.
* API Key.
* Database Password.
* SMTP Password.
* OAuth Client Secret.
* Encryption Key.

Chiến lược.

```text id="j7r2pf"
Application

↓

Secret Manager

↓

Temporary Secret

↓

Memory
```

Ứng dụng chỉ lấy Secret khi cần và không lưu lâu hơn mức cần thiết.

---

# 9. Encryption Strategy

## Data in Transit

Mọi giao tiếp đều sử dụng TLS.

Ví dụ.

* Browser ↔ API.
* API ↔ Database Proxy (khi hỗ trợ).
* API ↔ AI Provider.
* API ↔ Object Storage.

---

## Data at Rest

Các dữ liệu nhạy cảm cần được mã hóa khi lưu trữ.

Ví dụ.

* Refresh Token.
* API Credential.
* OAuth Secret.
* Backup.
* File Storage (nếu yêu cầu tuân thủ).

Không phải mọi cột đều cần mã hóa.

Việc mã hóa phải cân bằng giữa bảo mật và hiệu năng.

---

# 10. Password Policy

Không bao giờ lưu mật khẩu dạng văn bản.

Quy trình.

```text id="u3cn9m"
Password

↓

Hash

↓

Store Hash
```

Ngoài ra.

* Chính sách độ dài tối thiểu.
* Chống mật khẩu phổ biến.
* Giới hạn số lần đăng nhập sai.
* Hỗ trợ MFA.

---

# 11. Threat Modeling

Trước khi viết code.

Chúng ta phải đặt câu hỏi.

"Hệ thống có thể bị tấn công bằng cách nào?"

Ví dụ.

| Thành phần | Mối đe dọa        |
| ---------- | ----------------- |
| Login      | Brute Force       |
| API        | Injection         |
| Upload     | Malware           |
| Search     | DoS               |
| AI Prompt  | Prompt Injection  |
| Webhook    | Replay Attack     |
| Session    | Session Hijacking |

Sau khi xác định mối đe dọa.

Chúng ta thiết kế biện pháp giảm thiểu.

---

# 12. API Security

Mọi API phải trải qua các lớp bảo vệ.

```text id="d5my8x"
HTTPS

↓

Authentication

↓

Authorization

↓

Validation

↓

Rate Limit

↓

Business Logic

↓

Audit Log
```

Không được bỏ qua bất kỳ lớp nào.

---

# 13. Secure File Upload

Một trong những điểm dễ bị khai thác nhất.

Quy trình chuẩn.

```text id="g9v4rt"
Upload

↓

Validate Extension

↓

Validate MIME Type

↓

Virus Scan

↓

Store Object

↓

Save Metadata
```

Không tin tưởng tên file hoặc Content-Type do Client gửi lên.

---

# 14. Audit & Security Logging

Audit phục vụ nghiệp vụ.

Security Log phục vụ điều tra.

Ví dụ.

Security Event.

* Login Failed.
* MFA Failed.
* Permission Denied.
* Secret Rotation.
* Suspicious Activity.
* API Abuse.
* Webhook Verification Failed.

Các sự kiện này cần được lưu và theo dõi riêng với log ứng dụng thông thường.

---

# 15. Security Monitoring

Không chỉ ghi Log.

Mà còn phải phát hiện bất thường.

Ví dụ.

* 100 lần Login thất bại trong 1 phút.
* API bị gọi vượt ngưỡng.
* Upload bất thường.
* Quyền Admin thay đổi liên tục.
* Truy cập từ nhiều quốc gia trong thời gian ngắn (nếu phù hợp với chính sách).

Các sự kiện này cần kích hoạt cảnh báo để đội vận hành xử lý.

---

# 16. Compliance

Một hệ thống Enterprise thường phải đáp ứng các yêu cầu.

Ví dụ.

* Chính sách lưu trữ dữ liệu.
* Quyền xóa dữ liệu theo quy định.
* Nhật ký truy cập.
* Mã hóa dữ liệu.
* Chính sách sao lưu.

Ngay từ giai đoạn thiết kế, chúng ta phải biết sản phẩm sẽ cần tuân thủ tiêu chuẩn nào để tránh phải thay đổi kiến trúc sau này.

---

# 17. Security Testing Strategy

Bảo mật phải được kiểm thử liên tục.

Bao gồm.

* Static Analysis (SAST).
* Dependency Scanning.
* Secret Scanning.
* Dynamic Testing (DAST).
* Penetration Testing.
* Container Image Scanning.
* Infrastructure Scanning.

Những bước này sẽ được tự động hóa trong CI/CD ở các chương sau.

---

# Deliverables của Chương 10

Sau chương này, chúng ta phải có:

* Security Architecture Document.
* IAM Design.
* Authentication Strategy.
* Authorization Policy.
* Secret Management Strategy.
* Encryption Strategy.
* Threat Model.
* Security Control Matrix.
* Security Logging Strategy.
* Security Monitoring Plan.
* Compliance Checklist.

Đây là nền tảng bảo mật của toàn bộ hệ thống.

---

# Những gì chúng ta vẫn chưa làm

Đến cuối chương này, chúng ta vẫn chưa:

* Cấu hình Spring Security hoặc NestJS Guard.
* Thiết lập OAuth Provider.
* Cấu hình Vault.
* Cài đặt WAF.
* Viết Rule của SIEM.

Chúng ta đang thiết kế kiến trúc bảo mật.

Việc triển khai sẽ đến ở các chương về Infrastructure và DevSecOps.

---

# Engineering Mindset

Một Junior thường hỏi:

> "JWT hay Session?"

Một Mid thường hỏi:

> "RBAC hay ABAC?"

Một Senior sẽ hỏi:

> **"Nếu hệ thống bị tấn công ngay ngày mai, chúng ta sẽ phát hiện bằng cách nào, cô lập ra sao và giới hạn thiệt hại đến mức nào?"**

Bảo mật không chỉ là ngăn chặn.

Mà còn là khả năng phát hiện, phản ứng và phục hồi.

---

# Chuẩn đầu ra của Chương 10

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Thiết kế kiến trúc bảo mật theo nguyên tắc Security by Design.
* Xây dựng IAM với RBAC và ABAC.
* Thiết kế chiến lược quản lý Secret và mã hóa dữ liệu.
* Thực hiện Threat Modeling cho hệ thống Enterprise.
* Xây dựng Security Logging và Monitoring.
* Chuẩn bị nền tảng để triển khai DevSecOps trong môi trường Production.

> **Chương 11 sẽ là Infrastructure & Cloud Architecture. Chúng ta sẽ thiết kế toàn bộ hạ tầng chạy AEOS trên AWS: VPC, Subnet, Load Balancer, EC2, EKS, RDS, Redis, S3, CloudFront, Route 53, Auto Scaling, Multi-AZ, Disaster Recovery và toàn bộ kiến trúc Cloud Production.**
