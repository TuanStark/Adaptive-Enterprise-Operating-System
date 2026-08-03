# 🔍 Audit: BE Modules vs FE UI Coverage

## Tổng quan

| | Số lượng |
|---|---|
| **BE modules có controller (REST endpoints)** | 14 |
| **FE pages có route** | 7 (/, /tasks, /chat, /docs, /projects, /team, /settings) |
| **BE modules ĐÃ có FE UI** | 8 |
| **BE modules CHƯA có FE UI** | 6 |

---

## ✅ BE modules ĐÃ có FE UI match

| BE Module | Controller | FE Page | FE Feature | Status |
|---|---|---|---|---|
| `identity` | `POST /auth/login`, `POST /auth/register` | `/login` | `features/auth` | ✅ |
| `task` | `GET/POST /tasks`, `PATCH /tasks/:id/*` | `/tasks` | `features/tasks` | ✅ |
| `project` | `GET/POST /projects`, `PATCH /projects/:id/*` | `/projects` | `features/projects` | ✅ |
| `document` | `GET/POST /documents` | `/docs` | `features/docs` | ✅ |
| `message` | `GET/POST /channels`, WebSocket Gateway | `/chat` | `features/chat` | ✅ |
| `workspace` | `GET/POST /workspaces` | `/settings` | `features/settings` | ✅ |
| `organization` | `GET/POST /organizations` | `/team` (partial) | `features/team` | ✅ |
| `dashboard` | (no controller, internal) | `/` | `features/dashboard` | ✅ |

---

## 🔴 BE modules CHƯA có FE UI

### 1. `notification` — Notification Center
**BE endpoints:**
- `GET /notifications` — list notifications cho user
- `PATCH /notifications/:id/read` — mark as read
- `PATCH /notifications/read-all` — mark all as read

**FE thiếu:**
- ❌ Notification bell/dropdown trong Header (icon có nhưng không có panel)
- ❌ Notification page `/notifications`
- ❌ Unread count badge
- ❌ Real-time notification via WebSocket

---

### 2. `sprint` — Sprint Management
**BE endpoints:**
- `POST /sprints` — create sprint
- `GET /sprints` — list sprints by project
- `PATCH /sprints/:id/start` — start sprint
- `PATCH /sprints/:id/complete` — complete sprint

**FE thiếu:**
- ❌ Sprint creation dialog
- ❌ Sprint start/complete buttons (BacklogView chỉ hardcode "SCRUM Sprint 1")
- ❌ Sprint selector dropdown
- ❌ Sprint planning view

---

### 3. `meeting` — Meeting Management
**BE endpoints:**
- `POST /meetings` — create meeting
- `GET /meetings` — list meetings

**FE thiếu:**
- ❌ Meeting page `/meetings` hoàn toàn chưa có
- ❌ Calendar integration
- ❌ Meeting creation form
- ❌ Participant management

---

### 4. `comment` — Task Comments
**BE endpoints:**
- `POST /tasks/:taskId/comments` — create comment
- `GET /tasks/:taskId/comments` — list comments

**FE thiếu:**
- ❌ TaskDetailPanel không có comment section
- ❌ Comment input box
- ❌ Comment thread display

---

### 5. `approval` — Approval Workflows
**BE endpoints:**
- `POST /approvals` — create approval request
- `GET /approvals` — list pending approvals
- `PATCH /approvals/:id/process` — approve/reject

**FE thiếu:**
- ❌ Approval page/tab hoàn toàn chưa có
- ❌ Approval request form
- ❌ Approve/Reject buttons
- ❌ Approval status tracking

---

### 6. `form` — Dynamic Forms
**BE endpoints:**
- `POST /forms` — create form
- `GET /forms` — list forms
- `POST /forms/:id/submissions` — submit form

**FE thiếu:**
- ❌ Forms tab trong Tasks page chỉ là placeholder text
- ❌ Form builder UI
- ❌ Form submission view
- ❌ Form response analytics

---

## 🟡 BE modules có logic nhưng KHÔNG có controller (internal services)

Các module này không cần UI trực tiếp, nhưng FE nên tích hợp gián tiếp:

| Module | Vai trò | FE cần tích hợp? |
|---|---|---|
| `analytics` | `GET /analytics/workspace` | 🟡 Dashboard nên hiển thị analytics data |
| `member` | Internal member management | ⬜ Đã cover qua Team page |
| `role` | Role definitions | ⬜ Đã cover qua Settings |
| `permission` | Permission checks | ⬜ Internal middleware |
| `attachment` | File uploads | 🟡 Task/Message attachments |
| `audit` | Audit logging | 🟡 Settings → Audit Log tab |
| `automation` | Workflow automation | 🟡 Settings → Automations |
| `calendar` | Calendar events | 🟡 Calendar view trong Tasks |
| `integration` | External integrations | 🟡 Settings → Integrations |
| `issue` | Issue tracking | ⬜ Merged with Task |
| `search` | Global search | 🟡 Search bar trong Header |

---

## 📊 Mức độ ưu tiên fix

| Priority | Module | Lý do |
|---|---|---|
| 🔴 **P0** | `notification` | Users **phải** thấy notifications — bell icon đã có trong Header nhưng không hoạt động |
| 🔴 **P0** | `comment` | Task comments là **core feature** của project management |
| 🟠 **P1** | `sprint` | BacklogView đang hardcode, cần dynamic sprint management |
| 🟠 **P1** | `analytics` | Dashboard page đang hiện mock data, nên gọi `GET /analytics/workspace` |
| 🟡 **P2** | `meeting` | Cần page riêng hoặc calendar integration |
| 🟡 **P2** | `approval` | Workflow approval cho enterprise |
| 🟡 **P2** | `form` | Forms tab đang là placeholder |

> [!IMPORTANT]
> **6 BE modules** có REST endpoints sẵn sàng nhưng **FE hoàn toàn chưa có UI** để gọi chúng. Notifications và Comments là **critical** nhất.

Bạn muốn tôi bắt đầu implement UI cho module nào trước?
