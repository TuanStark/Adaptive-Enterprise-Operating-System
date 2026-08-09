"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Smile, Pencil, Trash2, Check, X, MoreHorizontal, Copy, Link as LinkIcon, MessageSquare, Pin } from "lucide-react";
import { Message, MessageReaction, User } from "../types";
import { clientApi } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAutoScrollBottom } from "@/hooks/useAutoScrollBottom";

interface MessageListProps {
  messages: Message[];
  users: Record<string, User>;
  currentUserId: string;
  channelId: string;
  onMessageEdited?: (msgId: string, newContent: string) => void;
  onMessageDeleted?: (msgId: string) => void;
  onReactionToggled?: (msgId: string, emoji: string, isAdding: boolean) => void;
  onMessagePinned?: (msgId: string, isPinned: boolean) => void;
  onThreadClick?: (msg: Message) => void;
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
  onMessagePinned,
  onThreadClick,
}: MessageListProps) {
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useAutoScrollBottom(messagesEndRef, [messages]);

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
            className={`group relative flex gap-3 px-3 py-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors mt-2 ${isOwner ? "flex-row" : "flex-row-reverse"
              }`}
          >
            {/* Avatar */}
            <div className="w-9 shrink-0 flex justify-center pt-0.5">
              <Avatar className="w-9 h-9 rounded-md">
                <AvatarImage src={sender?.avatarUrl} />
                <AvatarFallback className="rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs">
                  {senderDisplayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 flex flex-col ${isOwner ? "items-start" : "items-end"}`}>
              {/* Sender Name & Timestamp */}
              <div className={`flex items-baseline gap-2 mb-1 ${isOwner ? "flex-row" : "flex-row-reverse"}`}>
                <span className="font-bold text-[14px] text-gray-900 leading-none">
                  {senderDisplayName}
                </span>
                <span className="text-[11px] text-gray-400 leading-none">
                  {formatTime(msg.createdAt)}
                </span>
              </div>

              {isEditing ? (
                <div className={`mt-1 flex items-center gap-2 ${isOwner ? "flex-row" : "flex-row-reverse"}`}>
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
                <div className={`text-[14px] leading-relaxed break-words whitespace-pre-wrap ${isOwner
                  ? "bg-blue-500 text-white px-3 py-2 rounded-2xl rounded-tl-sm text-left inline-block max-w-[100%]"
                  : "bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl rounded-tr-sm text-right inline-block max-w-[100%]"
                  }`}>
                  {msg.isPinned && (
                    <div className={`flex items-center gap-1 mb-1 border-b pb-1 mb-1 text-[11px] font-bold ${isOwner ? "text-blue-100 border-blue-400 justify-start" : "text-amber-600 border-amber-200 justify-end"}`}>
                      <Pin className="w-3 h-3" fill="currentColor" /> Pinned
                    </div>
                  )}
                  {msg.content}
                  {msg.isEdited && (
                    <span className={`text-[11px] italic ml-1.5 ${isOwner ? "text-blue-100" : "text-gray-400"}`}>(edited)</span>
                  )}
                </div>
              )}

              {/* Reaction Badges */}
              {Object.keys(reactionGroups).length > 0 && (
                <div className={`mt-1.5 flex flex-wrap items-center gap-1.5 ${isOwner ? "justify-end" : "justify-end"}`}>
                  {Object.entries(reactionGroups).map(([emoji, group]) => {
                    const hasReacted = group.userIds.includes(currentUserId);
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleToggleReaction(msg, emoji)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${hasReacted
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

              {/* Thread Indicator */}
              {(msg.replyCount ?? 0) > 0 && (
                <div
                  className={`mt-1.5 flex items-center gap-2 group/thread cursor-pointer p-1.5 rounded-md transition-colors ${msg.isThreadUnread ? "bg-blue-50/60 hover:bg-blue-50" : "hover:bg-gray-100"
                    } ${isOwner ? "justify-start -ml-1.5 mr-0" : "justify-end flex-row-reverse -mr-1.5 ml-0"}`}
                  onClick={() => onThreadClick?.(msg)}
                >
                  <div className={`flex items-center gap-1.5 ${msg.isThreadUnread ? "text-blue-700" : "text-emerald-600 group-hover/thread:text-emerald-700"}`}>
                    <MessageSquare className="w-4 h-4 fill-current opacity-20" />
                    <span className="text-xs font-bold">{msg.replyCount} {msg.replyCount === 1 ? "reply" : "replies"}</span>
                  </div>
                  {msg.lastReplyAt && (
                    <span className="text-[11px] text-gray-400">
                      Last reply {formatTime(msg.lastReplyAt)}
                    </span>
                  )}
                  {msg.isThreadUnread && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="New replies" />
                  )}
                  <span className={`text-[11px] font-medium opacity-0 group-hover/thread:opacity-100 transition-opacity ${msg.isThreadUnread ? "text-blue-700" : "text-gray-500"}`}>
                    View thread
                  </span>
                </div>
              )}
            </div>

            {/* Hover Action Bar */}
            {!isEditing && (
              <div className={`absolute -top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-1 py-0.5 gap-0.5 z-10 pointer-events-none group-hover:pointer-events-auto ${isOwner ? "left-3" : "right-3"
                }`}>
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

                <div className="w-px h-3 bg-gray-200 mx-0.5" />
                <button
                  className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                  title="Reply in thread"
                  onClick={() => onThreadClick?.(msg)}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors cursor-pointer outline-none flex items-center justify-center"
                    title="More Options"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isOwner ? "start" : "end"} className="w-48 bg-white rounded-lg shadow-md border border-gray-200 p-1">
                    <DropdownMenuItem onClick={() => {
                      navigator.clipboard.writeText(msg.content);
                      toast.success("Text copied to clipboard");
                    }} className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm outline-none focus:bg-gray-100">
                      <Copy className="w-4 h-4 text-gray-500" /> Copy text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set("msgId", msg.id);
                      navigator.clipboard.writeText(url.toString());
                      toast.success("Link copied to clipboard");
                    }} className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm outline-none focus:bg-gray-100">
                      <LinkIcon className="w-4 h-4 text-gray-500" /> Copy link
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="h-px bg-gray-100 my-1 -mx-1" />
                    <DropdownMenuItem onClick={() => {
                      if (onMessagePinned) {
                        onMessagePinned(msg.id, !msg.isPinned);
                      }
                    }} className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm outline-none focus:bg-gray-100">
                      <Pin className="w-4 h-4 text-gray-500" /> {msg.isPinned ? "Unpin from conversation" : "Pin to conversation"}
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={async () => {
                      try {
                        await clientApi.post(`/channels/${channelId}/read-cursor`, { lastReadMessageId: msg.id });
                        toast.success("Marked as unread from this message");
                      } catch (err) {
                        toast.error("Failed to mark unread");
                      }
                    }} className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm outline-none focus:bg-gray-100">
                      <Check className="w-4 h-4 text-gray-500" /> Mark unread from here
                    </DropdownMenuItem>

                    {isOwner && (
                      <>
                        <DropdownMenuSeparator className="h-px bg-gray-100 my-1 -mx-1" />
                        <DropdownMenuItem onClick={() => handleStartEdit(msg)} className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm outline-none focus:bg-gray-100">
                          <Pencil className="w-4 h-4 text-gray-500" /> Edit message
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(msg.id)} className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-sm outline-none focus:bg-red-50 focus:text-red-600">
                          <Trash2 className="w-4 h-4 text-red-500" /> Delete message...
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
