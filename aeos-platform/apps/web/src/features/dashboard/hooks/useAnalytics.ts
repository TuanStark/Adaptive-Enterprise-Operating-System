"use client";

import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";
import type { WorkspaceAnalytics } from "../types";

export function useWorkspaceAnalytics(workspaceId: string | null) {
  return useQuery({
    queryKey: ["analytics", "workspace", workspaceId],
    queryFn: () =>
      clientApi.get<WorkspaceAnalytics>("/analytics/workspace", { workspaceId: workspaceId! }),
    enabled: !!workspaceId,
  });
}
