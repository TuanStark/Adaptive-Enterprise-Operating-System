import { serverApi, getSessionContext } from "@/lib/api-server";
import type { Task } from "../types";
import type { Project } from "@/features/projects/types";

interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function getTasksByProject(projectId: string): Promise<Record<string, Task[]>> {
  try {
    const response = await serverApi.get<PaginatedResponse<Task>>("/tasks", {
      projectId,
      limit: 200,
    });

    const grouped: Record<string, Task[]> = {};
    for (const task of response.data) {
      const status = task.status || "TODO";
      if (!grouped[status]) grouped[status] = [];
      grouped[status].push(task);
    }

    if (!grouped["TODO"]) grouped["TODO"] = [];
    if (!grouped["IN_PROGRESS"]) grouped["IN_PROGRESS"] = [];
    if (!grouped["DONE"]) grouped["DONE"] = [];

    return grouped;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return { TODO: [], IN_PROGRESS: [], DONE: [] };
  }
}

export async function getWorkspaceProjects(): Promise<Project[]> {
  try {
    const { workspaceId } = await getSessionContext();
    const response = await serverApi.get<PaginatedResponse<Project>>("/projects", { workspaceId });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects for task page:", error);
    return [];
  }
}
