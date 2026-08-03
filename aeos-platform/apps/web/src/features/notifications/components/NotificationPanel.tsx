"use client";

import React, { useState } from "react";
import { Bell, CheckSquare, MessageSquare, AtSign, GitMerge, Calendar, Shield, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Notification, NotificationType } from "../types";

// ── Mock Notifications ──
const initialNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "TASK_ASSIGNED",
    title: "New task assigned to you",
    content: "Peter Parker assigned you \"Setup CI/CD Pipeline\" in AEOS Platform",
    read: false,
    metadata: { taskId: "task-20", projectName: "AEOS Platform" },
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 min ago
  },
  {
    id: "notif-2",
    type: "COMMENT_ADDED",
    title: "New comment on your task",
    content: "Bruce Banner commented on \"Implement CQRS Pattern\": \"Looking good! Let's also add...\"",
    read: false,
    metadata: { taskId: "task-12", commentId: "comment-5" },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
  },
  {
    id: "notif-3",
    type: "MENTION",
    title: "You were mentioned",
    content: "Peter Parker mentioned you in #engineering-alerts: \"@Tony can you review the PR?\"",
    read: false,
    metadata: { channelId: "channel-2" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "notif-4",
    type: "SPRINT_STARTED",
    title: "Sprint started",
    content: "SCRUM Sprint 1 has been started for AEOS Platform",
    read: true,
    metadata: { sprintId: "sprint-1" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: "notif-5",
    type: "APPROVAL_REQUESTED",
    title: "Approval requested",
    content: "Bruce Banner requested your approval for \"Production Deploy v2.1\"",
    read: true,
    metadata: { approvalId: "approval-1" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "notif-6",
    type: "TASK_UPDATED",
    title: "Task status updated",
    content: "\"Design System Architecture\" was moved to DONE by Peter Parker",
    read: true,
    metadata: { taskId: "task-1" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];

// ── Helpers ──
const notificationIcon: Record<NotificationType, React.ReactNode> = {
  TASK_ASSIGNED: <CheckSquare className="w-4 h-4 text-blue-500" />,
  TASK_UPDATED: <CheckSquare className="w-4 h-4 text-emerald-500" />,
  COMMENT_ADDED: <MessageSquare className="w-4 h-4 text-amber-500" />,
  MENTION: <AtSign className="w-4 h-4 text-purple-500" />,
  SPRINT_STARTED: <GitMerge className="w-4 h-4 text-indigo-500" />,
  SPRINT_COMPLETED: <GitMerge className="w-4 h-4 text-emerald-500" />,
  APPROVAL_REQUESTED: <Shield className="w-4 h-4 text-orange-500" />,
  APPROVAL_PROCESSED: <Shield className="w-4 h-4 text-emerald-500" />,
  MEETING_SCHEDULED: <Calendar className="w-4 h-4 text-cyan-500" />,
};

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

export function NotificationPanel() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[10px] text-white font-bold leading-none">{unreadCount}</span>
            </span>
          )}
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-96 p-0 max-h-[480px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <DropdownMenuLabel className="p-0 text-base font-semibold text-gray-900">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium cursor-pointer bg-transparent border-none"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">All caught up!</p>
              <p className="text-xs text-gray-400 mt-1">No new notifications</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent ${
                  !notif.read ? "bg-primary/[0.03]" : ""
                }`}
              >
                {/* Icon */}
                <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${!notif.read ? "bg-primary/10" : "bg-gray-100"}`}>
                  {notificationIcon[notif.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${!notif.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="mt-1.5 w-2 h-2 bg-primary rounded-full shrink-0" />
                    )}
                  </div>
                  {notif.content && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.content}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2">
              <button className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium py-1.5 cursor-pointer bg-transparent border-none rounded-md hover:bg-primary/5 transition-colors">
                View all notifications
              </button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
