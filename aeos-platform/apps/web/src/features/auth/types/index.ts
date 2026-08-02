// ── Auth types aligned with BE Identity module ──

export type UserStatus = 'PENDING' | 'ACTIVE' | 'LOCKED' | 'DISABLED';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  emailVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
