import { Suspense } from "react";
import { TasksPageClient } from "@/features/tasks/components/TasksPageClient";
import { getTasksByProject, getWorkspaceProjects } from "@/features/tasks/api/queries";

export default async function TasksPage() {
  const projects = await getWorkspaceProjects();
  const firstProject = projects[0] ?? null;

  const tasks = firstProject
    ? await getTasksByProject(firstProject.id)
    : { TODO: [], IN_PROGRESS: [], DONE: [] };

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading...</div>}>
      <TasksPageClient
        initialTasks={tasks}
        projects={projects}
        initialProjectId={firstProject?.id ?? null}
      />
    </Suspense>
  );
}
