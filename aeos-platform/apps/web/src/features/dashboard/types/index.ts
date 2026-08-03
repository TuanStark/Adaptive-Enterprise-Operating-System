export interface WorkspaceAnalytics {
  totalProjects: number;
  totalTasks: number;
  totalMembers: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
}
