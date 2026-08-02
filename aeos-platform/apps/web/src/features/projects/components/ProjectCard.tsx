import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder } from "lucide-react";
import { Project } from "../types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow border-0 shadow-sm cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-gray-800">{project.name}</CardTitle>
        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
          <Folder className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">{project.description}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{project.status.charAt(0) + project.status.slice(1).toLowerCase()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
