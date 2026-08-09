"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Message, MessageReaction } from "../types";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000";
const WS_URL = WS_BASE.endsWith("/chat") ? WS_BASE : `${WS_BASE}/chat`;

interface UseChatSocketOptions {
  channelId: string;
  userId: string;
  onMessageReceived?: (message: Message) => void;
  onMessageEdited?: (data: { id: string; content: string; isEdited: boolean; editedAt: string }) => void;
  onMessageDeleted?: (data: { id: string }) => void;
  onReactionUpdated?: (data: { messageId: string; reactions: MessageReaction[] }) => void;
  onTypingUpdate?: (data: { userId: string; userName: string; isTyping: boolean }) => void;
}

export function useChatSocket({
  channelId,
  userId,
  onMessageReceived,
  onMessageEdited,
  onMessageDeleted,
  onReactionUpdated,
  onTypingUpdate,
}: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  const activeUserId = userId || session?.user?.id;

  useEffect(() => {
    if (!channelId || !activeUserId) return;

    const token = session?.accessToken;
    const socket = io(WS_URL, {
      query: { userId: activeUserId },
      auth: token ? { token } : undefined,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("[useChatSocket] Connected to Socket server. Socket ID:", socket.id);
      socket.emit("channel:join", { channelId });
    });

    if (socket.connected) {
      setIsConnected(true);
      console.log("[useChatSocket] Socket already connected. Socket ID:", socket.id);
      socket.emit("channel:join", { channelId });
    }

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      console.warn("[useChatSocket] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("[useChatSocket] Connection error:", err.message);
    });

    socket.on("message:received", (message: Message) => {
      console.log("[useChatSocket] Received message:", message);
      onMessageReceived?.(message);
    });

    socket.on("message:edited", (data: { id: string; content: string; isEdited: boolean; editedAt: string }) => {
      onMessageEdited?.(data);
    });

    socket.on("message:deleted", (data: { id: string }) => {
      onMessageDeleted?.(data);
    });

    socket.on("reaction:updated", (data: { messageId: string; reactions: MessageReaction[] }) => {
      onReactionUpdated?.(data);
    });

    socket.on("error", (data: { message?: string } | string) => {
      const msg = typeof data === "string" ? data : data?.message || "Failed to process chat action";
      toast.error(msg);
    });

    socket.on("typing:update", (data: { userId: string; userName: string; isTyping: boolean }) => {
      onTypingUpdate?.(data);
    });

    return () => {
      socket.emit("channel:leave", { channelId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [channelId, activeUserId, session?.accessToken]);

  const sendMessage = useCallback(
    (content: string, parentMessageId?: string, cb?: (res: any) => void) => {
      if (!socketRef.current || !socketRef.current.connected) {
        console.warn("[useChatSocket] Cannot send message: Socket is not connected");
        toast.error("Connecting to chat server... Please try again in a moment.");
        if (cb) cb({ status: 'error', message: 'Not connected' });
        return;
      }

      console.log("[useChatSocket] Emitting message:send for channel:", channelId);
      socketRef.current.emit("message:send", {
        channelId,
        content,
        parentMessageId,
      }, cb);
    },
    [channelId],
  );

  const editMessage = useCallback(
    (messageId: string, content: string, cb?: (res: any) => void) => {
      socketRef.current?.emit("message:edit", { channelId, messageId, content }, cb);
    },
    [channelId],
  );

  const deleteMessage = useCallback(
    (messageId: string, cb?: (res: any) => void) => {
      socketRef.current?.emit("message:delete", { channelId, messageId }, cb);
    },
    [channelId],
  );

  const toggleReaction = useCallback(
    (messageId: string, emoji: string, isAdding: boolean, cb?: (res: any) => void) => {
      const event = isAdding ? "reaction:add" : "reaction:remove";
      socketRef.current?.emit(event, { channelId, messageId, emoji }, cb);
    },
    [channelId],
  );

  const startTyping = useCallback(
    (userName: string) => {
      socketRef.current?.emit("typing:start", { channelId, userId: activeUserId, userName });
    },
    [channelId, activeUserId],
  );

  const stopTyping = useCallback(
    (userName: string) => {
      socketRef.current?.emit("typing:stop", { channelId, userId: activeUserId, userName });
    },
    [channelId, activeUserId],
  );

  return { sendMessage, editMessage, deleteMessage, toggleReaction, startTyping, stopTyping, isConnected };
}
