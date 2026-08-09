import { Hash, Bell, Search, Info, Lock, Loader2, UserPlus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { User } from "../types";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useWorkspaceMembers } from "../../workspaces/hooks/useWorkspaceMembers";
import { useAddChannelMember } from "../hooks/useAddChannelMember";

interface ChatHeaderProps {
  channelId?: string;
  channelName: string;
  memberCount: number;
  channelType?: 'PUBLIC' | 'PRIVATE' | 'DIRECT';
  targetUser?: User | null;
  members?: User[];
}

export function ChatHeader({ channelId, channelName, memberCount, channelType = 'PUBLIC', targetUser, members }: ChatHeaderProps) {
  const isDirect = channelType === 'DIRECT';
  const Icon = channelType === 'PRIVATE' ? Lock : Hash;

  const uniqueMembers = Array.from(new Map((members || []).map(m => [m.id, m])).values());
  const displayMemberCount = members ? uniqueMembers.length : memberCount;

  // Search logic
  const { data: session } = useSession();
  const workspaceId = session?.user?.workspaceId;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: workspaceMembersResponse, isLoading: isSearching } = useWorkspaceMembers({
    workspaceId,
    search: debouncedSearch,
  });

  const addMemberMutation = useAddChannelMember(channelId || "");

  const searchResults = workspaceMembersResponse?.data || [];
  const showSearchResults = debouncedSearch.length > 0;

  return (
    <div className="h-14 shrink-0 px-4 border-b border-gray-200 flex items-center justify-between bg-white z-10 w-full">
      <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md transition-colors -ml-2">
        {isDirect ? (
          <div className="relative">
            <Avatar className="w-6 h-6">
              <AvatarImage src={targetUser?.avatarUrl} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-medium">
                {channelName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
              targetUser?.isOnline ? "bg-emerald-500" : "bg-gray-300"
            )} />
          </div>
        ) : (
          <Icon className="w-5 h-5 text-gray-500" />
        )}
        <h2 className="font-bold text-gray-900 text-[15px]">{channelName}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Member Cluster - Only show for non-DM channels */}
        {!isDirect && (
          <Dialog>
            <DialogTrigger 
              render={
                <div className="hidden sm:flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md border border-transparent hover:border-gray-200 transition-all" />
              }
            >
              <div className="flex -space-x-1.5">
                {uniqueMembers.slice(0, 3).map((user) => (
                  <Avatar key={user.id} className="w-6 h-6 border border-white">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600">{displayMemberCount}</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Channel Members ({displayMemberCount})</DialogTitle>
              </DialogHeader>

              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Find members to add..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="max-h-[60vh] overflow-y-auto mt-2 space-y-3 pr-2">
                {showSearchResults ? (
                  isSearching ? (
                    <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => {
                      const isAlreadyMember = uniqueMembers.some((m) => m.id === user.userId);
                      return (
                        <div key={user.id} className="flex items-center justify-between gap-3 group">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.avatarUrl || undefined} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{user.name}</span>
                              <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={isAlreadyMember ? "secondary" : "default"}
                            disabled={isAlreadyMember || addMemberMutation.isPending}
                            onClick={() => addMemberMutation.mutate(user.userId!)}
                          >
                            {isAlreadyMember ? "Joined" : "Add"}
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500">No members found.</div>
                  )
                ) : (
                  uniqueMembers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
                          user.isOnline ? "bg-emerald-500" : "bg-gray-300"
                        )} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        {user.isOnline ? (
                          <span className="text-xs text-emerald-600">Online</span>
                        ) : (
                          <span className="text-xs text-gray-500">Offline</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {!isDirect && <div className="h-5 w-px bg-gray-200"></div>}

        {/* <div className="flex items-center gap-2 text-gray-500">
          <button className="p-1.5 hover:bg-gray-100 rounded-md"><Search className="w-[18px] h-[18px]" /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-md"><Bell className="w-[18px] h-[18px]" /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-md"><Info className="w-[18px] h-[18px]" /></button>
        </div> */}
      </div>
    </div>
  );
}
