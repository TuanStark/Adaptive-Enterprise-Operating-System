"use client";

import { CalendarIcon, CheckSquare, Bug, Bookmark, ChevronDown, GitMerge } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Task } from "../types";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

const TypeIcon = ({ type }: { type?: string }) => {
  if (type === "BUG") return <Bug className="w-4 h-4 text-red-500 shrink-0" />;
  if (type === "STORY") return <Bookmark className="w-4 h-4 text-emerald-500 shrink-0" />;
  return <CheckSquare className="w-4 h-4 text-blue-500 shrink-0" />;
};

interface BacklogTaskRowProps {
  task: Task;
  onTaskClick?: (taskId: string) => void;
}

export function BacklogTaskRow({ task, onTaskClick }: BacklogTaskRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border border-t-0 border-gray-200 bg-white hover:bg-gray-50 group transition-colors">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          className="w-4 h-4 rounded-sm border-gray-300 accent-blue-600"
          defaultChecked={task.status === "DONE"}
        />
        <TypeIcon type={task.type} />
        <button
          onClick={() => onTaskClick?.(task.id)}
          className="text-gray-500 text-sm hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          {task.key}
        </button>
        <span className="text-gray-900 text-sm font-medium hover:underline cursor-pointer">
          {task.title}
        </span>
      </div>
      <div className="flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
        <GitMerge className="w-4 h-4 text-gray-400" />
        <div className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded cursor-pointer flex items-center gap-1">
          {task.status.replace("_", " ")} <ChevronDown className="w-3 h-3" />
        </div>
        {task.dueDate && (
          <div className="flex items-center text-gray-500 text-xs gap-1 w-20">
            <CalendarIcon className="w-3.5 h-3.5" /> {formatDate(task.dueDate)}
          </div>
        )}
        <div className="w-6 text-center text-gray-500 font-semibold text-sm bg-gray-100 rounded-full px-1">
          {task.storyPoints || "-"}
        </div>
        <Avatar className="w-6 h-6">
          <AvatarFallback>
            {task.assigneeId ? task.assigneeId.substring(0, 2).toUpperCase() : "??"}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
