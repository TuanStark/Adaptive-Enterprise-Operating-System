"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api-server";
import { getServerSession } from "@/features/auth/api/getServerSession";

interface CreateApprovalInput {
  workspaceId: string;
  title: string;
  entityType: string;
  entityId: string;
  reviewerIds: string[];
}

export async function createApproval(input: CreateApprovalInput) {
  const user = await getServerSession();
  if (!user) throw new Error("Not authenticated");

  const result = await serverApi.post<{ id: string; message: string }>("/approvals", {
    tenantId: user.tenantId,
    ...input,
  });

  revalidatePath("/approvals");
  return result;
}

export async function processApproval(
  approvalId: string,
  action: "APPROVE" | "REJECT",
  comment?: string,
) {
  const result = await serverApi.patch<{ message: string }>(`/approvals/${approvalId}/process`, {
    action,
    comment,
  });

  revalidatePath("/approvals");
  return result;
}
