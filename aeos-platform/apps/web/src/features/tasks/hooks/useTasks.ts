'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/api-client';
import type {
  Task,
  TaskDetail,
  TaskFilters,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
} from '../types';
import type { PaginatedResponse } from '@/types/api';

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () =>
      clientApi.get<PaginatedResponse<Task>>('/tasks', {
        workspaceId: filters.workspaceId,
        projectId: filters.projectId,
        sprintId: filters.sprintId,
        status: filters.status,
        assigneeId: filters.assigneeId,
        reporterId: filters.reporterId,
        priority: filters.priority,
        type: filters.type,
        fixVersionId: filters.fixVersionId,
        search: filters.search,
        page: filters.page ?? 1,
        limit: filters.limit ?? 50,
      }),
    enabled: !!filters.projectId || !!filters.workspaceId,
  });
}

export function useTaskDetail(taskId: string | null) {
  return useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: () => clientApi.get<TaskDetail>(`/tasks/${taskId}`),
    enabled: !!taskId,
  });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tasks'] });

  const create = useMutation({
    mutationFn: (variables: CreateTaskInput) => clientApi.post<Task>('/tasks', variables),
    onSuccess: invalidate,
  });

  const changeStatus = useMutation({
    mutationFn: (variables: { taskId: string; status: TaskStatus }) =>
      clientApi.patch<{ message: string }>(`/tasks/${variables.taskId}/status`, {
        status: variables.status,
      }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasksQueries = queryClient.getQueriesData<PaginatedResponse<Task>>({
        queryKey: ['tasks'],
      });
      queryClient.setQueriesData<PaginatedResponse<Task>>({ queryKey: ['tasks'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((task) =>
            task.id === variables.taskId ? { ...task, status: variables.status } : task,
          ),
        };
      });
      return { previousTasksQueries };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSettled: () => {
      invalidate();
    },
  });

  const update = useMutation({
    mutationFn: (variables: { taskId: string } & UpdateTaskInput) => {
      const { taskId, ...payload } = variables;
      return clientApi.patch<{ message: string }>(`/tasks/${taskId}`, payload);
    },
    onSuccess: (_, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['task-detail', variables.taskId] });
    },
  });

  const remove = useMutation({
    mutationFn: (taskId: string) => clientApi.delete<void>(`/tasks/${taskId}`),
    onSuccess: invalidate,
  });

  const assign = useMutation({
    mutationFn: (variables: { taskId: string; assigneeId: string }) =>
      clientApi.patch<{ message: string }>(`/tasks/${variables.taskId}/assign`, {
        assigneeId: variables.assigneeId,
      }),
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
