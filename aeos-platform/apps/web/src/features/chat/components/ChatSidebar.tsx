"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Hash, Lock, Plus, MessageSquare, Search, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientApi } from "@/lib/api-client";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { Channel } from "../types";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { useWorkspaces } from "@/features/workspace/hooks/useWorkspaces";
import { WorkspaceSettingsDialog } from "@/features/workspace/components/WorkspaceSettingsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, UserPlus, ChevronDown } from "lucide-react";

export function ChatSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const workspaceId = session?.user?.workspaceId;
  const currentUserId = session?.user?.id;
  const activeChannelId = searchParams.get("channelId");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: workspaces } = useWorkspaces();
  const currentWorkspace = workspaces?.find(w => w.id === workspaceId);

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ["channels", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = (await clientApi.get(`/channels?workspaceId=${workspaceId}`)) as any;
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!workspaceId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = (await clientApi.get(`/workspaces/${workspaceId}/members`)) as any;
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!workspaceId,
  });

  const workspaceChannels: Channel[] = channels.filter((c: Channel) =>
    c.type !== 'DIRECT' && c.name.toLowerCase().includes(search.toLowerCase())
  );

  const directMessages: Channel[] = channels.filter((c: Channel) =>
    c.type === 'DIRECT' &&
    c.members?.some(m => {
      // search by user name if we had it, but for now just filter by type
      return true; // We'll refine this if search applies to DMs
    })
  );

  const selectedChannelId = activeChannelId || workspaceChannels[0]?.id;

  const handleChannelCreated = (newChannelId: string) => {
    queryClient.invalidateQueries({ queryKey: ["channels", workspaceId] });
    router.push(`/chat?channelId=${newChannelId}`);
  };

  const handleCreateDM = async (targetUserId: string) => {
    if (!workspaceId) return;
    try {
      const res = await clientApi.post(`/channels/dm`, {
        workspaceId,
        tenantId: session?.user?.tenantId || 'default',
        targetUserId,
      });
      const data = res as any;
      queryClient.invalidateQueries({ queryKey: ["channels", workspaceId] });
      router.push(`/chat?channelId=${data.id}`);
    } catch (err) {
      console.error('Failed to create DM', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F7F7F8] dark:bg-zinc-900/40 border-r border-gray-200/60 dark:border-zinc-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between group hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 transition-colors">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex-1 text-left font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2 outline-none">
            <span suppressHydrationWarning className="truncate max-w-[150px]">{currentWorkspace?.name || "Channels"}</span>
            <ChevronDown className="w-4 h-4 text-gray-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Workspace Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite People
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded"
          onClick={() => setIsCreateOpen(true)}
          title="Create Channel"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels..."
            className="pl-8 bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-xs h-8 focus-visible:ring-1 focus-visible:ring-emerald-500"
          />
        </div>
      </div>

      {/* Channels List */}
      <div className="p-3 overflow-y-auto flex-1 space-y-5">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
            Workspace Channels
          </p>

          {isLoading ? (
            <div className="space-y-1.5 px-2 py-1">
              <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
          ) : workspaceChannels.length === 0 ? (
            <p className="text-xs text-gray-400 italic px-2 py-1">No channels found</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {workspaceChannels.map((channel) => {
                const isActive = channel.id === selectedChannelId;
                const Icon = channel.type === "PRIVATE" ? Lock : Hash;

                return (
                  <Link
                    key={channel.id}
                    href={`/chat?channelId=${channel.id}`}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-semibold"
                        : "text-gray-600 dark:text-zinc-400 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-200"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-emerald-600" : "text-gray-400")} />
                    <span className="truncate flex-1">{channel.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Direct Messages */}
        <div>
          <div className="flex items-center justify-between mb-2 px-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Direct Messages
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            {members.length === 0 ? (
              <p className="text-xs text-gray-400 italic px-2 py-1">No members found</p>
            ) : (
              members
                .filter((m: any) => m.name?.toLowerCase().includes(search.toLowerCase()))
                .map((member: any) => {
                  const targetUserId = member.userId || member.id;
                  // Check if a DM channel already exists with this user
                  const existingDm = directMessages.find((c: Channel) => {
                    const isSelfDM = targetUserId === currentUserId;
                    if (isSelfDM) {
                      return c.members?.length === 1 && c.members[0].userId === currentUserId;
                    }
                    return c.members?.some(m => m.userId === targetUserId);
                  });

                  const isActive = existingDm?.id === selectedChannelId;
                  const isSelf = targetUserId === currentUserId;
                  const displayName = isSelf ? `${member.name} (You)` : member.name;

                  const content = (
                    <>
                      <div className={cn("w-2 h-2 rounded-full shrink-0", member.isOnline ? "bg-emerald-500" : "bg-gray-300")} />
                      <span className="truncate flex-1 text-left">{displayName}</span>
                    </>
                  );

                  const className = cn(
                    "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md font-medium transition-colors w-full",
                    isActive
                      ? "bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-semibold"
                      : "text-gray-600 dark:text-zinc-400 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-200"
                  );

                  if (existingDm) {
                    return (
                      <Link
                        key={targetUserId}
                        href={`/chat?channelId=${existingDm.id}`}
                        className={className}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={targetUserId}
                      onClick={() => handleCreateDM(targetUserId)}
                      className={className}
                    >
                      {content}
                    </button>
                  );
                })
            )}
          </div>
        </div>
      </div>

      <CreateChannelDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onChannelCreated={handleChannelCreated}
      />
      {workspaceId && (
        <WorkspaceSettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
}
