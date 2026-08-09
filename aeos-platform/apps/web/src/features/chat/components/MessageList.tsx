"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Smile, Pencil, Trash2, Check, X } from "lucide-react";
import { Message, MessageReaction, User } from "../types";
import { clientApi } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MessageListProps {
  messages: Message[];
  users: Record<string, User>;
  currentUserId: string;
  channelId: string;
  onMessageEdited?: (msgId: string, newContent: string) => void;
  onMessageDeleted?: (msgId: string) => void;
  onReactionToggled?: (msgId: string, emoji: string, isAdding: boolean) => void;
}

const EMOJI_OPTIONS = ["👍", "❤️", "🎉", "😂", "🚀", "👀"];

export function MessageList({
  messages,
  users,
  currentUserId,
  channelId,
  onMessageEdited,
  onMessageDeleted,
  onReactionToggled,
}: MessageListProps) {
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleStartEdit = (msg: Message) => {
    setEditingMsgId(msg.id);
    setEditContent(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMsgId(null);
    setEditContent("");
  };

  const handleSaveEdit = (msgId: string) => {
    if (!editContent.trim()) return;
    onMessageEdited?.(msgId, editContent.trim());
    setEditingMsgId(null);
  };

  const handleDelete = (msgId: string) => {
    onMessageDeleted?.(msgId);
  };

  const handleToggleReaction = (msg: Message, emoji: string) => {
    const existingReactions = msg.reactions || [];
    const hasReacted = existingReactions.some((r) => r.userId === currentUserId && r.emoji === emoji);
    onReactionToggled?.(msg.id, emoji, !hasReacted);
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
      <div className="flex items-center my-4">
        <div className="flex-1 h-px bg-gray-200"></div>
        <div className="px-4 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-full py-1">
          Today
        </div>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {messages.map((msg) => {
        const sender = users[msg.senderId];
        const isOwner = msg.senderId === currentUserId;
        const isEditing = editingMsgId === msg.id;

        const senderDisplayName =
          sender?.name || (isOwner ? "You" : `Member (${msg.senderId.substring(0, 6)})`);

        // Group reactions
        const reactionGroups: Record<string, { count: number; userIds: string[] }> = {};
        (msg.reactions || []).forEach((r) => {
          if (!reactionGroups[r.emoji]) {
            reactionGroups[r.emoji] = { count: 0, userIds: [] };
          }
          reactionGroups[r.emoji].count += 1;
          reactionGroups[r.emoji].userIds.push(r.userId);
        });

        return (
          <div
            key={msg.id}
            className="group relative flex gap-3 px-3 py-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors mt-2"
          >
            {/* Avatar - ALWAYS DISPLAYED */}
            <div className="w-9 shrink-0 flex justify-center pt-0.5">
              <Avatar className="w-9 h-9 rounded-md">
                <AvatarImage src={sender?.avatarUrl} />
                <AvatarFallback className="rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs">
                  {senderDisplayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Sender Name & Timestamp - ALWAYS DISPLAYED */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bold text-[14px] text-gray-900 leading-none">
                  {senderDisplayName}
                </span>
                <span className="text-[11px] text-gray-400 leading-none">
                  {formatTime(msg.createdAt)}
                </span>
              </div>

              {isEditing ? (
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="h-8 text-sm bg-white"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(msg.id);
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <Button size="icon" className="h-8 w-8" onClick={() => handleSaveEdit(msg.id)}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-[14px] text-gray-800 leading-relaxed break-words whitespace-pre-wrap">
                  {msg.content}
                  {msg.isEdited && (
                    <span className="text-[11px] text-gray-400 italic ml-1.5">(edited)</span>
                  )}
                </div>
              )}

              {/* Reaction Badges */}
              {Object.keys(reactionGroups).length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {Object.entries(reactionGroups).map(([emoji, group]) => {
                    const hasReacted = group.userIds.includes(currentUserId);
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleToggleReaction(msg, emoji)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          hasReacted
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span>{emoji}</span>
                        <span>{group.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hover Action Bar */}
            {!isEditing && (
              <div className="absolute right-3 -top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-1 py-0.5 gap-0.5 z-10 pointer-events-none group-hover:pointer-events-auto">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleToggleReaction(msg, emoji)}
                    className="p-1 hover:bg-gray-100 rounded text-sm transition-colors cursor-pointer"
                    title={`React ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}

                {isOwner && (
                  <>
                    <div className="w-px h-3 bg-gray-200 mx-0.5" />
                    <button
                      onClick={() => handleStartEdit(msg)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                      title="Edit Message"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1 hover:bg-gray-100 rounded text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      title="Delete Message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
