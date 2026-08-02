"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Projects</h1>
          <p className="text-gray-500">Manage your workspace projects.</p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-primary/90">New Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow border-0 shadow-sm cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium text-gray-800">Project Alpha {i}</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                <Folder className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">A revolutionary new product for enterprise.</p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>Updated 2 days ago</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Active</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
