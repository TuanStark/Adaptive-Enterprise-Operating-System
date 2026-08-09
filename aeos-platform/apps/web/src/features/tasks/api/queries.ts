import { serverApi, getSessionContext } from '@/lib/api-server';
import type { Task } from '../types';
import type { Project } from '@/features/projects/types';

interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  try {
    const { workspaceId } = await getSessionContext();
    const response = await serverApi.get<PaginatedResponse<Task>>('/tasks', {
      projectId,
      workspaceId,
      limit: 200,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
}

export async function getWorkspaceProjects(): Promise<Project[]> {
  try {
    const { workspaceId } = await getSessionContext();
    const response = await serverApi.get<PaginatedResponse<Project>>('/projects', { workspaceId });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch projects for task page:', error);
    return [];
  }
}
