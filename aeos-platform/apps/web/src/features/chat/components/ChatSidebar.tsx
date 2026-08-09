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

  const filteredChannels: Channel[] = channels.filter((c: Channel) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const teamMembers = members.filter(
    (m: any) => m.userId !== currentUserId && m.name?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedChannelId = activeChannelId || channels[0]?.id;

  const handleChannelCreated = (newChannelId: string) => {
    queryClient.invalidateQueries({ queryKey: ["channels", workspaceId] });
    router.push(`/chat?channelId=${newChannelId}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#F7F7F8] dark:bg-zinc-900/40 border-r border-gray-200/60 dark:border-zinc-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between group hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 transition-colors">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex-1 text-left font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2 outline-none">
            <span className="truncate max-w-[150px]">{currentWorkspace?.name || "Channels"}</span>
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
          ) : filteredChannels.length === 0 ? (
            <p className="text-xs text-gray-400 italic px-2 py-1">No channels found</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filteredChannels.map((channel) => {
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
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
            Direct Messages
          </p>
          <div className="flex flex-col gap-0.5">
            {teamMembers.length === 0 ? (
              <p className="text-xs text-gray-400 italic px-2 py-1">No team members</p>
            ) : (
              teamMembers.map((member: any) => (
                <div
                  key={member.userId || member.id}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-200/50 rounded-md cursor-pointer transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{member.name}</span>
                </div>
              ))
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
