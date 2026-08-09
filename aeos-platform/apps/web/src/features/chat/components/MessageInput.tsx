"use client";

import { useState, useRef, useId } from "react";
import { Bold, Italic, Link2, List, Code, Paperclip, Smile, Send, X, FileText, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadFileDirectly } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditorContent } from '@tiptap/react';
import { useMessageEditor } from "../hooks/useMessageEditor";

const EMOJI_LIST = ["👍", "❤️", "😂", "🔥", "🎉", "😢", "👀", "🚀", "🙌", "✨"];

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: { id: string; url: string; name: string; type: string; size: number }[]) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  channelName?: string;
}

export function MessageInput({ onSendMessage, onTypingStart, onTypingStop, channelName = "general" }: MessageInputProps) {
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const submitButtonId = `send-btn-${useId()}`;

  const { editor, isEmpty, setIsEmpty } = useMessageEditor({
    channelName,
    submitButtonId,
    onTypingStart,
    onTypingStop,
  });

  const handleSend = async () => {
    if (!editor) return;

    const text = editor.getText().trim();
    if (!text && !attachedFile) return;
    if (isUploading) return;

    let finalContent = editor.getHTML();
    if (!text) {
      finalContent = "";
    }

    const attachments: { id: string; url: string; name: string; type: string; size: number }[] = [];

    if (attachedFile) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadFileDirectly(attachedFile, "chat_attachments");
        if (uploadResult?.id) {
          attachments.push({
            id: uploadResult.id,
            url: uploadResult.url,
            name: attachedFile.name,
            type: attachedFile.type || "application/octet-stream",
            size: attachedFile.size,
          });
        }
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setIsUploading(false);
      }
    }

    onSendMessage(finalContent, attachments);
    editor.commands.clearContent();
    setIsEmpty(true);
    setAttachedFile(null);
    onTypingStop?.();
  };

  const insertEmoji = (emoji: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(emoji).run();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  return (
    <div className="px-4 pb-6 pt-2 shrink-0 bg-white">
      <style dangerouslySetInnerHTML={{
        __html: `
        .tiptap p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}} />
      <div className="border border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-all bg-white overflow-hidden">
        <div className="flex items-center gap-1 bg-gray-50/80 px-2 py-1.5 border-b border-gray-200">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-1 rounded transition-colors ${editor?.isActive('bold') ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-1 rounded transition-colors ${editor?.isActive('italic') ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <button
            onClick={() => {
              const url = window.prompt('Enter URL:');
              if (url) {
                editor?.chain().focus().setLink({ href: url }).run();
              } else if (url === '') {
                editor?.chain().focus().unsetLink().run();
              }
            }}
            className={`p-1 rounded transition-colors ${editor?.isActive('link') ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}
            title="Link"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded transition-colors ${editor?.isActive('bulletList') ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleCode().run()}
            className={`p-1 rounded transition-colors ${editor?.isActive('code') ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {attachedFile && (
          <div className="mx-2 mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between text-xs text-gray-700">
            <div className="flex items-center gap-2 truncate">
              {attachedFile.type.startsWith('image/') ? (
                <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-primary shrink-0" />
              )}
              <span className="truncate font-medium">{attachedFile.name}</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              disabled={isUploading}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="p-2 min-h-[60px] max-h-[200px] overflow-y-auto cursor-text" onClick={() => editor?.commands.focus()}>
          <EditorContent editor={editor} />
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
              id={submitButtonId}
              size="icon"
              className="h-7 w-7 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              onClick={handleSend}
              disabled={(isEmpty && !attachedFile) || isUploading}
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
