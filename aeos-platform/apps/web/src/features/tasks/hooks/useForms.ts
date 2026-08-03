"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";
import type { DynamicForm, CreateFormInput } from "../types/form";
import type { PaginatedResponse } from "@/types/api";

export function useForms(workspaceId: string | null, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["forms", workspaceId, page, limit],
    queryFn: () =>
      clientApi.get<PaginatedResponse<DynamicForm>>("/forms", {
        workspaceId: workspaceId!,
        page,
        limit,
      }),
    enabled: !!workspaceId,
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFormInput) =>
      clientApi.post<{ id: string; message: string }>("/forms", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
}
