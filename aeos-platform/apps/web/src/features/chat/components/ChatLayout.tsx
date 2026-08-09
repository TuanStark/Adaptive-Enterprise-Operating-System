"use client";

import { useSearchParams } from "next/navigation";
import { ChatArea } from "./ChatArea";
import type { Channel, Message, User } from "../types";

interface ChatLayoutProps {
  initialChannels: Channel[];
  initialMessages: Message[];
  users: Record<string, User>;
  currentUserId: string;
}

export function ChatLayout({
  initialChannels,
  initialMessages,
  users,
  currentUserId,
}: ChatLayoutProps) {
  const searchParams = useSearchParams();
  const activeChannelId = searchParams.get("channelId") || initialChannels[0]?.id || "";

  const activeChannel = initialChannels.find((c) => c.id === activeChannelId) || initialChannels[0];

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      <div className="flex-1 h-full min-w-0">
        {activeChannel ? (
          <ChatArea
            key={activeChannel.id}
            channelId={activeChannel.id}
            channelName={activeChannel.name}
            initialMessages={activeChannel.id === initialChannels[0]?.id ? initialMessages : []}
            users={users}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p className="text-sm">No channels available. Create one from the sidebar to start chatting!</p>
          </div>
        )}
      </div>
    </div>
  );
}
