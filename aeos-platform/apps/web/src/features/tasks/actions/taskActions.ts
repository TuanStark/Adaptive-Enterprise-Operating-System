"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api-server";
import { getServerSession } from "@/features/auth/api/getServerSession";

interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  storyPoints?: number;
}

export async function createTask(input: CreateTaskInput) {
  const user = await getServerSession();
  if (!user) throw new Error("Not authenticated");

  const result = await serverApi.post<{ id: string; key: string }>("/tasks", {
    tenantId: user.tenantId,
    ...input,
  });

  revalidatePath("/tasks");
  return result;
}

export async function changeTaskStatus(taskId: string, status: string) {
  const result = await serverApi.patch<{ message: string }>(`/tasks/${taskId}/status`, { status });
  revalidatePath("/tasks");
  return result;
}

export async function assignTask(taskId: string, assigneeId: string) {
  const result = await serverApi.patch<{ message: string }>(`/tasks/${taskId}/assign`, { assigneeId });
  revalidatePath("/tasks");
  return result;
}

export async function moveTaskToSprint(taskId: string, sprintId: string | null) {
  const result = await serverApi.patch<{ message: string }>(`/tasks/${taskId}/sprint`, {
    sprintId: sprintId ?? undefined,
  });
  revalidatePath("/tasks");
  return result;
}
