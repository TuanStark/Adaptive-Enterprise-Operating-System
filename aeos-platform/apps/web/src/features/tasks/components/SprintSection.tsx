"use client";

import { ChevronDown, ChevronRight, Play, Check, Plus, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droppable } from "@hello-pangea/dnd";
import type { Sprint } from "../types/sprint";
import type { Task } from "../types";
import { BacklogTaskRow } from "./BacklogTaskRow";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

interface SprintSectionProps {
  sprint: Sprint;
  tasks: Task[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onStartSprint: () => void;
  onCompleteSprint: () => void;
  isStarting?: boolean;
  isCompleting?: boolean;
  addingTaskTo?: string | null;
  setAddingTaskTo?: (val: string | null) => void;
  newTaskTitle?: string;
  setNewTaskTitle?: (val: string) => void;
  onHandleCreateTask?: () => void;
  onTaskClick?: (taskId: string) => void;
}

export function SprintSection({
  sprint,
  tasks,
  isCollapsed,
  onToggleCollapse,
  onStartSprint,
  onCompleteSprint,
  isStarting,
  isCompleting,
  addingTaskTo,
  setAddingTaskTo,
  newTaskTitle,
  setNewTaskTitle,
  onHandleCreateTask,
  onTaskClick,
}: SprintSectionProps) {
  const isActive = sprint.status === "ACTIVE";
  const isPlanning = sprint.status === "PLANNING";

  const todoCount = tasks.filter((t) => t.status === "TODO" || t.status === "BACKLOG").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "REVIEW").length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="mb-8">
      <div className={`flex items-center justify-between px-4 py-2 rounded-t border border-gray-200 ${isActive ? "bg-gray-50/80" : ""}`}>
        <div className="flex items-center gap-2">
          <button onClick={onToggleCollapse} className="border-none bg-transparent cursor-pointer p-0 flex items-center justify-center">
            {isCollapsed
              ? <ChevronRight className="w-4 h-4 text-gray-600" />
              : <ChevronDown className="w-4 h-4 text-gray-600" />
            }
          </button>
          <span className="font-semibold text-gray-900 text-sm">{sprint.name}</span>
          {isActive && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 font-semibold">
              ACTIVE
            </Badge>
          )}
          {sprint.startDate && sprint.endDate && (
            <span className="text-gray-500 text-sm ml-2">
              {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
            </span>
          )}
          {!sprint.startDate && (
            <span className="text-gray-500 text-sm ml-2 cursor-pointer hover:underline flex items-center gap-1">Add dates</span>
          )}
          <span className="text-gray-500 text-sm ml-1">({tasks.length} work items)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">{todoCount}</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{inProgressCount}</span>
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">{doneCount}</span>
          </div>
          {isActive && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs bg-gray-50"
              onClick={onCompleteSprint}
              disabled={isCompleting}
            >
              <Check className="w-3 h-3 mr-1" /> Complete sprint
            </Button>
          )}
          {isPlanning && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs bg-gray-50"
              onClick={onStartSprint}
              disabled={tasks.length === 0 || isStarting}
            >
              <Play className="w-3 h-3 mr-1" /> Start sprint
            </Button>
          )}
          <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>
      </div>

      {!isCollapsed && (
        <Droppable droppableId={sprint.id}>
          {(provided) => (
            <div className="flex flex-col min-h-[50px]" ref={provided.innerRef} {...provided.droppableProps}>
              {tasks.length > 0 ? (
                tasks.map((task, index) => <BacklogTaskRow key={task.id} task={task} index={index} onTaskClick={onTaskClick} />)
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-b-lg p-6 flex flex-col items-center justify-center text-gray-500 text-sm bg-gray-50/30">
                  Plan a sprint by dragging work items into it, or by dragging the sprint footer.
                </div>
              )}
              {provided.placeholder}

              {addingTaskTo === sprint.id ? (
                <div className="px-4 py-2 border border-t-0 border-gray-200 bg-white rounded-b">
                  <Input
                    autoFocus
                    value={newTaskTitle || ""}
                    onChange={(e) => setNewTaskTitle?.(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onHandleCreateTask?.();
                      if (e.key === "Escape") setAddingTaskTo?.(null);
                    }}
                    onBlur={() => onHandleCreateTask?.()}
                    className="h-8 text-sm"
                    placeholder="What needs to be done?"
                  />
                </div>
              ) : (
                <div
                  onClick={() => setAddingTaskTo?.(sprint.id)}
                  className="flex items-center px-4 py-2 border border-t-0 border-gray-200 bg-white rounded-b hover:bg-gray-50 cursor-pointer text-gray-500 text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create task
                </div>
              )}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}
