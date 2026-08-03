"use client";

import { useState } from "react";
import { Search, Filter, BarChart2, Settings, MoreHorizontal, ChevronDown, ChevronRight, Plus, GitMerge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSprints, useSprintMutations } from "../hooks/useSprints";
import { useTasks } from "../hooks/useTasks";
import { SprintSection } from "./SprintSection";
import { BacklogTaskRow } from "./BacklogTaskRow";
import { CreateSprintDialog } from "./CreateSprintDialog";
import type { Task } from "../types";

interface BacklogViewProps {
  initialTasks: Record<string, Task[]>;
  projectId?: string;
}

export function BacklogView({ initialTasks, projectId = "proj-1" }: BacklogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSprints, setCollapsedSprints] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: sprintsData } = useSprints(projectId);
  const { data: tasksData } = useTasks({ projectId });
  const { start, complete } = useSprintMutations(projectId);

  const sprints = sprintsData ?? [];
  const allTasks = tasksData?.data ?? Object.values(initialTasks).flat();

  const getSprintTasks = (sprintId: string) => allTasks.filter((t) => t.sprintId === sprintId);
  const backlogTasks = allTasks.filter((t) => !t.sprintId);
  const activeSprints = sprints.filter((s) => s.status !== "COMPLETED");
  const completedSprints = sprints.filter((s) => s.status === "COMPLETED");

  const toggleCollapse = (sprintId: string) => {
    setCollapsedSprints((prev) => {
      const next = new Set(prev);
      if (next.has(sprintId)) next.delete(sprintId);
      else next.add(sprintId);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto pb-10">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search backlog"
              className="h-8 pl-8 w-[200px] text-sm bg-gray-50/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex -space-x-1">
            <Avatar className="w-8 h-8 border-2 border-white cursor-pointer">
              <AvatarImage src="https://i.pravatar.cc/150?u=1" />
              <AvatarFallback className="bg-gray-200 text-gray-600 text-xs font-medium">LT</AvatarFallback>
            </Avatar>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-gray-700 bg-gray-50/50">
            <Filter className="w-3.5 h-3.5 mr-2" /> Filter
          </Button>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Button variant="ghost" size="icon" className="h-8 w-8"><BarChart2 className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Sprints Area */}
      <div className="px-8 mt-6 max-w-[1200px]">
        {/* Active & Planning Sprints */}
        {activeSprints.map((sprint) => (
          <SprintSection
            key={sprint.id}
            sprint={sprint}
            tasks={getSprintTasks(sprint.id)}
            isCollapsed={collapsedSprints.has(sprint.id)}
            onToggleCollapse={() => toggleCollapse(sprint.id)}
            onStartSprint={() => start.mutate(sprint.id)}
            onCompleteSprint={() => complete.mutate(sprint.id)}
            isStarting={start.isPending}
            isCompleting={complete.isPending}
          />
        ))}

        {/* Divider */}
        <div className="flex justify-center my-6">
          <div className="w-6 h-6 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-400 shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
          </div>
        </div>

        {/* Backlog */}
        <div className="mb-8">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-gray-600 cursor-pointer" />
              <span className="font-semibold text-gray-900 text-sm">Backlog</span>
              <span className="text-gray-500 text-sm ml-2">({backlogTasks.length} work items)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 opacity-50">
                <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {backlogTasks.filter((t) => t.status === "TODO" || t.status === "BACKLOG").length}
                </span>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {backlogTasks.filter((t) => t.status === "IN_PROGRESS").length}
                </span>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {backlogTasks.filter((t) => t.status === "DONE").length}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs bg-gray-50 flex items-center gap-1"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <GitMerge className="w-3.5 h-3.5" /> Create sprint
              </Button>
            </div>
          </div>

          <div className="flex flex-col">
            {backlogTasks.length > 0 ? (
              backlogTasks.map((task) => <BacklogTaskRow key={task.id} task={task} />)
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 text-sm bg-gray-50/30">
                Your backlog is empty.
              </div>
            )}
            <div className={`flex items-center px-4 py-2 border border-gray-200 bg-white rounded-b hover:bg-gray-50 cursor-pointer text-gray-500 text-sm font-medium transition-colors ${backlogTasks.length === 0 ? "border-t-0 mt-1" : ""}`}>
              <Plus className="w-4 h-4 mr-2" /> Create
            </div>
          </div>
        </div>

        {/* Completed Sprints (collapsed) */}
        {completedSprints.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 px-2 py-2 text-gray-400">
              <ChevronRight className="w-4 h-4" />
              <span className="text-sm font-medium">Completed Sprints ({completedSprints.length})</span>
            </div>
          </div>
        )}
      </div>

      {/* Create Sprint Dialog */}
      <CreateSprintDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        projectId={projectId}
        nextSprintNumber={sprints.length + 1}
      />
    </div>
  );
}
