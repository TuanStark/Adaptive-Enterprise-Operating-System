import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/api-client';
import { toast } from 'sonner';

export interface WorkspaceMemberProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  nickname: string | null;
  title: string | null;
  department: string | null;
  statusMessage: string | null;
  joinedAt: string | null;
}

export function useWorkspaceMemberProfile(workspaceId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['workspace', workspaceId, 'member', 'me'],
    queryFn: async () => {
      const data = await clientApi.get<WorkspaceMemberProfile>(`/workspaces/${workspaceId}/members/me`);
      return data;
    },
    enabled: !!workspaceId,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<WorkspaceMemberProfile>) => {
      await clientApi.patch(`/workspaces/${workspaceId}/members/profile`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'member', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
      toast.success('Workspace profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update workspace profile');
    },
  });

  return {
    memberProfile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateMemberProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
