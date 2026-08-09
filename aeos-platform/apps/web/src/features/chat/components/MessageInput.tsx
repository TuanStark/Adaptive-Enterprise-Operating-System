"use client";

import { useState, useRef, useEffect } from "react";
import { Bold, Italic, Link2, List, Code, Paperclip, Smile, Send, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const EMOJI_LIST = ["👍", "❤️", "😂", "🔥", "🎉", "😢", "👀", "🚀", "🙌", "✨"];

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  channelName?: string;
}

export function MessageInput({ onSendMessage, onTypingStart, onTypingStop, channelName = "general" }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newText = `${before}${prefix}${selectedText}${suffix}${after}`;
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      }
    }, 0);
  };

  const insertEmoji = (emoji: string) => {
    insertFormatting(emoji, "");
  };

  const handleSend = () => {
    if (!content.trim() && !attachedFile) return;

    let finalContent = content.trim();
    if (attachedFile) {
      finalContent += `\n📎 [Attachment: ${attachedFile.name}]`;
    }

    onSendMessage(finalContent);
    setContent("");
    setAttachedFile(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  return (
    <div className="px-4 pb-6 pt-2 shrink-0 bg-white">
      <div className="border border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-all bg-white overflow-hidden">
        <div className="flex items-center gap-1 bg-gray-50/80 px-2 py-1.5 border-b border-gray-200">
          <button onClick={() => insertFormatting("**", "**")} className="p-1 text-gray-500 hover:bg-gray-200 rounded" title="Bold"><Bold className="w-4 h-4" /></button>
          <button onClick={() => insertFormatting("*", "*")} className="p-1 text-gray-500 hover:bg-gray-200 rounded" title="Italic"><Italic className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <button onClick={() => insertFormatting("[", "](url)")} className="p-1 text-gray-500 hover:bg-gray-200 rounded" title="Link"><Link2 className="w-4 h-4" /></button>
          <button onClick={() => insertFormatting("- ")} className="p-1 text-gray-500 hover:bg-gray-200 rounded" title="List"><List className="w-4 h-4" /></button>
          <button onClick={() => insertFormatting("`", "`")} className="p-1 text-gray-500 hover:bg-gray-200 rounded" title="Code"><Code className="w-4 h-4" /></button>
        </div>

        {attachedFile && (
          <div className="mx-2 mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between text-xs text-gray-700">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate font-medium">{attachedFile.name}</span>
            </div>
            <button onClick={() => setAttachedFile(null)} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="p-2 min-h-[60px]">
          <textarea
            ref={textareaRef}
            placeholder={`Message #${channelName}`}
            className="w-full h-full min-h-[40px] resize-none outline-none text-[15px] bg-transparent placeholder:text-gray-500"
            rows={1}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex items-center justify-between px-2 py-1.5 bg-white">
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors outline-none cursor-pointer flex items-center justify-center" title="Emoji">
                <Smile className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-2 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="grid grid-cols-5 gap-2">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="h-10 text-xl flex items-center justify-center hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center">
            <Button
              size="icon"
              className="h-7 w-7 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              onClick={handleSend}
              disabled={!content.trim() && !attachedFile}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
