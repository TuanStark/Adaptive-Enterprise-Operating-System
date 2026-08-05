import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";

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
    queryKey: ["workspaces"],
    queryFn: () => clientApi.get<UserWorkspace[]>("/workspaces/me"),
  });
}

export function useWorkspaceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["workspaces"] });

  const create = useMutation({
    mutationFn: (variables: { tenantId: string; organizationId?: string; name: string; description?: string }) =>
      clientApi.post<{ id: string }>("/workspaces", variables),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (variables: { workspaceId: string; name?: string; description?: string; domain?: string }) =>
      clientApi.patch<{ message: string }>(`/workspaces/${variables.workspaceId}`, {
        name: variables.name,
        description: variables.description,
        domain: variables.domain,
      }),
    onSuccess: invalidate,
  });

  const archive = useMutation({
    mutationFn: (workspaceId: string) => clientApi.patch<{ message: string }>(`/workspaces/${workspaceId}/archive`),
    onSuccess: invalidate,
  });

  return { create, update, archive };
}
