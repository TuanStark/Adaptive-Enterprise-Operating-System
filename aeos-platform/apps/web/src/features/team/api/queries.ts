import { serverApi, getSessionContext } from "@/lib/api-server";
import type { TeamMember } from "../types";

interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const { workspaceId } = await getSessionContext();
    const response = await serverApi.get<PaginatedResponse<TeamMember>>(
      `/workspaces/${workspaceId}/members`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return [];
  }
}
