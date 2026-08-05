// ── Project types aligned with BE Project Aggregate ──

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ProjectMember = {
  userId: string;
  role: string;
  joinedAt: string;
};

export type Project = {
  id: string;
  tenantId: string;
  workspaceId: string;
  name: string;
  description: string | null;
  ownerId: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string | null;
  endDate: string | null;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectPayload = {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
};

export type UpdateProjectPayload = Partial<CreateProjectPayload>;
