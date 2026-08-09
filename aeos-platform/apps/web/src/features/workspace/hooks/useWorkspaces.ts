import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/api-client';

export interface WorkspaceMembership {
  roleId: string | null;
  roleName: string | null;
  joinedAt: string | null;
}

export interface UserWorkspace {
  id: string;
  name: string | null;
  description: string | null;
  organizationId: string | null;
  status: string | null;
  membership: WorkspaceMembership;
}

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => clientApi.get<UserWorkspace[]>('/workspaces/me'),
  });
}

export function useWorkspaceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['workspaces'] });

  const create = useMutation({
    mutationFn: (variables: {
      tenantId: string;
      organizationId?: string;
      name: string;
      description?: string;
    }) => clientApi.post<{ id: string }>('/workspaces', variables),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (variables: {
      workspaceId: string;
      name?: string;
      description?: string;
      domain?: string;
    }) =>
      clientApi.patch<{ message: string }>(`/workspaces/${variables.workspaceId}`, {
        name: variables.name,
        description: variables.description,
        domain: variables.domain,
      }),
    onSuccess: invalidate,
  });

  const archive = useMutation({
    mutationFn: (workspaceId: string) =>
      clientApi.patch<{ message: string }>(`/workspaces/${workspaceId}/archive`),
    onSuccess: invalidate,
  });

  return { create, update, archive };
}

export interface WorkspaceMember {
  userId: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  joinedAt: string;
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: () =>
      clientApi.get<{ data: WorkspaceMember[]; total: number }>(
        `/workspaces/${workspaceId}/members`,
      ),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceMemberMutations(workspaceId: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });

  const invite = useMutation({
    mutationFn: (email: string) =>
      clientApi.post<{ message: string }>(`/workspaces/${workspaceId}/invites`, { email }),
  });

  const remove = useMutation({
    mutationFn: (userId: string) =>
      clientApi.post<{ message: string }>(`/workspaces/${workspaceId}/members/${userId}/remove`),
    onSuccess: invalidate,
  });

  return { invite, remove };
}
