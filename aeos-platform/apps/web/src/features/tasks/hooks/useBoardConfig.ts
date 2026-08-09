'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/api-client';
import type { BoardConfig, BoardColumn } from '../types/board';

export function useBoardConfig(projectId: string | null) {
  return useQuery({
    queryKey: ['board-config', projectId],
    queryFn: () => clientApi.get<BoardConfig>(`/boards/${projectId}/config`),
    enabled: !!projectId,
  });
}

export function useBoardConfigMutations(projectId: string | null) {
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: (variables: { columns: BoardColumn[]; name?: string; workspaceId?: string }) =>
      clientApi.put<BoardConfig>(`/boards/${projectId}/config`, {
        name: variables.name ?? 'Board',
        columns: variables.columns,
        workspaceId: variables.workspaceId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-config', projectId] });
    },
  });

  return { save };
}
