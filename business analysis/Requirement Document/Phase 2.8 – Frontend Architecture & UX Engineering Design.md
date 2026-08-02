# Phase 2.8 – Frontend Architecture & UX Engineering Design

# Tổng quan

Sau khi hoàn thành:

- Business Analysis
- Domain Design
- Detailed Design
- User Story & Use Case Specification
- API Contract Design
- Database Deep Design
- System Architecture Design
- Backend Implementation Blueprint

Chúng ta đã có một Backend đủ chi tiết để bắt đầu phát triển.

Tuy nhiên, một hệ thống Enterprise không chỉ có Backend.

Frontend cũng cần được thiết kế như một kiến trúc hoàn chỉnh.

Một Senior Fullstack không chỉ biết React hay Next.js.

Senior phải quyết định:

- Frontend Architecture.
- Component Design.
- State Management.
- Data Fetching Strategy.
- Permission Rendering.
- Performance Optimization.
- Design System.
- Folder Structure.
- Frontend Coding Convention.

Đó chính là mục tiêu của **Phase 2.8 – Frontend Architecture & UX Engineering Design**.

---

# 1. Mục tiêu của Phase 2.8

Sau Phase này chúng ta sẽ có:

- Frontend Folder Structure.
- Feature-based Architecture.
- State Management Strategy.
- Data Fetching Strategy.
- Authentication Flow.
- Authorization Flow.
- Design System.
- Component Library.
- Routing Strategy.
- Error Handling Strategy.
- Performance Strategy.
- Accessibility Guideline.
- Frontend Coding Convention.

Frontend sẽ đủ chi tiết để bắt đầu code mà không cần thay đổi kiến trúc.

---

# 2. Frontend Technology Stack

AEOS sử dụng:

- Next.js 16 (App Router)
- React 19
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Axios
- next-intl
- Framer Motion
- Recharts
- Socket.IO Client

Lý do lựa chọn:

- SEO tốt.
- Server Components.
- Streaming.
- Type Safety.
- Performance cao.
- Dễ mở rộng.
- Cộng đồng lớn.

---

# 3. Frontend Architecture

AEOS sử dụng Feature-based Architecture.

```text
apps/web

src

├── app
│
├── features
│
├── components
│
├── layouts
│
├── hooks
│
├── lib
│
├── services
│
├── stores
│
├── providers
│
├── types
│
├── styles
│
└── constants
```

Không tổ chức theo:

```text
pages

components

utils

```

vì sẽ rất khó mở rộng.

---

# 4. Feature-based Structure

Ví dụ:

```text
features

├── auth

├── workspace

├── organization

├── project

├── task

├── document

├── notification

├── dashboard

└── profile
```

Mỗi Feature là một module độc lập.

---

# 5. Feature Internal Structure

Ví dụ:

```text
workspace

├── api

├── components

├── hooks

├── pages

├── schemas

├── services

├── stores

├── types

└── utils
```

Mỗi feature tự quản lý toàn bộ logic của mình.

---

# 6. Routing Strategy

AEOS sử dụng App Router.

```text
app

├── (public)

├── (auth)

├── (dashboard)

├── api

└── layout.tsx
```

Ví dụ:

```text
/

login

register

/dashboard

/workspaces

/projects

/tasks

/documents
```

---

# 7. Layout Architecture

Layout được chia theo khu vực.

```text
Public Layout

↓

Auth Layout

↓

Dashboard Layout

↓

Workspace Layout
```

Mỗi Layout chịu trách nhiệm:

- Navigation.
- Sidebar.
- Header.
- Breadcrumb.
- Permission.
- Theme.

---

# 8. State Management Strategy

Frontend không dùng một Store cho tất cả.

AEOS chia thành ba nhóm.

## Server State

Dùng:

```text
TanStack Query
```

Chứa:

- Workspace.
- Project.
- Task.
- User Profile.
- Notification.

---

## Client State

Dùng:

```text
Zustand
```

Chứa:

- Sidebar.
- Modal.
- Theme.
- Drawer.
- Wizard Step.

---

## Form State

Dùng:

```text
React Hook Form
```

Kết hợp:

```text
Zod Validation
```

---

# 9. Data Fetching Strategy

Flow:

```text
Component

↓

Custom Hook

↓

API Service

↓

Axios Client

↓

Backend API
```

Không gọi Axios trực tiếp trong Component.

Sai:

```tsx
useEffect(() => {

axios.get(...)

})
```

Đúng:

```tsx
useWorkspace()

↓

workspaceService

↓

axiosClient
```

---

# 10. API Layer

```text
services

├── api.ts

├── auth.api.ts

├── workspace.api.ts

├── project.api.ts

├── task.api.ts
```

Mỗi API tách riêng.

---

# 11. Authentication Flow

Flow:

```text
Login Page

↓

POST /auth/login

↓

Receive Token

↓

Save Session

↓

Redirect Dashboard
```

Access Token:

- Memory.

Refresh Token:

- HttpOnly Cookie.

---

# 12. Authorization Strategy

Permission được lấy sau Login.

```text
User

↓

Workspace

↓

Role

↓

Permission
```

Frontend chỉ hiển thị UI phù hợp.

Ví dụ:

```text
PROJECT.DELETE
```

Có quyền:

```text
Hiển thị Delete Button
```

Không có quyền:

```text
Ẩn Button
```

Backend vẫn là nơi kiểm tra cuối cùng.

---

# 13. Design System

AEOS xây dựng Design System riêng.

Bao gồm:

```text
Button

Input

Textarea

Select

Checkbox

Radio

Badge

Avatar

Modal

Dialog

Drawer

Tabs

Table

DataGrid

Pagination

Breadcrumb

Toast

Tooltip

Card

Skeleton

Loading
```

Toàn bộ UI phải sử dụng component chung.

---

# 14. Component Classification

AEOS chia Component thành ba nhóm.

## Shared Component

Ví dụ:

```text
Button

Input

Modal
```

---

## Feature Component

Ví dụ:

```text
WorkspaceCard

ProjectTable

TaskStatusBadge
```

---

## Page Component

Ví dụ:

```text
WorkspacePage

DashboardPage

ProjectPage
```

---

# 15. Form Architecture

Ví dụ:

```text
Create Workspace

↓

React Hook Form

↓

Zod

↓

Submit

↓

Mutation

↓

Invalidate Cache
```

Không validate thủ công.

---

# 16. Error Handling

Phân loại:

```text
Validation Error

↓

Business Error

↓

Network Error

↓

Unknown Error
```

Hiển thị:

- Toast.
- Inline Error.
- Error Boundary.

---

# 17. Loading Strategy

Các trạng thái cần xử lý:

```text
Loading

Empty

Success

Error

Refetching
```

Không dùng Spinner cho mọi trường hợp.

Ưu tiên Skeleton Loading.

---

# 18. Performance Strategy

Bao gồm:

- React.memo
- useMemo
- useCallback
- Dynamic Import
- Lazy Loading
- Route Segment
- Server Component
- Image Optimization
- Code Splitting
- Virtual List

---

# 19. Realtime Strategy

Realtime sử dụng:

```text
Socket.IO
```

Các chức năng:

- Notification.
- Task Update.
- User Online.
- Comment.
- Collaboration.

---

# 20. Accessibility (A11Y)

Frontend phải hỗ trợ:

- Keyboard Navigation.
- Screen Reader.
- Focus Management.
- ARIA Label.
- Contrast Ratio.
- Semantic HTML.

---

# 21. Internationalization (i18n)

Sử dụng:

```text
next-intl
```

Hỗ trợ:

- English.
- Vietnamese.
- Japanese.

Không hardcode text.

---

# 22. Theme Strategy

Hỗ trợ:

```text
Light

Dark

System
```

Quản lý bằng Theme Provider.

---

# 23. Frontend Testing

Bao gồm:

## Unit Test

- Component.
- Hook.
- Utility.

## Integration Test

- Feature.

## E2E Test

- Playwright.

---

# 24. Frontend Coding Convention

Quy định:

- PascalCase cho Component.
- camelCase cho Hook.
- Không viết Business Logic trong UI.
- Mỗi Component chỉ có một trách nhiệm.
- Không gọi API trực tiếp trong Component.
- Không lưu Server State trong Zustand.
- Không tạo Global Store nếu không cần.

---

# 25. Output của Phase 2.8

Sau khi hoàn thành chúng ta sẽ có:

## Frontend Architecture

- Folder Structure.
- Feature-based Architecture.
- Routing Strategy.
- Layout Strategy.

## State Management

- React Query.
- Zustand.
- React Hook Form.

## UI

- Design System.
- Component Library.
- Theme System.

## UX

- Permission Rendering.
- Error Handling.
- Loading Strategy.
- Accessibility.

## Performance

- Code Splitting.
- Lazy Loading.
- Virtualization.
- Caching.

Developer Frontend có thể bắt đầu phát triển mà không cần tự thiết kế lại kiến trúc.

---

# Trạng thái hiện tại của AEOS

```text
Business Analysis
        ↓
Domain Design
        ↓
Detailed Design
        ↓
User Story
        ↓
API Contract
        ↓
Database Deep Design
        ↓
System Architecture
        ↓
Backend Implementation Blueprint
        ↓
Frontend Architecture & UX Engineering Design ✅
```

---

# Bước tiếp theo

**Phase 2.9 – Security Architecture Design**

Chúng ta sẽ thiết kế toàn bộ kiến trúc bảo mật của hệ thống:

- Authentication.
- Authorization.
- RBAC.
- JWT.
- OAuth2.
- Session Management.
- API Security.
- Data Encryption.
- Secret Management.
- Audit Logging.
- Security Best Practices.
- OWASP Top 10 Protection.

Đây là lớp bảo vệ toàn bộ hệ thống trước khi bước sang phần Cloud, DevOps và triển khai Production.