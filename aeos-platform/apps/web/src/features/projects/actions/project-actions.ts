"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api-server";
import { CreateProjectPayload, UpdateProjectPayload, Project } from "../types";
import { auth } from "@/auth";

export async function createProjectAction(data: CreateProjectPayload): Promise<Project> {
  try {
    const session = await auth();

    if (!session?.user?.tenantId || !session?.user?.workspaceId) {
      throw new Error("You must have an active workspace to create a project.");
    }

    const payload = {
      ...data,
      tenantId: session.user.tenantId,
      workspaceId: session.user.workspaceId,
    };
    const newProject = await serverApi.post<Project>("/projects", payload);
    revalidatePath("/projects");
    return newProject;
  } catch (error: unknown) {
    console.error("Failed to create project:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create project");
  }
}

export async function updateProjectAction(id: string, data: UpdateProjectPayload): Promise<Project> {
  try {
    const updatedProject = await serverApi.patch<Project>(`/projects/${id}`, data);
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    return updatedProject;
  } catch (error) {
    console.error(`Failed to update project ${id}:`, error);
    throw new Error("Failed to update project");
  }
}

export async function deleteProjectAction(id: string): Promise<void> {
  try {
    await serverApi.delete(`/projects/${id}`);
    revalidatePath("/projects");
  } catch (error) {
    console.error(`Failed to delete project ${id}:`, error);
    throw new Error("Failed to delete project");
  }
}
