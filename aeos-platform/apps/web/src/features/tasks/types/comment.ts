export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}
