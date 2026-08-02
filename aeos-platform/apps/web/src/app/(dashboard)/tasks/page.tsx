import { TasksPageClient } from "@/features/tasks/components/TasksPageClient";
import { Task } from "@/features/tasks/types";

// Simulate Server-side data fetching
async function getTasks(): Promise<Record<string, Task[]>> {
  return {
    "TODO": [
      { id: "AEOS-14", title: "Write Documentation", status: "TODO", type: "TASK", priority: "MEDIUM", assignee: { name: "Natasha Romanoff", avatar: "https://i.pravatar.cc/150?u=4" }, sprint: "SCRUM Sprint 1", storyPoints: 2 },
      { id: "AEOS-15", title: "Setup Notification Service", status: "TODO", type: "STORY", priority: "HIGH", assignee: { name: "Tony Stark" }, sprint: "SCRUM Sprint 1", storyPoints: 5 },
      { id: "AEOS-16", title: "Research caching strategies", status: "TODO", type: "TASK", priority: "LOW", assignee: { name: "Unassigned" }, sprint: "Backlog", storyPoints: 3 },
    ],
    "IN_PROGRESS": [
      { id: "AEOS-12", title: "Implement CQRS Pattern", status: "IN_PROGRESS", type: "BUG", priority: "URGENT", assignee: { name: "Peter Parker", avatar: "https://i.pravatar.cc/150?u=2" }, sprint: "SCRUM Sprint 1", storyPoints: 8 },
    ],
    "DONE": [
      { id: "AEOS-1", title: "Design System Architecture", status: "DONE", type: "STORY", priority: "HIGH", assignee: { name: "Tony Stark", avatar: "https://github.com/shadcn.png" }, sprint: "SCRUM Sprint 1", storyPoints: 13 },
    ],
  };
}

export default async function TasksPage() {
  const tasks = await getTasks();

  return <TasksPageClient initialTasks={tasks} />;
}
