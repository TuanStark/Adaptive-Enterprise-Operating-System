"use client";

import { useState, useEffect } from "react";
import { Search, Filter, BarChart2, Settings, MoreHorizontal, ChevronDown, ChevronRight, Plus, GitMerge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useSprints, useSprintMutations } from "../hooks/useSprints";
import { useTasks, useTaskMutations } from "../hooks/useTasks";
import { SprintSection } from "./SprintSection";
import { BacklogTaskRow } from "./BacklogTaskRow";
import { CreateSprintDialog } from "./CreateSprintDialog";
import { ScrollDownIndicator } from "./ScrollDownIndicator";
import { TaskDetailPanel } from "./TaskDetailPanel";
import type { Task } from "../types";

interface BacklogViewProps {
  initialTasks: Record<string, Task[]>;
  projectId: string;
  tenantId: string;
  workspaceId: string;
}

export function BacklogView({ initialTasks, projectId, tenantId, workspaceId }: BacklogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSprints, setCollapsedSprints] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [addingTaskTo, setAddingTaskTo] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { data: sprintsData } = useSprints(projectId);
  const { data: tasksData } = useTasks({ projectId });
  const { start, complete } = useSprintMutations(projectId);
  const { create, moveToSprint } = useTaskMutations();

  const sprints = sprintsData ?? [];
  const allTasks = tasksData?.data ?? Object.values(initialTasks).flat();

  // Local state for optimistic drag and drop
  const [localTasks, setLocalTasks] = useState<Task[]>(allTasks);

  useEffect(() => {
    setLocalTasks(allTasks);
  }, [allTasks]);

  const filteredTasks = localTasks.filter((t) =>
    searchQuery === "" ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSprintTasks = (sprintId: string) => filteredTasks.filter((t) => t.sprintId === sprintId);
  const backlogTasks = filteredTasks.filter((t) => !t.sprintId);
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

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newSprintId = destination.droppableId === "BACKLOG" ? null : destination.droppableId;

    // Optimistic UI update
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, sprintId: newSprintId } : t))
    );

    moveToSprint.mutate({ taskId: draggableId, sprintId: newSprintId });
  };

  const handleCreateTask = async (targetId: string) => {
    if (!newTaskTitle.trim()) {
      setAddingTaskTo(null);
      return;
    }
    const sprintId = targetId === "BACKLOG" ? null : targetId;
    const title = newTaskTitle.trim();
    setNewTaskTitle("");
    setAddingTaskTo(null);

    try {
      const newTask = await create.mutateAsync({
        tenantId,
        workspaceId,
        projectId,
        title,
      });
      if (sprintId) {
        await moveToSprint.mutateAsync({ taskId: newTask.id, sprintId });
      }
    } catch (error) {
      console.error("Failed to create task", error);
    }
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

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Sprints Area */}
        <div className="px-8 mt-6">
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
              addingTaskTo={addingTaskTo}
              setAddingTaskTo={setAddingTaskTo}
              newTaskTitle={newTaskTitle}
              setNewTaskTitle={setNewTaskTitle}
              onHandleCreateTask={() => handleCreateTask(sprint.id)}
              onTaskClick={(id) => setSelectedTaskId(id)}
            />
          ))}

          {/* Divider */}
          <ScrollDownIndicator />

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

            <Droppable droppableId="BACKLOG">
              {(provided) => (
                <div className="flex flex-col min-h-[50px]" ref={provided.innerRef} {...provided.droppableProps}>
                  {backlogTasks.length > 0 ? (
                    backlogTasks.map((task, index) => <BacklogTaskRow key={task.id} task={task} index={index} onTaskClick={(id) => setSelectedTaskId(id)} />)
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 text-sm bg-gray-50/30">
                      Your backlog is empty.
                    </div>
                  )}
                  {provided.placeholder}
                  
                  {addingTaskTo === "BACKLOG" ? (
                    <div className="px-4 py-2 border border-t-0 border-gray-200 bg-white rounded-b">
                      <Input
                        autoFocus
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateTask("BACKLOG");
                          if (e.key === "Escape") setAddingTaskTo(null);
                        }}
                        onBlur={() => handleCreateTask("BACKLOG")}
                        className="h-8 text-sm"
                        placeholder="What needs to be done?"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setAddingTaskTo("BACKLOG")}
                      className={`flex items-center px-4 py-2 border border-gray-200 bg-white rounded-b hover:bg-gray-50 cursor-pointer text-gray-500 text-sm font-medium transition-colors ${backlogTasks.length === 0 ? "border-t-0 mt-1" : ""}`}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Create task
                    </div>
                  )}
                </div>
              )}
            </Droppable>
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
      </DragDropContext>

      {/* Create Sprint Dialog */}
      <CreateSprintDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        projectId={projectId}
        nextSprintNumber={sprints.length + 1}
      />

      {/* Task Detail Panel */}
      <TaskDetailPanel
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onNavigateToTask={(id) => setSelectedTaskId(id)}
      />
    </div>
  );
}
