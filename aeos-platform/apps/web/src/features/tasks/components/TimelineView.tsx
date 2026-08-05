"use client";

import React from "react";
import { ChevronDown, Plus, Maximize2, Filter, Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "../types";

interface TimelineViewProps {
  initialTasks: Record<string, Task[]>;
}

export function TimelineView({ initialTasks }: TimelineViewProps) {
  const allTasks = Object.values(initialTasks).flat();

  // Filter tasks that have dueDate (for rendering on timeline) — prioritize EPICs
  const timelineTasks = allTasks
    .filter((t) => t.dueDate || t.type === "EPIC")
    .slice(0, 10);

  const now = new Date();
  const months = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return d.toLocaleString("default", { month: "long" });
  });

  const TYPE_COLORS: Record<string, string> = {
    EPIC: "bg-purple-500",
    STORY: "bg-emerald-500",
    BUG: "bg-red-500",
    TASK: "bg-blue-500",
    SUBTASK: "bg-gray-400",
  };

  // Simple position calculation: map dueDate to pixel offset
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 4, 0);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalWidth = 640;

  const getPosition = (task: Task) => {
    const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);
    const dayOffset = Math.max(0, Math.ceil((taskDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const left = Math.min((dayOffset / totalDays) * totalWidth, totalWidth - 100);
    return { left, width: 120 };
  };

  const todayOffset = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const todayLeft = (todayOffset / totalDays) * totalWidth;

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded px-2 h-8">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input placeholder="Search" className="outline-none text-sm w-32 bg-transparent" />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-gray-700 bg-gray-50/50">
            <Filter className="w-3.5 h-3.5 mr-2" /> Filter
          </Button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <div className="text-sm text-gray-600 font-medium cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">Today</div>
          <div className="flex bg-gray-100 p-0.5 rounded text-xs font-medium text-gray-600">
             <div className="px-3 py-1 cursor-pointer hover:bg-white rounded shadow-sm">Weeks</div>
             <div className="px-3 py-1 bg-white rounded shadow-sm">Months</div>
             <div className="px-3 py-1 cursor-pointer hover:bg-white rounded shadow-sm">Quarters</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Maximize2 className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel (List) */}
        <div className="w-[300px] border-r border-gray-200 flex flex-col shrink-0">
          <div className="h-12 border-b border-gray-200 px-4 flex items-center bg-gray-50/50">
            <span className="text-sm font-semibold text-gray-700">Task / Epic</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {timelineTasks.length > 0 ? timelineTasks.map(task => (
              <div key={task.id} className="h-12 border-b border-gray-100 flex items-center px-4 hover:bg-gray-50 cursor-pointer group">
                <ChevronDown className="w-4 h-4 text-gray-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`w-4 h-4 rounded flex items-center justify-center mr-2 shrink-0 ${TYPE_COLORS[task.type] ?? TYPE_COLORS.TASK}`}>
                   <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
                <span className="text-sm text-gray-900 truncate font-medium">{task.title}</span>
              </div>
            )) : (
              <div className="p-4 text-center text-sm text-gray-400">No tasks with dates.</div>
            )}
            <div className="h-12 flex items-center px-4 hover:bg-gray-50 cursor-pointer text-gray-500 font-medium text-sm transition-colors">
              <Plus className="w-4 h-4 mr-2" /> Create task
            </div>
          </div>
        </div>

        {/* Right Panel (Gantt) */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIvPjwvZz48L3N2Zz4=')] relative">
           {/* Header Timeline */}
           <div className="h-12 border-b border-gray-200 flex bg-white/90 sticky top-0 z-10">
              {months.map(m => (
                 <div key={m} className="w-[160px] shrink-0 border-l border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {m}
                 </div>
              ))}
           </div>
           
           {/* Timeline Bars Area */}
           <div className={`relative pt-2`} style={{ width: `${totalWidth}px` }}>
              {timelineTasks.map((task) => {
                const pos = getPosition(task);
                return (
                  <div key={task.id} className="h-12 relative flex items-center group">
                    <div 
                      className={`absolute h-6 rounded-full shadow-sm flex items-center px-3 text-xs text-white font-medium cursor-pointer hover:brightness-110 transition-all ${TYPE_COLORS[task.type] ?? TYPE_COLORS.TASK}`}
                      style={{ left: `${pos.left}px`, width: `${pos.width}px` }}
                    >
                      <span className="truncate">{task.title}</span>
                    </div>
                  </div>
                );
              })}
           </div>
           
           {/* Today Marker */}
           <div className="absolute top-0 bottom-0 border-l-2 border-red-400 z-0" style={{ left: `${todayLeft}px` }}>
             <div className="absolute top-0 -left-[19px] bg-red-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-b-md shadow-sm">TODAY</div>
           </div>
        </div>
      </div>
    </div>
  );
}
