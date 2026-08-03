// ── Comment types aligned with BE Comment Entity ──

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  content: string;
  createdAt: string;
};
