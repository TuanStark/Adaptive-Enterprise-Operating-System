// ── Team types aligned with BE Member / Identity modules ──

export type TeamMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export type TeamMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  avatarUrl: string | null;
  joinedAt: string;
  isOnline?: boolean;
};
