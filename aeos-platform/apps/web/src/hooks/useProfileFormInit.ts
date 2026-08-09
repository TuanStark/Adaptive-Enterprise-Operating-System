import { useEffect } from 'react';
import type { UserProfile } from '@/features/auth/hooks/useProfile';

export function useProfileFormInit(
  profile: UserProfile | undefined,
  setMounted: (val: boolean) => void,
  setFirstName: (val: string) => void,
  setLastName: (val: string) => void,
  setBio: (val: string) => void,
  setTimezone: (val: string) => void,
  setPhone: (val: string) => void,
  setAvatarUrl: (val: string) => void,
) {
  useEffect(() => {
    setMounted(true);
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setBio(profile.bio ?? '');
      setTimezone(profile.timezone ?? '');
      setPhone(profile.phone ?? '');
      setAvatarUrl(profile.avatarUrl ?? '');
    }
  }, [profile, setMounted, setFirstName, setLastName, setBio, setTimezone, setPhone, setAvatarUrl]);
}
