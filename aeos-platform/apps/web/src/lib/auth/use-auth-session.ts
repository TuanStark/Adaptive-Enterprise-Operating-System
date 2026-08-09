'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export function useAuthSession() {
  const { data: session, status, update } = useSession();

  useEffect(() => {
    if (session?.error === 'RefreshTokenError') {
      console.warn('[auth] Refresh token expired — signing out');
      signOut({ callbackUrl: '/login' });
    }
  }, [session?.error]);

  return {
    session,
    status,
    update,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
}
