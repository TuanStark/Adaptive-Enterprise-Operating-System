"use client";

import React from "react";
import { CheckSquare, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export function SummaryView() {
  return (
    <div className="h-full w-full bg-white overflow-y-auto p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (Activities) */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Done in the last 7 days</h3>
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <CheckCircle2 className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm">No work items were completed in the last 7 days.</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Updated recently</h3>
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer">
                  <CheckSquare className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 hover:underline">Design System Update {i}</p>
                    <p className="text-xs text-gray-500">Updated {i} hour(s) ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Insights) */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Status overview</h3>
            <div className="flex items-center gap-4">
              {/* Mock Donut Chart using CSS */}
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center shrink-0" 
                style={{ background: 'conic-gradient(#3b82f6 0% 30%, #22c55e 30% 50%, #f3f4f6 50% 100%)' }}
              >
                <div className="w-16 h-16 bg-white rounded-full"></div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> In Progress</span>
                  <span className="font-semibold">30%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Done</span>
                  <span className="font-semibold">20%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-200" /> To Do</span>
                  <span className="font-semibold">50%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Priority breakdown</h3>
            <div className="flex flex-col gap-3">
               <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-red-500"><AlertCircle className="w-4 h-4" /> Urgent</span>
                  <span className="font-semibold">1</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{width: '20%'}}></div></div>
               
               <div className="flex items-center justify-between text-sm mt-2">
                  <span className="flex items-center gap-2 text-orange-500"><Clock className="w-4 h-4" /> High</span>
                  <span className="font-semibold">2</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full" style={{width: '40%'}}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
