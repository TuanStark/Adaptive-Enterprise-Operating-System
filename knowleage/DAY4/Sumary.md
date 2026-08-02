# Senior Fullstack Engineer Residency

## Phase 1 – Foundation Engineering

# Day 4 – Software Architecture & Architectural Decision Making

> **"Code có thể thay đổi mỗi tuần. Kiến trúc có thể ảnh hưởng đến dự án trong nhiều năm."**

Sau ba ngày đầu tiên, chúng ta đã hiểu:

* Doanh nghiệp đang giải quyết vấn đề gì.
* Domain được chia như thế nào.
* Business hoạt động thông qua Event ra sao.

Hôm nay chúng ta sẽ trả lời câu hỏi quan trọng tiếp theo:

> **Hệ thống nên được xây như thế nào?**

Đây là công việc của một **Software Architect**.

---

# 1. Architecture là gì?

Rất nhiều người nghĩ Architecture là sơ đồ.

Ví dụ.

```
Client

↓

API

↓

Database
```

Đó không phải Architecture.

Architecture là tập hợp những quyết định có ảnh hưởng lâu dài đến hệ thống.

Ví dụ.

* Chia hệ thống thành bao nhiêu module?
* Monolith hay Microservices?
* Đồng bộ hay bất đồng bộ?
* SQL hay NoSQL?
* REST hay gRPC?
* Event-Driven hay Request/Response?
* Deploy như thế nào?
* Scale ra sao?

Những quyết định này sẽ ảnh hưởng đến hàng nghìn dòng code sau này.

---

# 2. Kiến trúc không phải mục tiêu

Một sai lầm phổ biến.

Startup vừa thành lập.

Có hai lập trình viên.

Nhưng lại xây ngay:

* Kubernetes
* Kafka
* Service Mesh
* Microservices
* Event Bus
* CQRS
* Saga

Hệ thống trở nên cực kỳ phức tạp.

Trong khi lượng người dùng chỉ vài chục người.

Đây gọi là **Over Engineering**.

Một Senior luôn nhớ nguyên tắc:

> **Architecture phải phục vụ Business, không phải phục vụ cái tôi của lập trình viên.**

---

# 3. Các kiểu kiến trúc phổ biến

## Layered Architecture

```
Presentation

↓

Application

↓

Domain

↓

Infrastructure

↓

Database
```

Ưu điểm:

* Dễ hiểu.
* Dễ học.
* Phù hợp dự án nhỏ.

Nhược điểm:

* Dễ tạo God Service.
* Khó mở rộng khi hệ thống lớn.

---

## Clean Architecture

```
Presentation

↓

Application

↓

Domain

↓

Infrastructure
```

Domain nằm ở trung tâm.

Framework chỉ là chi tiết triển khai.

Ưu điểm:

* Test dễ.
* Độc lập framework.
* Dễ bảo trì.

Nhược điểm:

* Khó tiếp cận với người mới.

---

## Hexagonal Architecture

Hay còn gọi là Ports & Adapters.

```
External World

↓

Adapter

↓

Port

↓

Domain

↓

Port

↓

Adapter

↓

Database
```

Mục tiêu là:

Domain không phụ thuộc vào Database, API hay Message Queue.

---

# 4. Monolith hay Microservices?

Đây là câu hỏi nổi tiếng nhất.

Và cũng là câu hỏi bị trả lời sai nhiều nhất.

---

## Monolith

Một ứng dụng.

Một Deployment.

Một Database.

Ưu điểm.

* Đơn giản.
* Debug dễ.
* Deploy nhanh.
* Phù hợp giai đoạn đầu.

Nhược điểm.

* Khó scale từng phần.
* Team lớn dễ xung đột.

---

## Microservices

Nhiều Service.

Mỗi Service có vòng đời riêng.

Ưu điểm.

* Scale độc lập.
* Deploy độc lập.
* Team độc lập.

Nhược điểm.

* Distributed System.
* Khó Debug.
* Khó Monitoring.
* Khó Transaction.
* Đòi hỏi hạ tầng tốt.

---

# 5. Modular Monolith

Đây là kiến trúc mình chọn cho AEOS.

```
AEOS

├── Identity
├── Workspace
├── Project
├── Task
├── Document
├── Notification
├── Search
├── AI
└── Automation
```

Tất cả nằm trong một ứng dụng.

Nhưng mỗi Module hoàn toàn độc lập.

Không được truy cập trực tiếp vào code của nhau.

Chỉ giao tiếp thông qua Public Interface hoặc Domain Event.

---

## Tại sao không chọn Microservices ngay?

Bởi vì:

* Chúng ta chưa có hàng triệu người dùng.
* Chưa có nhiều team phát triển độc lập.
* Chưa có nhu cầu deploy riêng từng module.

Modular Monolith giúp giữ được:

* Đơn giản của Monolith.
* Tính tách biệt của Microservices.

Đây là lựa chọn của rất nhiều công ty trong giai đoạn đầu.

---

# 6. C4 Model

Một Software Architect không chỉ vẽ một sơ đồ.

Họ mô tả hệ thống ở nhiều mức độ.

## Level 1 – System Context

Hệ thống tương tác với ai?

```
Employee

↓

AEOS

↓

Email

↓

AI Provider

↓

Object Storage
```

---

## Level 2 – Container

Hệ thống gồm những thành phần nào?

```
Web Application

API Server

Worker

Database

Redis

Search

Object Storage
```

---

## Level 3 – Component

API Server bao gồm những Module nào?

```
Identity

Workspace

Project

Task

Document

Notification

Search
```

---

## Level 4 – Code

Đi xuống mức Class.

Entity.

Interface.

Repository.

Đây là mức mà lập trình viên làm việc hàng ngày.

---

# 7. Architecture Decision Record (ADR)

Senior không đưa ra quyết định bằng cảm tính.

Mọi quyết định đều phải được ghi lại.

Ví dụ.

## ADR-001

**Decision**

Sử dụng PostgreSQL.

**Context**

Hệ thống cần ACID Transaction.

Quan hệ dữ liệu phức tạp.

**Alternative**

MongoDB.

**Trade-off**

MongoDB linh hoạt hơn.

Nhưng PostgreSQL phù hợp hơn với dữ liệu quan hệ.

---

## ADR-002

Sử dụng Modular Monolith.

Không dùng Microservices.

Lý do:

* Team nhỏ.
* MVP.
* Giảm độ phức tạp.
* Dễ Debug.

---

# 8. Quality Attributes

Một Software Architect không chỉ nghĩ đến chức năng.

Họ nghĩ đến chất lượng của hệ thống.

Ví dụ.

## Performance

API phản hồi dưới 200ms.

---

## Availability

Uptime 99.9%.

---

## Scalability

Hệ thống phải scale ngang.

---

## Security

Có RBAC.

MFA.

Audit Log.

Encryption.

---

## Maintainability

Code dễ đọc.

Dễ thay đổi.

---

## Observability

Có Logging.

Metrics.

Tracing.

---

## Reliability

Một Worker chết.

Hệ thống vẫn tiếp tục hoạt động.

---

# 9. Trade-off

Không tồn tại kiến trúc hoàn hảo.

Mọi quyết định đều có đánh đổi.

Ví dụ.

Microservices.

Ưu điểm.

* Scale tốt.

Nhược điểm.

* Debug khó.

---

REST.

Ưu điểm.

* Đơn giản.

Nhược điểm.

* Over Fetching.

---

Kafka.

Ưu điểm.

* Throughput cao.

Nhược điểm.

* Vận hành phức tạp.

Một Senior luôn hỏi:

> "Mình đang đánh đổi điều gì?"

---

# 10. Kiến trúc của AEOS

Sau khi phân tích.

Chúng ta quyết định.

```
Client

↓

Next.js

↓

API Gateway (NestJS)

↓

Modular Monolith

├── Identity
├── Workspace
├── Project
├── Task
├── Document
├── Notification
├── Search
├── AI
└── Automation

↓

PostgreSQL

↓

Redis

↓

Object Storage

↓

OpenSearch

↓

Background Worker
```

Đây sẽ là kiến trúc của Version 0.1.

Trong tương lai.

Khi một Module trở nên quá lớn.

Chúng ta sẽ tách Module đó thành Microservice.

Đây gọi là **Evolutionary Architecture**.

---

# 11. Anti-Patterns

Không chọn công nghệ vì xu hướng.

Không tách Microservice quá sớm.

Không dùng Event Bus cho mọi bài toán.

Không chia Module theo Database.

Không để Business Logic nằm trong Controller.

Không phụ thuộc trực tiếp vào Infrastructure trong Domain.

---

# 12. Deliverables của Day 4

Sau khi hoàn thành Day 4.

Chúng ta phải có.

## Architecture Vision

Mục tiêu kiến trúc.

---

## C4 Model

* Level 1
* Level 2
* Level 3

---

## Architecture Decision Records

Ít nhất:

* ADR-001 PostgreSQL.
* ADR-002 Modular Monolith.
* ADR-003 Event-Driven nội bộ.
* ADR-004 Redis.
* ADR-005 Object Storage.

---

## Quality Attribute Scenarios

Xác định các yêu cầu phi chức năng.

---

## Technology Radar

Phân loại công nghệ:

* Adopt
* Trial
* Assess
* Hold

---

# Engineering Mindset

Một Junior thường hỏi:

> "Làm sao để viết chức năng này?"

Một Senior sẽ hỏi:

> "Nếu sáu tháng nữa cần thay đổi chức năng này thì kiến trúc hiện tại có còn phù hợp không?"

Đó là sự khác biệt giữa **viết code** và **thiết kế hệ thống**.

---

# Chuẩn đầu ra của Day 4

Sau khi hoàn thành Day 4, bạn sẽ có khả năng:

* Phân biệt các phong cách kiến trúc phổ biến.
* Hiểu khi nào nên dùng Monolith, Modular Monolith hoặc Microservices.
* Thiết kế hệ thống bằng C4 Model.
* Ghi lại quyết định kỹ thuật bằng ADR.
* Đánh giá kiến trúc dựa trên Quality Attributes thay vì cảm tính.
* Phân tích Trade-off của từng quyết định kỹ thuật.
* Thiết kế kiến trúc có khả năng tiến hóa theo sự phát triển của sản phẩm.

> **Ngày 5, chúng ta sẽ bước vào giai đoạn Product Engineering. Chúng ta sẽ xây dựng Product Requirement Document (PRD), User Story, Use Case, Business Flow và Non-Functional Requirements. Đây là tài liệu mà Product Manager, Business Analyst và Engineering Team cùng sử dụng trước khi Sprint đầu tiên bắt đầu.**
