export const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/invite'] as const;
export const AUTH_ROUTES = ['/login', '/register'] as const;
export const DEFAULT_LOGIN_REDIRECT = '/';
export const LOGIN_PAGE = '/login';
export const ERROR_PAGE = '/auth/error';
export const TOKEN_REFRESH_BUFFER_SECONDS = 5 * 60;
export const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_ROUTE_MAP: Record<string, UserRole[]> = {
  '/admin': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/settings/organization': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
};
