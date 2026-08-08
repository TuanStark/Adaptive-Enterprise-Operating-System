export interface WorkspaceAnalytics {
  overview: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    pendingTasks: number;
    totalDocuments: number;
    totalForms: number;
    totalApprovals: number;
    totalUsers: number;
    totalComments: number;
  };
}

export interface VelocityDataPoint {
  name: string;
  tasks: number;
  completed: number;
}

export interface BurndownDataPoint {
  day: string;
  ideal: number;
  remaining: number | null;
}
