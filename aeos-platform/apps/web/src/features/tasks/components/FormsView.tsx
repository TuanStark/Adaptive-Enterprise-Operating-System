"use client";

import React from "react";
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FormsView() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-10 flex flex-col items-center text-center shadow-sm">
         <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
            <ClipboardList className="w-10 h-10 text-purple-600" />
         </div>
         <h2 className="text-xl font-semibold text-gray-900 mb-3">Capture work with Forms</h2>
         <p className="text-sm text-gray-500 mb-8">
           Create forms to collect requests, bug reports, or any other structured data directly into your Jira project backlog.
         </p>
         <Button className="w-full bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Create form</Button>
      </div>
    </div>
  );
}
