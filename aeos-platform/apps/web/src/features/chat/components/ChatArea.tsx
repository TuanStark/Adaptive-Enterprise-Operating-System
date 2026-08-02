import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Message, User } from "../types";

interface ChatAreaProps {
  channelName: string;
  messages: Message[];
  users: Record<string, User>;
}

export function ChatArea({ channelName, messages, users }: ChatAreaProps) {
  return (
    <div className="flex flex-col h-full bg-white relative">
      <ChatHeader channelName={channelName} memberCount={Object.keys(users).length} />
      <MessageList messages={messages} users={users} />
      <MessageInput />
    </div>
  );
}
