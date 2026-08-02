import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, User } from "../types";

interface MessageListProps {
  messages: Message[];
  users: Record<string, User>;
}

export function MessageList({ messages, users }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <div className="px-4 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-full py-1">
          Today
        </div>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {messages.map((msg, idx) => {
        const sender = users[msg.senderId];
        const previousMsg = idx > 0 ? messages[idx - 1] : null;
        const isConsecutive = previousMsg && previousMsg.senderId === msg.senderId;

        return (
          <div key={msg.id} className={`group flex gap-3 px-2 py-1 -mx-2 hover:bg-gray-50 transition-colors ${isConsecutive ? 'mt-0.5' : 'mt-4'}`}>
            <div className="w-10 shrink-0 flex justify-center">
              {!isConsecutive ? (
                <Avatar className="w-10 h-10 rounded-md">
                  <AvatarImage src={sender?.avatarUrl} />
                  <AvatarFallback className="rounded-md bg-emerald-100 text-emerald-700 font-medium">
                    {sender?.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="hidden group-hover:flex items-center text-[10px] text-gray-400 select-none mt-1">
                  12:00
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {!isConsecutive && (
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="font-bold text-[15px] text-gray-900 leading-none">{sender?.name}</span>
                  <span className="text-xs text-gray-500 leading-none">11:59 AM</span>
                </div>
              )}
              <div className="text-[15px] text-gray-800 leading-relaxed break-words whitespace-pre-wrap">
                {msg.content}
              </div>

              {msg.reactions && msg.reactions.length > 0 && (
                <div className="mt-2 flex items-center gap-2 cursor-pointer group/thread w-fit">
                  <div className="flex -space-x-1">
                    <Avatar className="w-5 h-5 border border-white">
                      <AvatarImage src="https://i.pravatar.cc/150?u=2" />
                    </Avatar>
                  </div>
                  <span className="text-sm font-semibold text-blue-600 group-hover/thread:underline">
                    {msg.reactions.length} reactions
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
