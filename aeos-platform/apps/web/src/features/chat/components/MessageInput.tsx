"use client";

import { useState, useRef } from "react";
import { Bold, Italic, Link2, List, Code, Paperclip, Smile, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  channelName?: string;
}

export function MessageInput({ onSendMessage, onTypingStart, onTypingStop, channelName = "general" }: MessageInputProps) {
  const [content, setContent] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (!content.trim()) return;
    onSendMessage(content.trim());
    setContent("");
    onTypingStop?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;

    // Typing indicator with debounce
    onTypingStart?.();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop?.();
    }, 2000);
  };

  return (
    <div className="px-4 pb-6 pt-2 shrink-0 bg-white">
      <div className="border border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-all bg-white overflow-hidden">
        <div className="flex items-center gap-1 bg-gray-50/80 px-2 py-1.5 border-b border-gray-200">
          <button className="p-1 text-gray-500 hover:bg-gray-200 rounded"><Bold className="w-4 h-4" /></button>
          <button className="p-1 text-gray-500 hover:bg-gray-200 rounded"><Italic className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <button className="p-1 text-gray-500 hover:bg-gray-200 rounded"><Link2 className="w-4 h-4" /></button>
          <button className="p-1 text-gray-500 hover:bg-gray-200 rounded"><List className="w-4 h-4" /></button>
          <button className="p-1 text-gray-500 hover:bg-gray-200 rounded"><Code className="w-4 h-4" /></button>
        </div>

        <div className="p-2 min-h-[60px]">
          <textarea
            placeholder={`Message #${channelName}`}
            className="w-full h-full min-h-[40px] resize-none outline-none text-[15px] bg-transparent placeholder:text-gray-500"
            rows={1}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="flex items-center justify-between px-2 py-1.5 bg-white">
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"><PlusIcon className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"><Paperclip className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"><Smile className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center">
            <Button
              size="icon"
              className="h-7 w-7 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              onClick={handleSend}
              disabled={!content.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
