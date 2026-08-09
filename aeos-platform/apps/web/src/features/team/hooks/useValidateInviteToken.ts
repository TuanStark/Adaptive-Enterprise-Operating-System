import { useState, useEffect } from 'react';
import { clientApi } from '@/lib/api-client';
import { InviteInfo } from '../types/invite.types';

interface UseValidateInviteTokenResult {
  inviteInfo: InviteInfo | null;
  isValidating: boolean;
  validateError: string | null;
}

export function useValidateInviteToken(token: string | null): UseValidateInviteTokenResult {
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [validateError, setValidateError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      return;
    }

    let isMounted = true;
    const validateToken = async () => {
      try {
        const res = await clientApi.get<InviteInfo>(`/workspaces/invites/validate?token=${token}`);
        if (isMounted) {
          setInviteInfo(res);
          setValidateError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg =
            err instanceof Error ? err.message : 'The invitation link is invalid or has expired.';
          setValidateError(msg);
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };

    validateToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return {
    inviteInfo,
    isValidating,
    validateError,
  };
}
