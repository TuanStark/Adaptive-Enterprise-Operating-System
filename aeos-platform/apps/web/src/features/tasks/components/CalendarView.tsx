"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Settings, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "../types";

interface CalendarViewProps {
  initialTasks: Record<string, Task[]>;
}

export function CalendarView({ initialTasks }: CalendarViewProps) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const allTasks = Object.values(initialTasks).flat();

  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  // Build grid cells
  const cells: { day: number; isCurrentMonth: boolean }[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push({ day: daysInPrevMonth - firstDayOfMonth + 1 + i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, isCurrentMonth: false });
  }

  // Group tasks by day (only tasks with dueDate in the current month)
  const tasksByDay: Record<number, Task[]> = {};
  for (const task of allTasks) {
    if (!task.dueDate) continue;
    const d = new Date(task.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(task);
    }
  }

  const TYPE_COLORS: Record<string, string> = {
    BUG: "bg-red-100 text-red-700 border-red-200",
    STORY: "bg-emerald-100 text-emerald-700 border-emerald-200",
    EPIC: "bg-purple-100 text-purple-700 border-purple-200",
    TASK: "bg-blue-100 text-blue-700 border-blue-200",
    SUBTASK: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}><ChevronLeft className="w-4 h-4" /></Button>
             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}><ChevronRight className="w-4 h-4" /></Button>
             <Button variant="outline" size="sm" className="h-8 font-semibold text-gray-700 ml-1" onClick={() => setCurrentDate(new Date())}>Today</Button>
          </div>
          <h2 className="text-xl font-bold text-gray-900 min-w-[140px]">{monthName} {year}</h2>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <Button variant="outline" size="sm" className="h-8 text-gray-700 bg-gray-50/50">
            <Filter className="w-3.5 h-3.5 mr-2" /> Filter
          </Button>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 bg-gray-50 overflow-hidden">
         {/* Days Header */}
         <div className="grid grid-cols-7 border border-gray-200 bg-white rounded-t-lg shrink-0">
            {daysOfWeek.map((day, idx) => (
               <div key={day} className={`py-2 text-center text-xs font-semibold uppercase text-gray-500 ${idx !== 6 ? 'border-r border-gray-200' : ''}`}>
                 {day}
               </div>
            ))}
         </div>
         
         {/* Calendar Grid */}
         <div className="grid grid-cols-7 flex-1 border-x border-b border-gray-200 bg-white rounded-b-lg overflow-hidden">
            {cells.map((cell, i) => (
               <div key={i} className={`border-t border-gray-100 p-1 flex flex-col ${i % 7 !== 6 ? 'border-r' : ''} ${!cell.isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'}`}>
                  <div className="flex justify-end p-1 mb-1">
                     <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${cell.isCurrentMonth && isToday(cell.day) ? 'bg-blue-600 text-white' : (cell.isCurrentMonth ? 'text-gray-700' : 'text-gray-400')}`}>
                       {cell.day}
                     </span>
                  </div>
                  {/* Task events */}
                  <div className="flex flex-col gap-1 overflow-hidden">
                     {cell.isCurrentMonth && tasksByDay[cell.day]?.slice(0, 2).map((task) => (
                       <div key={task.id} className={`text-[10px] font-semibold px-2 py-0.5 rounded border truncate cursor-pointer hover:brightness-95 ${TYPE_COLORS[task.type] ?? TYPE_COLORS.TASK}`}>
                         {task.key}: {task.title}
                       </div>
                     ))}
                     {cell.isCurrentMonth && (tasksByDay[cell.day]?.length ?? 0) > 2 && (
                       <span className="text-[10px] text-gray-500 px-2">+{(tasksByDay[cell.day]?.length ?? 0) - 2} more</span>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
