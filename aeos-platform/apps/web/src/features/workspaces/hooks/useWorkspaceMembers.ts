import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";
import { PaginatedResponse } from "@/types/api";

export interface WorkspaceMember {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  joinedAt: string | null;
}

interface UseWorkspaceMembersParams {
  workspaceId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useWorkspaceMembers({ workspaceId, search, page = 1, limit = 50 }: UseWorkspaceMembersParams) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId, { search, page, limit }],
    queryFn: () =>
      clientApi.get<PaginatedResponse<WorkspaceMember>>(`/workspaces/${workspaceId}/members`, {
        search,
        page,
        limit,
      }),
    enabled: !!workspaceId,
  });
}
