"use client";

import React from "react";
import { CheckSquare, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Task } from "../types";

interface SummaryViewProps {
  initialTasks: Record<string, Task[]>;
}

export function SummaryView({ initialTasks }: SummaryViewProps) {
  const allTasks = Object.values(initialTasks).flat();
  const total = allTasks.length;

  const statusCounts = {
    todo: allTasks.filter((t) => t.status === "TODO" || t.status === "BACKLOG").length,
    inProgress: allTasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "REVIEW" || t.status === "BLOCKED").length,
    done: allTasks.filter((t) => t.status === "DONE").length,
  };

  const priorityCounts = {
    urgent: allTasks.filter((t) => t.priority === "URGENT").length,
    high: allTasks.filter((t) => t.priority === "HIGH").length,
    medium: allTasks.filter((t) => t.priority === "MEDIUM").length,
    low: allTasks.filter((t) => t.priority === "LOW").length,
  };

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
    <div className="h-full w-full bg-white overflow-y-auto p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Completed tasks</h3>
            {doneTasks.length > 0 ? (
              <div className="flex flex-col gap-3">
                {doneTasks.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-through">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.key}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm">No completed tasks yet.</p>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Recently created</h3>
            <div className="flex flex-col gap-3">
              {recentTasks.length > 0 ? recentTasks.map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer">
                  <CheckSquare className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 hover:underline">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.key} · {t.status.replace(/_/g, " ")}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-4">No tasks created yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Status overview</h3>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center shrink-0" style={{ background: conicGradient }}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">{total}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> In Progress</span>
                  <span className="font-semibold">{pct(statusCounts.inProgress)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Done</span>
                  <span className="font-semibold">{pct(statusCounts.done)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-200" /> To Do</span>
                  <span className="font-semibold">{pct(statusCounts.todo)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Priority breakdown</h3>
            <div className="flex flex-col gap-3">
               <div className="flex items-center justify-between text-sm">
                 <span className="flex items-center gap-2 text-red-500"><AlertCircle className="w-4 h-4" /> Urgent</span>
                 <span className="font-semibold">{priorityCounts.urgent}</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{width: `${priPct(priorityCounts.urgent)}%`}}></div></div>
               
               <div className="flex items-center justify-between text-sm mt-2">
                 <span className="flex items-center gap-2 text-orange-500"><Clock className="w-4 h-4" /> High</span>
                 <span className="font-semibold">{priorityCounts.high}</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full" style={{width: `${priPct(priorityCounts.high)}%`}}></div></div>

               <div className="flex items-center justify-between text-sm mt-2">
                 <span className="flex items-center gap-2 text-blue-500"><Clock className="w-4 h-4" /> Medium</span>
                 <span className="font-semibold">{priorityCounts.medium}</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: `${priPct(priorityCounts.medium)}%`}}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
