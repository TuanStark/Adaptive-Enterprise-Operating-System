'use client';

import { useQuery } from '@tanstack/react-query';
import { clientApi } from '@/lib/api-client';
import type { WorkspaceAnalytics, VelocityDataPoint, BurndownDataPoint } from '../types';

export function useWorkspaceAnalytics(workspaceId: string | null) {
  return useQuery({
    queryKey: ['analytics', 'workspace', workspaceId],
    queryFn: () =>
      clientApi.get<WorkspaceAnalytics>('/analytics/workspace', { workspaceId: workspaceId! }),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useVelocityChart(workspaceId: string | null) {
  return useQuery({
    queryKey: ['analytics', 'velocity', workspaceId],
    queryFn: () =>
      clientApi.get<VelocityDataPoint[]>('/analytics/workspace/velocity', {
        workspaceId: workspaceId!,
      }),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useBurndownChart(workspaceId: string | null) {
  return useQuery({
    queryKey: ['analytics', 'burndown', workspaceId],
    queryFn: () =>
      clientApi.get<BurndownDataPoint[]>('/analytics/workspace/burndown', {
        workspaceId: workspaceId!,
      }),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
