export type InviteStatus = "idle" | "loading" | "success" | "error";

export interface InviteInfo {
  email: string;
  workspaceId: string;
  workspaceName?: string;
  inviterName?: string;
}

export interface UserWorkspaceDto {
  id: string;
  name: string | null;
  organizationId: string | null;
  membership?: {
    roleName?: string | null;
  };
}
