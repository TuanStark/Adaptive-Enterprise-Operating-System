import { serverApi, getSessionContext } from '@/lib/api-server';
import { Project } from '../types';

export async function getProjects(): Promise<Project[]> {
  try {
    const { workspaceId } = await getSessionContext();
    const response = await serverApi.get<{ data: Project[]; meta: unknown }>('/projects', {
      workspaceId,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    return await serverApi.get<Project>(`/projects/${id}`);
  } catch (error) {
    console.error(`Failed to fetch project ${id}:`, error);
    return null;
  }
}
