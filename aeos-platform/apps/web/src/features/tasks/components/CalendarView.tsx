"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Filter, Settings, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CalendarView() {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Create a 5-week month grid mock
  const days = Array.from({ length: 35 }, (_, i) => i - 2); 
  
  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
             <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
             <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
             <Button variant="outline" size="sm" className="h-8 font-semibold text-gray-700 ml-1">Today</Button>
          </div>
          <h2 className="text-xl font-bold text-gray-900 min-w-[140px]">August 2026</h2>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <Button variant="outline" size="sm" className="h-8 text-gray-700 bg-gray-50/50">
            <Filter className="w-3.5 h-3.5 mr-2" /> Filter
          </Button>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <div className="flex bg-gray-100 p-0.5 rounded text-xs font-medium text-gray-600 mr-2">
             <div className="px-3 py-1 bg-white rounded shadow-sm">Month</div>
             <div className="px-3 py-1 cursor-pointer hover:bg-white rounded shadow-sm">Week</div>
          </div>
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
            {days.map((day, i) => {
               const isCurrentMonth = day > 0 && day <= 31;
               const isToday = day === 12; // Just a mock today
               return (
                 <div key={i} className={`border-t border-gray-100 p-1 flex flex-col ${i % 7 !== 6 ? 'border-r' : ''} ${!isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'}`}>
                    <div className="flex justify-end p-1 mb-1">
                       <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : (isCurrentMonth ? 'text-gray-700' : 'text-gray-400')}`}>
                         {isCurrentMonth ? day : (day <= 0 ? 31 + day : day - 31)}
                       </span>
                    </div>
                    {/* Mock Events */}
                    <div className="flex flex-col gap-1 overflow-hidden">
                       {day === 4 && <div className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200 truncate cursor-pointer hover:bg-blue-200">AEOS-14: Docs</div>}
                       {day === 12 && <div className="bg-red-100 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-red-200 truncate cursor-pointer hover:bg-red-200">AEOS-12: Bug fix</div>}
                       {day === 15 && <div className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200 truncate cursor-pointer hover:bg-emerald-200">AEOS-1: Design</div>}
                    </div>
                 </div>
               )
            })}
         </div>
      </div>
    </div>
  );
}
