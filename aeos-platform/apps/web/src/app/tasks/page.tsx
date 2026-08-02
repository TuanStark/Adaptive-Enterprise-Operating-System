import { TasksPageClient } from "@/features/tasks/components/TasksPageClient";
import { Task } from "@/features/tasks/types";

// Simulate Server-side data fetching
async function getTasks(): Promise<Record<string, Task[]>> {
  return {
    "TODO": [
      { id: "AEOS-14", title: "Write Documentation", status: "TODO", priority: "MEDIUM", assignee: { name: "Natasha Romanoff", avatar: "https://i.pravatar.cc/150?u=4" } },
      { id: "AEOS-15", title: "Setup Notification Service", status: "TODO", priority: "HIGH", assignee: { name: "Tony Stark" } },
    ],
    "IN_PROGRESS": [
      { id: "AEOS-12", title: "Implement CQRS Pattern", status: "IN_PROGRESS", priority: "URGENT", assignee: { name: "Peter Parker", avatar: "https://i.pravatar.cc/150?u=2" } },
    ],
    "DONE": [
      { id: "AEOS-1", title: "Design System Architecture", status: "DONE", priority: "HIGH", assignee: { name: "Tony Stark", avatar: "https://github.com/shadcn.png" } },
    ],
  };
}

export default async function TasksPage() {
  const tasks = await getTasks();

  return <TasksPageClient initialTasks={tasks} />;
}
