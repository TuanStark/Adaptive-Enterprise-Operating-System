import { create } from 'zustand';

interface AppState {
  isGlobalSidebarOpen: boolean;
  toggleGlobalSidebar: () => void;
  isLocalSidebarOpen: boolean;
  toggleLocalSidebar: () => void;
  setLocalSidebarOpen: (isOpen: boolean) => void;
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isGlobalSidebarOpen: true,
  toggleGlobalSidebar: () => set((state) => ({ isGlobalSidebarOpen: !state.isGlobalSidebarOpen })),
  isLocalSidebarOpen: true,
  toggleLocalSidebar: () => set((state) => ({ isLocalSidebarOpen: !state.isLocalSidebarOpen })),
  setLocalSidebarOpen: (isOpen) => set({ isLocalSidebarOpen: isOpen }),
  activeWorkspaceId: null,
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
}));
