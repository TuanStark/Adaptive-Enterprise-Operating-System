import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string;
      organizationId: string;
      workspaceId: string;
      workspaceName: string;
    } & DefaultSession["user"];
    accessToken: string;
    error?: "RefreshTokenError";
  }

  interface User {
    id: string;
    role: string;
    tenantId: string;
    organizationId: string;
    workspaceId: string;
    workspaceName: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    tenantId: string;
    organizationId: string;
    workspaceId: string;
    workspaceName: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    error?: "RefreshTokenError";
  }
}
