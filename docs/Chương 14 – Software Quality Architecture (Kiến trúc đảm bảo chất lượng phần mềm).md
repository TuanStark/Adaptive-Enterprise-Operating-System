# Senior Fullstack Engineer Residency

# Chương 14 – Software Quality Architecture (Kiến trúc đảm bảo chất lượng phần mềm)

> **"Một Senior Developer không đo chất lượng bằng việc 'code chạy được'. Chất lượng được đo bằng khả năng thay đổi hệ thống mà không làm hỏng những gì đang hoạt động."**

Đến thời điểm này, AEOS đã hoàn thành:

* Business Architecture.
* Domain Architecture.
* Data Architecture.
* Database Architecture.
* System Architecture.
* API Architecture.
* Security Architecture.
* Cloud Architecture.
* DevOps & GitOps Architecture.
* Observability & SRE.

Chúng ta đã có một hệ thống có thể vận hành.

Nhưng vẫn còn một vấn đề.

> **Làm thế nào để sau 5 năm phát triển, hàng nghìn lần Deploy và hàng triệu dòng code, đội ngũ vẫn có thể thay đổi hệ thống một cách tự tin?**

Đó là nhiệm vụ của **Software Quality Architecture**.

Quality không chỉ là Testing.

Quality là toàn bộ chiến lược giúp hệ thống luôn đúng, luôn ổn định và luôn có thể phát triển.

---

# Mục tiêu của chương

Sau chương này chúng ta sẽ thiết kế được:

* Quality Strategy.
* Testing Architecture.
* Test Pyramid.
* Test Automation.
* Contract Testing.
* Performance Testing.
* Security Testing.
* Quality Gate.
* Test Data Strategy.
* Release Quality Process.

Đây là nền tảng để AEOS phát triển bền vững trong nhiều năm.

---

# 1. Chất lượng là gì?

Nhiều người nghĩ.

Quality = Không có Bug.

Đây là quan điểm sai.

Một hệ thống chất lượng phải đạt được.

* Đúng nghiệp vụ.
* Dễ bảo trì.
* Dễ mở rộng.
* Hiệu năng ổn định.
* An toàn.
* Có thể kiểm thử.
* Có thể quan sát.
* Có thể triển khai liên tục.

Testing chỉ là một phần của Quality.

---

# 2. Shift Left Testing

Testing không diễn ra sau khi viết code.

Testing bắt đầu ngay từ khi phân tích yêu cầu.

Quy trình.

```text id="h7n2pk"
Requirement

↓

Architecture

↓

Design

↓

Implementation

↓

Testing

↓

Deployment
```

Quality phải được xây dựng từ đầu.

Không được "vá" ở cuối dự án.

---

# 3. Testing Pyramid

AEOS áp dụng Testing Pyramid.

```text id="t8r4vm"
End-to-End Test

──────────────

Integration Test

────────────────────────────

Unit Test
```

Nguyên tắc.

* Unit Test nhiều nhất.
* Integration Test vừa đủ.
* End-to-End Test ít nhưng quan trọng.

Không nên đảo ngược kim tự tháp.

---

# 4. Unit Testing

Unit Test kiểm tra.

* Domain Logic.
* Value Object.
* Domain Service.
* Utility.
* Business Rule.

Không kiểm tra.

* Database.
* HTTP.
* Redis.
* Kafka.
* File System.

Một Unit Test phải.

* Nhanh.
* Độc lập.
* Có thể chạy hàng nghìn lần mỗi ngày.

---

# 5. Integration Testing

Integration Test kiểm tra sự phối hợp giữa nhiều thành phần.

Ví dụ.

```text id="m4x8cz"
API

↓

Application Service

↓

Repository

↓

PostgreSQL
```

Hoặc.

```text id="q9dp5s"
Task Module

↓

Permission Module
```

Mục tiêu.

Xác minh các thành phần hoạt động đúng khi kết hợp.

---

# 6. Contract Testing

Trong hệ thống lớn.

Module không được phá vỡ API của nhau.

Ví dụ.

Frontend.

Kỳ vọng.

```json id="n3fw7y"
{
  "id": "...",
  "title": "...",
  "status": "IN_PROGRESS"
}
```

Nếu Backend đổi.

```json id="v8ua2l"
{
  "taskId": "...",
  "name": "..."
}
```

Frontend sẽ hỏng.

Contract Test giúp phát hiện điều này trước khi triển khai.

---

# 7. End-to-End Testing

Kiểm tra toàn bộ luồng nghiệp vụ.

Ví dụ.

```text id="k2rh9j"
Login

↓

Create Workspace

↓

Invite Member

↓

Create Project

↓

Create Task

↓

Complete Task
```

E2E Test mô phỏng hành vi người dùng thực tế.

Không cần quá nhiều.

Nhưng phải bao phủ các luồng nghiệp vụ quan trọng.

---

# 8. Performance Testing

Một hệ thống đúng nhưng chậm vẫn là hệ thống thất bại.

Các loại kiểm thử.

* Load Test.
* Stress Test.
* Spike Test.
* Endurance Test.
* Scalability Test.

Ví dụ.

1000 người dùng đồng thời.

Hệ thống vẫn phải đáp ứng SLO đã đặt ra.

---

# 9. Security Testing

Không chỉ kiểm thử chức năng.

Còn kiểm thử bảo mật.

Ví dụ.

* SQL Injection.
* XSS.
* CSRF.
* SSRF.
* Authentication Bypass.
* Authorization Bypass.
* File Upload.
* Rate Limiting.

Các bài kiểm thử này cần được tự động hóa khi có thể.

---

# 10. Test Data Management

Không sử dụng dữ liệu Production để kiểm thử.

Chiến lược.

* Seed Data.
* Factory.
* Fixture.
* Mock Data.
* Synthetic Data.

Test phải.

* Có thể chạy lại.
* Không phụ thuộc dữ liệu cũ.
* Không phụ thuộc thứ tự chạy.

---

# 11. Mock hay Real Dependency?

Nguyên tắc.

Unit Test.

Mock Dependency.

Integration Test.

Dùng Dependency thật.

Ví dụ.

PostgreSQL.

Redis.

Object Storage giả lập nếu phù hợp.

Không lạm dụng Mock khiến bài kiểm thử không còn phản ánh thực tế.

---

# 12. Test Automation

Mọi bài kiểm thử đều nên được tự động hóa.

Pipeline.

```text id="r5mk1v"
Commit

↓

Unit Test

↓

Integration Test

↓

Contract Test

↓

Performance Smoke Test

↓

Deploy
```

Không kiểm thử thủ công những việc máy có thể làm.

---

# 13. Quality Gates

Một Pull Request chỉ được Merge khi vượt qua.

* Build.
* Lint.
* Unit Test.
* Integration Test.
* Security Scan.
* Code Coverage.
* Static Analysis.

Nếu Quality Gate thất bại.

Không được Merge.

---

# 14. Code Coverage

Coverage không phải mục tiêu.

Coverage chỉ là chỉ số.

100% Coverage.

Không đồng nghĩa.

100% Chất lượng.

Điều quan trọng.

Kiểm thử đúng Business Rule.

Không phải chỉ tăng phần trăm Coverage.

---

# 15. Mutation Testing

Một bài kiểm thử tốt phải phát hiện được lỗi.

Mutation Testing.

Thay đổi nhỏ trong code.

Nếu Test vẫn Pass.

Test chưa đủ tốt.

Đây là kỹ thuật nâng cao giúp đánh giá chất lượng của bộ kiểm thử.

---

# 16. Non-functional Testing

Ngoài chức năng.

AEOS còn kiểm thử.

* Reliability.
* Availability.
* Scalability.
* Security.
* Accessibility.
* Compatibility.
* Recovery.
* Backup Restore.

Đây là các yêu cầu phi chức năng quyết định chất lượng của hệ thống Production.

---

# 17. Quality Metrics

Chúng ta phải đo lường chất lượng.

Ví dụ.

* Test Pass Rate.
* Defect Escape Rate.
* Build Success Rate.
* Mean Time to Detect.
* Mean Time to Fix.
* Code Coverage.
* Mutation Score.

Không đo lường.

Không thể cải thiện.

---

# 18. Continuous Quality

Quality không phải giai đoạn cuối.

Quality diễn ra liên tục.

```text id="c7vq4m"
Design

↓

Code

↓

Review

↓

Test

↓

Deploy

↓

Monitor

↓

Improve
```

Mỗi vòng lặp đều giúp hệ thống tốt hơn.

---

# Deliverables của Chương 14

Sau chương này, chúng ta phải có:

* Software Quality Strategy.
* Testing Pyramid Guideline.
* Unit Testing Standard.
* Integration Testing Standard.
* Contract Testing Strategy.
* End-to-End Testing Strategy.
* Performance Testing Plan.
* Security Testing Plan.
* Test Data Strategy.
* Quality Gate Policy.
* Quality Metrics Dashboard.

Đây là tài liệu đảm bảo chất lượng cho toàn bộ dự án.

---

# Những gì chúng ta vẫn chưa làm

Đến cuối chương này, chúng ta vẫn chưa:

* Viết Unit Test.
* Viết Integration Test.
* Viết E2E Test.
* Cấu hình Test Runner.
* Tạo Pipeline kiểm thử.

Đó là chủ ý.

Chúng ta đang thiết kế chiến lược chất lượng trước khi triển khai.

---

# Engineering Mindset

Một Junior thường hỏi:

> "Em có cần viết Test không?"

Một Mid thường hỏi:

> "Coverage bao nhiêu phần trăm là đủ?"

Một Staff Engineer sẽ hỏi:

> **"Nếu ngày mai có 50 lập trình viên cùng sửa hệ thống, làm thế nào để chúng ta phát hiện ngay một thay đổi làm sai Business Rule trước khi nó đến Production?"**

Đó là bản chất của Software Quality.

Không phải tìm Bug.

Mà là **ngăn Bug xuất hiện ngay từ đầu**.

---

# Chuẩn đầu ra của Chương 14

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Thiết kế chiến lược đảm bảo chất lượng cho hệ thống Enterprise.
* Xây dựng Testing Pyramid phù hợp với kiến trúc DDD và Modular Monolith.
* Thiết kế Unit Test, Integration Test, Contract Test và End-to-End Test.
* Xây dựng Quality Gates và Test Automation trong CI/CD.
* Định nghĩa các chỉ số chất lượng để theo dõi và cải tiến liên tục.
* Chuẩn bị nền tảng để triển khai bộ kiểm thử tự động khi bắt đầu viết mã nguồn.

> **Chương 15 sẽ là Implementation Blueprint & Development Standards. Đây là chương cuối của giai đoạn kiến trúc. Chúng ta sẽ chuẩn hóa toàn bộ cách triển khai dự án: cấu trúc thư mục, quy ước coding, Clean Architecture, DDD trong mã nguồn, Error Handling, Logging, Dependency Injection, Coding Standards, Documentation Standards và Development Workflow. Sau chương này, chúng ta sẽ chính thức bắt đầu viết dòng code đầu tiên của AEOS.**
