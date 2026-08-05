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

interface CreateTaskInput {
  tenantId: string;
  projectId: string;
  title: string;
  description?: string;
  type?: string;
  priority?: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: string;
  type?: string;
  storyPoints?: number | null;
  dueDate?: string | null;
}

export interface TaskDetail {
  id: string;
  key: string;
  tenantId: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  type: string;
  priority: string;
  storyPoints: number | null;
  assigneeId: string | null;
  creatorId: string;
  sprintId: string | null;
  parentTaskId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
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

export function useTaskDetail(taskId: string | null) {
  return useQuery({
    queryKey: ["task-detail", taskId],
    queryFn: () => clientApi.get<TaskDetail>(`/tasks/${taskId}`),
    enabled: !!taskId,
  });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tasks"] });

  const create = useMutation({
    mutationFn: (variables: CreateTaskInput) =>
      clientApi.post<Task>("/tasks", variables),
    onSuccess: invalidate,
  });

  const changeStatus = useMutation({
    mutationFn: (variables: { taskId: string; status: string }) =>
      clientApi.patch<{ message: string }>(`/tasks/${variables.taskId}/status`, { status: variables.status }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (variables: { taskId: string } & UpdateTaskInput) => {
      const { taskId, ...payload } = variables;
      return clientApi.patch<{ message: string }>(`/tasks/${taskId}`, payload);
    },
    onSuccess: (_, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["task-detail", variables.taskId] });
    },
  });

  const remove = useMutation({
    mutationFn: (taskId: string) =>
      clientApi.delete<void>(`/tasks/${taskId}`),
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

  return { create, changeStatus, update, remove, assign, moveToSprint };
}

