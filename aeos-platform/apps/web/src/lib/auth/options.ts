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
  role?: string;
  status: string;
}

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

        const loginData = await backendLogin(email, password);
        if (!loginData) return null;

        const profile = await backendGetProfile(loginData.accessToken);

        const displayName = profile
          ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || email
          : email;

        return {
          id: loginData.userId,
          email: loginData.email,
          name: displayName,
          role: profile?.role ?? "USER",
          tenantId: profile?.tenantId ?? "",
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
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          tenantId: user.tenantId,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: user.expiresAt,
        };
      }

      const now = Math.floor(Date.now() / 1000);
      if (now < token.expiresAt - TOKEN_REFRESH_BUFFER_SECONDS) {
        return token;
      }

      console.log("[auth] Access token expiring, attempting refresh…");
      const refreshed = await backendRefreshToken(token.refreshToken);

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

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.tenantId = token.tenantId;
      session.accessToken = token.accessToken;

      if (token.error) {
        session.error = token.error;
      }

      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isPublicRoute = ["/login", "/register", "/forgot-password"].some(
        (route) => pathname === route || pathname.startsWith(route + "/"),
      );

      if (!isLoggedIn && !isPublicRoute) {
        return false;
      }

      if (isLoggedIn && isPublicRoute) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`[auth:event] User signed in: ${user.email} (${user.id})`);
    },
    async signOut(message) {
      console.log("[auth:event] User signed out:", "token" in message ? "JWT session" : "");
    },
  },
};
