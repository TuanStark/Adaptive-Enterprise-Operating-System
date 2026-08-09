import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import type { Session } from 'next-auth';

export function useSyncAuthStore(user: Session['user'] | undefined) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    setUser(user || null);
  }, [user, setUser]);
}
