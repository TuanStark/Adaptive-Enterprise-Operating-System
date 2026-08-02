# Senior Fullstack Engineer Residency

# Chương 8 – System Architecture (Kiến trúc tổng thể hệ thống)

> **"Đây là chương đầu tiên chúng ta thiết kế toàn bộ hệ thống. Không còn nhìn từng Domain riêng lẻ, mà nhìn AEOS như một nền tảng Enterprise hoàn chỉnh."**

Đến thời điểm này, chúng ta đã hoàn thành:

* Business Discovery.
* Business Process Modeling.
* Domain Discovery.
* Domain Modeling.
* Data Architecture.
* Database Architecture.

Bây giờ chúng ta phải trả lời câu hỏi lớn nhất:

> **AEOS sẽ được xây dựng như thế nào để có thể phục vụ từ vài chục đến hàng triệu người dùng mà không phải viết lại toàn bộ kiến trúc?**

Đây là công việc của **Solution Architect**.

---

# Mục tiêu của chương

Sau chương này, chúng ta phải quyết định được:

* Kiến trúc tổng thể của hệ thống.
* Phong cách kiến trúc (Architectural Style).
* Cách các thành phần giao tiếp với nhau.
* Chiến lược mở rộng hệ thống.
* Chiến lược triển khai.
* Kiến trúc Production.

Đây là tài liệu có ảnh hưởng lớn nhất đến toàn bộ dự án.

---

# 1. Kiến trúc tổng thể

Có rất nhiều lựa chọn.

Ví dụ.

* Layered Architecture
* Hexagonal Architecture
* Clean Architecture
* Microservices
* Event Driven Architecture
* Modular Monolith
* Service Oriented Architecture

Không có mô hình nào luôn tốt nhất.

Chúng ta phải lựa chọn theo giai đoạn phát triển của sản phẩm.

---

# 2. Kiến trúc của AEOS

Đối với phiên bản đầu tiên.

Chúng ta lựa chọn:

> **Modular Monolith + Domain-Driven Design + Event-Driven Internal Architecture.**

Lý do.

* Phát triển nhanh.
* Dễ Debug.
* Một lần Deploy.
* Một Transaction.
* Không có Distributed Transaction.
* Không phát sinh độ phức tạp của Microservices quá sớm.

Tuy nhiên.

Toàn bộ hệ thống sẽ được thiết kế để có thể tách thành Microservices trong tương lai.

---

# 3. Kiến trúc phân lớp

Toàn bộ hệ thống sẽ tuân theo kiến trúc nhiều lớp.

```text id="91xqmn"
Presentation Layer

↓

Application Layer

↓

Domain Layer

↓

Infrastructure Layer
```

## Presentation Layer

Chịu trách nhiệm:

* REST API.
* GraphQL.
* WebSocket.
* Authentication.
* Request Validation.
* DTO Mapping.

Không chứa Business Logic.

---

## Application Layer

Điều phối Use Case.

Ví dụ.

* Create Project.
* Publish Document.
* Invite Member.
* Execute Workflow.

Application Layer không chứa Business Rule.

Nó chỉ điều phối.

---

## Domain Layer

Đây là trái tim của hệ thống.

Bao gồm:

* Aggregate.
* Entity.
* Value Object.
* Domain Service.
* Domain Event.
* Repository Interface.

Đây là nơi chứa toàn bộ Business Rule.

---

## Infrastructure Layer

Bao gồm:

* PostgreSQL.
* Redis.
* OpenSearch.
* Object Storage.
* Email.
* Kafka (tương lai).
* AI Provider.
* Third-party Integration.

Infrastructure chỉ thực hiện các Interface do Domain và Application định nghĩa.

---

# 4. C4 Model

Chúng ta sẽ mô hình hóa hệ thống theo C4 Model.

## Level 1 – System Context

AEOS giao tiếp với:

* Người dùng.
* GitHub.
* Google Workspace.
* Slack.
* Email Provider.
* AI Provider.
* Object Storage.

---

## Level 2 – Container Diagram

Các Container chính.

```text id="2kzv8p"
Web Application

↓

API Server

↓

PostgreSQL

↓

Redis

↓

OpenSearch

↓

Object Storage

↓

AI Provider
```

Đây là mức nhìn của DevOps và Solution Architect.

---

## Level 3 – Component Diagram

Trong API Server.

```text id="g7m4jd"
Workspace Module

Project Module

Task Module

Knowledge Module

Workflow Module

Notification Module

AI Module

Search Module

Identity Module
```

Mỗi Module là một Bounded Context.

---

# 5. Internal Communication

Trong Modular Monolith.

Có hai hình thức giao tiếp.

## Đồng bộ

Application Service gọi trực tiếp sang Interface của Context khác khi cần phản hồi ngay.

Ví dụ.

```text id="q8bnc5"
Create Task

↓

Permission Service

↓

Validate Permission

↓

Continue
```

---

## Bất đồng bộ

Thông qua Domain Event.

Ví dụ.

```text id="h5rtx2"
Document Published

↓

Domain Event

↓

Search Update

↓

AI Summary

↓

Notification
```

Điều này giúp giảm Coupling.

---

# 6. Module Independence

Một Module phải độc lập.

Ví dụ.

Task Module.

Không được Import trực tiếp Repository của Document.

Không được Query Database của Project.

Không được sửa Aggregate của Workspace.

Mọi giao tiếp đều phải đi qua:

* Interface.
* Domain Event.
* Application Service.

Đây là nền tảng để sau này tách Microservices.

---

# 7. Transaction Boundary

Một Transaction chỉ tồn tại trong một Bounded Context.

Ví dụ.

Create Task.

```text id="l2fh91"
Task Aggregate

↓

Commit Transaction

↓

Publish Event
```

Sau khi Transaction thành công.

Các Context khác sẽ phản ứng thông qua Event.

Không có Transaction kéo dài qua nhiều Context.

---

# 8. Read Model & Write Model

AEOS áp dụng mô hình:

* Write Model tập trung vào tính đúng đắn của nghiệp vụ.
* Read Model tối ưu cho truy vấn.

Ví dụ.

Dashboard.

Không truy vấn trực tiếp từ Aggregate.

Có thể đọc từ:

* Materialized View.
* Read Projection.
* Search Index.
* Analytics Store.

Điều này giúp giảm tải cho dữ liệu nghiệp vụ.

---

# 9. Cross-cutting Concerns

Có nhiều chức năng xuất hiện ở mọi Module.

Ví dụ.

* Authentication.
* Authorization.
* Audit.
* Logging.
* Validation.
* Metrics.
* Tracing.
* Configuration.
* Feature Flag.

Những thành phần này không thuộc Business Domain.

Chúng sẽ được triển khai như Shared Infrastructure hoặc Shared Kernel, tùy theo mức độ liên quan đến nghiệp vụ.

---

# 10. Architectural Decision Records (ADR)

Mỗi quyết định kiến trúc đều phải được ghi lại.

Ví dụ.

## ADR-001

**Quyết định**

Sử dụng Modular Monolith.

**Lý do**

* Đội ngũ nhỏ.
* Deploy đơn giản.
* Chi phí thấp.
* Dễ kiểm thử.

**Trade-off**

Sau này cần kế hoạch tách Module nếu quy mô tăng.

---

## ADR-002

**Quyết định**

Sử dụng PostgreSQL.

**Lý do**

* ACID.
* JSONB.
* Full Text Search.
* Hệ sinh thái mạnh.

---

## ADR-003

**Quyết định**

Không sử dụng Foreign Key xuyên Bounded Context.

**Lý do**

* Giảm Coupling.
* Chuẩn bị cho Microservices.

ADR giúp đội ngũ hiểu vì sao một quyết định được đưa ra, tránh lặp lại các cuộc tranh luận trong tương lai.

---

# 11. Evolution Strategy

Kiến trúc phải có khả năng phát triển.

Lộ trình dự kiến.

```text id="f4vp7d"
Modular Monolith

↓

Modular Monolith + Internal Events

↓

Message Broker

↓

Extract Module

↓

Microservices

↓

Event-Driven Platform
```

Chúng ta không thiết kế Microservices ngay từ đầu.

Chúng ta thiết kế để **có thể tiến hóa**.

---

# 12. Deliverables của Chương 8

Sau chương này, chúng ta phải có:

* Software Architecture Document.
* C4 Model (Level 1, 2, 3).
* Architecture Style Decision.
* Module Interaction Diagram.
* Transaction Boundary Map.
* Read/Write Strategy.
* Cross-cutting Concern Catalogue.
* Architectural Decision Records.
* Evolution Roadmap.

Đây là tài liệu kiến trúc tổng thể của AEOS.

---

# Những gì chúng ta vẫn chưa làm

Đến cuối chương này, chúng ta vẫn chưa:

* Viết API.
* Thiết kế Endpoint.
* Viết Source Code.
* Tạo Dockerfile.
* Triển khai Kubernetes.

Bởi vì kiến trúc hệ thống phải ổn định trước khi bắt đầu triển khai.

---

# Engineering Mindset

Một Junior thường hỏi:

> "Em nên dùng Microservices hay Modular Monolith?"

Một Mid thường hỏi:

> "Kiến trúc nào hiệu năng tốt hơn?"

Một Solution Architect sẽ hỏi:

> **"Kiến trúc nào phù hợp nhất với giai đoạn phát triển của sản phẩm, năng lực đội ngũ và khả năng mở rộng trong 3–5 năm tới?"**

Không có kiến trúc tốt nhất.

Chỉ có kiến trúc phù hợp nhất với bối cảnh của dự án.

---

# Chuẩn đầu ra của Chương 8

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Thiết kế kiến trúc tổng thể cho một hệ thống Enterprise.
* Phân chia Module theo Bounded Context.
* Thiết kế giao tiếp đồng bộ và bất đồng bộ giữa các Module.
* Xác định Transaction Boundary và chiến lược Read/Write.
* Ghi nhận và quản lý các quyết định kiến trúc bằng ADR.
* Xây dựng một kiến trúc có thể tiến hóa từ Modular Monolith sang Microservices mà không phải thiết kế lại từ đầu.

> **Chương 9 sẽ là API & Integration Architecture. Chúng ta sẽ thiết kế Public API, Internal API, Event Contract, Webhook, Authentication, Authorization, Versioning, Idempotency, Error Handling và Integration Strategy để AEOS có thể giao tiếp an toàn với các ứng dụng và dịch vụ bên ngoài.**
