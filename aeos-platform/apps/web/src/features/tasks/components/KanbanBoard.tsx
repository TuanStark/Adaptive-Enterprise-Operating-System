"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bug, Bookmark, CheckSquare, Plus, Layers, AlertTriangle, ArrowUp, ArrowDown, Minus, Clock, MoreHorizontal, Settings, Pencil, Trash2, X } from "lucide-react";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { BoardToolbar } from "./BoardToolbar";
import type { Task, TaskPriority } from "../types";
import type { BoardColumn, TaskStatusValue } from "../types/board";
import { ALL_STATUSES } from "../types/board";
import { useTaskMutations, useTasks } from "../hooks/useTasks";
import { useBoardConfig, useBoardConfigMutations } from "../hooks/useBoardConfig";
import { getLabelColor } from "../hooks/useTaskDetailPanel";
import { generateId } from "../utils/id";

// ── Icons ──

const TypeIcon = ({ type }: { type?: string }) => {
  if (type === "BUG") return <Bug className="w-4 h-4 text-red-500 shrink-0" />;
  if (type === "STORY") return <Bookmark className="w-4 h-4 text-emerald-500 shrink-0" />;
  if (type === "EPIC") return <Layers className="w-4 h-4 text-purple-500 shrink-0" />;
  if (type === "SUBTASK") return <CheckSquare className="w-3.5 h-3.5 text-gray-400 shrink-0" />;
  return <CheckSquare className="w-4 h-4 text-blue-500 shrink-0" />;
};

const PriorityIcon = ({ priority }: { priority?: TaskPriority }) => {
  if (priority === "URGENT") return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
  if (priority === "HIGH") return <ArrowUp className="w-3.5 h-3.5 text-orange-500" />;
  if (priority === "LOW") return <ArrowDown className="w-3.5 h-3.5 text-gray-400" />;
  return <Minus className="w-3.5 h-3.5 text-blue-400" />;
};

// ── Props ──

interface KanbanBoardProps {
  initialTasks: Task[];
  projectId: string;
  tenantId: string;
  workspaceId: string;
}

export function KanbanBoard({ initialTasks, projectId, tenantId, workspaceId }: KanbanBoardProps) {
  const { create, changeStatus } = useTaskMutations();
  const { data: boardConfig, isLoading: configLoading } = useBoardConfig(projectId);
  const { save: saveConfig } = useBoardConfigMutations(projectId);
  const { data: tasksData } = useTasks({ projectId, workspaceId, limit: 200 });

  const tasks = tasksData?.data ?? initialTasks;
  const columns = boardConfig?.columns ?? [];

  // ── Filter State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  // ── UI State ──
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [addingTaskCol, setAddingTaskCol] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColStatuses, setNewColStatuses] = useState<TaskStatusValue[]>([]);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editColName, setEditColName] = useState("");

  // ── Local Tasks State (for instant DND updates without flicker) ──
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // ── Derived: group tasks into columns ──
  const columnTasks = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const col of columns) {
      map[col.id] = localTasks.filter((t) => {
        if (!col.statuses.includes(t.status as TaskStatusValue)) return false;
        if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.key.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedAssignee && t.assigneeId !== selectedAssignee) return false;
        if (selectedType && t.type !== selectedType) return false;
        if (selectedPriority && t.priority !== selectedPriority) return false;
        return true;
      });
    }
    return map;
  }, [columns, localTasks, searchQuery, selectedAssignee, selectedType, selectedPriority]);

  // ── Statuses already used by existing columns ──
  const usedStatuses = useMemo(() => {
    const set = new Set<string>();
    columns.forEach((c) => c.statuses.forEach((s) => set.add(s)));
    return set;
  }, [columns]);

  const availableStatuses = ALL_STATUSES.filter((s) => !usedStatuses.has(s));

  // ── Handlers ──

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const { destination, draggableId } = result;
    const destCol = columns.find((c) => c.id === destination.droppableId);
    if (!destCol || destCol.statuses.length === 0) return;

    // Change task status to first status of destination column
    const newStatus = destCol.statuses[0];
    
    // Synchronously update local state to prevent UI flicker
    setLocalTasks((prev) => 
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    // Then run mutation in background
    changeStatus.mutate({ taskId: draggableId, status: newStatus });
  }, [columns, changeStatus]);

  const handleCreateTask = useCallback((colId: string) => {
    if (!newTaskTitle.trim()) {
      setAddingTaskCol(null);
      return;
    }
    create.mutate({
      tenantId,
      workspaceId,
      projectId,
      title: newTaskTitle.trim(),
    });
    setNewTaskTitle("");
    setAddingTaskCol(null);
  }, [newTaskTitle, tenantId, workspaceId, projectId, create]);

  const handleAddColumn = useCallback(() => {
    if (!newColName.trim() || newColStatuses.length === 0) return;
    const newCol: BoardColumn = {
      id: `col-${Date.now()}`,
      name: newColName.trim().toUpperCase(),
      statuses: newColStatuses,
      order: columns.length,
    };
    saveConfig.mutate({ columns: [...columns, newCol], workspaceId });
    setNewColName("");
    setNewColStatuses([]);
    setIsAddingCol(false);
  }, [newColName, newColStatuses, columns, saveConfig, workspaceId]);

  const handleDeleteColumn = useCallback((colId: string) => {
    const updated = columns.filter((c) => c.id !== colId).map((c, i) => ({ ...c, order: i }));
    saveConfig.mutate({ columns: updated, workspaceId });
  }, [columns, saveConfig, workspaceId]);

  const handleRenameColumn = useCallback((colId: string) => {
    if (!editColName.trim()) {
      setEditingColId(null);
      return;
    }
    const updated = columns.map((c) => (c.id === colId ? { ...c, name: editColName.trim().toUpperCase() } : c));
    saveConfig.mutate({ columns: updated, workspaceId });
    setEditingColId(null);
  }, [editColName, columns, saveConfig, workspaceId]);

  const toggleNewColStatus = (status: TaskStatusValue) => {
    setNewColStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  if (configLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading board...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter Toolbar */}
      <BoardToolbar
        tasks={tasks}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
      />

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full gap-4 min-w-max pb-4 items-start">
            {columns
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((col) => {
                const items = columnTasks[col.id] ?? [];
                const isOverWip = col.wipLimit != null && items.length > col.wipLimit;

                return (
                  <div key={col.id} className="w-[300px] flex flex-col bg-gray-50/50 rounded-xl border border-gray-100 shrink-0 max-h-full">
                    {/* Column Header */}
                    <div className={`p-3 flex justify-between items-center shrink-0 ${isOverWip ? "bg-red-50/50" : ""}`}>
                      <div className="flex items-center gap-2">
                        {editingColId === col.id ? (
                          <Input
                            autoFocus
                            value={editColName}
                            onChange={(e) => setEditColName(e.target.value)}
                            onBlur={() => handleRenameColumn(col.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRenameColumn(col.id);
                              if (e.key === "Escape") setEditingColId(null);
                            }}
                            className="h-6 w-32 text-xs font-semibold uppercase"
                          />
                        ) : (
                          <span className="font-semibold text-gray-500 text-sm uppercase tracking-wide">
                            {col.name}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isOverWip ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-700"}`}>
                          {items.length}{col.wipLimit != null ? `/${col.wipLimit}` : ""}
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <button className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-1"><MoreHorizontal className="w-4 h-4" /></button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingColId(col.id); setEditColName(col.name); }}>
                            <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteColumn(col.id)} className="text-red-600">
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete column
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Column subtitle: mapped statuses */}
                    <div className="px-3 pb-2 flex flex-wrap gap-1">
                      {col.statuses.map((s) => (
                        <span key={s} className="text-[9px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {s.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>

                    {/* Cards */}
                    <Droppable droppableId={col.id}>
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 px-2 pb-1 space-y-2 overflow-y-auto min-h-[120px]">
                          {items.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedTaskId(task.id)}
                                  style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.8 : 1 }}
                                >
                                  <Card className="shadow-sm border-gray-200 hover:border-primary/50 transition-colors cursor-pointer">
                                    <CardContent className="p-3">
                                      {/* Labels */}
                                      {task.labels && task.labels.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                          {task.labels.slice(0, 3).map((label) => (
                                            <span key={label} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getLabelColor(label)}`}>
                                              {label}
                                            </span>
                                          ))}
                                          {task.labels.length > 3 && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                                              +{task.labels.length - 3}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      {/* Title */}
                                      <div className="flex items-start gap-2 mb-2">
                                        <div className="mt-0.5"><TypeIcon type={task.type} /></div>
                                        <p className={`text-sm font-medium leading-snug ${task.status === "DONE" ? "line-through text-gray-500" : "text-gray-900"}`}>
                                          {task.title}
                                        </p>
                                      </div>
                                      {/* Footer */}
                                      <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50 font-normal text-[10px]">
                                            {task.key}
                                          </Badge>
                                          <PriorityIcon priority={task.priority} />
                                          {task.storyPoints != null && (
                                            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">
                                              {task.storyPoints}
                                            </span>
                                          )}
                                          {task.dueDate && (
                                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                              new Date(task.dueDate) < new Date() ? "bg-red-100 text-red-600" : "text-gray-400"
                                            }`}>
                                              {new Date(task.dueDate).toLocaleDateString("en", { day: "numeric", month: "short" })}
                                            </span>
                                          )}
                                        </div>
                                        <Avatar className="h-6 w-6">
                                          <AvatarFallback className="text-[10px]">
                                            {task.assigneeId ? task.assigneeId.substring(0, 2).toUpperCase() : "??"}
                                          </AvatarFallback>
                                        </Avatar>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    {/* Create Issue */}
                    <div className="px-2 pb-2 shrink-0">
                      {addingTaskCol === col.id ? (
                        <div className="space-y-2 mt-1">
                          <Input
                            autoFocus
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCreateTask(col.id);
                              if (e.key === "Escape") setAddingTaskCol(null);
                            }}
                            placeholder="What needs to be done?"
                            className="h-8 text-sm"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="h-7 text-xs" onClick={() => handleCreateTask(col.id)}>Create</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingTaskCol(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => setAddingTaskCol(col.id)}
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-200 bg-gray-100/50 p-2 rounded-md cursor-pointer transition-colors mt-1"
                        >
                          <Plus className="w-4 h-4" /> Create issue
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Add Column */}
            <div className="w-[300px] shrink-0">
              {isAddingCol ? (
                <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-3 space-y-3">
                  <Input
                    autoFocus
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    placeholder="Column name..."
                    className="h-8 text-sm"
                  />
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Map statuses to this column:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {availableStatuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => toggleNewColStatus(s)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer border ${
                            newColStatuses.includes(s)
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {s.replace(/_/g, " ")}
                        </button>
                      ))}
                      {availableStatuses.length === 0 && (
                        <p className="text-xs text-gray-400">All statuses are already mapped.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleAddColumn}
                      disabled={!newColName.trim() || newColStatuses.length === 0}
                    >
                      Add
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setIsAddingCol(false); setNewColName(""); setNewColStatuses([]); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsAddingCol(true)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-200 bg-gray-50/80 p-3 rounded-xl border border-dashed border-gray-300 cursor-pointer transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" /> Add column
                </div>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
    </div>
  );
}
