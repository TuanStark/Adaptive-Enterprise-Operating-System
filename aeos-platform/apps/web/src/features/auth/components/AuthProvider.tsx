"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

function AuthSessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    setUser(session?.user || null);
  }, [session?.user, setUser]);

  useEffect(() => {
    if (session?.error === "RefreshTokenError") {
      console.warn("[auth] Refresh token expired — signing out");
      signOut({ callbackUrl: "/login" });
    }
  }, [session?.error]);

  return <>{children}</>;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session} refetchInterval={4 * 60} refetchOnWindowFocus={true}>
      <AuthSessionGuard>{children}</AuthSessionGuard>
    </SessionProvider>
  );
}
