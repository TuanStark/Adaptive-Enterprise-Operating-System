# Senior Fullstack Engineer Residency

# Chương 13 – Observability, Platform Operations & Site Reliability Engineering (SRE)

> **"Deploy thành công không có nghĩa là dự án thành công. Một hệ thống chỉ thực sự thành công khi đội ngũ có thể biết nó đang hoạt động như thế nào, phát hiện sự cố trước người dùng và khôi phục dịch vụ trong thời gian ngắn nhất."**

Đến thời điểm này, chúng ta đã hoàn thành:

* Business Architecture.
* Domain Architecture.
* Data Architecture.
* Database Architecture.
* System Architecture.
* API Architecture.
* Security Architecture.
* Cloud Architecture.
* DevOps & GitOps Architecture.

Nhưng nếu Production bị lỗi lúc **02:30 sáng**.

* Làm sao biết lỗi ở đâu?
* Làm sao biết Service nào đang chết?
* Làm sao biết Database có đang quá tải?
* Làm sao biết Request nào chậm?
* Làm sao biết Deployment vừa rồi có phải nguyên nhân không?

Đó chính là lý do Observability ra đời.

Observability không phải Logging.

Observability là **khả năng hiểu trạng thái bên trong của một hệ thống thông qua dữ liệu mà hệ thống phát ra**.

Đây là chương giúp chúng ta bước vào tư duy của **Site Reliability Engineer (SRE)**.

---

# Mục tiêu của chương

Sau chương này, chúng ta phải thiết kế được:

* Logging Architecture.
* Metrics Architecture.
* Distributed Tracing.
* Alerting Strategy.
* Dashboard Strategy.
* Incident Management.
* SLI.
* SLO.
* SLA.
* Capacity Planning.
* Reliability Engineering.

Đây là nền tảng để vận hành hệ thống Production.

---

# 1. Ba trụ cột của Observability

Observability hiện đại dựa trên ba tín hiệu chính.

```text id="o1p7ad"
Logs

+

Metrics

+

Traces

=

Observability
```

Thiếu một trong ba.

Việc điều tra sự cố sẽ rất khó khăn.

---

# 2. Logging Architecture

Log không phải để Debug.

Log là bằng chứng về những gì hệ thống đã làm.

AEOS sử dụng Structured Logging.

Ví dụ.

```json
{
  "timestamp": "2026-08-01T10:15:00Z",
  "level": "INFO",
  "service": "task-service",
  "traceId": "9d4c8a...",
  "userId": "usr_123",
  "workspaceId": "ws_456",
  "message": "Task created"
}
```

Không ghi.

```text id="d4j8nf"
Task created!
```

Structured Log giúp máy có thể phân tích được.

---

# 3. Log Levels

Không phải mọi Log đều giống nhau.

* TRACE.
* DEBUG.
* INFO.
* WARN.
* ERROR.
* FATAL.

Nguyên tắc.

Production.

Không bật DEBUG lâu dài.

Development.

Có thể bật DEBUG.

Điều này giúp giảm chi phí lưu trữ và tăng hiệu năng.

---

# 4. Correlation ID & Trace ID

Một Request đi qua nhiều Module.

Ví dụ.

```text id="h2pk7r"
API

↓

Project Module

↓

Task Module

↓

Notification Module

↓

Audit Module
```

Nếu mỗi Module ghi Log riêng.

Chúng ta rất khó ghép lại.

Giải pháp.

Mọi Request đều có.

* Correlation ID.
* Trace ID.

Nhờ đó toàn bộ Log của một Request có thể được liên kết với nhau.

---

# 5. Metrics Architecture

Metrics trả lời câu hỏi.

"Hệ thống đang khỏe hay đang gặp vấn đề?"

Ví dụ.

Application.

* Request per Second.
* Error Rate.
* Response Time.
* Active User.

Infrastructure.

* CPU.
* Memory.
* Disk.
* Network.

Database.

* Slow Query.
* Connection Count.
* Cache Hit Ratio.

---

# 6. Golden Signals

Google SRE đề xuất bốn chỉ số quan trọng.

* Latency.
* Traffic.
* Errors.
* Saturation.

Ví dụ.

```text id="k7qn5w"
Latency

↓

Traffic

↓

Errors

↓

Saturation
```

Chỉ cần theo dõi tốt bốn chỉ số này.

Đã có thể phát hiện phần lớn sự cố.

---

# 7. RED & USE Metrics

Đối với API.

Theo dõi RED.

* Rate.
* Errors.
* Duration.

Đối với hạ tầng.

Theo dõi USE.

* Utilization.
* Saturation.
* Errors.

Đây là hai mô hình phổ biến trong các hệ thống lớn.

---

# 8. Distributed Tracing

Một Request có thể đi qua.

* API Gateway.
* Identity.
* Project.
* Task.
* Notification.
* Database.
* Redis.

Distributed Tracing cho phép nhìn toàn bộ hành trình.

```text id="f8rt1y"
Gateway

↓

Task Module

↓

Permission

↓

Database

↓

Notification
```

Nhờ đó.

Chúng ta biết chính xác bước nào gây chậm.

---

# 9. Dashboard Strategy

Dashboard không phải để trình diễn.

Dashboard phục vụ vận hành.

Ví dụ.

Executive Dashboard.

* Active Workspace.
* Error Rate.
* Uptime.

Application Dashboard.

* Response Time.
* Throughput.
* Error.

Database Dashboard.

* Query Time.
* Replication Delay.
* Connection Pool.

Kubernetes Dashboard.

* Pod.
* Node.
* Restart.
* Resource Usage.

Mỗi nhóm có Dashboard riêng phù hợp với nhu cầu.

---

# 10. Alerting Strategy

Không Alert mọi thứ.

Chỉ Alert khi cần hành động.

Ví dụ.

Không nên.

CPU 75%.

Nếu đó là trạng thái bình thường.

Nên Alert.

* Error Rate tăng đột biến.
* API Timeout.
* Database Connection cạn.
* Pod Crash Loop.
* Disk sắp đầy.
* SSL sắp hết hạn.

Alert phải có ngữ cảnh và hướng dẫn xử lý.

---

# 11. SLI, SLO & SLA

## SLI

Chỉ số đo lường.

Ví dụ.

* 99.95% Request thành công.

---

## SLO

Mục tiêu nội bộ.

Ví dụ.

* 99.9% Availability.
* P95 Response dưới 300ms.

---

## SLA

Cam kết với khách hàng.

Ví dụ.

* 99.5% Uptime.

SLO luôn phải cao hơn SLA để tạo khoảng đệm vận hành.

---

# 12. Incident Management

Khi Production gặp sự cố.

Quy trình.

```text id="r5cw2k"
Detect

↓

Alert

↓

Triage

↓

Mitigation

↓

Recovery

↓

Postmortem
```

Mục tiêu.

Khôi phục dịch vụ trước.

Điều tra nguyên nhân sau.

---

# 13. Runbook

Một Incident không nên phụ thuộc vào trí nhớ của một cá nhân.

Ví dụ.

Runbook.

Database Down.

Bao gồm.

* Cách xác minh.
* Các bước xử lý.
* Cách Rollback.
* Người chịu trách nhiệm.
* Điều kiện Escalation.

Runbook giúp giảm thời gian xử lý sự cố.

---

# 14. Postmortem

Sau mỗi Incident.

Không tìm người để đổ lỗi.

Mà tìm nguyên nhân gốc.

Ví dụ.

* Điều gì xảy ra?
* Tại sao xảy ra?
* Vì sao hệ thống không phát hiện sớm?
* Chúng ta cần cải thiện gì?

Mục tiêu là cải tiến hệ thống và quy trình.

---

# 15. Capacity Planning

Không đợi hệ thống quá tải mới mở rộng.

Phải dự báo.

Ví dụ.

* Tăng trưởng người dùng.
* Dung lượng lưu trữ.
* CPU.
* Memory.
* Database.

Capacity Planning giúp tối ưu chi phí và tránh gián đoạn.

---

# 16. Chaos Engineering

Muốn biết hệ thống có chịu lỗi được không.

Phải chủ động kiểm thử.

Ví dụ.

* Tắt một Pod.
* Tắt một Node.
* Ngắt Redis.
* Tăng độ trễ mạng.
* Mất kết nối Database Replica.

Nếu hệ thống vẫn hoạt động đúng.

Kiến trúc đủ khả năng chịu lỗi.

---

# 17. Reliability Engineering

Độ tin cậy không đến từ may mắn.

Mà từ thiết kế.

Bao gồm.

* Retry.
* Timeout.
* Circuit Breaker.
* Bulkhead.
* Rate Limit.
* Graceful Shutdown.
* Health Check.
* Auto Recovery.

Đây là những mẫu thiết kế nền tảng của hệ thống phân tán.

---

# 18. Observability Stack

Một Platform Production thường bao gồm.

* Metrics Collector.
* Log Collector.
* Trace Collector.
* Visualization.
* Alert Manager.
* Incident Management.

Các công cụ cụ thể sẽ được triển khai ở phần thực hành sau.

Trong giai đoạn thiết kế, điều quan trọng là hiểu vai trò của từng thành phần và cách chúng kết nối với nhau.

---

# Deliverables của Chương 13

Sau chương này, chúng ta phải có:

* Observability Architecture.
* Logging Standard.
* Metrics Catalogue.
* Distributed Tracing Strategy.
* Dashboard Design.
* Alert Policy.
* Incident Response Plan.
* Runbook Template.
* SLI/SLO Definition.
* Capacity Planning Strategy.
* Reliability Pattern Catalogue.

Đây là tài liệu vận hành của AEOS.

---

# Những gì chúng ta vẫn chưa làm

Đến cuối chương này, chúng ta vẫn chưa:

* Cài Prometheus.
* Cài Grafana.
* Cài Loki.
* Cài Tempo hoặc Jaeger.
* Cấu hình Alertmanager.
* Viết Dashboard.

Chúng ta mới hoàn thành kiến trúc vận hành.

Việc triển khai sẽ diễn ra ở các chương thực hành về Kubernetes và Platform Engineering.

---

# Engineering Mindset

Một Junior thường hỏi:

> "Ứng dụng chạy được chưa?"

Một Mid thường hỏi:

> "Có Log lỗi không?"

Một Site Reliability Engineer sẽ hỏi:

> **"Nếu Response Time tăng gấp ba lần trong 10 phút tới, hệ thống sẽ phát hiện sau bao lâu, ai sẽ được cảnh báo, Runbook nào sẽ được kích hoạt và chúng ta có thể khôi phục dịch vụ trong bao nhiêu phút?"**

Đó là sự khác biệt giữa việc **xây dựng hệ thống** và **vận hành hệ thống**.

---

# Chuẩn đầu ra của Chương 13

Sau khi hoàn thành chương này, bạn sẽ có khả năng:

* Thiết kế kiến trúc Observability cho hệ thống Enterprise.
* Xây dựng chiến lược Logging, Metrics và Distributed Tracing.
* Thiết kế Alerting và Dashboard phục vụ vận hành Production.
* Xác định SLI, SLO và SLA phù hợp với mục tiêu kinh doanh.
* Thiết kế quy trình Incident Management và Postmortem.
* Áp dụng các nguyên tắc Site Reliability Engineering để xây dựng hệ thống có khả năng quan sát, chịu lỗi và phục hồi cao.

> **Chương 14 sẽ là Software Quality Architecture. Chúng ta sẽ thiết kế toàn bộ chiến lược đảm bảo chất lượng: Testing Pyramid, Unit Test, Integration Test, Contract Test, End-to-End Test, Performance Test, Security Test, Test Data Management, Quality Gates và Test Automation. Đây là chương giúp AEOS không chỉ chạy được mà còn duy trì chất lượng khi hệ thống và đội ngũ phát triển ngày càng lớn.**
