"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Comment } from "../types/comment";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  const displayName = comment.user?.displayName || comment.userId;
  const initials = displayName.slice(0, 2).toUpperCase();
  console.log(comment)

  return (
    <div className="flex items-start gap-3 group">
      <Avatar className="h-7 w-7 mt-0.5 shrink-0">
        {comment.user?.avatarUrl && <AvatarImage src={comment.user.avatarUrl} alt={displayName} />}
        <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600 font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900">{displayName}</span>
          <span className="text-[11px] text-gray-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700 mt-0.5 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
