import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/api-client';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  tenantId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  timezone: string | null;
  phone: string | null;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

export function useProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const data = await clientApi.get<UserProfile>('/users/me');
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<UserProfile>) => {
      await clientApi.patch('/users/profile', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
