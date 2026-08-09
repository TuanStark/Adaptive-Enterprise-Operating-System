'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/api-client';
import type { Comment } from '../types/comment';

export function useComments(taskId: string) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => clientApi.get<Comment[]>(`/tasks/${taskId}/comments`),
    enabled: !!taskId,
  });
}

export function useAddComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { tenantId: string; content: string }) =>
      clientApi.post<{ id: string }>(`/tasks/${taskId}/comments`, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });
}
