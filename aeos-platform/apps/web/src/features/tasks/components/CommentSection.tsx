"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Comment } from "../types/comment";

// ── Mock Comments ──
const mockComments: Comment[] = [
  {
    id: "comment-1",
    userId: "user-2",
    userName: "Peter Parker",
    avatarUrl: "https://i.pravatar.cc/150?u=2",
    content: "I've started working on the Command Bus implementation. Should we use a library or build it from scratch?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "comment-2",
    userId: "user-1",
    userName: "Tony Stark",
    avatarUrl: "https://github.com/shadcn.png",
    content: "Let's build it from scratch — we need full control over the middleware pipeline. I've drafted an interface in the shared-kernel package.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "comment-3",
    userId: "user-3",
    userName: "Bruce Banner",
    avatarUrl: "https://i.pravatar.cc/150?u=3",
    content: "Looking good! Let's also add retry logic for failed command handlers. I can work on that part if needed.",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

// ── Helpers ──
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface CommentSectionProps {
  taskId: string;
}

export function CommentSection({ taskId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    // Simulate API call
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: "user-1",
      userName: "Tony Stark",
      avatarUrl: "https://github.com/shadcn.png",
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setComments((prev) => [...prev, comment]);
      setNewComment("");
      setIsSubmitting(false);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">
          Comments
          <span className="ml-2 text-xs font-normal text-gray-400">({comments.length})</span>
        </p>
      </div>

      {/* Comment Thread */}
      {comments.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Send className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No comments yet</p>
          <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 group">
              <Avatar className="h-7 w-7 mt-0.5 shrink-0">
                {comment.avatarUrl && <AvatarImage src={comment.avatarUrl} />}
                <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600 font-medium">
                  {comment.userName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-gray-900">{comment.userName}</span>
                  <span className="text-[11px] text-gray-400">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Input */}
      <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
        <Avatar className="h-7 w-7 mt-1 shrink-0">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600 font-medium">TS</AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment... (Enter to send)"
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pr-10 resize-none bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-gray-400"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1.5 bottom-1.5 h-7 w-7 text-primary hover:text-primary/80 hover:bg-primary/10 disabled:opacity-30"
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
