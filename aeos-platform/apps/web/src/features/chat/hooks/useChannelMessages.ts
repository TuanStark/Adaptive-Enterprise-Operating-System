import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/api-client';
import { Message } from '../types';

export function useChannelMessages(channelId: string, initialMessages?: Message[]) {
  const queryClient = useQueryClient();
  const queryKey = ['channels', channelId, 'messages'];

  const { data: messages = initialMessages || [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res: any = await clientApi.get(`/channels/${channelId}/messages`);
      const list = Array.isArray(res) ? res : res?.data || [];
      return [...list].reverse();
    },
    enabled: !!channelId,
    initialData: initialMessages,
  });

  const setMessages = (updater: Message[] | ((prev: Message[]) => Message[])) => {
    queryClient.setQueryData<Message[]>(queryKey, (old = []) => {
      if (typeof updater === 'function') {
        return updater(old);
      }
      return updater;
    });
  };

  return { messages, setMessages, isLoading };
}
