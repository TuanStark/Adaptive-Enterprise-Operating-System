"use client";

import { useState, useCallback } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Message, User } from "../types";
import { useChatSocket } from "../hooks/useChatSocket";

interface ChatAreaProps {
  channelId: string;
  channelName: string;
  messages: Message[];
  users: Record<string, User>;
  currentUserId: string;
}

export function ChatArea({ channelId, channelName, messages: initialMessages, users, currentUserId }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const handleMessageReceived = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const handleTypingUpdate = useCallback((data: { userId: string; userName: string; isTyping: boolean }) => {
    setTypingUsers(prev => {
      if (data.isTyping) {
        return prev.includes(data.userName) ? prev : [...prev, data.userName];
      }
      return prev.filter(name => name !== data.userName);
    });
  }, []);

  const { sendMessage, startTyping, stopTyping, isConnected } = useChatSocket({
    channelId,
    userId: currentUserId,
    onMessageReceived: handleMessageReceived,
    onTypingUpdate: handleTypingUpdate,
  });

  const handleSendMessage = useCallback((content: string) => {
    sendMessage(content);
  }, [sendMessage]);

  const handleTypingStart = useCallback(() => {
    startTyping(users[currentUserId]?.name ?? "Unknown");
  }, [startTyping, currentUserId, users]);

  const handleTypingStop = useCallback(() => {
    stopTyping(users[currentUserId]?.name ?? "Unknown");
  }, [stopTyping, currentUserId, users]);

  return (
    <div className="flex flex-col h-full bg-white relative">
      <ChatHeader channelName={channelName} memberCount={Object.keys(users).length} />
      <MessageList messages={messages} users={users} />

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-5 py-1 text-xs text-gray-500 italic">
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}

      {/* Connection status */}
      {!isConnected && (
        <div className="px-5 py-1 text-xs text-amber-600 bg-amber-50 text-center">
          Connecting to chat server...
        </div>
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        channelName={channelName}
      />
    </div>
  );
}
