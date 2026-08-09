"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ThreadPanel } from "./ThreadPanel";
import { Message, User } from "../types";
import { useChatSocket } from "../hooks/useChatSocket";
import { useChannelMessages } from "../hooks/useChannelMessages";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface ChatAreaProps {
  channelId: string;
  channelName: string;
  channelType: 'PUBLIC' | 'PRIVATE' | 'DIRECT';
  targetUser?: User | null;
  initialMessages: Message[];
  users: Record<string, User>;
  currentUserId: string;
  channelMembers?: User[];
}

export function ChatArea({
  channelId,
  channelName,
  channelType,
  targetUser,
  initialMessages,
  users,
  currentUserId,
  channelMembers,
}: ChatAreaProps) {
  const { messages, setMessages, isLoading: isLoadingMessages } = useChannelMessages(channelId, initialMessages);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [activeThreadMessage, setActiveThreadMessage] = useState<Message | null>(null);
  const { data: session } = useSession();
  const workspaceId = session?.user?.workspaceId;

  const handleThreadClick = useCallback((msg: Message) => {
    setActiveThreadMessage(msg);
    if (msg.isThreadUnread) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, isThreadUnread: false } : m
        )
      );
    }
  }, [setMessages]);

  const handleMessageReceived = useCallback((message: Message) => {
    if (message.parentMessageId) {
      // Update the parent message's replyCount and lastReplyAt
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === message.parentMessageId) {
            const isThreadActive = activeThreadMessage?.id === m.id;
            return {
              ...m,
              replyCount: (m.replyCount || 0) + 1,
              lastReplyAt: message.createdAt,
              isThreadUnread: !isThreadActive, // Mark unread only if thread is not currently open
            };
          }
          return m;
        })
      );
      return;
    }

    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) {
        return prev.map((m) => (m.id === message.id ? message : m));
      }
      return [...prev, message];
    });
  }, [activeThreadMessage?.id]);

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

  const handleMessagePinned = useCallback((data: { id: string; channelId: string; isPinned: boolean }) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === data.id ? { ...m, isPinned: data.isPinned } : m))
    );
  }, []);

  const { sendMessage, editMessage, deleteMessage, pinMessage, unpinMessage, toggleReaction, startTyping, stopTyping, isConnected } = useChatSocket({
    channelId,
    workspaceId,
    userId: currentUserId,
    onMessageReceived: handleMessageReceived,
    onMessageEdited: handleMessageEdited,
    onMessageDeleted: handleMessageDeleted,
    onMessagePinned: handleMessagePinned,
    onReactionUpdated: handleReactionUpdated,
    onTypingUpdate: handleTypingUpdate,
  });

  const handleSendMessage = useCallback(
    (content: string, attachments?: { id: string; url: string; name: string; type: string; size: number }[]) => {
      if ((!content.trim() && (!attachments || attachments.length === 0)) || !channelId) return;

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
        attachments: attachments || [],
        createdAt: new Date().toISOString(),
        editedAt: null,
        deletedAt: null,
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Emit via WebSocket with ack callback
      const attachmentIds = attachments?.map(a => a.id) || [];
      sendMessage(content.trim(), undefined, attachmentIds, (res: any) => {
        if (res?.status === 'success' && res.data?.id) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: res.data.id } : m))
          );
        } else {
          // Revert optimistic if failed
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
        }
      });
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
    <div className="flex h-full bg-white relative flex-1 min-w-0">
      <div className="flex flex-col h-full flex-1 min-w-0">
        <ChatHeader
          channelId={channelId}
          channelName={channelName}
          memberCount={channelMembers ? channelMembers.length : Object.keys(users).length}
          channelType={channelType}
          targetUser={targetUser}
          members={channelMembers || Object.values(users)}
        />

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
            onMessageEdited={(id, content) => {
              if (id.startsWith("temp-")) {
                toast.error("Please wait for the message to be sent before editing.");
                return;
              }
              handleMessageEdited({ id, content, isEdited: true, editedAt: new Date().toISOString() });
              editMessage(id, content);
            }}
            onMessageDeleted={(id) => {
              if (id.startsWith("temp-")) {
                toast.error("Please wait for the message to be sent before deleting.");
                return;
              }
              handleMessageDeleted({ id });
              deleteMessage(id);
            }}
            onReactionToggled={(messageId, emoji, isAdding) => {
              if (messageId.startsWith("temp-")) {
                toast.error("Please wait for the message to be sent before reacting.");
                return;
              }
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id === messageId) {
                    const existing = m.reactions || [];
                    const newReactions = isAdding
                      ? [...existing, { userId: currentUserId, emoji }]
                      : existing.filter((r) => !(r.userId === currentUserId && r.emoji === emoji));
                    return { ...m, reactions: newReactions };
                  }
                  return m;
                })
              );
              toggleReaction(messageId, emoji, isAdding);
            }}
            onMessagePinned={(id, isPinned) => {
              if (id.startsWith("temp-")) {
                toast.error("Please wait for the message to be sent before pinning.");
                return;
              }
              handleMessagePinned({ id, channelId, isPinned });
              if (isPinned) {
                pinMessage(id);
              } else {
                unpinMessage(id);
              }
            }}
            onThreadClick={handleThreadClick}
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

      {/* Thread Panel */}
      {activeThreadMessage && (
        <ThreadPanel
          channelId={channelId}
          parentMessage={activeThreadMessage}
          users={users}
          currentUserId={currentUserId}
          onClose={() => setActiveThreadMessage(null)}
        />
      )}
    </div>
  );
}
