"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Task, TaskType, TaskPriority } from "../types";

interface BoardToolbarProps {
  tasks: Task[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedAssignee: string | null;
  onAssigneeChange: (assigneeId: string | null) => void;
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  selectedPriority: string | null;
  onPriorityChange: (priority: string | null) => void;
}

const TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: "EPIC", label: "Epic" },
  { value: "STORY", label: "Story" },
  { value: "TASK", label: "Task" },
  { value: "BUG", label: "Bug" },
  { value: "SUBTASK", label: "Subtask" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: "URGENT", label: "Urgent", color: "text-red-600" },
  { value: "HIGH", label: "High", color: "text-orange-500" },
  { value: "MEDIUM", label: "Medium", color: "text-blue-500" },
  { value: "LOW", label: "Low", color: "text-gray-400" },
];

export function BoardToolbar({
  tasks,
  searchQuery,
  onSearchChange,
  selectedAssignee,
  onAssigneeChange,
  selectedType,
  onTypeChange,
  selectedPriority,
  onPriorityChange,
}: BoardToolbarProps) {
  // Collect unique assignees from tasks
  const assignees = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.assigneeId) map.set(t.assigneeId, t.assigneeId);
    });
    return Array.from(map.values());
  }, [tasks]);

  const hasFilters = !!searchQuery || !!selectedAssignee || !!selectedType || !!selectedPriority;

  const clearAll = () => {
    onSearchChange("");
    onAssigneeChange(null);
    onTypeChange(null);
    onPriorityChange(null);
  };

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <Input
          placeholder="Search board..."
          className="h-8 pl-8 w-[180px] text-sm bg-gray-50/80 border-gray-200"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Assignee Avatars */}
      <div className="flex -space-x-1">
        {assignees.slice(0, 6).map((uid) => (
          <button
            key={uid}
            onClick={() => onAssigneeChange(selectedAssignee === uid ? null : uid)}
            className={`relative rounded-full transition-all cursor-pointer border-none bg-transparent p-0 ${
              selectedAssignee === uid ? "ring-2 ring-blue-500 ring-offset-1 z-10" : "hover:z-10"
            }`}
          >
            <Avatar className="w-7 h-7 border-2 border-white">
              <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600 font-medium">
                {uid.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        ))}
      </div>

      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <button className={`flex items-center gap-1 h-8 px-3 rounded-md border text-sm transition-colors cursor-pointer ${
            selectedType ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}>
            {selectedType ?? "Type"}
          </button>
        } />
        <DropdownMenuContent>
          {selectedType && (
            <DropdownMenuItem onClick={() => onTypeChange(null)} className="text-gray-400">
              Clear
            </DropdownMenuItem>
          )}
          {TYPE_OPTIONS.map((t) => (
            <DropdownMenuItem
              key={t.value}
              onClick={() => onTypeChange(t.value)}
              className={selectedType === t.value ? "font-semibold" : ""}
            >
              {t.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <button className={`flex items-center gap-1 h-8 px-3 rounded-md border text-sm transition-colors cursor-pointer ${
            selectedPriority ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}>
            {selectedPriority ?? "Priority"}
          </button>
        } />
        <DropdownMenuContent>
          {selectedPriority && (
            <DropdownMenuItem onClick={() => onPriorityChange(null)} className="text-gray-400">
              Clear
            </DropdownMenuItem>
          )}
          {PRIORITY_OPTIONS.map((p) => (
            <DropdownMenuItem
              key={p.value}
              onClick={() => onPriorityChange(p.value)}
              className={selectedPriority === p.value ? "font-semibold" : ""}
            >
              <span className={p.color}>{p.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 h-8 px-2 text-xs text-gray-500 hover:text-gray-700 cursor-pointer bg-transparent border-none"
        >
          <X className="w-3 h-3" /> Clear filters
        </button>
      )}
    </div>
  );
}
