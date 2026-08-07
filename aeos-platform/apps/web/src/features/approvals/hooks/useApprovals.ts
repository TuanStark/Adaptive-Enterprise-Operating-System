"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";
import type { Approval } from "../types";
import type { PaginatedResponse } from "@/types/api";

export function useApprovals(workspaceId: string | null, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["approvals", workspaceId, page, limit],
    queryFn: () =>
      clientApi.get<PaginatedResponse<Approval>>("/approvals", {
        workspaceId: workspaceId!,
        page,
        limit,
      }),
    enabled: !!workspaceId,
  });
}

export function useProcessApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { approvalId: string; action: "APPROVE" | "REJECT"; comment?: string }) =>
      clientApi.patch<{ message: string }>(`/approvals/${variables.approvalId}/process`, {
        action: variables.action,
        comment: variables.comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
  });
}

export function useCreateApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      tenantId: string;
      workspaceId: string;
      title: string;
      entityType: string;
      entityId: string;
      reviewerIds: string[];
    }) => clientApi.post<{ id: string; message: string }>("/approvals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
  });
}
