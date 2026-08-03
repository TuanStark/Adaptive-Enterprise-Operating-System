import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem("aeos_access_token");
    localStorage.removeItem("aeos_refresh_token");
    localStorage.removeItem("aeos_user");
    set({ user: null });
    window.location.href = "/login";
  },
}));
