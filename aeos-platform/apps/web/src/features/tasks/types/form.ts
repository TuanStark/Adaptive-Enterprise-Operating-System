export interface DynamicForm {
  id: string;
  name: string;
  isActive: boolean;
  submissionsCount: number;
  createdAt: string;
}

export interface CreateFormInput {
  tenantId: string;
  workspaceId: string;
  name: string;
  description?: string;
  schema: Record<string, unknown>;
}
