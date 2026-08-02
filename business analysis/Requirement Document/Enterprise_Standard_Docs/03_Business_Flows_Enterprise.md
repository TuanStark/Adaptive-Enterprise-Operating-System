# AEOS - Luồng Nghiệp vụ & Bản đồ Ngữ cảnh (Enterprise Business Flows & Context Map)

Tài liệu này mô tả sự phụ thuộc và cách thức liên lạc giữa các Bounded Contexts của AEOS (Theo C4 Model & Domain-Driven Design).

---

## 1. Bản đồ Ngữ cảnh Cấp cao (High-Level Context Map)

Sự phụ thuộc về mặt nghiệp vụ (Không phải phụ thuộc trực tiếp về mặt code hay DB).

```text
       [Workspace]
            │
            ├───────────────────────┐
            ▼                       ▼
       [Project]               [Knowledge]
            │                       │
            ▼                       ▼
         [Task]             [Unified Search]
            │                       │
            └──────────┬────────────┘
                       ▼
               [Workflow Engine]
                       │
                       ▼
                 [AI Assistant]
                       │
                       ▼
                 [Notification]
```
*Ghi chú: Mũi tên thể hiện sự phụ thuộc chiều xuôi. Workflow lắng nghe sự kiện của Task và Knowledge. AI Assistant lắng nghe sự kiện của Workflow. Notification nằm ở cuối chuỗi.*

---

## 2. Luồng Giao tiếp Bất đồng bộ (Event-Driven Flow)

AEOS áp dụng nguyên tắc: **Một Transaction chỉ giới hạn trong một Bounded Context**. Bất kỳ tác động nào ra bên ngoài phải thông qua **Domain Event** bắn lên Internal Message Broker (Event Bus).

### Quy trình số 1: Luồng xử lý khi phát hành Document (Publish Flow)

Luồng này chứng minh sự độc lập của các Context.

```text
1. [Knowledge Context] 
   - Nhận yêu cầu Publish Document.
   - Commit DB Transaction: Cập nhật Document Status = PUBLISHED.
   - Bắn sự kiện: `DocumentPublishedEvent(documentId, authorId, contentHash)`.
   - Phản hồi HTTP 200 OK cho Client (Không chờ các bước sau).

2. [Unified Search Context] (Lắng nghe ngầm)
   - Bắt `DocumentPublishedEvent`.
   - Kéo nội dung (nếu cần).
   - Index nội dung vào OpenSearch Cluster.

3. [Workflow Engine Context] (Lắng nghe ngầm)
   - Bắt `DocumentPublishedEvent`.
   - Kiểm tra xem có Workflow Rule nào khớp không (VD: Rule: "Gửi cảnh báo Slack khi Document Mới").
   - Kích hoạt Automation Job.

4. [AI Assistant Context] (Lắng nghe ngầm)
   - Bắt `DocumentPublishedEvent`.
   - Chạy chunking (chia nhỏ text) & embedding (mã hóa vector).
   - Lưu vào Vector Database (ChromaDB / pgvector).
```

---

## 3. Máy Trạng thái (State Machine) của Knowledge Document

Vòng đời của một tài liệu tri thức (Document) trong AEOS nghiêm ngặt hơn nhiều so với Google Docs thông thường.

### Bảng Chuyển đổi Trạng thái (State Transitions)

| Trạng thái Hiện tại | Hành động (Action) | Trạng thái Mới | Bounded Context Xử lý |
| :--- | :--- | :--- | :--- |
| `[NULL]` | Khởi tạo Document | `DRAFT` | Knowledge Context |
| `DRAFT` | Request Review | `IN_REVIEW` | Knowledge Context |
| `IN_REVIEW` | Approve & Publish | `PUBLISHED` | Knowledge Context |
| `PUBLISHED` | Update (Sửa đổi) | **Tạo Version mới ở trạng thái `DRAFT`**. Bản đang chạy vẫn là `PUBLISHED`. | Knowledge Context |
| `PUBLISHED` | Archive (Lưu trữ) | `ARCHIVED` | Knowledge Context |

### Business Rules (Luật Nghiệp vụ) cốt lõi:
- **Tính Bất biến (Immutability)**: Khi Document đạt trạng thái `PUBLISHED`, nội dung của version đó là bất biến. Mọi sự thay đổi phải dẫn đến một Version ID mới. 
- **Quyền Truy Cập AI**: AI Context chỉ được phép sử dụng các phiên bản `PUBLISHED` để trả lời câu hỏi của người dùng, không được phép đọc nội dung `DRAFT`.

---

## 4. Luồng Xử lý AI Meeting Transcript (Chức năng Trợ lý)

Quy trình tự động hóa cực mạnh của AEOS.

```text
[External Integration Context]
Nhận Webhook từ Google Meet (Video đã ghi âm xong).
   │
   ▼
[AI Assistant Context]
Chạy Whisper AI để Speech-to-Text -> Ra bản Transcript thô.
Gửi Prompt tới LLM (GPT-4) yêu cầu trích xuất Action Items.
   │
   ▼
[Task Context] (Được AI gọi qua Application Service hoặc Event)
Sinh ra 5 Task mới tương ứng với 5 Action Items, gán cho những người được nhắc tên.
   │
   ▼
[Notification Context]
Gửi Email/App Notification: "Trợ lý AI đã tạo 5 Task cho cuộc họp Sprint Planning."
```
