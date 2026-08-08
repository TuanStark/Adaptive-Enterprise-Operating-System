"use client";

import React, { useState } from "react";
import { CheckSquare, AlertCircle, Clock, CheckCircle2, Bug, Bookmark, LayoutList } from "lucide-react";
import { Task } from "../types";
import { useTasks } from "../hooks/useTasks";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MOCK_USERS = [
  { id: "00000000-0000-0000-0000-000000000001", name: "Tony Stark", initials: "TS" },
  { id: "00000000-0000-0000-0000-000000000002", name: "Bruce Wayne", initials: "BW" },
  { id: "unassigned", name: "Unassigned", initials: "??" },
];

interface SummaryViewProps {
  initialTasks: Record<string, Task[]>;
  projectId: string;
}

export function SummaryView({ initialTasks, projectId }: SummaryViewProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const { data } = useTasks({ projectId });
  const allTasks = data?.data ?? Object.values(initialTasks).flat();
  const total = allTasks.length;

  const statusCounts = {
    todo: allTasks.filter((t) => t.status === "TODO" || t.status === "BACKLOG").length,
    inProgress: allTasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "REVIEW" || t.status === "BLOCKED").length,
    done: allTasks.filter((t) => t.status === "DONE").length,
  };

  const priorityCounts = {
    urgent: allTasks.filter((t) => t.priority === "URGENT").length,
    high: allTasks.filter((t) => t.priority === "HIGH").length,
    medium: allTasks.filter((t) => t.priority === "MEDIUM" || !t.priority).length,
    low: allTasks.filter((t) => t.priority === "LOW").length,
  };

  const typeCounts = {
    bug: allTasks.filter((t) => t.type === "BUG").length,
    story: allTasks.filter((t) => t.type === "STORY").length,
    task: allTasks.filter((t) => t.type === "TASK" || !t.type).length,
  };

  const workloadMap = allTasks.reduce((acc, t) => {
    const key = t.assigneeId || "unassigned";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedWorkload = Object.entries(workloadMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const pct = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);
  const priPct = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

  const recentTasks = [...allTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const doneTasks = allTasks.filter((t) => t.status === "DONE");

  const conicGradient = total > 0
    ? `conic-gradient(#3b82f6 0% ${pct(statusCounts.inProgress)}%, #22c55e ${pct(statusCounts.inProgress)}% ${pct(statusCounts.inProgress) + pct(statusCounts.done)}%, #f3f4f6 ${pct(statusCounts.inProgress) + pct(statusCounts.done)}% 100%)`
    : "conic-gradient(#f3f4f6 0% 100%)";

  return (
    <div className="h-full w-full bg-white overflow-y-auto p-8 relative">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Summary</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Workload by Assignee</h3>
              <div className="flex flex-col gap-4 flex-1">
                {sortedWorkload.length > 0 ? sortedWorkload.map(([userId, count]) => {
                  const user = MOCK_USERS.find(u => u.id === userId) || { name: "Unknown", initials: "??" };
                  return (
                    <div key={userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-gray-200">
                          <AvatarFallback className="text-[10px] bg-gray-50">{user.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
                      </div>
                      <div className="flex items-center gap-2 w-1/3">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 w-4 text-right">{count}</span>
                      </div>
                    </div>
                  )
                }) : (
                  <p className="text-sm text-gray-400 py-4">No workload data.</p>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Types of Work</h3>
              <div className="flex flex-col justify-center gap-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-700"><CheckSquare className="w-4 h-4 text-blue-500" /> Tasks</span>
                  <div className="flex items-center gap-2 w-1/2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${pct(typeCounts.task)}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 w-8 text-right">{pct(typeCounts.task)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-700"><Bookmark className="w-4 h-4 text-emerald-500" /> Stories</span>
                  <div className="flex items-center gap-2 w-1/2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct(typeCounts.story)}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 w-8 text-right">{pct(typeCounts.story)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-700"><Bug className="w-4 h-4 text-red-500" /> Bugs</span>
                  <div className="flex items-center gap-2 w-1/2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: `${pct(typeCounts.bug)}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 w-8 text-right">{pct(typeCounts.bug)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><LayoutList className="w-4 h-4" /> Recently created</h3>
            <div className="flex flex-col gap-2">
              {recentTasks.length > 0 ? recentTasks.map((t) => (
                <div key={t.id} onClick={() => setSelectedTaskId(t.id)} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                  {t.type === "BUG" ? <Bug className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> : t.type === "STORY" ? <Bookmark className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> : <CheckSquare className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{t.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 font-medium">{t.key}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">{t.status.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-sm">No tasks created yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Completed tasks</h3>
            {doneTasks.length > 0 ? (
              <div className="flex flex-col gap-2">
                {doneTasks.slice(0, 5).map((t) => (
                  <div key={t.id} onClick={() => setSelectedTaskId(t.id)} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-through truncate opacity-70">{t.title}</p>
                      <p className="text-xs text-gray-400 font-medium">{t.key}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <CheckCircle2 className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm">No completed tasks yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-6">Status overview</h3>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center shrink-0 shadow-inner" style={{ background: conicGradient }}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-gray-900 leading-none">{total}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Tasks</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" /> In Progress</span>
                  <span className="font-semibold text-gray-700">{pct(statusCounts.inProgress)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 shadow-sm" /> Done</span>
                  <span className="font-semibold text-gray-700">{pct(statusCounts.done)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-200 shadow-inner border border-gray-300" /> To Do</span>
                  <span className="font-semibold text-gray-700">{pct(statusCounts.todo)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-6">Priority breakdown</h3>
            <div className="flex flex-col gap-4">
               <div className="group">
                 <div className="flex items-center justify-between text-sm mb-1.5">
                   <span className="flex items-center gap-1.5 text-red-500 font-medium"><AlertCircle className="w-3.5 h-3.5" /> Urgent</span>
                   <span className="text-xs font-semibold text-gray-500">{priorityCounts.urgent}</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                   <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{width: `${priPct(priorityCounts.urgent)}%`}}></div>
                 </div>
               </div>
               
               <div className="group">
                 <div className="flex items-center justify-between text-sm mb-1.5">
                   <span className="flex items-center gap-1.5 text-orange-500 font-medium"><Clock className="w-3.5 h-3.5" /> High</span>
                   <span className="text-xs font-semibold text-gray-500">{priorityCounts.high}</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                   <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{width: `${priPct(priorityCounts.high)}%`}}></div>
                 </div>
               </div>

               <div className="group">
                 <div className="flex items-center justify-between text-sm mb-1.5">
                   <span className="flex items-center gap-1.5 text-blue-500 font-medium"><Clock className="w-3.5 h-3.5" /> Medium</span>
                   <span className="text-xs font-semibold text-gray-500">{priorityCounts.medium}</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                   <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{width: `${priPct(priorityCounts.medium)}%`}}></div>
                 </div>
               </div>

               <div className="group">
                 <div className="flex items-center justify-between text-sm mb-1.5">
                   <span className="flex items-center gap-1.5 text-green-600 font-medium"><Clock className="w-3.5 h-3.5" /> Low</span>
                   <span className="text-xs font-semibold text-gray-500">{priorityCounts.low}</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                   <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{width: `${priPct(priorityCounts.low)}%`}}></div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <TaskDetailPanel
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onNavigateToTask={(id) => setSelectedTaskId(id)}
      />
    </div>
  );
}
