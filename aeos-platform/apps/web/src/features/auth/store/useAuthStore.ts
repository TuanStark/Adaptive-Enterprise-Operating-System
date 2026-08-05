import { create } from "zustand";
import type { Session } from "next-auth";
interface AuthState {
  user: Session["user"] | null;
  setUser: (user: Session["user"] | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
