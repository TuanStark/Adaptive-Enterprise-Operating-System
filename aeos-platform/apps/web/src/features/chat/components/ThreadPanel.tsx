"use client";
import { FormattedText } from "./MessageList";
import { useState, useCallback, useEffect, useRef } from "react";
import { Message, User } from "../types";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { MessageAttachment } from "./MessageAttachment";
import { useChatSocket } from "../hooks/useChatSocket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePanelResize } from "@/hooks/usePanelResize";
import { useThreadMessages } from "../hooks/useThreadMessages";

interface ThreadPanelProps {
  channelId: string;
  parentMessage: Message;
  users: Record<string, User>;
  currentUserId: string;
  onClose: () => void;
}

export function ThreadPanel({
  channelId,
  parentMessage,
  users,
  currentUserId,
  onClose,
}: ThreadPanelProps) {
  const { replies, setReplies, isLoading } = useThreadMessages(channelId, parentMessage.id);
  const [width, setWidth] = useState(350);
  const isResizingRef = useRef(false);
  const { data: session } = useSession();
  const workspaceId = session?.user?.workspaceId;

  const startResizing = useCallback((e: React.MouseEvent) => {
    isResizingRef.current = true;
    e.preventDefault();
  }, []);

  usePanelResize(isResizingRef, setWidth, 300);

  const readThreadRef = useRef<((threadId: string) => void) | undefined>(undefined);

  const handleMessageReceived = useCallback((message: Message) => {
    if (message.parentMessageId === parentMessage.id) {
      setReplies((prev) => {
        if (prev.some((m) => m.id === message.id)) {
          return prev.map((m) => (m.id === message.id ? message : m));
        }
        return [...prev, message];
      });
      // Mark as read when a new reply arrives while panel is open
      readThreadRef.current?.(parentMessage.id);
    }
  }, [parentMessage.id]);

  const handleMessageEdited = useCallback(
    (data: { id: string; content: string; isEdited: boolean; editedAt: string }) => {
      setReplies((prev) =>
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
    setReplies((prev) => prev.filter((m) => m.id !== data.id));
  }, []);

  const handleReactionUpdated = useCallback(
    (data: { messageId: string; reactions: any[] }) => {
      setReplies((prev) =>
        prev.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m))
      );
    },
    []
  );

  const { sendMessage, editMessage, deleteMessage, pinMessage, unpinMessage, toggleReaction, isConnected, readThread } = useChatSocket({
    channelId,
    workspaceId,
    userId: currentUserId,
    onMessageReceived: handleMessageReceived,
    onMessageEdited: handleMessageEdited,
    onMessageDeleted: handleMessageDeleted,
    onReactionUpdated: handleReactionUpdated,
  });

  useEffect(() => {
    readThreadRef.current = readThread;
  }, [readThread]);

  useEffect(() => {
    // Mark thread as read when opening the panel
    readThread?.(parentMessage.id);
  }, [parentMessage.id, readThread]);

  const handleSendReply = useCallback(
    (content: string, attachments?: { id: string; url: string; name: string; type: string; size: number }[]) => {
      if ((!content.trim() && (!attachments || attachments.length === 0)) || !channelId) return;

      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        channelId,
        senderId: currentUserId,
        content: content.trim(),
        parentMessageId: parentMessage.id,
        isPinned: false,
        isEdited: false,
        reactions: [],
        attachments: attachments || [],
        createdAt: new Date().toISOString(),
        editedAt: null,
        deletedAt: null,
      };

      setReplies((prev) => [...prev, tempMessage]);

      const attachmentIds = attachments?.map(a => a.id) || [];
      sendMessage(content.trim(), parentMessage.id, attachmentIds, (res: any) => {
        if (res?.status === 'success' && res.data?.id) {
          setReplies((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: res.data.id } : m))
          );
        } else {
          setReplies((prev) => prev.filter((m) => m.id !== tempId));
        }
      });
    },
    [channelId, currentUserId, parentMessage.id, sendMessage]
  );

  return (
    <div
      className="relative flex flex-col h-full bg-white border-l border-gray-200 shrink-0"
      style={{ width: `${width}px` }}
    >
      {/* Resizer Handle */}
      <div
        className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 z-10 transition-colors"
        onMouseDown={startResizing}
      />
      {/* Header */}
      <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Thread</h3>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Parent Message (Context) */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex gap-3">
          <Avatar className="w-9 h-9 rounded-md">
            <AvatarImage src={users[parentMessage.senderId]?.avatarUrl} />
            <AvatarFallback className="rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs">
              {(users[parentMessage.senderId]?.name || "U").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-bold text-[14px] text-gray-900 leading-none">
                {users[parentMessage.senderId]?.name || "Unknown"}
              </span>
            </div>
            <div className="text-[14px] leading-relaxed break-words whitespace-pre-wrap text-gray-800">
              {parentMessage.content?.trim().startsWith('<') ? (
                <div 
                  className="prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0 prose-a:underline prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none text-gray-800 prose-strong:text-gray-900 prose-a:text-blue-600 prose-code:bg-gray-100 prose-code:text-gray-800"
                  dangerouslySetInnerHTML={{ __html: parentMessage.content }} 
                />
              ) : (
                <FormattedText content={parentMessage.content || ''} />
              )}
            </div>
            {parentMessage.attachments && parentMessage.attachments.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                {parentMessage.attachments.map(att => (
                  <MessageAttachment key={att.id} attachment={att} isOwner={parentMessage.senderId === currentUserId} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-xs text-gray-400">
            Loading thread...
          </div>
        ) : (
          <div className="px-2">
            <MessageList
              messages={replies}
              users={users}
              currentUserId={currentUserId}
              channelId={channelId}
              onMessageEdited={(id, content) => {
                if (id.startsWith("temp-")) return;
                handleMessageEdited({ id, content, isEdited: true, editedAt: new Date().toISOString() });
                editMessage(id, content);
              }}
              onMessageDeleted={(id) => {
                if (id.startsWith("temp-")) return;
                handleMessageDeleted({ id });
                deleteMessage(id);
              }}
              onReactionToggled={(messageId, emoji, isAdding) => {
                if (messageId.startsWith("temp-")) return;
                setReplies((prev) =>
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
                if (id.startsWith("temp-")) return;
                setReplies((prev) =>
                  prev.map((m) => (m.id === id ? { ...m, isPinned } : m))
                );
                if (isPinned) pinMessage(id);
                else unpinMessage(id);
              }}
            />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200">
        <MessageInput
          onSendMessage={handleSendReply}
          onTypingStart={() => { }}
          onTypingStop={() => { }}
          channelName="thread"
        />
      </div>
    </div>
  );
}
