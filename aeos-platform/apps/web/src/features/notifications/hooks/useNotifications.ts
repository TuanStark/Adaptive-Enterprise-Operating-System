"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";
import type { Notification } from "../types";
import type { PaginatedResponse } from "@/types/api";

const NOTIFICATIONS_KEY = ["notifications"] as const;

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, page, limit],
    queryFn: () =>
      clientApi.get<PaginatedResponse<Notification>>("/notifications", { page, limit }),
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: (id: string) =>
      clientApi.patch<{ message: string }>(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () =>
      clientApi.patch<{ message: string }>("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });

  return { markAsRead, markAllAsRead };
}
