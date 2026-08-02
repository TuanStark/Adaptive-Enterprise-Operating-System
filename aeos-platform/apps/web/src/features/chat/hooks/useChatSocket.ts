"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "../types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000/chat";

interface UseChatSocketOptions {
  channelId: string;
  userId: string;
  onMessageReceived?: (message: Message) => void;
  onTypingUpdate?: (data: { userId: string; userName: string; isTyping: boolean }) => void;
}

export function useChatSocket({ channelId, userId, onMessageReceived, onTypingUpdate }: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(WS_URL, {
      query: { userId },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("channel:join", { channelId });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("message:received", (message: Message) => {
      onMessageReceived?.(message);
    });

    socket.on("typing:update", (data: { userId: string; userName: string; isTyping: boolean }) => {
      onTypingUpdate?.(data);
    });

    return () => {
      socket.emit("channel:leave", { channelId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [channelId, userId]);

  const sendMessage = useCallback(
    (content: string, parentMessageId?: string) => {
      socketRef.current?.emit("message:send", {
        channelId,
        content,
        parentMessageId,
      });
    },
    [channelId],
  );

  const startTyping = useCallback(
    (userName: string) => {
      socketRef.current?.emit("typing:start", { channelId, userId, userName });
    },
    [channelId, userId],
  );

  const stopTyping = useCallback(
    (userName: string) => {
      socketRef.current?.emit("typing:stop", { channelId, userId, userName });
    },
    [channelId, userId],
  );

  return { sendMessage, startTyping, stopTyping, isConnected };
}
