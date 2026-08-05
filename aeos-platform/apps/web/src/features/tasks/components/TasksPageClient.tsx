"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Share2, Zap, LayoutTemplate, Maximize2, MoreHorizontal, Users, Plus } from "lucide-react";
import { KanbanBoard } from "./KanbanBoard";

import { Task } from "../types";
import type { Project } from "@/features/projects/types";
import { BacklogView } from "./BacklogView";
import { SummaryView } from "./SummaryView";
import { TimelineView } from "./TimelineView";
import { CalendarView } from "./CalendarView";
import { DocsView } from "./DocsView";
import { FormsView } from "./FormsView";

interface TasksPageClientProps {
  initialTasks: Record<string, Task[]>;
  projects: Project[];
  initialProjectId: string | null;
}

export function TasksPageClient({ initialTasks, projects, initialProjectId }: TasksPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "board";

  const [currentProjectId, setCurrentProjectId] = useState(initialProjectId);
  const currentProject = projects.find(p => p.id === currentProjectId);
  const currentProjectName = currentProject?.name ?? "No Project";

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Jira-style Header */}
      <div className="flex flex-col border-b border-gray-200 px-6 pt-4 shrink-0">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span>Projects</span><span className="mx-2">/</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="flex items-center gap-1 hover:bg-gray-100 px-1 rounded transition-colors focus:outline-none">{currentProjectName} <ChevronDown className="w-3 h-3" /></button>} />
            <DropdownMenuContent align="start">
              {projects.map(p => (
                <DropdownMenuItem key={p.id} onClick={() => {
                  setCurrentProjectId(p.id);
                  router.refresh();
                }}>{p.name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded text-blue-600 flex items-center justify-center font-bold text-lg">
              M
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">My Team</h1>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 bg-gray-100"><Users className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-gray-100"><MoreHorizontal className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300 text-gray-600"><Share2 className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300 text-gray-600"><Zap className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300 text-gray-600"><LayoutTemplate className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300 text-gray-600"><Maximize2 className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {['Summary', 'Backlog', 'Board', 'Calendar', 'Timeline', 'Docs', 'Forms'].map(tab => {
            const isTabActive = currentView === tab.toLowerCase() || (tab === 'Board' && currentView === 'sprint');
            return (
              <div
                key={tab}
                onClick={() => {
                  router.push(`/tasks?view=${tab.toLowerCase()}`);
                }}
                className={`pb-3 text-sm font-medium cursor-pointer border-b-2 transition-colors ${isTabActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
              >
                {tab}
              </div>
            );
          })}
          <Button variant="ghost" size="icon" className="h-6 w-6 -mt-3 text-gray-500"><Plus className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'backlog' && <BacklogView initialTasks={initialTasks} />}
        {currentView === 'summary' && <SummaryView />}
        {currentView === 'timeline' && <TimelineView />}
        {currentView === 'calendar' && <CalendarView />}
        {currentView === 'docs' && <DocsView />}
        {currentView === 'forms' && <FormsView />}
        {(currentView === 'board' || currentView === 'sprint') && (
          <div className="h-full p-6">
            <KanbanBoard initialTasks={initialTasks} view="board" />
          </div>
        )}
      </div>
    </div>
  );
}
