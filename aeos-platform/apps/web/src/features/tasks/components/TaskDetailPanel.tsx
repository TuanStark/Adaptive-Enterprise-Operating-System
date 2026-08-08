"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Paperclip, CheckSquare, Loader2, ChevronDown, X, Plus, Clock, Calendar, Tag, Pencil, Search, UserCircle2 } from "lucide-react";
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
import { useTasks } from "../hooks/useTasks";
import { useWorkspaceMembers } from "../../workspaces/hooks/useWorkspaceMembers";
import { useDebounce } from "@/hooks/useDebounce";
import { useState } from "react";

function EditableField({
  value,
  displayValue,
  onSave,
  placeholder = "—",
  type = "text",
}: {
  value: string | number;
  displayValue?: React.ReactNode;
  onSave: (val: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value);

  if (isEditing) {
    return (
      <Input
        autoFocus
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => {
          onSave(val.toString());
          setIsEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSave(val.toString());
            setIsEditing(false);
          }
          if (e.key === "Escape") {
            setIsEditing(false);
            setVal(value);
          }
        }}
        className="h-7 text-sm px-2 py-1 w-full"
      />
    );
  }

  return (
    <div
      className="group flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1 -ml-1 rounded transition-colors"
      onClick={() => {
        setVal(value);
        setIsEditing(true);
      }}
    >
      <span className="text-sm text-gray-700 truncate">
        {value ? (displayValue ?? value) : <span className="text-gray-400 italic">{placeholder}</span>}
      </span>
      <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
  onNavigateToTask?: (taskId: string) => void;
}

export function TaskDetailPanel({ taskId, onClose, onNavigateToTask }: TaskDetailPanelProps) {
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
    isEditingDescription,
    editDescription,
    setEditDescription,
    handleSaveDescription,
    startEditingDescription,
    setIsEditingDescription,
  } = useTaskDetailPanel(taskId);

  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const { data: searchResults } = useTasks({ search: taskSearchQuery, limit: 5 });

  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [reporterSearch, setReporterSearch] = useState("");
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [isReporterDropdownOpen, setIsReporterDropdownOpen] = useState(false);

  const debouncedAssigneeSearch = useDebounce(assigneeSearch, 300);
  const debouncedReporterSearch = useDebounce(reporterSearch, 300);

  const { data: assigneesResult } = useWorkspaceMembers({
    workspaceId: task?.workspaceId ?? undefined,
    search: debouncedAssigneeSearch,
    limit: 10,
  });

  const { data: reportersResult } = useWorkspaceMembers({
    workspaceId: task?.workspaceId ?? undefined,
    search: debouncedReporterSearch,
    limit: 10,
  });

  const assigneesList = assigneesResult?.data ?? [];
  const reportersList = reportersResult?.data ?? [];

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
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 h-14">
            <div className="flex items-center gap-3 w-2/3 relative">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                <CheckSquare className="w-4 h-4 text-primary" />
                <span>{task?.key ?? taskId}</span>
              </div>

              <DropdownMenu open={taskSearchQuery.length > 0} onOpenChange={(open) => !open && setTaskSearchQuery("")}>
                <DropdownMenuContent align="start" className="w-[350px] max-h-[300px] overflow-y-auto p-1" sideOffset={5}>
                  {searchResults?.data && searchResults.data.length > 0 ? (
                    searchResults.data.map(t => (
                      <DropdownMenuItem
                        key={t.id}
                        className="flex flex-col items-start py-2 cursor-pointer"
                        onClick={() => {
                          setTaskSearchQuery("");
                          onNavigateToTask?.(t.id);
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-xs font-semibold text-gray-500 shrink-0">{t.key}</span>
                          <span className="text-sm text-gray-900 truncate font-medium">{t.title}</span>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-3 text-center text-sm text-gray-500">No issues found.</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500"><Paperclip className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 mr-4"><MessageSquare className="w-4 h-4" /></Button>
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
                    <div className="group flex items-center gap-2">
                      <h2
                        className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-50 p-1 -ml-1 rounded transition-colors"
                        onClick={startEditingTitle}
                      >
                        {task.title}
                      </h2>
                      <button onClick={startEditingTitle} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer rounded-md hover:bg-gray-100">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
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
                    <DropdownMenu open={isAssigneeDropdownOpen} onOpenChange={setIsAssigneeDropdownOpen}>
                      <DropdownMenuTrigger>
                        <div className="flex items-center gap-2 group cursor-pointer hover:bg-gray-50 p-1 -ml-1 rounded transition-colors w-fit">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                              {task.assignee?.displayName
                                ? task.assignee.displayName.substring(0, 2).toUpperCase()
                                : <UserCircle2 className="w-4 h-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {task.assignee?.displayName ? task.assignee.displayName : "Unassigned"}
                          </span>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[200px] p-0" align="start">
                        <div className="p-2 border-b border-gray-100">
                          <Input
                            placeholder="Search user..."
                            value={assigneeSearch}
                            onChange={(e) => setAssigneeSearch(e.target.value)}
                            className="h-8 text-sm focus-visible:ring-1"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-1">
                          <DropdownMenuItem
                            onClick={() => {
                              handleUpdateField({ assigneeId: null });
                              setIsAssigneeDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 text-gray-500 cursor-pointer"
                          >
                            <Avatar className="h-5 w-5"><AvatarFallback className="bg-gray-100"><UserCircle2 className="w-3 h-3" /></AvatarFallback></Avatar>
                            Unassigned
                          </DropdownMenuItem>
                          {assigneesList.length > 0 ? assigneesList.map(u => (
                            <DropdownMenuItem
                              key={u.id}
                              onClick={() => {
                                handleUpdateField({ assigneeId: u.userId });
                                setIsAssigneeDropdownOpen(false);
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px]">
                                  {u.name ? u.name.substring(0, 2).toUpperCase() : "??"}
                                </AvatarFallback>
                              </Avatar>
                              {u.name}
                            </DropdownMenuItem>
                          )) : (
                            <div className="p-2 text-center text-xs text-gray-400">No user found</div>
                          )}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Reporter</p>
                    <DropdownMenu open={isReporterDropdownOpen} onOpenChange={setIsReporterDropdownOpen}>
                      <DropdownMenuTrigger>
                        <div className="flex items-center gap-2 group cursor-pointer hover:bg-gray-50 p-1 -ml-1 rounded transition-colors w-fit">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                              {task.reporter?.displayName
                                ? task.reporter.displayName.substring(0, 2).toUpperCase()
                                : <UserCircle2 className="w-4 h-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {task.reporter?.displayName ? task.reporter.displayName : "Unassigned"}
                          </span>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[200px] p-0" align="start">
                        <div className="p-2 border-b border-gray-100">
                          <Input
                            placeholder="Search user..."
                            value={reporterSearch}
                            onChange={(e) => setReporterSearch(e.target.value)}
                            className="h-8 text-sm focus-visible:ring-1"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-1">
                          <DropdownMenuItem
                            onClick={() => {
                              handleUpdateField({ reporterId: null });
                              setIsReporterDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 text-gray-500 cursor-pointer"
                          >
                            <Avatar className="h-5 w-5"><AvatarFallback className="bg-gray-100"><UserCircle2 className="w-3 h-3" /></AvatarFallback></Avatar>
                            Unassigned
                          </DropdownMenuItem>
                          {reportersList.length > 0 ? reportersList.map(u => (
                            <DropdownMenuItem
                              key={u.id}
                              onClick={() => {
                                handleUpdateField({ reporterId: u.userId });
                                setIsReporterDropdownOpen(false);
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px]">
                                  {u.name ? u.name.substring(0, 2).toUpperCase() : "??"}
                                </AvatarFallback>
                              </Avatar>
                              {u.name}
                            </DropdownMenuItem>
                          )) : (
                            <div className="p-2 text-center text-xs text-gray-400">No user found</div>
                          )}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Story Points</p>
                    <EditableField
                      value={task.storyPoints ?? ""}
                      type="number"
                      onSave={(val) => handleUpdateField({ storyPoints: val ? Number(val) : null })}
                      placeholder="None"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Start Date</p>
                    <EditableField
                      value={task.startDate ? task.startDate.split("T")[0] : ""}
                      displayValue={task.startDate ? new Date(task.startDate).toLocaleDateString() : undefined}
                      type="date"
                      onSave={(val) => handleUpdateField({ startDate: val ? new Date(val).toISOString() : null })}
                      placeholder="None"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-xs font-medium text-gray-500">Due Date</p>
                    </div>
                    <EditableField
                      value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                      displayValue={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined}
                      type="date"
                      onSave={(val) => handleUpdateField({ dueDate: val ? new Date(val).toISOString() : null })}
                      placeholder="None"
                    />
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
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center group cursor-pointer hover:bg-gray-100 transition-colors">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Original</p>
                      <EditableField
                        value={task.originalEstimate ?? ""}
                        displayValue={formatMinutes(task.originalEstimate)}
                        type="number"
                        onSave={(val) => handleUpdateField({ originalEstimate: val ? Number(val) : null })}
                        placeholder="0m"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center group cursor-pointer hover:bg-gray-100 transition-colors">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Remaining</p>
                      <EditableField
                        value={task.remainingEstimate ?? ""}
                        displayValue={formatMinutes(task.remainingEstimate)}
                        type="number"
                        onSave={(val) => handleUpdateField({ remainingEstimate: val ? Number(val) : null })}
                        placeholder="0m"
                      />
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
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">Description</p>
                    {!isEditingDescription && (
                      <button onClick={startEditingDescription} className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 bg-transparent border-none cursor-pointer">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>
                  {isEditingDescription ? (
                    <div className="space-y-2">
                      <Textarea
                        autoFocus
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Add a description..."
                        className="min-h-[120px] text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleSaveDescription}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingDescription(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="text-sm text-gray-700 space-y-2 bg-gray-50 hover:bg-gray-100 p-4 rounded-xl border border-gray-100 min-h-[60px] cursor-pointer transition-colors"
                      onClick={startEditingDescription}
                    >
                      {task.description ? (
                        <p className="whitespace-pre-wrap">{task.description}</p>
                      ) : (
                        <p className="text-gray-400 italic">No description provided. Click to add one.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex gap-1 mb-4">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer border-none ${activeTab === tab.key
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
