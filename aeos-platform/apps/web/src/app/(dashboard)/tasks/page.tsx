import { Suspense } from "react";
import { TasksPageClient } from "@/features/tasks/components/TasksPageClient";
import { Task } from "@/features/tasks/types";

// Simulate Server-side data fetching (will be replaced with real API call)
async function getTasks(): Promise<Record<string, Task[]>> {
  return {
    "TODO": [
      { id: "task-14", key: "AEOS-14", title: "Write Documentation", status: "TODO", type: "TASK", priority: "MEDIUM", assigneeId: "user-4", sprintId: "sprint-1", storyPoints: 2, projectId: "proj-1", dueDate: null, createdAt: "2026-08-01T10:00:00Z" },
      { id: "task-15", key: "AEOS-15", title: "Setup Notification Service", status: "TODO", type: "STORY", priority: "HIGH", assigneeId: "user-1", sprintId: "sprint-1", storyPoints: 5, projectId: "proj-1", dueDate: null, createdAt: "2026-08-01T10:30:00Z" },
      { id: "task-16", key: "AEOS-16", title: "Research caching strategies", status: "TODO", type: "TASK", priority: "LOW", assigneeId: null, sprintId: null, storyPoints: 3, projectId: "proj-1", dueDate: null, createdAt: "2026-08-01T11:00:00Z" },
    ],
    "IN_PROGRESS": [
      { id: "task-12", key: "AEOS-12", title: "Implement CQRS Pattern", status: "IN_PROGRESS", type: "BUG", priority: "URGENT", assigneeId: "user-2", sprintId: "sprint-1", storyPoints: 8, projectId: "proj-1", dueDate: null, createdAt: "2026-07-28T09:00:00Z" },
    ],
    "DONE": [
      { id: "task-1", key: "AEOS-1", title: "Design System Architecture", status: "DONE", type: "STORY", priority: "HIGH", assigneeId: "user-1", sprintId: "sprint-1", storyPoints: 13, projectId: "proj-1", dueDate: null, createdAt: "2026-07-20T08:00:00Z" },
    ],
  };
}

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading...</div>}>
      <TasksPageClient initialTasks={tasks} />
    </Suspense>
  );
}
