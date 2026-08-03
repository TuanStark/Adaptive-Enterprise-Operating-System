"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";
import type { Sprint } from "../types/sprint";

export function useSprints(projectId: string) {
  return useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => clientApi.get<Sprint[]>("/sprints", { projectId }),
    enabled: !!projectId,
  });
}

export function useSprintMutations(projectId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });

  const create = useMutation({
    mutationFn: (input: { name: string; tenantId: string; projectId: string; goal?: string; startDate?: string; endDate?: string }) =>
      clientApi.post<{ id: string }>("/sprints", input),
    onSuccess: invalidate,
  });

  const start = useMutation({
    mutationFn: (id: string) => clientApi.patch<{ message: string }>(`/sprints/${id}/start`),
    onSuccess: invalidate,
  });

  const complete = useMutation({
    mutationFn: (id: string) => clientApi.patch<{ message: string }>(`/sprints/${id}/complete`),
    onSuccess: invalidate,
  });

  return { create, start, complete };
}
