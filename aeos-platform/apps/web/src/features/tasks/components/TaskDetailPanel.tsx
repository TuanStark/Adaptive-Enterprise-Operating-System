"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageSquare, Paperclip, CheckSquare, Loader2, ChevronDown } from "lucide-react";
import { CommentSection } from "./CommentSection";
import { useTaskDetail, useTaskMutations } from "../hooks/useTasks";
import { useSession } from "next-auth/react";
import type { TaskStatus, TaskPriority, TaskType } from "../types";

const STATUS_OPTIONS: TaskStatus[] = ["BACKLOG", "TODO", "IN_PROGRESS", "BLOCKED", "REVIEW", "DONE", "CANCELLED"];
const PRIORITY_OPTIONS: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const TYPE_OPTIONS: TaskType[] = ["EPIC", "STORY", "TASK", "BUG", "SUBTASK"];

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: "bg-gray-50 text-gray-700 border-gray-200",
  TODO: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700 border-yellow-200",
  BLOCKED: "bg-red-50 text-red-700 border-red-200",
  REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  DONE: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-gray-50 text-gray-400 border-gray-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-50 text-gray-600 border-gray-200",
  MEDIUM: "bg-blue-50 text-blue-600 border-blue-200",
  HIGH: "bg-orange-50 text-orange-600 border-orange-200",
  URGENT: "bg-red-50 text-red-600 border-red-200",
};

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "activity" | "history">("comments");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const { data: session } = useSession();
  const tenantId = session?.user?.tenantId ?? "";

  const { data: task, isLoading } = useTaskDetail(taskId);
  const { update, changeStatus } = useTaskMutations();

  if (!taskId) return null;

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== task?.title) {
      update.mutate({ taskId, title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const tabs = [
    { key: "comments" as const, label: "Comments" },
    { key: "activity" as const, label: "Activity" },
    { key: "history" as const, label: "History" },
  ];

  return (
    <Sheet open={!!taskId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl w-full p-0 overflow-y-auto">
        <div className="flex flex-col h-full bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <CheckSquare className="w-4 h-4 text-primary" />
              <span>{task?.key ?? taskId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MessageSquare className="w-4 h-4" /></Button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : task ? (
              <>
                {/* Title */}
                <div className="space-y-2">
                  {isEditingTitle ? (
                    <Input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle();
                        if (e.key === "Escape") setIsEditingTitle(false);
                      }}
                      className="text-2xl font-bold border-none shadow-none px-1 -ml-1 focus-visible:ring-1"
                    />
                  ) : (
                    <h2
                      className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-50 p-1 -ml-1 rounded transition-colors"
                      onClick={() => {
                        setEditTitle(task.title);
                        setIsEditingTitle(true);
                      }}
                    >
                      {task.title}
                    </h2>
                  )}

                  {/* Status + Priority Badges */}
                  <div className="flex gap-2 pt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <button className="focus:outline-none">
                          <Badge variant="outline" className={`${STATUS_COLORS[task.status] ?? ""} cursor-pointer`}>
                            {task.status.replace(/_/g, " ")} <ChevronDown className="w-3 h-3 ml-1" />
                          </Badge>
                        </button>
                      } />
                      <DropdownMenuContent>
                        {STATUS_OPTIONS.map((s) => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() => changeStatus.mutate({ taskId: task.id, status: s })}
                            className={task.status === s ? "font-semibold" : ""}
                          >
                            {s.replace(/_/g, " ")}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <button className="focus:outline-none">
                          <Badge variant="outline" className={`${PRIORITY_COLORS[task.priority] ?? ""} cursor-pointer`}>
                            {task.priority} <ChevronDown className="w-3 h-3 ml-1" />
                          </Badge>
                        </button>
                      } />
                      <DropdownMenuContent>
                        {PRIORITY_OPTIONS.map((p) => (
                          <DropdownMenuItem
                            key={p}
                            onClick={() => update.mutate({ taskId: task.id, priority: p })}
                            className={task.priority === p ? "font-semibold" : ""}
                          >
                            {p}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <button className="focus:outline-none">
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 cursor-pointer">
                            {task.type} <ChevronDown className="w-3 h-3 ml-1" />
                          </Badge>
                        </button>
                      } />
                      <DropdownMenuContent>
                        {TYPE_OPTIONS.map((t) => (
                          <DropdownMenuItem
                            key={t}
                            onClick={() => update.mutate({ taskId: task.id, type: t })}
                            className={task.type === t ? "font-semibold" : ""}
                          >
                            {t}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Assignee</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {task.assigneeId ? task.assigneeId.substring(0, 2).toUpperCase() : "??"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">
                        {task.assigneeId ? `User ${task.assigneeId.substring(0, 8)}` : "Unassigned"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Creator</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {task.creatorId.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">
                        User {task.creatorId.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Story Points</p>
                    <span className="text-sm text-gray-700">{task.storyPoints ?? "—"}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Due Date</p>
                    <span className="text-sm text-gray-700">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Description</p>
                  <div className="text-sm text-gray-700 space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[60px]">
                    {task.description ? (
                      <p>{task.description}</p>
                    ) : (
                      <p className="text-gray-400 italic">No description provided.</p>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex gap-1 mb-4">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer border-none ${
                          activeTab === tab.key
                            ? "bg-gray-900 text-white"
                            : "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "comments" && <CommentSection taskId={task.id} tenantId={tenantId} />}
                  {activeTab === "activity" && (
                    <div className="py-6 text-center text-sm text-gray-400">
                      Activity tracking coming soon.
                    </div>
                  )}
                  {activeTab === "history" && (
                    <div className="py-6 text-center text-sm text-gray-400">
                      No history available yet.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-sm text-gray-400">Task not found.</div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
