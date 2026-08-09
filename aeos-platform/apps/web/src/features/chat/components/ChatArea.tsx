"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Message, User } from "../types";
import { useChatSocket } from "../hooks/useChatSocket";
import { clientApi } from "@/lib/api-client";

interface ChatAreaProps {
  channelId: string;
  channelName: string;
  initialMessages: Message[];
  users: Record<string, User>;
  currentUserId: string;
}

export function ChatArea({
  channelId,
  channelName,
  initialMessages,
  users,
  currentUserId,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Sync / fetch messages when channelId changes
  useEffect(() => {
    let isMounted = true;
    setMessages(initialMessages);

    if (channelId) {
      setIsLoadingMessages(true);
      clientApi
        .get<{ data: Message[] }>(`/channels/${channelId}/messages`)
        .then((res: any) => {
          if (isMounted) {
            const list = Array.isArray(res) ? res : res?.data || [];
            setMessages(list);
          }
        })
        .catch((err) => console.error("Failed to load channel messages:", err))
        .finally(() => {
          if (isMounted) setIsLoadingMessages(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [channelId]);

  const handleMessageReceived = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const handleMessageEdited = useCallback(
    (data: { id: string; content: string; isEdited: boolean; editedAt: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.id
            ? { ...m, content: data.content, isEdited: true, editedAt: data.editedAt }
            : m
        )
      );
    },
    []
  );

  const handleMessageDeleted = useCallback((data: { id: string }) => {
    setMessages((prev) => prev.filter((m) => m.id !== data.id));
  }, []);

  const handleReactionUpdated = useCallback(
    (data: { messageId: string; reactions: any[] }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m))
      );
    },
    []
  );

  const handleTypingUpdate = useCallback(
    (data: { userId: string; userName: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        if (data.isTyping) {
          return prev.includes(data.userName) ? prev : [...prev, data.userName];
        }
        return prev.filter((name) => name !== data.userName);
      });
    },
    []
  );

  const { sendMessage, startTyping, stopTyping, isConnected } = useChatSocket({
    channelId,
    userId: currentUserId,
    onMessageReceived: handleMessageReceived,
    onMessageEdited: handleMessageEdited,
    onMessageDeleted: handleMessageDeleted,
    onReactionUpdated: handleReactionUpdated,
    onTypingUpdate: handleTypingUpdate,
  });

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !channelId) return;

      // Optimistic message object for instant UI feedback
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        channelId,
        senderId: currentUserId,
        content: content.trim(),
        parentMessageId: null,
        isPinned: false,
        isEdited: false,
        reactions: [],
        createdAt: new Date().toISOString(),
        editedAt: null,
        deletedAt: null,
      };

      setMessages((prev) => [...prev, tempMessage]);

      // 1. Emit via WebSocket
      sendMessage(content.trim());

      // 2. HTTP POST fallback for 100% guaranteed DB persistence
      try {
        const res: any = await clientApi.post<{ id: string }>(`/channels/${channelId}/messages`, {
          content: content.trim(),
        });
        if (res?.id) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: res.id } : m))
          );
        }
      } catch (err) {
        console.error("[ChatArea] HTTP send message error:", err);
      }
    },
    [channelId, currentUserId, sendMessage]
  );

  const handleTypingStart = useCallback(() => {
    startTyping(users[currentUserId]?.name ?? "Unknown");
  }, [startTyping, currentUserId, users]);

  const handleTypingStop = useCallback(() => {
    stopTyping(users[currentUserId]?.name ?? "Unknown");
  }, [stopTyping, currentUserId, users]);

  return (
    <div className="flex flex-col h-full bg-white relative flex-1 min-w-0">
      <ChatHeader channelName={channelName} memberCount={Object.keys(users).length} />

      {isLoadingMessages ? (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
          Loading messages...
        </div>
      ) : (
        <MessageList
          messages={messages}
          users={users}
          currentUserId={currentUserId}
          channelId={channelId}
          onMessageEdited={(id, content) =>
            handleMessageEdited({ id, content, isEdited: true, editedAt: new Date().toISOString() })
          }
          onMessageDeleted={(id) => handleMessageDeleted({ id })}
          onReactionToggled={(messageId, reactions) =>
            handleReactionUpdated({ messageId, reactions })
          }
        />
      )}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-5 py-1 text-xs text-gray-500 italic bg-white">
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
