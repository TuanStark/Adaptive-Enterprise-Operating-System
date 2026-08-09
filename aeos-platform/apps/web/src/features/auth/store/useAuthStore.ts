import { create } from "zustand";
import type { Session } from "next-auth";
import type { UserProfile } from "../hooks/useProfile";
import type { WorkspaceMemberProfile } from "../../workspace/hooks/useWorkspaceMemberProfile";

interface AuthState {
  user: Session["user"] | null;
  profile: UserProfile | null;
  workspaceMemberProfile: WorkspaceMemberProfile | null;
  setUser: (user: Session["user"] | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setWorkspaceMemberProfile: (profile: WorkspaceMemberProfile | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  workspaceMemberProfile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setWorkspaceMemberProfile: (workspaceMemberProfile) => set({ workspaceMemberProfile }),
  clearUser: () => set({ user: null, profile: null, workspaceMemberProfile: null }),
}));
