# Senior Fullstack Engineer Residency

# Chương 7 – Database Architecture & Physical Data Modeling

> **"Đây là chương đầu tiên chúng ta thực sự thiết kế cơ sở dữ liệu. Nhưng mục tiêu không phải là tạo bảng, mà là xây dựng một nền tảng dữ liệu có thể vận hành nhiều năm mà không phải thiết kế lại."**

Sau Chương 6, chúng ta đã có:

* Domain Model.
* Aggregate.
* Persistence Model.
* Data Ownership.
* Data Lifecycle.
* Data Consistency.
* Audit Strategy.
* Versioning Strategy.

Đây là thời điểm chúng ta chuyển từ **Logical Data Model** sang **Physical Data Model**.

Nói cách khác.

Từ hôm nay, mọi quyết định sẽ ảnh hưởng trực tiếp đến hiệu năng, khả năng mở rộng và chi phí vận hành của toàn bộ hệ thống.

---

# Mục tiêu của chương

Sau chương này chúng ta phải quyết định được:

* Vì sao chọn PostgreSQL?
* Vì sao cần Redis?
* Vì sao cần Object Storage?
* Vì sao cần OpenSearch?
* Database sẽ được tổ chức như thế nào?
* Bảng nào sẽ được tạo?
* Khóa chính sử dụng loại gì?
* Có sử dụng Foreign Key không?
* Index được thiết kế ra sao?
* Partition khi nào?
* Backup như thế nào?

Đây là bản thiết kế vật lý của toàn bộ nền tảng dữ liệu.

---

# 1. Database Technology Selection

Một Senior không chọn công nghệ vì xu hướng.

Họ chọn công nghệ dựa trên đặc điểm của dữ liệu.

## PostgreSQL

Lưu trữ dữ liệu nghiệp vụ.

Ví dụ.

* Workspace.
* Project.
* Task.
* Workflow.
* Document Metadata.
* Permission.
* Audit Metadata.

Lý do.

* ACID.
* MVCC.
* Transaction mạnh.
* JSONB.
* Full Text Search.
* Partitioning.
* Logical Replication.

---

## Redis

Không lưu dữ liệu nghiệp vụ.

Redis dùng cho:

* Cache.
* Session.
* Rate Limit.
* Distributed Lock.
* Queue Metadata.
* Temporary Token.

Nếu Redis mất dữ liệu.

Hệ thống vẫn phải hoạt động.

---

## Object Storage

Không lưu file trong PostgreSQL.

File sẽ được lưu trên Object Storage.

Ví dụ.

* Image.
* Video.
* PDF.
* Word.
* Excel.
* Backup.

Database chỉ lưu Metadata.

---

## OpenSearch

Không dùng PostgreSQL để tìm kiếm toàn văn ở quy mô lớn.

OpenSearch lưu:

* Search Index.
* Full Text Index.
* AI Hybrid Search.
* Autocomplete.

---

# 2. Database Topology

Ngay cả khi triển khai Modular Monolith.

Chúng ta vẫn phân chia dữ liệu theo Domain.

```text id="5pr8xa"
PostgreSQL

├── identity
├── workspace
├── project
├── task
├── knowledge
├── workflow
├── notification
├── analytics
└── audit
```

Ban đầu có thể cùng nằm trong một Database.

Nhưng mỗi Domain có Schema hoặc Namespace riêng.

Điều này giúp việc tách Microservice sau này đơn giản hơn rất nhiều.

---

# 3. Primary Key Strategy

Đây là quyết định rất quan trọng.

Không dùng Auto Increment.

AEOS sẽ sử dụng:

* UUID v7 (ưu tiên).
* Hoặc ULID.

Lý do.

* Phân tán.
* Không lộ số lượng dữ liệu.
* Hỗ trợ Merge.
* Tăng hiệu quả Index so với UUID v4.

Mọi Aggregate đều sử dụng cùng một chuẩn ID.

---

# 4. Foreign Key Strategy

Một chủ đề gây tranh luận.

Trong AEOS.

Chúng ta chia thành hai cấp.

## Trong cùng Bounded Context

Sử dụng Foreign Key.

Ví dụ.

Task.

Checklist.

Comment.

Subtask.

---

## Khác Bounded Context

Không sử dụng Foreign Key.

Ví dụ.

Task lưu:

```text
project_id
```

Nhưng PostgreSQL không tạo FK sang Project.

Lý do.

Các Context phải độc lập.

Đây là nền tảng để sau này chuyển sang Microservices mà không phải thay đổi Schema.

---

# 5. Table Design Principles

Mỗi bảng phải trả lời được.

* Nó thuộc Context nào?
* Aggregate nào sở hữu?
* Có Soft Delete không?
* Có Audit không?
* Có Version không?
* Có cần Partition không?

Không được tạo bảng chỉ vì "có vẻ sẽ cần".

---

# 6. Audit Columns Standard

Toàn bộ bảng nghiệp vụ sẽ thống nhất.

Ví dụ.

```text id="z1x7hb"
id

created_at

created_by

updated_at

updated_by

deleted_at

deleted_by

version
```

Việc chuẩn hóa này giúp:

* Audit.
* Optimistic Locking.
* Soft Delete.
* Migration.

---

# 7. Index Strategy

Index không được tạo theo cảm tính.

Mỗi Index phải phục vụ một Query.

Ví dụ.

Task.

```text id="2kw9fr"
(project_id)

(assignee_id)

(status)

(priority)

(due_date)

(project_id, status)

(project_id, assignee_id)
```

Document.

```text id="y8mn5q"
(workspace_id)

(folder_id)

(published_at)

(author_id)
```

Nếu không có Query.

Không tạo Index.

---

# 8. JSON hay Relational?

Một Senior luôn tự hỏi.

"Dữ liệu này có cần Query không?"

Nếu câu trả lời là Có.

=> Relational.

Nếu:

* Metadata.
* Dynamic Config.
* Plugin Setting.
* Workflow Config.

=> JSONB.

Không dùng JSON chỉ để "linh hoạt hơn".

---

# 9. Partition Strategy

Không phải bảng nào cũng Partition.

Ví dụ.

Task.

Khoảng vài triệu bản ghi.

Không cần.

Audit Log.

Hàng trăm triệu bản ghi.

Nên Partition theo thời gian.

Ví dụ.

```text id="s4mj8p"
audit_log_2026_01

audit_log_2026_02

audit_log_2026_03
```

Analytics.

Notification History.

Workflow History.

Đều là ứng viên tốt.

---

# 10. Read & Write Pattern

Không phải bảng nào cũng có cùng đặc điểm.

Ví dụ.

Workspace.

Read nhiều.

Write ít.

---

Task.

Read rất nhiều.

Write nhiều.

---

Audit.

Write cực nhiều.

Read rất ít.

---

Search.

Read cực nhiều.

Write bất đồng bộ.

Việc hiểu đặc điểm truy cập sẽ quyết định:

* Index.
* Partition.
* Cache.
* Replication.

---

# 11. Backup Strategy

Không phải Backup toàn bộ giống nhau.

Ví dụ.

Critical.

* Workspace.
* Project.
* Document.
* Permission.

Backup liên tục.

---

Search Index.

Có thể rebuild.

Không cần Backup thường xuyên.

---

Redis.

Không phải dữ liệu nghiệp vụ.

Có thể khởi tạo lại.

---

# 12. Migration Strategy

Database sẽ thay đổi liên tục.

Nguyên tắc.

* Migration luôn tăng tiến.
* Không chỉnh sửa Migration cũ.
* Rollback phải được tính trước.
* Production Migration phải tương thích ngược.

Đây là nền tảng của Continuous Delivery.

---

# 13. Database Anti-pattern

Những điều tuyệt đối tránh.

* Một bảng lưu mọi thứ.
* JSON cho dữ liệu quan hệ.
* Cascade Delete tràn lan.
* Không có Index.
* Composite Primary Key quá phức tạp.
* Trigger chứa Business Logic.
* FK xuyên Bounded Context.
* Query N+1.
* Thiếu Soft Delete ở dữ liệu nghiệp vụ.
* Không có Audit.

Đây là những nguyên nhân phổ biến khiến hệ thống khó mở rộng.

---

# Deliverables của Chương 7

Sau chương này, chúng ta phải có:

* Database Technology Decision Record.
* Database Topology Diagram.
* Physical Data Model.
* Primary Key Strategy.
* Foreign Key Strategy.
* Table Design Guideline.
* Indexing Guideline.
* JSONB Usage Guideline.
* Partition Strategy.
* Backup Strategy.
* Migration Strategy.
* Database Best Practices.

Đây là tài liệu định hướng cho toàn bộ đội phát triển trước khi tạo bảng dữ liệu đầu tiên.

---

# Những gì chúng ta vẫn chưa làm

Đến cuối chương này, chúng ta vẫn chưa:

* Vẽ ERD chi tiết.
* Viết Prisma Schema.
* Sinh Migration.
* Tạo bảng trong PostgreSQL.

Đó là chủ ý.

Chúng ta đã hoàn thành **kiến trúc dữ liệu vật lý**, nhưng chưa bắt đầu triển khai.

---

# Engineering Mindset

Một Junior thường hỏi:

> "Bảng này nên có bao nhiêu cột?"

Một Mid thường hỏi:

> "Có nên thêm Index không?"

Một Senior sẽ hỏi:

> **"Thiết kế dữ liệu này còn hoạt động tốt khi hệ thống có một tỷ bản ghi và nhiều đội phát triển cùng làm việc không?"**

Đó là khác biệt giữa một cơ sở dữ liệu chỉ chạy được và một nền tảng dữ liệu có thể đồng hành cùng sản phẩm trong nhiều năm.

---

# Chuẩn đầu ra của Chương 7

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Thiết kế kiến trúc cơ sở dữ liệu cho hệ thống Enterprise.
* Lựa chọn đúng công nghệ lưu trữ cho từng loại dữ liệu.
* Xây dựng chiến lược khóa chính, khóa ngoại và Index.
* Thiết kế Partition, Backup và Migration cho Production.
* Tránh các Database Anti-pattern thường gặp trong các hệ thống lớn.

> **Chương 8 sẽ là System Architecture. Đây là chương chúng ta chuyển từ tầng dữ liệu lên tầng hệ thống: quyết định kiến trúc tổng thể (Modular Monolith hay Microservices), thiết kế C4 Model, các thành phần của hệ thống, giao tiếp giữa các Context và chuẩn bị cho việc xây dựng kiến trúc production-ready.**
