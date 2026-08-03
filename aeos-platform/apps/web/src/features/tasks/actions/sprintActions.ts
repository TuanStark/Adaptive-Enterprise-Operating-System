"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api-server";
import { getServerSession } from "@/features/auth/api/getServerSession";

interface CreateSprintInput {
  projectId: string;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export async function createSprint(input: CreateSprintInput) {
  const user = await getServerSession();
  if (!user) throw new Error("Not authenticated");

  const result = await serverApi.post<{ id: string }>("/sprints", {
    tenantId: user.tenantId,
    ...input,
  });

  revalidatePath("/tasks");
  return result;
}

export async function startSprint(id: string) {
  const result = await serverApi.patch<{ message: string }>(`/sprints/${id}/start`);
  revalidatePath("/tasks");
  return result;
}

export async function completeSprint(id: string) {
  const result = await serverApi.patch<{ message: string }>(`/sprints/${id}/complete`);
  revalidatePath("/tasks");
  return result;
}
