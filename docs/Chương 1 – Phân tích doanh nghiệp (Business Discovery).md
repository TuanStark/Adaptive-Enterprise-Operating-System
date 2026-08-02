# Senior Fullstack Engineer Residency

# Chương 1 – Phân tích doanh nghiệp (Business Discovery)

> **"Một Senior Engineer không bắt đầu bằng việc tạo project. Họ bắt đầu bằng việc hiểu doanh nghiệp."**

Đây là điểm khác biệt lớn nhất giữa một lập trình viên chỉ biết lập trình và một kỹ sư phần mềm có khả năng thiết kế hệ thống.

Trong phần lớn các khóa học, sau vài bài giới thiệu, người học sẽ tạo repository, thiết kế cơ sở dữ liệu và bắt đầu xây dựng API.

Đó không phải là cách một sản phẩm Enterprise được tạo ra.

Trong thực tế, trước khi dòng code đầu tiên được viết, đội ngũ Product, Business Analyst, Solution Architect và Tech Lead sẽ dành nhiều tuần để trả lời một câu hỏi duy nhất:

> **Chúng ta đang giải quyết vấn đề gì?**

Đó cũng là cách chúng ta sẽ xây dựng AEOS.

---

# Kickoff Meeting

Hãy tưởng tượng hôm nay là ngày đầu tiên của dự án.

Bạn vừa được giao vai trò **Solution Architect**.

Trong buổi Kickoff, CTO phát biểu:

> "Chúng ta sẽ xây dựng Atlas Enterprise Operating System (AEOS) — một nền tảng giúp doanh nghiệp quản lý công việc, tri thức và quy trình trên một hệ thống thống nhất, thay thế việc phải sử dụng nhiều công cụ như Notion, Jira, Slack, Google Drive hay Zapier."

Sau đó, CTO chỉ nói thêm một câu:

> **"Hãy thiết kế hệ thống này."**

Không có Database.

Không có API.

Không có Entity.

Không có Framework.

Không có công nghệ nào được lựa chọn.

Mọi quyết định kỹ thuật đều phải bắt đầu từ việc hiểu doanh nghiệp.

---

# Nhiệm vụ đầu tiên của Solution Architect

Một Junior thường bắt đầu bằng cách đưa ra câu trả lời.

Một Senior bắt đầu bằng cách đặt câu hỏi.

Những câu hỏi đầu tiên cần được trả lời là:

* Khách hàng mục tiêu của sản phẩm là ai?
* Doanh nghiệp có quy mô bao nhiêu người?
* Họ đang gặp vấn đề gì trong quá trình vận hành?
* Họ đang sử dụng những công cụ nào?
* Vì sao họ muốn thay đổi?
* Họ kỳ vọng điều gì từ hệ thống mới?
* Điều gì sẽ quyết định dự án thành công?

Nếu chưa trả lời được các câu hỏi này, chúng ta chưa đủ cơ sở để thiết kế bất kỳ thành phần kỹ thuật nào.

---

# Doanh nghiệp giả định

Để quá trình phân tích mang tính thực tế, chúng ta sẽ xây dựng một doanh nghiệp giả định.

## Công ty ABC Technology

Quy mô:

* 150 nhân viên.
* 5 phòng ban.
* Là công ty phát triển phần mềm.

Các phòng ban gồm:

* Engineering.
* Human Resources.
* Sales.
* Marketing.
* Finance.

Doanh nghiệp đã hoạt động nhiều năm và đang sử dụng nhiều công cụ khác nhau.

Ví dụ:

* Slack để trao đổi.
* Google Drive để lưu tài liệu.
* Jira để quản lý công việc.
* Notion để lưu tri thức.
* Trello cho một số nhóm nhỏ.

Mỗi công cụ giải quyết một nhu cầu riêng, nhưng không có sự kết nối với nhau.

---

# Vấn đề của doanh nghiệp

Khi khảo sát doanh nghiệp, chúng ta phát hiện nhiều vấn đề.

Ví dụ.

Một nhân viên mới gia nhập công ty.

Quy trình hiện tại gồm:

* HR tạo tài khoản.
* IT cấp Email.
* Admin mời vào Slack.
* Leader thêm vào Jira.
* Quản lý chia sẻ Google Drive.
* Đồng nghiệp gửi tài liệu Notion.

Toàn bộ quy trình đều được thực hiện thủ công.

Nếu quên một bước, nhân viên mới sẽ không thể làm việc bình thường.

Đây không phải là vấn đề kỹ thuật.

Đây là **vấn đề nghiệp vụ**.

---

# Phân tích quy trình nghiệp vụ

Chúng ta sẽ không hỏi:

> "Nên dùng PostgreSQL hay MongoDB?"

Thay vào đó, chúng ta sẽ hỏi:

* Có bao nhiêu bước trong quy trình này?
* Ai chịu trách nhiệm ở từng bước?
* Bước nào có thể tự động hóa?
* Nếu một bước thất bại thì điều gì sẽ xảy ra?
* Có cần cơ chế khôi phục hay không?
* Có cần ghi lại lịch sử để kiểm tra sau này không?

Những câu hỏi này giúp chúng ta hiểu cách doanh nghiệp vận hành trước khi nghĩ đến giải pháp kỹ thuật.

---

# Business Flow

Sau khi hiểu quy trình, chúng ta sẽ mô hình hóa nó thành Business Flow.

Ví dụ, quy trình tiếp nhận nhân viên mới.

```text
Invite Member

↓

Accept Invitation

↓

Create Account

↓

Join Workspace

↓

Assign Default Role

↓

Assign Department

↓

Grant Project Access

↓

Grant Document Permission

↓

Send Welcome Notification

↓

Record Audit Log
```

Business Flow sẽ là nền tảng cho việc thiết kế Domain, API và kiến trúc hệ thống trong các chương tiếp theo.

---

# Business Rules

Tiếp theo, chúng ta xác định các quy tắc nghiệp vụ.

Ví dụ:

* Một Workspace có được phép xóa hay chỉ được Archive?
* Một Guest có thể Upload Document không?
* Một Project có thể Archive khi vẫn còn Task đang thực hiện không?
* Thành viên nghỉ việc thì dữ liệu sẽ thuộc về ai?
* Một Document có được chỉnh sửa sau khi phát hành không?
* Một Manager có được xem dữ liệu của phòng ban khác không?

Business Rule quyết định cách hệ thống hoạt động.

Nếu Business Rule sai, hệ thống sẽ sai ngay cả khi code hoàn hảo.

---

# Actor Analysis

Chúng ta cần xác định toàn bộ tác nhân tương tác với hệ thống.

Bao gồm:

* Owner.
* Administrator.
* Manager.
* Team Leader.
* Member.
* Guest.
* AI Agent.
* Scheduler.
* External System.
* Webhook.

Mỗi Actor sẽ có quyền hạn, trách nhiệm và hành vi khác nhau.

Đây sẽ là cơ sở để thiết kế Authorization trong các chương sau.

---

# Từ Business đến Engineering

Sau khi hoàn thành việc phân tích doanh nghiệp, chúng ta mới bắt đầu chuyển sang các hoạt động kỹ thuật.

Thứ tự sẽ luôn là:

```text
Business Problem

↓

Business Process

↓

Business Rules

↓

Business Flow

↓

Actor Analysis

↓

Domain Discovery

↓

Event Storming

↓

System Design

↓

Implementation
```

Điều quan trọng cần nhớ là:

> **Chúng ta không học Domain-Driven Design hay Event Storming như những chủ đề độc lập. Chúng ta sử dụng chúng như những công cụ để giải quyết bài toán thực tế của doanh nghiệp.**

Đó chính là cách một Solution Architect và một Senior Engineer tiếp cận việc xây dựng sản phẩm.

---

# Mục tiêu của Chương 1

Sau khi hoàn thành chương này, chúng ta phải trả lời được các câu hỏi sau:

* Doanh nghiệp của chúng ta là ai?
* Họ đang gặp những vấn đề gì?
* Quy trình nghiệp vụ hiện tại diễn ra như thế nào?
* Những điểm nào có thể được cải thiện?
* Các Actor trong hệ thống là ai?
* Những Business Rule nào bắt buộc phải tuân thủ?
* Business Flow của từng nghiệp vụ chính là gì?

Chỉ khi trả lời đầy đủ các câu hỏi này, chúng ta mới đủ cơ sở để bước sang chương tiếp theo: **Phân tích Domain và thiết kế mô hình nghiệp vụ**.

> **Từ chương tiếp theo trở đi, chúng ta sẽ đi sâu vào từng nghiệp vụ của AEOS, phân tích từng quy trình như một đội ngũ kỹ thuật thực thụ. Mục tiêu không phải là học lý thuyết, mà là thiết kế một hệ thống Enterprise có thể triển khai trong môi trường production.**
