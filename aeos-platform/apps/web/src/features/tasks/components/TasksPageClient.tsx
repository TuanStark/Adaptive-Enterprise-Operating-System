"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { KanbanBoard } from "./KanbanBoard";
import { Task } from "../types";

interface TasksPageClientProps {
  initialTasks: Record<string, Task[]>;
}

export function TasksPageClient({ initialTasks }: TasksPageClientProps) {
  const [view, setView] = useState<"board" | "list">("board");

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <span>Projects</span><span className="mx-2">/</span><span>AEOS-CORE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Active Sprint</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-9">Complete Sprint</Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex bg-gray-100/80 p-1 rounded-lg">
          <div onClick={() => setView("board")} className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer transition-colors ${view === "board" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}>Board</div>
          <div onClick={() => setView("list")} className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer transition-colors ${view === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}>List</div>
        </div>
      </div>

      <KanbanBoard initialTasks={initialTasks} view={view} />
    </div>
  );
}
