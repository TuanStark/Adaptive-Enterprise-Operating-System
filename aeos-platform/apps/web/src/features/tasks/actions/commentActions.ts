"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api-server";
import { getServerSession } from "@/features/auth/api/getServerSession";

export async function addComment(taskId: string, content: string) {
  const user = await getServerSession();
  if (!user) throw new Error("Not authenticated");

  const result = await serverApi.post<{ id: string }>(`/tasks/${taskId}/comments`, {
    tenantId: user.tenantId,
    content,
  });

  revalidatePath("/tasks");
  return result;
}
