# Senior Fullstack Engineer Residency

## Phase 1 – Foundation Engineering

# Day 5 – Product Engineering: PRD, User Story & Requirement Analysis

> **"Một hệ thống thất bại không phải vì code tệ, mà vì đội phát triển xây sai thứ khách hàng cần."**

Sau Day 4, chúng ta đã có kiến trúc của hệ thống.

Nhưng vẫn còn một câu hỏi rất quan trọng:

> **Chúng ta sẽ xây cái gì trước?**

Đây không còn là công việc của Software Architect.

Đây là công việc của **Product Manager**, **Business Analyst** và **Tech Lead**.

Một Senior Engineer không chỉ biết đọc yêu cầu.

Họ biết cách **phân tích, phản biện và làm rõ yêu cầu** trước khi Sprint đầu tiên bắt đầu.

---

# 1. Product Requirement Document (PRD)

PRD (Product Requirement Document) là tài liệu mô tả **điều gì cần được xây dựng và tại sao cần xây dựng**.

PRD không chứa code.

PRD cũng không mô tả Database.

PRD trả lời các câu hỏi:

* Sản phẩm giải quyết vấn đề gì?
* Ai sẽ sử dụng?
* Họ đang gặp khó khăn gì?
* Thành công được đo bằng điều gì?
* Phạm vi của phiên bản đầu tiên là gì?

PRD là cầu nối giữa Business và Engineering.

Nếu PRD sai.

Toàn bộ hệ thống có thể được xây đúng về mặt kỹ thuật nhưng vẫn thất bại về mặt sản phẩm.

---

# 2. Product Vision

Đối với AEOS.

Product Vision được định nghĩa như sau.

> **Xây dựng một nền tảng Enterprise giúp doanh nghiệp quản lý tri thức, cộng tác và tự động hóa công việc trên một hệ thống thống nhất, thay thế việc sử dụng nhiều công cụ rời rạc.**

Đây sẽ là kim chỉ nam cho mọi quyết định về sau.

Một tính năng mới chỉ được thêm vào khi nó phục vụ Product Vision.

---

# 3. Target Customer

Một sai lầm phổ biến là viết:

> "Dành cho tất cả mọi người."

Một sản phẩm tốt luôn xác định rõ khách hàng mục tiêu.

Đối với AEOS.

## Primary Customer

* Startup.
* Công ty vừa và nhỏ.
* Công ty công nghệ.
* Đội phát triển phần mềm.

---

## Secondary Customer

* Marketing Team.
* HR Team.
* Sales Team.
* Customer Success.

---

## Internal User

* Owner.
* Admin.
* Manager.
* Member.
* Guest.

---

# 4. Problem Statement

Mỗi sản phẩm đều phải giải quyết những vấn đề cụ thể.

AEOS hướng tới các vấn đề sau.

## Vấn đề 1

Thông tin nằm rải rác.

Ví dụ.

* Google Drive.
* Slack.
* Notion.
* Jira.

Nhân viên mất rất nhiều thời gian để tìm kiếm.

---

## Vấn đề 2

Không có nguồn dữ liệu thống nhất.

Một tài liệu được cập nhật.

Nhưng nhiều hệ thống khác không biết.

---

## Vấn đề 3

Quy trình làm việc thủ công.

Ví dụ.

Upload tài liệu.

↓

Thông báo.

↓

Đánh chỉ mục.

↓

Tóm tắt AI.

↓

Gửi Email.

Tất cả đều làm bằng tay.

---

## Vấn đề 4

Khó kiểm soát quyền truy cập.

Nhiều hệ thống.

Nhiều tài khoản.

Nhiều Role.

Khó quản lý.

---

# 5. Success Metrics

Một Product Manager luôn xác định cách đo thành công.

Ví dụ.

Không phải.

> "Có chức năng Search."

Mà là.

* Thời gian tìm tài liệu giảm từ 5 phút xuống dưới 30 giây.
* 95% tài liệu được tìm thấy trong lần tìm kiếm đầu tiên.
* AI trả lời dưới 5 giây.
* API phản hồi dưới 200ms.
* Uptime đạt 99.9%.

Đây gọi là **Product Metrics**.

---

# 6. Functional Requirements

Functional Requirement mô tả hệ thống **phải làm được gì**.

Ví dụ.

## Authentication

* Đăng ký Workspace.
* Đăng nhập.
* Đăng xuất.
* Quên mật khẩu.
* MFA.
* OAuth.

---

## Workspace

* Tạo Workspace.
* Đổi tên Workspace.
* Mời thành viên.
* Phân quyền.
* Xóa thành viên.

---

## Project

* Tạo Project.
* Cập nhật Project.
* Archive Project.

---

## Task

* Tạo Task.
* Giao Task.
* Đổi trạng thái.
* Comment.
* Attachment.

---

## Document

* Upload.
* Versioning.
* Share.
* Search.
* AI Summary.

---

# 7. Non-Functional Requirements

Senior Engineer luôn dành rất nhiều thời gian cho phần này.

## Performance

95% API phản hồi dưới 200ms.

---

## Availability

99.9% uptime.

---

## Scalability

Có thể mở rộng theo chiều ngang.

---

## Security

* RBAC.
* MFA.
* Audit Log.
* Encryption.
* Rate Limiting.

---

## Reliability

Không mất dữ liệu khi Worker gặp lỗi.

---

## Maintainability

Module độc lập.

Code dễ đọc.

---

## Observability

* Logging.
* Metrics.
* Tracing.
* Alerting.

---

# 8. User Story

User Story giúp đội phát triển hiểu giá trị của từng tính năng.

Ví dụ.

> **As an Admin, I want to invite a new member so that they can collaborate in my workspace.**

Một User Story tốt luôn có ba thành phần.

* Ai?
* Muốn làm gì?
* Để đạt được điều gì?

---

Ví dụ khác.

> **As a Member, I want to upload a document so that everyone in my team can access it.**

---

# 9. Acceptance Criteria

Một User Story chưa đủ.

Chúng ta cần định nghĩa điều kiện hoàn thành.

Ví dụ.

**User Story**

Admin mời thành viên.

Acceptance Criteria.

* Email hợp lệ.
* Người được mời nhận Email.
* Link hết hạn sau 24 giờ.
* Không thể mời trùng.
* Ghi Audit Log.
* Gửi Notification.

Đây là tiêu chuẩn để QA kiểm thử.

---

# 10. Use Case

Use Case mô tả cách người dùng tương tác với hệ thống.

Ví dụ.

## Upload Document

Actor.

Member.

Luồng chính.

1. Chọn File.
2. Upload.
3. Hệ thống lưu Object Storage.
4. Sinh Metadata.
5. Sinh Domain Event.
6. Đánh chỉ mục Search.
7. AI tạo Summary.
8. Gửi Notification.

Luồng ngoại lệ.

* File quá lớn.
* Virus.
* Mất kết nối.
* Không đủ quyền.

---

# 11. Business Flow

Business Flow giúp chúng ta nhìn thấy toàn bộ quy trình.

Ví dụ.

```id="vzrp6o"
Upload Document

↓

Permission Validation

↓

Store Object

↓

Create Metadata

↓

Publish Event

↓

Generate Embedding

↓

Update Search

↓

Generate Summary

↓

Notify Member

↓

Record Audit
```

Một Business Flow thường đi qua nhiều Domain khác nhau.

---

# 12. MVP Prioritization

Không phải tính năng nào cũng được xây trước.

Chúng ta sẽ sử dụng phương pháp MoSCoW.

## Must Have

* Authentication.
* Workspace.
* Project.
* Task.
* Document.

---

## Should Have

* Search.
* Notification.
* Activity.

---

## Could Have

* Calendar.
* AI Summary.
* Automation.

---

## Won't Have (Version 0.1)

* Marketplace.
* Plugin.
* Billing.
* SDK.

---

# 13. Definition of Ready (DoR)

Một User Story chỉ được đưa vào Sprint khi:

* Đã có Business Value.
* Có Acceptance Criteria.
* Có UI Flow.
* Có API Contract (nếu cần).
* Không còn yêu cầu mơ hồ.

---

# 14. Definition of Done (DoD)

Một tính năng chỉ được xem là hoàn thành khi:

* Code Review.
* Unit Test đạt yêu cầu.
* Integration Test thành công.
* Security Review hoàn tất.
* Logging đầy đủ.
* Monitoring được cấu hình.
* Documentation cập nhật.
* Triển khai thành công trên môi trường Staging.

Viết code xong **không đồng nghĩa với hoàn thành**.

---

# 15. Deliverables của Day 5

Sau Day 5 chúng ta phải có:

## Product Requirement Document (PRD)

Tài liệu mô tả đầy đủ sản phẩm.

---

## Functional Requirements

Danh sách chức năng.

---

## Non-Functional Requirements

Danh sách yêu cầu phi chức năng.

---

## User Story Catalogue

Danh sách User Story.

---

## Acceptance Criteria

Tiêu chí kiểm thử.

---

## Use Case Specification

Luồng nghiệp vụ.

---

## Business Flow

Luồng xử lý của hệ thống.

---

## MVP Roadmap

Lộ trình phát triển theo từng phiên bản.

---

# Engineering Mindset

Một Junior nhận yêu cầu và bắt đầu code.

Một Senior sẽ hỏi:

* Người dùng thực sự cần gì?
* Có cách đơn giản hơn không?
* Nếu yêu cầu thay đổi thì kiến trúc có chịu được không?
* Làm sao để QA biết tính năng đã hoàn thành?
* Làm sao để Product Manager đo được giá trị của tính năng này?

Đó là lý do Senior Engineer luôn quan tâm đến **Business** trước khi quan tâm đến **Code**.

---

# Chuẩn đầu ra của Day 5

Sau khi hoàn thành Day 5, bạn sẽ có khả năng:

* Đọc và xây dựng Product Requirement Document (PRD).
* Chuyển yêu cầu nghiệp vụ thành Functional và Non-Functional Requirements.
* Viết User Story và Acceptance Criteria theo chuẩn Agile.
* Thiết kế Use Case và Business Flow.
* Ưu tiên tính năng bằng phương pháp MoSCoW.
* Xác định Definition of Ready (DoR) và Definition of Done (DoD).
* Làm việc hiệu quả với Product Manager, Business Analyst và QA trước khi bắt đầu Sprint.

> **Ngày 6, chúng ta sẽ chính thức bước vào Engineering Design. Chúng ta sẽ thiết kế Repository Strategy, Monorepo, Module Structure, Coding Standards, Git Workflow, Branching Strategy, Commit Convention, API Versioning và Engineering Guidelines. Đây sẽ là ngày đặt nền móng cho toàn bộ source code của AEOS trước khi tạo repository đầu tiên.**
