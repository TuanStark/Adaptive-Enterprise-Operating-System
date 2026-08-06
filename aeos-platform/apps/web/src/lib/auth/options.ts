import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import {
  TOKEN_REFRESH_BUFFER_SECONDS,
  ACCESS_TOKEN_EXPIRY_SECONDS,
  LOGIN_PAGE,
  ERROR_PAGE,
} from "./constants";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_PREFIX = "/api/v1";

interface BackendLoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
}

interface BackendRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

interface BackendUserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  tenantId: string;
  status: string;
}

interface WorkspaceMembership {
  roleId: string | null;
  roleName: string | null;
  joinedAt: string | null;
}

interface UserWorkspace {
  id: string;
  name: string | null;
  description: string | null;
  organizationId: string | null;
  status: string | null;
  membership: WorkspaceMembership;
}

// ── Backend API Helpers ──────────────────────────────────────

async function backendLogin(
  email: string,
  password: string,
): Promise<BackendLoginResponse | null> {
  try {
    const res = await fetch(`${API_BASE}${API_PREFIX}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const body = await res.json();

    if (res.ok && body.success) {
      return body.data as BackendLoginResponse;
    }

    console.error("[auth] Login failed:", body.error?.message ?? res.statusText);
    return null;
  } catch (error) {
    console.error("[auth] Login network error:", error);
    return null;
  }
}

async function backendGetProfile(
  accessToken: string,
): Promise<BackendUserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}${API_PREFIX}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const body = await res.json();
    if (res.ok && body.success) {
      return body.data as BackendUserProfile;
    }
    return null;
  } catch {
    return null;
  }
}

async function backendGetUserWorkspaces(
  accessToken: string,
): Promise<UserWorkspace[]> {
  try {
    const res = await fetch(`${API_BASE}${API_PREFIX}/workspaces/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const body = await res.json();
    if (res.ok && body.success) {
      return body.data as UserWorkspace[];
    }
    return [];
  } catch {
    return [];
  }
}

async function backendRefreshToken(
  refreshToken: string,
): Promise<BackendRefreshResponse | null> {
  try {
    const res = await fetch(`${API_BASE}${API_PREFIX}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const body = await res.json();
    if (res.ok && body.success) {
      return body.data as BackendRefreshResponse;
    }

    console.error("[auth] Refresh token failed:", body.error?.message ?? res.statusText);
    return null;
  } catch (error) {
    console.error("[auth] Refresh token network error:", error);
    return null;
  }
}

// ── Refresh Token Dedup Lock ─────────────────────────────────
// Prevents race condition: multiple concurrent jwt() calls all see
// "token expiring" → all call backendRefreshToken → first succeeds
// and revokes old session → second fails with "invalid or expired".
// Solution: dedup by refreshToken string, share the same promise.
let inflightRefresh: Promise<BackendRefreshResponse | null> | null = null;
let inflightRefreshKey: string | null = null;

async function dedupRefreshToken(
  refreshToken: string,
): Promise<BackendRefreshResponse | null> {
  if (inflightRefreshKey === refreshToken && inflightRefresh) {
    return inflightRefresh;
  }
  inflightRefreshKey = refreshToken;
  inflightRefresh = backendRefreshToken(refreshToken).finally(() => {
    inflightRefresh = null;
    inflightRefreshKey = null;
  });
  return inflightRefresh;
}

// ── NextAuth Options ─────────────────────────────────────────

export const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        // 1. Login → lấy tokens
        const loginData = await backendLogin(email, password);
        if (!loginData) return null;

        // 2. Lấy user profile
        const profile = await backendGetProfile(loginData.accessToken);

        const displayName = profile
          ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || email
          : email;

        // 3. Lấy danh sách workspace → auto-select workspace đầu tiên
        const workspaces = await backendGetUserWorkspaces(loginData.accessToken);
        const activeWorkspace = workspaces[0] ?? null;

        const role = activeWorkspace?.membership.roleName ?? "USER";
        const workspaceId = activeWorkspace?.id ?? "";
        const workspaceName = activeWorkspace?.name ?? "";
        const organizationId = activeWorkspace?.organizationId ?? "";

        console.log(
          `[auth] User ${email} logged in → org: ${organizationId}, workspace: "${workspaceName}" (${workspaceId}), role: ${role}`,
        );

        return {
          id: loginData.userId,
          email: loginData.email,
          name: displayName,
          role,
          tenantId: profile?.tenantId ?? "",
          organizationId,
          workspaceId,
          workspaceName,
          accessToken: loginData.accessToken,
          refreshToken: loginData.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY_SECONDS,
        };
      },
    }),
  ],

  pages: {
    signIn: LOGIN_PAGE,
    error: ERROR_PAGE,
  },

  session: { strategy: "jwt" },

  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

  debug: process.env.NODE_ENV === "development",

  callbacks: {
    // ── JWT Callback: Token Rotation ──
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.workspaceId) token.workspaceId = session.workspaceId;
        if (session.workspaceName) token.workspaceName = session.workspaceName;
        if (session.organizationId) token.organizationId = session.organizationId;
      }

      // Initial sign-in: seed JWT with all backend data
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          tenantId: user.tenantId,
          organizationId: user.organizationId,
          workspaceId: user.workspaceId,
          workspaceName: user.workspaceName,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: user.expiresAt,
        };
      }

      // Token chưa hết hạn → trả về nguyên
      const now = Math.floor(Date.now() / 1000);
      if (now < (token.expiresAt as number) - TOKEN_REFRESH_BUFFER_SECONDS) {
        return token;
      }

      // Token sắp hết hạn → gọi refresh (deduped)
      console.log("[auth] Access token expiring, attempting refresh…");
      const refreshed = await dedupRefreshToken(token.refreshToken as string);

      if (!refreshed) {
        console.error("[auth] Refresh token failed — marking session as errored");
        return { ...token, error: "RefreshTokenError" as const };
      }

      console.log("[auth] Token refreshed successfully");
      return {
        ...token,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        expiresAt: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY_SECONDS,
        error: undefined,
      };
    },

    // ── Session Callback: Expose data cho client ──
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.tenantId = token.tenantId as string;
      session.user.organizationId = token.organizationId as string;
      session.user.workspaceId = token.workspaceId as string;
      session.user.workspaceName = token.workspaceName as string;
      session.accessToken = token.accessToken as string;

      if (token.error) {
        session.error = token.error as "RefreshTokenError";
      }

      return session;
    },

    // ── Authorized Callback: Middleware route protection ──
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isPublicRoute = ["/login", "/register", "/forgot-password"].some(
        (route) => pathname === route || pathname.startsWith(route + "/"),
      );

      // Chưa login + route bảo vệ → redirect về login
      if (!isLoggedIn && !isPublicRoute) {
        return false;
      }

      // Đã login + đang ở trang auth → redirect về dashboard
      if (isLoggedIn && isPublicRoute) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`[auth:event] User signed in: ${user.email} (${user.id}) → workspace: ${user.workspaceId}`);
    },
    async signOut(message) {
      console.log("[auth:event] User signed out:", "token" in message ? "JWT session" : "");
    },
  },
};
