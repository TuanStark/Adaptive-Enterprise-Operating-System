"use client";

import { CalendarIcon, CheckSquare, Bug, Bookmark, ChevronDown, GitMerge, GripVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Draggable } from "@hello-pangea/dnd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task } from "../types";
import { useTaskMutations } from "../hooks/useTasks";

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

const MOCK_USERS = [
  { id: "00000000-0000-0000-0000-000000000001", name: "Tony Stark", initials: "TS" },
  { id: "00000000-0000-0000-0000-000000000002", name: "Bruce Wayne", initials: "BW" },
  { id: "unassigned", name: "Unassigned", initials: "??" },
];

interface BacklogTaskRowProps {
  task: Task;
  index: number;
  onTaskClick?: (taskId: string) => void;
}

export function BacklogTaskRow({ task, index, onTaskClick }: BacklogTaskRowProps) {
  const { changeStatus, update, assign } = useTaskMutations();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    changeStatus.mutate({ taskId: task.id, status: isChecked ? "DONE" : "TODO" });
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex items-center justify-between px-4 py-2 border border-t-0 border-gray-200 bg-white hover:bg-gray-50 group transition-colors ${
            snapshot.isDragging ? "shadow-lg bg-gray-50 z-50 rounded" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div {...provided.dragHandleProps} className="text-gray-300 hover:text-gray-500 cursor-grab">
              <GripVertical className="w-4 h-4" />
            </div>
            <input
              type="checkbox"
              className="w-4 h-4 rounded-sm border-gray-300 accent-blue-600"
              checked={task.status === "DONE"}
              onChange={handleCheckboxChange}
            />
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <TypeIcon type={task.type} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => update.mutate({ taskId: task.id, type: "TASK" })}>
                  <CheckSquare className="w-4 h-4 text-blue-500 mr-2" /> Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => update.mutate({ taskId: task.id, type: "STORY" })}>
                  <Bookmark className="w-4 h-4 text-emerald-500 mr-2" /> Story
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => update.mutate({ taskId: task.id, type: "BUG" })}>
                  <Bug className="w-4 h-4 text-red-500 mr-2" /> Bug
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => onTaskClick?.(task.id)}
              className="text-gray-500 text-sm hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              {task.key}
            </button>
            <span
              onClick={() => onTaskClick?.(task.id)}
              className="text-gray-900 text-sm font-medium hover:underline cursor-pointer"
            >
              {task.title}
            </span>
          </div>
          <div className="flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
            <GitMerge className="w-4 h-4 text-gray-400" />
            
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded cursor-pointer flex items-center gap-1">
                  {task.status.replace("_", " ")} <ChevronDown className="w-3 h-3" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["TODO", "BACKLOG", "IN_PROGRESS", "REVIEW", "DONE"].map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => changeStatus.mutate({ taskId: task.id, status: status as any })}
                  >
                    {status.replace("_", " ")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {task.dueDate && (
              <div className="flex items-center text-gray-500 text-xs gap-1 w-20">
                <CalendarIcon className="w-3.5 h-3.5" /> {formatDate(task.dueDate)}
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="w-6 text-center text-gray-500 font-semibold text-sm bg-gray-100 rounded-full px-1 hover:bg-gray-200 cursor-pointer">
                  {task.storyPoints || "-"}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => update.mutate({ taskId: task.id, storyPoints: undefined })}>
                  Clear (-)
                </DropdownMenuItem>
                {[1, 2, 3, 5, 8, 13, 21].map((pts) => (
                  <DropdownMenuItem key={pts} onClick={() => update.mutate({ taskId: task.id, storyPoints: pts })}>
                    {pts} Point{pts > 1 ? "s" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none rounded-full ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-500">
                <Avatar className="w-6 h-6">
                  <AvatarFallback>
                    {task.assigneeId
                      ? MOCK_USERS.find((u) => u.id === task.assigneeId)?.initials ||
                        task.assigneeId.substring(0, 2).toUpperCase()
                      : "??"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {MOCK_USERS.map((user) => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() =>
                      assign.mutate({
                        taskId: task.id,
                        assigneeId: user.id === "unassigned" ? (null as any) : user.id,
                      })
                    }
                  >
                    {user.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </Draggable>
  );
}
