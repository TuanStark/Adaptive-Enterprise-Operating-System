import { Hash, Bell, Search, Info, Lock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "../types";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  channelName: string;
  memberCount: number;
  channelType?: 'PUBLIC' | 'PRIVATE' | 'DIRECT';
  targetUser?: User | null;
}

export function ChatHeader({ channelName, memberCount, channelType = 'PUBLIC', targetUser }: ChatHeaderProps) {
  const isDirect = channelType === 'DIRECT';
  const Icon = channelType === 'PRIVATE' ? Lock : Hash;

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
          <div className="hidden sm:flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md border border-transparent hover:border-gray-200 transition-all">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((i) => (
                <Avatar key={i} className="w-6 h-6 border border-white">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-600">{memberCount}</span>
          </div>
        )}

        {!isDirect && <div className="h-5 w-px bg-gray-200"></div>}

        <div className="flex items-center gap-2 text-gray-500">
          <button className="p-1.5 hover:bg-gray-100 rounded-md"><Search className="w-[18px] h-[18px]" /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-md"><Bell className="w-[18px] h-[18px]" /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-md"><Info className="w-[18px] h-[18px]" /></button>
        </div>
      </div>
    </div>
  );
}
