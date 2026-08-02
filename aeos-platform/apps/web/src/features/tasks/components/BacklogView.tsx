"use client";

import React, { useState } from "react";
import { Search, Filter, BarChart2, Settings, MoreHorizontal, ChevronDown, CheckSquare, Bug, Bookmark, Plus, GitMerge, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Task } from "../types";

const TypeIcon = ({ type }: { type?: string }) => {
  if (type === "BUG") return <Bug className="w-4 h-4 text-red-500 shrink-0" />;
  if (type === "STORY") return <Bookmark className="w-4 h-4 text-emerald-500 shrink-0" />;
  return <CheckSquare className="w-4 h-4 text-blue-500 shrink-0" />;
};

interface BacklogViewProps {
  initialTasks: Record<string, Task[]>;
}

export function BacklogView({ initialTasks }: BacklogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Flatten all tasks
  const allTasks = Object.values(initialTasks).flat();
  
  // Group tasks by sprint
  const sprint0Tasks = allTasks.filter(t => t.sprintId === "sprint-1");
  const backlogTasks = allTasks.filter(t => !t.sprintId);

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
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex -space-x-1">
            <Avatar className="w-8 h-8 border-2 border-white cursor-pointer"><AvatarImage src="https://i.pravatar.cc/150?u=1" /><AvatarFallback className="bg-gray-200 text-gray-600 text-xs font-medium">LT</AvatarFallback></Avatar>
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
        {/* Active Sprint */}
        <div className="mb-8">
          <div className="flex items-center justify-between bg-gray-50/80 px-4 py-2 rounded-t border border-gray-200">
            <div className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-gray-600 cursor-pointer" />
              <span className="font-semibold text-gray-900 text-sm">SCRUM Sprint 1</span>
              <span className="text-gray-500 text-sm ml-2">2 Aug - 16 Aug ({sprint0Tasks.length} work items)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">0</span>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">0</span>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">0</span>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs bg-gray-50">Complete sprint</Button>
              <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
          </div>
          
          <div className="flex flex-col">
            {sprint0Tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between px-4 py-2 border border-t-0 border-gray-200 bg-white hover:bg-gray-50 group transition-colors">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 accent-blue-600" defaultChecked />
                  <TypeIcon type={task.type} />
                  <span className="text-gray-500 text-sm hover:underline cursor-pointer">{task.id}</span>
                  <span className="text-gray-900 text-sm font-medium hover:underline cursor-pointer">{task.title}</span>
                </div>
                <div className="flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  <GitMerge className="w-4 h-4 text-gray-400" />
                  <div className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded cursor-pointer flex items-center gap-1">
                    To Do <ChevronDown className="w-3 h-3" />
                  </div>
                  <div className="flex items-center text-gray-500 text-xs gap-1 w-20">
                    <CalendarIcon className="w-3.5 h-3.5" /> Aug 12
                  </div>
                  <div className="w-6 text-center text-gray-500 font-semibold text-sm bg-gray-100 rounded-full px-1">{task.storyPoints || "-"}</div>
                  <Avatar className="w-6 h-6"><AvatarFallback>{task.assigneeId ? task.assigneeId.substring(0, 2).toUpperCase() : "??"}</AvatarFallback></Avatar>
                </div>
              </div>
            ))}
            <div className="flex items-center px-4 py-2 border border-t-0 border-gray-200 bg-white rounded-b hover:bg-gray-50 cursor-pointer text-gray-500 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4 mr-2" /> Create
            </div>
          </div>
        </div>

        {/* Future Sprint Placeholder */}
        <div className="mb-8">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-gray-600 cursor-pointer" />
              <span className="font-semibold text-gray-900 text-sm">SCRUM Sprint 2</span>
              <span className="text-gray-500 text-sm ml-2 cursor-pointer hover:underline flex items-center gap-1">Add dates</span>
              <span className="text-gray-500 text-sm ml-2">(0 work items)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 opacity-50">
                <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">0</span>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">0</span>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">0</span>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs bg-gray-50 text-gray-400" disabled>Start sprint</Button>
              <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
          </div>
          
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 text-sm bg-gray-50/30">
            Plan a sprint by dragging work items into it, or by dragging the sprint footer.
          </div>
          <div className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-50 cursor-pointer text-sm font-medium rounded transition-colors mt-1">
            <Plus className="w-4 h-4 mr-2" /> Create
          </div>
        </div>

        {/* Divider */}
        <div className="flex justify-center my-6">
          <div className="w-6 h-6 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-400 shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
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
                <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">0</span>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">0</span>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">0</span>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs bg-gray-50 flex items-center gap-1"><GitMerge className="w-3.5 h-3.5" /> Create sprint</Button>
            </div>
          </div>
          
          <div className="flex flex-col">
            {backlogTasks.length > 0 ? backlogTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between px-4 py-2 border-t border-x first:border-t border-gray-200 bg-white hover:bg-gray-50 group transition-colors">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 accent-blue-600" />
                  <TypeIcon type={task.type} />
                  <span className="text-gray-500 text-sm hover:underline cursor-pointer">{task.id}</span>
                  <span className="text-gray-900 text-sm font-medium hover:underline cursor-pointer">{task.title}</span>
                </div>
                <div className="flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  <GitMerge className="w-4 h-4 text-gray-400" />
                  <div className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded cursor-pointer flex items-center gap-1">
                    To Do <ChevronDown className="w-3 h-3" />
                  </div>
                  <div className="w-6 text-center text-gray-500 font-semibold text-sm bg-gray-100 rounded-full px-1">{task.storyPoints || "-"}</div>
                  <Avatar className="w-6 h-6"><AvatarFallback>{task.assigneeId ? task.assigneeId.substring(0, 2).toUpperCase() : "??"}</AvatarFallback></Avatar>
                </div>
              </div>
            )) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 text-sm bg-gray-50/30">
                Your backlog is empty.
              </div>
            )}
            <div className={`flex items-center px-4 py-2 border border-gray-200 bg-white rounded-b hover:bg-gray-50 cursor-pointer text-gray-500 text-sm font-medium transition-colors ${backlogTasks.length === 0 ? 'border-t-0 mt-1' : ''}`}>
              <Plus className="w-4 h-4 mr-2" /> Create
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
