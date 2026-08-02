"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Documents</h1>
          <p className="text-gray-500">Wiki and project documentation.</p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-primary/90">Create Document</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow border-0 shadow-sm cursor-pointer">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500 mb-2">
                <FileText className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base font-medium text-gray-800 mb-1">Architecture Guide {i}</CardTitle>
              <p className="text-xs text-gray-500 line-clamp-2">Detailed technical specifications for the AEOS platform deployment.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
