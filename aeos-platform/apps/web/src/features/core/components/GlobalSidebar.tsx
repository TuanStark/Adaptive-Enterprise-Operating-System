"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, CheckSquare, Folder, FileText, Settings, Users, MessageSquare, Plus, Video, Shield, Check } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useWorkspaces } from "@/features/workspace/hooks/useWorkspaces";
import { CreateWorkspaceDialog } from "@/features/workspace/components/CreateWorkspaceDialog";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const globalNavItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Docs", href: "/docs", icon: FileText },
  { name: "Projects", href: "/projects", icon: Folder },
  { name: "Meetings", href: "/meetings", icon: Video },
  { name: "Team", href: "/team", icon: Users },
  { name: "Approvals", href: "/approvals", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function GlobalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update, status } = useSession();
  const { data: workspacesData, isLoading } = useWorkspaces();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const setActiveWorkspaceId = useAppStore((s) => s.setActiveWorkspaceId);

  const workspaces = workspacesData || [];
  const currentWorkspaceId = session?.user?.workspaceId;
  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);
  const workspaceInitial = currentWorkspace?.name?.charAt(0).toUpperCase() || "W";

  const handleSwitchWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (workspaceId === currentWorkspaceId) {
      setActiveWorkspaceId(workspaceId);
      return;
    }
    setActiveWorkspaceId(workspaceId);
    await update({ workspaceId, workspaceName });
    router.refresh();
  };

  useEffect(() => {
    if (status === "loading" || isLoading) return;

    if (workspaces.length > 0) {
      if (!currentWorkspaceId || !workspaces.find((w) => w.id === currentWorkspaceId)) {
        const first = workspaces[0];
        handleSwitchWorkspace(first.id, first.name || "Unknown");
      } else {
        setActiveWorkspaceId(currentWorkspaceId);
      }
    }
  }, [workspaces, currentWorkspaceId, isLoading, status]);

  return (
    <aside className="w-16 h-screen bg-[#1E1F22] flex flex-col items-center py-4 border-r border-[#1E1F22] z-30 shrink-0">
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg mb-6 shadow-md shadow-primary/20">
        A
      </div>

      <div className="flex-1 flex flex-col gap-3 w-full px-2">
        {globalNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative group flex justify-center"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-[14px] transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-gray-400 hover:bg-[#2B2D31] hover:text-gray-100 hover:rounded-[10px]"
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>

              {/* Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.name}
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-md"></div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto px-2 w-full flex justify-center pb-2 relative group/workspace">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className="w-12 h-12 rounded-[14px] bg-[#2B2D31] text-gray-100 font-semibold text-lg flex items-center justify-center hover:bg-primary hover:text-white hover:rounded-[10px] transition-all duration-300 focus:outline-none shadow-sm">
              {workspaceInitial}
            </button>
          } />
          <DropdownMenuContent align="start" side="right" sideOffset={16} className="w-64 p-2 shadow-xl border-gray-200/50 rounded-xl">
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 px-2">
              Workspaces
            </DropdownMenuLabel>

            {isLoading ? (
              <DropdownMenuItem disabled className="px-2 py-2">
                <div className="animate-pulse w-full h-4 bg-gray-200 rounded"></div>
              </DropdownMenuItem>
            ) : workspaces.length > 0 ? (
              <div className="space-y-1">
                {workspaces.map((ws) => {
                  const isActive = ws.id === currentWorkspaceId;
                  const initial = ws.name?.charAt(0).toUpperCase() || "W";
                  return (
                    <DropdownMenuItem
                      key={ws.id}
                      onClick={() => handleSwitchWorkspace(ws.id, ws.name || "Unknown")}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 cursor-pointer rounded-lg transition-all",
                        isActive ? "bg-primary/5 text-primary" : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-colors",
                        isActive ? "bg-primary text-white shadow-sm" : "bg-gray-200 text-gray-600"
                      )}>
                        {initial}
                      </div>
                      <span className={cn("flex-1 truncate", isActive ? "font-semibold" : "font-medium")}>
                        {ws.name}
                      </span>
                      {isActive && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            ) : (
              <DropdownMenuItem disabled className="px-2 py-2 text-gray-500">
                No workspaces
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                <Plus className="h-4 w-4 text-gray-500" />
              </div>
              Create Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tooltip for Workspace Switcher */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover/workspace:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {currentWorkspace?.name || "Switch Workspace"}
        </div>
      </div>

      <CreateWorkspaceDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
    </aside>
  );
}
