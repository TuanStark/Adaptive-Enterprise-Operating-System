"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";
import type { Meeting, CreateMeetingInput } from "../types";
import type { PaginatedResponse } from "@/types/api";

export function useMeetings(workspaceId: string | null, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["meetings", workspaceId, page, limit],
    queryFn: () =>
      clientApi.get<PaginatedResponse<Meeting>>("/meetings", {
        workspaceId: workspaceId!,
        page,
        limit,
      }),
    enabled: !!workspaceId,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMeetingInput) =>
      clientApi.post<{ id: string; message: string }>("/meetings", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}
