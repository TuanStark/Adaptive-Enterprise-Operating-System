import { Hash, Bell, Search, Info } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ChatHeaderProps {
  channelName: string;
  memberCount: number;
}

export function ChatHeader({ channelName, memberCount }: ChatHeaderProps) {
  return (
    <div className="h-14 shrink-0 px-4 border-b border-gray-200 flex items-center justify-between bg-white z-10 w-full">
      <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md transition-colors -ml-2">
        <Hash className="w-5 h-5 text-gray-500" />
        <h2 className="font-bold text-gray-900 text-[15px]">{channelName}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Member Cluster */}
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

        <div className="h-5 w-px bg-gray-200"></div>

        <div className="flex items-center gap-2 text-gray-500">
          <button className="p-1.5 hover:bg-gray-100 rounded-md"><Search className="w-[18px] h-[18px]" /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-md"><Bell className="w-[18px] h-[18px]" /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-md"><Info className="w-[18px] h-[18px]" /></button>
        </div>
      </div>
    </div>
  );
}
