"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { useSyncAuthStore } from "../hooks/useSyncAuthStore";

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

function AuthSessionGuard({ children }: { children: React.ReactNode }) {
  const { session } = useAuthSession();
  useSyncAuthStore(session?.user);

  return <>{children}</>;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session} refetchInterval={4 * 60} refetchOnWindowFocus={true}>
      <AuthSessionGuard>{children}</AuthSessionGuard>
    </SessionProvider>
  );
}
