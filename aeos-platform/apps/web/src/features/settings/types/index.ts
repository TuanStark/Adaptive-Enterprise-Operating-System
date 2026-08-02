// ── Settings types aligned with BE workspace/identity modules ──

export type WorkspaceSettings = {
  id: string;
  tenantId: string;
  name: string;
  domain: string;
  createdAt: string;
};

export type ProfileSettings = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  bio?: string;
  status: 'PENDING' | 'ACTIVE' | 'LOCKED' | 'DISABLED';
};
