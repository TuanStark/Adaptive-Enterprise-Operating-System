"use client";

import React from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DocsView() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-10 flex flex-col items-center text-center shadow-sm">
         <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
         </div>
         <h2 className="text-xl font-semibold text-gray-900 mb-3">Project Pages</h2>
         <p className="text-sm text-gray-500 mb-8">
           Connect to Confluence to organize your team's work, create product requirements, and document your architecture in one place.
         </p>
         <div className="flex flex-col gap-3 w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Connect to Confluence</Button>
            <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"><Plus className="w-4 h-4 mr-2" /> Create blank page</Button>
         </div>
      </div>
    </div>
  );
}
