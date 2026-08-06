"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageSquare, Paperclip, CheckSquare, Loader2, ChevronDown, X, Plus, Clock, Calendar, Tag } from "lucide-react";
import { CommentSection } from "./CommentSection";
import { useSession } from "next-auth/react";
import {
  useTaskDetailPanel,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  TYPE_OPTIONS,
  RESOLUTION_OPTIONS,
  ENVIRONMENT_OPTIONS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  getLabelColor,
  formatMinutes,
} from "../hooks/useTaskDetailPanel";

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  const { data: session } = useSession();
  const tenantId = session?.user?.tenantId ?? "";

  const {
    task,
    isLoading,
    activeTab,
    setActiveTab,
    isEditingTitle,
    editTitle,
    setEditTitle,
    handleSaveTitle,
    startEditingTitle,
    setIsEditingTitle,
    handleChangeStatus,
    handleUpdateField,
    labelInput,
    setLabelInput,
    isAddingLabel,
    setIsAddingLabel,
    handleAddLabel,
    handleRemoveLabel,
    isResolved,
    isBug,
    timeProgress,
  } = useTaskDetailPanel(taskId);

  if (!taskId) return null;

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
                      onClick={startEditingTitle}
                    >
                      {task.title}
                    </h2>
                  )}

                  {/* Status + Priority + Type Badges */}
                  <div className="flex gap-2 pt-2 flex-wrap">
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
                            onClick={() => handleChangeStatus(s)}
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
                            onClick={() => handleUpdateField({ priority: p })}
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
                            onClick={() => handleUpdateField({ type: t })}
                            className={task.type === t ? "font-semibold" : ""}
                          >
                            {t}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Labels */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs font-medium text-gray-500">Labels</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {(task.labels ?? []).map((label) => (
                      <span
                        key={label}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getLabelColor(label)}`}
                      >
                        {label}
                        <button
                          onClick={() => handleRemoveLabel(label)}
                          className="hover:bg-black/10 rounded-full p-0.5 transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {isAddingLabel ? (
                      <Input
                        autoFocus
                        value={labelInput}
                        onChange={(e) => setLabelInput(e.target.value)}
                        onBlur={() => { handleAddLabel(); setIsAddingLabel(false); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddLabel();
                          if (e.key === "Escape") setIsAddingLabel(false);
                        }}
                        placeholder="Label name..."
                        className="h-6 w-24 text-xs px-2"
                      />
                    ) : (
                      <button
                        onClick={() => setIsAddingLabel(true)}
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer border border-dashed border-gray-200 bg-transparent"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    )}
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
                    <p className="text-xs font-medium text-gray-500 mb-2">Reporter</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {task.reporterId ? task.reporterId.substring(0, 2).toUpperCase() : task.creatorId.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">
                        {task.reporterId ? `User ${task.reporterId.substring(0, 8)}` : `User ${task.creatorId.substring(0, 8)}`}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Story Points</p>
                    <span className="text-sm text-gray-700">{task.storyPoints ?? "—"}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Start Date</p>
                    <span className="text-sm text-gray-700">
                      {task.startDate ? new Date(task.startDate).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-xs font-medium text-gray-500">Due Date</p>
                    </div>
                    <span className="text-sm text-gray-700">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                    </span>
                  </div>

                  {/* Resolution — only show when resolved */}
                  {isResolved && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Resolution</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <button className="focus:outline-none">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 cursor-pointer text-xs">
                              {task.resolution ?? "None"} <ChevronDown className="w-3 h-3 ml-1" />
                            </Badge>
                          </button>
                        } />
                        <DropdownMenuContent>
                          {RESOLUTION_OPTIONS.map((r) => (
                            <DropdownMenuItem
                              key={r}
                              onClick={() => handleUpdateField({ resolution: r })}
                              className={task.resolution === r ? "font-semibold" : ""}
                            >
                              {r.replace(/_/g, " ")}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                  {/* Environment — only show for bugs */}
                  {isBug && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Environment</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <button className="focus:outline-none">
                            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 cursor-pointer text-xs">
                              {task.environment ?? "None"} <ChevronDown className="w-3 h-3 ml-1" />
                            </Badge>
                          </button>
                        } />
                        <DropdownMenuContent>
                          {ENVIRONMENT_OPTIONS.map((e) => (
                            <DropdownMenuItem
                              key={e}
                              onClick={() => handleUpdateField({ environment: e })}
                              className={task.environment === e ? "font-semibold" : ""}
                            >
                              {e}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {/* Time Tracking */}
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">Time Tracking</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Original</p>
                      <p className="text-sm font-semibold text-gray-700">{formatMinutes(task.originalEstimate)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Remaining</p>
                      <p className="text-sm font-semibold text-gray-700">{formatMinutes(task.remainingEstimate)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                      <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wide mb-0.5">Logged</p>
                      <p className="text-sm font-semibold text-blue-700">{formatMinutes(task.timeSpent)}</p>
                    </div>
                  </div>
                  {task.originalEstimate != null && task.originalEstimate > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${timeProgress > 100 ? "bg-red-500" : "bg-blue-500"}`}
                        style={{ width: `${Math.min(timeProgress, 100)}%` }}
                      />
                    </div>
                  )}
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
