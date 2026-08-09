import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/api-client';
import { toast } from 'sonner';

export function useAddChannelMember(channelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await clientApi.post<{ message: string }>(`/channels/${channelId}/members`, {
        userId,
      });
      return response;
    },
    onSuccess: () => {
      toast.success('Member added to channel');
      // Invalidate channel queries to refresh member list
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      // The current channel details might also need invalidation if they exist
      queryClient.invalidateQueries({ queryKey: ['channel', channelId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add member');
    },
  });
}
