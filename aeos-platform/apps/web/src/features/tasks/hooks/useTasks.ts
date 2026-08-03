"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";
import type { Task } from "../types";
import type { PaginatedResponse } from "@/types/api";

interface TaskFilters {
  projectId?: string;
  sprintId?: string;
  status?: string;
  assigneeId?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () =>
      clientApi.get<PaginatedResponse<Task>>("/tasks", {
        projectId: filters.projectId,
        sprintId: filters.sprintId,
        status: filters.status,
        assigneeId: filters.assigneeId,
        priority: filters.priority,
        page: filters.page ?? 1,
        limit: filters.limit ?? 50,
      }),
    enabled: !!filters.projectId,
  });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tasks"] });

  const changeStatus = useMutation({
    mutationFn: (variables: { taskId: string; status: string }) =>
      clientApi.patch<{ message: string }>(`/tasks/${variables.taskId}/status`, { status: variables.status }),
    onSuccess: invalidate,
  });

  const assign = useMutation({
    mutationFn: (variables: { taskId: string; assigneeId: string }) =>
      clientApi.patch<{ message: string }>(`/tasks/${variables.taskId}/assign`, { assigneeId: variables.assigneeId }),
    onSuccess: invalidate,
  });

  const moveToSprint = useMutation({
    mutationFn: (variables: { taskId: string; sprintId: string | null }) =>
      clientApi.patch<{ message: string }>(`/tasks/${variables.taskId}/sprint`, {
        sprintId: variables.sprintId ?? undefined,
      }),
    onSuccess: invalidate,
  });

  return { changeStatus, assign, moveToSprint };
}
