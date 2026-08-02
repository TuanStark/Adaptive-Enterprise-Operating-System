# Senior Fullstack Engineer Residency

# Chương 11 – Infrastructure & Cloud Architecture (Thiết kế hạ tầng Cloud Production)

> **"Một hệ thống Enterprise không chạy trên Docker Compose. Nó chạy trên một hạ tầng được thiết kế để chịu lỗi, mở rộng và vận hành liên tục trong nhiều năm."**

Đến thời điểm này, chúng ta đã hoàn thành:

* Business Architecture.
* Domain Architecture.
* Data Architecture.
* Database Architecture.
* System Architecture.
* API Architecture.
* Security Architecture.

Nhưng vẫn còn một câu hỏi quan trọng.

> **Hệ thống sẽ chạy ở đâu, mở rộng như thế nào, chịu lỗi ra sao và làm thế nào để không bị gián đoạn khi có sự cố?**

Đó là mục tiêu của chương này.

Đây cũng là chương bắt đầu kết nối toàn bộ kiến thức về **Cloud, DevOps và System Design**.

---

# Mục tiêu của chương

Sau chương này, chúng ta phải thiết kế được:

* Cloud Architecture.
* Network Architecture.
* Compute Strategy.
* Storage Strategy.
* High Availability.
* Disaster Recovery.
* Auto Scaling.
* Infrastructure Security.
* Cost Optimization.
* Production Environment.

Đây sẽ là bản thiết kế hạ tầng cho AEOS.

---

# 1. Vì sao lựa chọn AWS?

AEOS có thể chạy trên:

* AWS.
* Azure.
* Google Cloud.

Trong khóa học này, chúng ta lựa chọn **AWS** vì:

* Hệ sinh thái dịch vụ phong phú.
* Phổ biến trong doanh nghiệp.
* Hỗ trợ Kubernetes rất tốt.
* Dễ mở rộng toàn cầu.
* Có nhiều dịch vụ Managed giúp giảm chi phí vận hành.

Tuy nhiên, các nguyên tắc thiết kế vẫn có thể áp dụng cho nền tảng khác.

---

# 2. Cloud Architecture Overview

Kiến trúc Production của AEOS.

```text id="ov4x9d"
Internet

↓

Route 53

↓

CloudFront

↓

Application Load Balancer

↓

Amazon EKS

↓

PostgreSQL (Amazon RDS)

↓

Redis

↓

Object Storage

↓

OpenSearch
```

Đây là kiến trúc ở mức tổng quan.

Trong các phần tiếp theo, chúng ta sẽ phân tích từng thành phần.

---

# 3. Network Architecture

Mọi thứ bắt đầu từ mạng.

```text id="a3mk8v"
AWS Region

↓

VPC

├── Public Subnet A
├── Public Subnet B

├── Private App Subnet A
├── Private App Subnet B

├── Private Database Subnet A
└── Private Database Subnet B
```

Nguyên tắc.

Không đặt Database trong Public Subnet.

Không cho phép Internet truy cập trực tiếp vào Pod.

---

# 4. Traffic Flow

Luồng truy cập của người dùng.

```text id="q9vb4c"
User

↓

DNS

↓

CloudFront

↓

Application Load Balancer

↓

Ingress Controller

↓

Service

↓

Pod
```

Luồng này giúp:

* Giảm tải.
* Caching.
* TLS Termination.
* Load Balancing.
* Bảo vệ ứng dụng khỏi truy cập trực tiếp.

---

# 5. Compute Layer

AEOS sẽ chạy trên Kubernetes.

Cụ thể.

Amazon EKS.

Lý do.

* Chuẩn Kubernetes.
* Dễ mở rộng.
* Hỗ trợ Rolling Update.
* Hỗ trợ Auto Scaling.
* Hệ sinh thái mạnh.

Ban đầu.

Chúng ta chỉ sử dụng một Cluster.

Sau này có thể mở rộng.

* Production.
* Staging.
* Development.

---

# 6. Database Layer

PostgreSQL sử dụng Amazon RDS.

Nguyên tắc.

* Multi-AZ.
* Automated Backup.
* Point-in-Time Recovery.
* Read Replica khi cần mở rộng đọc.

Không tự quản lý PostgreSQL trên EC2 nếu chưa có lý do đặc biệt.

---

# 7. Object Storage

Toàn bộ file.

* PDF.
* Image.
* Video.
* Attachment.

Đều được lưu trên Object Storage.

Luồng.

```text id="u2xp8j"
Upload

↓

Object Storage

↓

Metadata Database

↓

Search Index
```

Ứng dụng không lưu file trong Database.

---

# 8. Cache Layer

Redis phục vụ.

* Cache.
* Session.
* Distributed Lock.
* Rate Limit.
* Queue Metadata.

Redis không phải là nguồn dữ liệu chính.

Nếu Redis mất dữ liệu.

Hệ thống vẫn phải hoạt động.

---

# 9. Search Layer

OpenSearch phục vụ.

* Full Text Search.
* AI Search.
* Document Search.
* Log Search.

Search Index được cập nhật bất đồng bộ thông qua Event.

Không truy vấn trực tiếp PostgreSQL cho mọi tìm kiếm.

---

# 10. High Availability

Một Production System phải chịu được lỗi.

Ví dụ.

```text id="h6zn2r"
Availability Zone A

↓

Application

↓

Database Replica

↓

Availability Zone B

↓

Application

↓

Primary Database
```

Nếu một Availability Zone gặp sự cố.

Hệ thống vẫn tiếp tục hoạt động.

---

# 11. Auto Scaling

Không phải mọi thành phần đều mở rộng giống nhau.

Ví dụ.

Pod.

Dựa trên.

* CPU.
* Memory.
* Request Rate.
* Queue Length.

Node.

Dựa trên.

* Pod Scheduling.
* Resource Utilization.

Không mở rộng Database theo cùng cách với Application.

---

# 12. Disaster Recovery

Mọi hệ thống đều phải giả định rằng sự cố sẽ xảy ra.

Chiến lược.

* Backup tự động.
* Snapshot.
* Point-in-Time Recovery.
* Multi-AZ.
* Khả năng khôi phục ở Region khác nếu yêu cầu.

Disaster Recovery không chỉ là sao lưu.

Mà là khả năng khôi phục trong thời gian chấp nhận được.

---

# 13. Environment Strategy

AEOS sử dụng nhiều môi trường.

```text id="b5rt9m"
Local

↓

Development

↓

Testing

↓

Staging

↓

Production
```

Mỗi môi trường có:

* Namespace riêng.
* Database riêng.
* Secret riêng.
* Domain riêng.
* CI/CD riêng.

Không chia sẻ dữ liệu giữa Production và Development.

---

# 14. Infrastructure Security

Hạ tầng phải được bảo vệ.

Bao gồm.

* Private Subnet.
* Security Group.
* Network ACL.
* IAM Role.
* Encryption at Rest.
* Encryption in Transit.
* Secret Manager.
* Bastion hoặc giải pháp truy cập quản trị an toàn khi cần.
* Logging.

Không sử dụng Access Key cố định trong ứng dụng.

---

# 15. Cost Optimization

Một Senior không chỉ quan tâm hệ thống chạy được.

Mà còn quan tâm chi phí.

Ví dụ.

* Auto Scaling.
* Reserved Capacity khi phù hợp.
* Lifecycle Policy cho Object Storage.
* Tắt môi trường Development ngoài giờ (nếu cho phép).
* Giám sát tài nguyên nhàn rỗi.
* Chọn đúng kích thước dịch vụ.

Cloud Architecture luôn là bài toán cân bằng giữa hiệu năng, độ tin cậy và chi phí.

---

# 16. Observability Infrastructure

Muốn vận hành Production.

Chúng ta phải quan sát được hệ thống.

Bao gồm.

* Metrics.
* Logs.
* Distributed Tracing.
* Alerting.
* Dashboard.

Một hệ thống không thể quan sát được thì không thể vận hành hiệu quả.

---

# 17. Infrastructure as Code

Toàn bộ hạ tầng phải được định nghĩa bằng mã.

Không cấu hình thủ công.

Ví dụ.

* VPC.
* Subnet.
* RDS.
* EKS.
* Redis.
* IAM.
* Object Storage.

Mọi thay đổi đều phải được quản lý qua phiên bản và có thể tái tạo.

---

# 18. Evolution Roadmap

Kiến trúc hạ tầng cũng phải có khả năng phát triển.

```text id="f8kr2p"
Local Docker

↓

Single VPS

↓

Managed Database

↓

Kubernetes

↓

Managed Kubernetes

↓

Multi-AZ

↓

Multi-Region
```

Chúng ta không xây dựng kiến trúc lớn ngay từ đầu.

Chúng ta thiết kế để có thể phát triển theo từng giai đoạn.

---

# Deliverables của Chương 11

Sau chương này, chúng ta phải có:

* Cloud Architecture Diagram.
* Network Topology.
* Traffic Flow Diagram.
* Compute Strategy.
* Storage Strategy.
* Auto Scaling Strategy.
* Disaster Recovery Plan.
* Environment Strategy.
* Infrastructure Security Guideline.
* Cost Optimization Strategy.
* Infrastructure as Code Guideline.

Đây là tài liệu kiến trúc hạ tầng cho Production.

---

# Những gì chúng ta vẫn chưa làm

Đến cuối chương này, chúng ta vẫn chưa:

* Viết Terraform.
* Tạo VPC.
* Tạo EKS Cluster.
* Cấu hình Kubernetes.
* Triển khai CI/CD.

Đó là chủ ý.

Chúng ta đang thiết kế kiến trúc hạ tầng trước khi triển khai.

---

# Engineering Mindset

Một Junior thường hỏi:

> "Em nên dùng EC2 hay Kubernetes?"

Một Mid thường hỏi:

> "EKS hay tự cài Kubernetes?"

Một Cloud Architect sẽ hỏi:

> **"Kiến trúc này có đáp ứng được mục tiêu về độ sẵn sàng, khả năng mở rộng, bảo mật, chi phí và khả năng vận hành trong 3–5 năm tới không?"**

Cloud không chỉ là nơi chạy ứng dụng.

Cloud là nền tảng để doanh nghiệp phát triển sản phẩm một cách bền vững.

---

# Chuẩn đầu ra của Chương 11

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Thiết kế kiến trúc Cloud Production trên AWS.
* Xây dựng Network Topology theo chuẩn Enterprise.
* Thiết kế chiến lược Compute, Storage và Database.
* Xây dựng High Availability và Disaster Recovery.
* Thiết kế Auto Scaling và Cost Optimization.
* Chuẩn bị đầy đủ nền tảng để bước sang triển khai hạ tầng bằng **Infrastructure as Code**.

> **Chương 12 sẽ là DevOps, CI/CD & GitOps Architecture. Chúng ta sẽ thiết kế toàn bộ quy trình phát triển và triển khai phần mềm: Git Workflow, Branching Strategy, CI Pipeline, CD Pipeline, Docker Build, Helm, Argo CD, GitOps, Progressive Delivery, Feature Flags và Release Strategy để AEOS có thể phát hành hàng chục lần mỗi ngày một cách an toàn.**
