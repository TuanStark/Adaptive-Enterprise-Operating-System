# AEOS - Tài liệu Yêu cầu Nghiệp vụ & Kiến trúc Cấp độ Doanh nghiệp (Enterprise BRD/Architecture)

## 1. Tóm tắt Thực thi (Executive Summary)
**AEOS (Atlas Enterprise Operating System)** không phải là một phần mềm đơn lẻ. Đây là một nền tảng vận hành doanh nghiệp hợp nhất, được sinh ra để giải quyết bài toán phân mảnh công cụ (thay thế Notion, Jira, Slack, Zapier, v.v.). Hệ thống được thiết kế cực kỳ nghiêm ngặt theo phương pháp luận **Domain-Driven Design (DDD)** và kiến trúc ban đầu là **Modular Monolith** có khả năng tiến hóa thành Event-Driven Microservices.

---

## 2. Bản đồ Năng lực Nghiệp vụ (Business Capability Map & Bounded Contexts)

Hệ thống được chia thành 12 **Bounded Contexts** độc lập, được phân nhóm theo mức độ ưu tiên chiến lược:

### 2.1 Core Domains (Tạo ra lợi thế cạnh tranh)
1. **Knowledge Management**: Quản lý tri thức, vòng đời Document (Draft -> In Review -> Published), quản lý version.
2. **Workflow Automation**: Engine tự động hóa quy trình (Tương tự Zapier nội bộ).
3. **AI Assistant**: Trợ lý AI ngữ cảnh hóa (tổng hợp tài liệu, trích xuất action items từ cuộc họp).
4. **Unified Search**: Tìm kiếm hợp nhất xuyên suốt toàn bộ Contexts với cơ chế phân quyền (Permission Filtering).

### 2.2 Supporting Domains (Quan trọng nhưng không tạo khác biệt cốt lõi)
5. **Project Management**: Vòng đời dự án, nhóm công việc.
6. **Task Management**: Giao việc, theo dõi tiến độ, máy trạng thái công việc.
7. **Notification**: Thông báo (In-App, Email, Push) bất đồng bộ.
8. **Analytics**: Báo cáo, tổng hợp dữ liệu (Read Models).

### 2.3 Generic Domains (Có thể dùng giải pháp có sẵn)
9. **Identity & Access**: Xác thực (JWT), SSO, Quản lý tài khoản.
10. **Workspace Management**: Cách ly dữ liệu (Tenancy), cấu hình tổ chức.
11. **Integration**: Giao tiếp với External Systems (Github, Google Drive).
12. **Audit**: Lưu vết (Audit Logs) bất biến cho toàn hệ thống.

---

## 3. Kiến trúc Tổng thể (System Architecture)

Dựa theo nguyên tắc của **Solution Architect**, AEOS tuân thủ các quyết định kiến trúc (ADRs) sau:

### 3.1 Architectural Decision Records (ADR)
- **ADR-001 (Architectural Style):** Sử dụng **Modular Monolith**. Phát triển nhanh, deploy một lần, chia package rõ ràng để chuẩn bị tách Microservices khi quy mô đạt >100 developers.
- **ADR-002 (Communication):** 
  - **Đồng bộ (Sync):** Application Service gọi Interface của Context khác (chỉ khi cần Validation tức thời).
  - **Bất đồng bộ (Async):** Giao tiếp qua **Domain Events** (Internal Event Bus) để giảm Coupling (VD: Document Published -> Update Search Index).
- **ADR-003 (Database Strategy):** PostgreSQL cho Transactional (Write Model), OpenSearch cho Unified Search (Read Model), Redis cho Caching/Pub-Sub. Tuyệt đối không dùng Foreign Key xuyên Bounded Context.

### 3.2 Lớp Kiến trúc (Layered Architecture)
Mỗi Bounded Context được tổ chức theo Clean/Hexagonal Architecture:
1. **Presentation Layer**: Controller, REST API, DTO Mapping.
2. **Application Layer**: Điều phối Use Cases (Không chứa Business Rules).
3. **Domain Layer (Trái tim):** Aggregate Roots, Value Objects, Domain Services, Domain Events (Ví dụ: `Workspace`, `Priority`, `Task Completed Event`).
4. **Infrastructure Layer**: Database Repository implementations, API Clients bên ngoài.

---

## 4. Yêu cầu Phi chức năng Nghiêm ngặt (NFR)

- **Độc lập Module (Module Independence):** Một Transaction Database chỉ tồn tại trong giới hạn của MỘT Bounded Context duy nhất. Mọi thay đổi ảnh hưởng đến Context khác phải dùng Eventual Consistency (Outbox Pattern).
- **Performance:** Write Model (DB) tối ưu cho tính đúng đắn. Read Model (CQRS) tối ưu cho truy vấn (Latency < 200ms).
- **Security:** Mọi truy cập vào Aggregate phải thông qua Permission Check (Ví dụ: AI Assistant phải tôn trọng quyền đọc tài liệu của người đang truy vấn).
