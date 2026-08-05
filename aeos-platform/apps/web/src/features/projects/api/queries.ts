import { serverApi } from "@/lib/api-server";
import { Project } from "../types";

export async function getProjects(): Promise<Project[]> {
  try {
    return await serverApi.get<Project[]>("/projects");
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    // Return empty array or throw depending on how you want to handle errors in UI
    return [];
  }
}

/**
 * Fetch a single project by ID.
 */
export async function getProject(id: string): Promise<Project | null> {
  try {
    return await serverApi.get<Project>(`/projects/${id}`);
  } catch (error) {
    console.error(`Failed to fetch project ${id}:`, error);
    return null;
  }
}
