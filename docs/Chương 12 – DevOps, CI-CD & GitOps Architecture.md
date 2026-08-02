# Senior Fullstack Engineer Residency

# Chương 12 – DevOps, CI/CD & GitOps Architecture

> **"Một Senior Developer không chỉ biết viết code. Họ biết làm thế nào để một dòng code từ laptop của lập trình viên có thể được triển khai lên Production một cách tự động, an toàn, có thể rollback và gần như không gây gián đoạn."**

Đến thời điểm này, chúng ta đã hoàn thành:

* Business Architecture
* Domain Architecture
* Data Architecture
* Database Architecture
* System Architecture
* API Architecture
* Security Architecture
* Cloud Architecture

Nhưng hệ thống vẫn chưa thể vận hành.

Chúng ta vẫn chưa trả lời được những câu hỏi quan trọng:

* Làm sao nhiều Developer cùng làm việc mà không xung đột?
* Làm sao đảm bảo code luôn đạt chất lượng?
* Làm sao Deploy hàng chục lần mỗi ngày mà không downtime?
* Làm sao Rollback trong vài phút nếu có lỗi?
* Làm sao mọi thay đổi hạ tầng đều có thể kiểm soát?

Đó chính là mục tiêu của chương này.

---

# Mục tiêu của chương

Sau chương này chúng ta sẽ thiết kế được:

* Git Workflow.
* Branching Strategy.
* Development Workflow.
* CI Pipeline.
* CD Pipeline.
* GitOps.
* Progressive Delivery.
* Release Strategy.
* Artifact Management.
* Environment Promotion.
* Deployment Strategy.

Đây là "dây chuyền sản xuất phần mềm" của AEOS.

---

# 1. DevOps là gì?

DevOps không phải Docker.

DevOps không phải Kubernetes.

DevOps cũng không phải CI/CD.

DevOps là văn hóa và quy trình giúp:

* Development.
* QA.
* Security.
* Operations.

Làm việc như một đội duy nhất.

Mục tiêu.

```text
Commit

↓

Build

↓

Test

↓

Security Scan

↓

Package

↓

Deploy

↓

Monitor

↓

Feedback
```

Đây là vòng đời liên tục của phần mềm.

---

# 2. Git Workflow

AEOS sử dụng Git như nguồn chân lý (Single Source of Truth).

Chiến lược Branch.

```text
main

↓

develop

↓

feature/*

↓

release/*

↓

hotfix/*
```

Ý nghĩa.

## main

Luôn phản ánh Production.

---

## develop

Tích hợp toàn bộ tính năng chuẩn bị cho phiên bản tiếp theo.

---

## feature

Mỗi tính năng là một Branch riêng.

Ví dụ.

```text
feature/task-comments

feature/document-versioning

feature/workflow-engine
```

---

## release

Chuẩn bị phát hành.

Chỉ sửa Bug.

Không thêm tính năng mới.

---

## hotfix

Sửa lỗi Production.

Sau khi hoàn thành phải hợp nhất trở lại các nhánh phù hợp.

---

# 3. Pull Request Workflow

Không ai được Push trực tiếp vào Branch chính.

Quy trình.

```text
Feature Branch

↓

Pull Request

↓

Code Review

↓

CI

↓

Approval

↓

Merge
```

Mỗi Pull Request cần:

* Mô tả thay đổi.
* Liên kết Issue.
* Kiểm tra CI thành công.
* Được Review bởi ít nhất một thành viên có quyền.

---

# 4. Conventional Commit

Commit phải có cấu trúc.

Ví dụ.

```text
feat(task): add recurring task

fix(auth): refresh token rotation

refactor(workspace): simplify permission service

test(project): add integration tests

docs(api): update authentication guide
```

Lợi ích.

* Sinh Changelog.
* Semantic Version.
* Tự động hóa Release.

---

# 5. CI Pipeline

Mỗi Commit đều phải chạy Pipeline.

```text
Checkout

↓

Install Dependencies

↓

Lint

↓

Unit Test

↓

Integration Test

↓

Build

↓

Security Scan

↓

Package

↓

Publish Artifact
```

Nếu Pipeline thất bại.

Code không được Merge.

---

# 6. Quality Gate

Một Build chỉ được coi là thành công khi vượt qua tất cả tiêu chí.

Ví dụ.

* Lint.
* Unit Test.
* Integration Test.
* Code Coverage.
* Static Analysis.
* Dependency Scan.
* Secret Scan.
* License Check.

Đây là "cổng chất lượng" của dự án.

---

# 7. Artifact Management

Sau khi Build thành công.

Kết quả không phải Source Code.

Mà là Artifact.

Ví dụ.

```text
Application

↓

Docker Image

↓

Image Registry
```

Artifact là thứ duy nhất được phép triển khai lên Production.

Không Build lại trong giai đoạn Deploy.

---

# 8. CD Pipeline

Triển khai không nên thực hiện thủ công.

Quy trình.

```text
Artifact

↓

Deploy Development

↓

Integration Test

↓

Deploy Staging

↓

Smoke Test

↓

Approval (nếu cần)

↓

Deploy Production
```

Mỗi môi trường đều có bước kiểm tra riêng.

---

# 9. GitOps

Trong AEOS.

Git không chỉ quản lý Source Code.

Git còn quản lý hạ tầng và cấu hình triển khai.

```text
Git Repository

↓

Argo CD

↓

Kubernetes Cluster
```

Cluster không bị chỉnh sửa thủ công.

Argo CD sẽ đồng bộ trạng thái thực tế với trạng thái trong Git.

Git trở thành nguồn chân lý cho cả ứng dụng và hạ tầng.

---

# 10. Deployment Strategy

Không phải mọi lần Deploy đều giống nhau.

### Rolling Update

Triển khai mặc định.

Pod mới được tạo trước khi Pod cũ bị loại bỏ.

---

### Blue-Green Deployment

Có hai môi trường.

* Blue.
* Green.

Chuyển toàn bộ lưu lượng khi phiên bản mới sẵn sàng.

Rollback rất nhanh.

---

### Canary Deployment

Triển khai cho một phần nhỏ người dùng.

Ví dụ.

```text
5%

↓

20%

↓

50%

↓

100%
```

Giúp phát hiện lỗi trước khi ảnh hưởng toàn bộ người dùng.

---

# 11. Progressive Delivery

Deployment và Release là hai khái niệm khác nhau.

Triển khai thành công không có nghĩa là người dùng sẽ thấy tính năng mới.

Feature Flag giúp:

* Bật/Tắt tính năng.
* Thử nghiệm A/B.
* Phát hành theo Workspace.
* Phát hành theo nhóm người dùng.

---

# 12. Rollback Strategy

Rollback phải nhanh và đáng tin cậy.

Ví dụ.

```text
Detect Issue

↓

Stop Rollout

↓

Rollback Previous Version

↓

Verify

↓

Resume Monitoring
```

Rollback không được yêu cầu Build lại ứng dụng.

---

# 13. Infrastructure as Code

Mọi hạ tầng đều được quản lý bằng mã.

Bao gồm.

* VPC.
* IAM.
* Kubernetes Cluster.
* Database.
* DNS.
* Load Balancer.

Mọi thay đổi phải:

* Có Pull Request.
* Có Review.
* Có lịch sử thay đổi.
* Có khả năng Rollback.

---

# 14. DevSecOps

Security không đứng ngoài Pipeline.

Pipeline chuẩn.

```text
Commit

↓

SAST

↓

Dependency Scan

↓

Secret Scan

↓

Container Scan

↓

Build

↓

Deploy

↓

Runtime Monitoring
```

Mục tiêu.

Phát hiện vấn đề càng sớm càng tốt.

---

# 15. Environment Promotion

Một phiên bản phải đi qua các môi trường theo thứ tự.

```text
Development

↓

Testing

↓

Staging

↓

Production
```

Không được triển khai trực tiếp từ máy cá nhân lên Production.

---

# 16. Release Strategy

AEOS sử dụng Semantic Versioning.

Ví dụ.

```text
v1.0.0

v1.1.0

v1.1.1

v2.0.0
```

Mỗi Release phải có:

* Changelog.
* Migration Plan.
* Rollback Plan.
* Release Note.

---

# 17. DevOps Metrics

Một đội ngũ không thể cải thiện nếu không đo lường.

Các chỉ số quan trọng.

* Deployment Frequency.
* Lead Time for Changes.
* Change Failure Rate.
* Mean Time to Recovery (MTTR).

Đây là các chỉ số phổ biến để đánh giá hiệu quả quy trình phát triển và vận hành.

---

# Deliverables của Chương 12

Sau chương này, chúng ta phải có:

* Git Workflow Guideline.
* Branching Strategy.
* Pull Request Policy.
* Conventional Commit Guideline.
* CI Pipeline Design.
* CD Pipeline Design.
* GitOps Architecture.
* Deployment Strategy.
* Release Strategy.
* Rollback Strategy.
* DevSecOps Pipeline.
* DevOps Metrics Dashboard Design.

Đây là tài liệu chuẩn hóa toàn bộ quy trình phát triển và phát hành của AEOS.

---

# Những gì chúng ta vẫn chưa làm

Đến cuối chương này, chúng ta vẫn chưa:

* Viết GitHub Actions.
* Tạo Jenkins Pipeline.
* Cấu hình Argo CD.
* Viết Helm Chart.
* Cấu hình Kubernetes Deployment.

Đó là chủ ý.

Chúng ta đang thiết kế quy trình trước khi triển khai công cụ.

---

# Engineering Mindset

Một Junior thường hỏi:

> "Làm sao Deploy Docker lên Kubernetes?"

Một Mid thường hỏi:

> "Nên dùng Jenkins hay GitHub Actions?"

Một Staff Engineer hoặc Platform Engineer sẽ hỏi:

> **"Làm thế nào để hàng trăm lập trình viên có thể triển khai hàng nghìn thay đổi mỗi tuần mà vẫn đảm bảo chất lượng, bảo mật và khả năng rollback trong vài phút?"**

Đó là bản chất của DevOps hiện đại: xây dựng một **Platform Engineering System** giúp việc phát triển và phát hành phần mềm trở nên nhanh, an toàn và lặp lại được.

---

# Chuẩn đầu ra của Chương 12

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Thiết kế quy trình DevOps cho một hệ thống Enterprise.
* Xây dựng Git Workflow và Branching Strategy chuyên nghiệp.
* Thiết kế CI/CD Pipeline theo chuẩn Production.
* Áp dụng GitOps để quản lý hạ tầng và ứng dụng.
* Thiết kế chiến lược triển khai, rollback và phát hành tính năng.
* Chuẩn bị nền tảng để triển khai thực tế bằng GitHub Actions, Helm, Argo CD, Kubernetes và Terraform.

> **Chương 13 sẽ là Observability & Platform Operations. Chúng ta sẽ thiết kế toàn bộ khả năng vận hành của AEOS: Logging, Metrics, Distributed Tracing, Alerting, SLI/SLO/SLA, Incident Response, Runbook, Capacity Planning và Site Reliability Engineering (SRE). Đây là chương đưa bạn từ một người biết triển khai hệ thống trở thành người biết vận hành hệ thống ở quy mô Production.**
