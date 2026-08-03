"use client";

import { Bell, CheckSquare, MessageSquare, AtSign, GitMerge, Calendar, Shield } from "lucide-react";
import type { Notification, NotificationType } from "../types";

const NOTIFICATION_ICONS: Record<NotificationType, { icon: typeof Bell; className: string }> = {
  TASK_ASSIGNED: { icon: CheckSquare, className: "text-blue-500" },
  TASK_UPDATED: { icon: CheckSquare, className: "text-emerald-500" },
  COMMENT_ADDED: { icon: MessageSquare, className: "text-amber-500" },
  MENTION: { icon: AtSign, className: "text-purple-500" },
  SPRINT_STARTED: { icon: GitMerge, className: "text-indigo-500" },
  SPRINT_COMPLETED: { icon: GitMerge, className: "text-emerald-500" },
  APPROVAL_REQUESTED: { icon: Shield, className: "text-orange-500" },
  APPROVAL_PROCESSED: { icon: Shield, className: "text-emerald-500" },
  MEETING_SCHEDULED: { icon: Calendar, className: "text-cyan-500" },
};

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

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const config = NOTIFICATION_ICONS[notification.type];
  const Icon = config?.icon ?? Bell;
  const iconClassName = config?.className ?? "text-gray-400";

  return (
    <button
      onClick={() => onMarkAsRead(notification.id)}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent ${!notification.read ? "bg-primary/[0.03]" : ""
        }`}
    >
      <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${!notification.read ? "bg-primary/10" : "bg-gray-100"}`}>
        <Icon className={`w-4 h-4 ${iconClassName}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${!notification.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="mt-1.5 w-2 h-2 bg-primary rounded-full shrink-0" />
          )}
        </div>
        {notification.content && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
            {notification.content}
          </p>
        )}
        <p className="text-[11px] text-gray-400 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
    </button>
  );
}
