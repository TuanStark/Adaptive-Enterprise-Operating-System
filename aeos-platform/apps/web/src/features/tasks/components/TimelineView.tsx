"use client";

import React from "react";
import { ChevronDown, Plus, Maximize2, Filter, Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TimelineView() {
  const months = ["August", "September", "October", "November"];
  const epics = [
    { id: "AEOS-100", title: "Authentication Flow Rewrite", start: 2, length: 15, color: "bg-purple-500" },
    { id: "AEOS-102", title: "Dashboard Redesign UI", start: 10, length: 20, color: "bg-blue-500" },
    { id: "AEOS-105", title: "Migrate to Next.js App Router", start: 25, length: 30, color: "bg-emerald-500" },
  ];

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
            <span className="text-sm font-semibold text-gray-700">Epic / Task</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {epics.map(epic => (
              <div key={epic.id} className="h-12 border-b border-gray-100 flex items-center px-4 hover:bg-gray-50 cursor-pointer group">
                <ChevronDown className="w-4 h-4 text-gray-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-4 h-4 rounded bg-purple-500 flex items-center justify-center mr-2 shrink-0">
                   <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
                <span className="text-sm text-gray-900 truncate font-medium">{epic.title}</span>
              </div>
            ))}
            <div className="h-12 flex items-center px-4 hover:bg-gray-50 cursor-pointer text-gray-500 font-medium text-sm transition-colors">
              <Plus className="w-4 h-4 mr-2" /> Create epic
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
           <div className="relative w-[640px] pt-2">
              {epics.map((epic, idx) => (
                 <div key={epic.id} className="h-12 relative flex items-center group">
                    <div 
                      className={`absolute h-6 rounded-full shadow-sm flex items-center px-3 text-xs text-white font-medium cursor-pointer hover:brightness-110 transition-all ${epic.color}`}
                      style={{ left: `${epic.start * 10}px`, width: `${epic.length * 10}px` }}
                    >
                      <span className="truncate">{epic.title}</span>
                    </div>
                 </div>
              ))}
           </div>
           
           {/* Today Marker */}
           <div className="absolute top-0 bottom-0 left-[240px] border-l-2 border-red-400 z-0">
             <div className="absolute top-0 -left-[19px] bg-red-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-b-md shadow-sm">TODAY</div>
           </div>
        </div>
      </div>
    </div>
  );
}
