"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Task = {
  id: string;
  title: string;
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignee: { name: string; avatar?: string };
};

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: "Task Title",
    cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusColor = (s: string) => {
        switch (s) {
          case "DONE": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
          case "IN_PROGRESS": return "bg-blue-100 text-blue-700 hover:bg-blue-200";
          case "IN_REVIEW": return "bg-purple-100 text-purple-700 hover:bg-purple-200";
          default: return "bg-gray-100 text-gray-700 hover:bg-gray-200";
        }
      };
      return <Badge variant="secondary" className={`rounded-md font-medium ${getStatusColor(status)}`}>{status.replace('_', ' ')}</Badge>;
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-gray-100"
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const p = row.getValue("priority") as string;
      const getColor = (p: string) => {
        if (p === 'URGENT') return 'text-red-600 bg-red-50';
        if (p === 'HIGH') return 'text-orange-600 bg-orange-50';
        if (p === 'MEDIUM') return 'text-blue-600 bg-blue-50';
        return 'text-gray-600 bg-gray-50';
      }
      return <Badge variant="outline" className={`border-0 ${getColor(p)}`}>{p}</Badge>;
    },
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ row }) => {
      const assignee = row.original.assignee;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={assignee.avatar} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{assignee.name}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 outline-none">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] rounded-xl">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(task.id)}>
                Copy Task ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Assign to me</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

const mockData: Task[] = [
  { id: "1", title: "Design System Architecture", status: "DONE", priority: "URGENT", assignee: { name: "Tony Stark", avatar: "https://github.com/shadcn.png" } },
  { id: "2", title: "Implement CQRS Pattern", status: "IN_PROGRESS", priority: "HIGH", assignee: { name: "Peter Parker" } },
  { id: "3", title: "Setup Next.js Frontend", status: "IN_REVIEW", priority: "HIGH", assignee: { name: "Bruce Banner" } },
  { id: "4", title: "Write Documentation", status: "TODO", priority: "MEDIUM", assignee: { name: "Natasha Romanoff" } },
  { id: "5", title: "Docker Containerization", status: "BACKLOG", priority: "LOW", assignee: { name: "Clint Barton" } },
  { id: "6", title: "Deploy to Kubernetes", status: "BACKLOG", priority: "HIGH", assignee: { name: "Thor Odinson" } },
];

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tasks</h1>
          <p className="text-gray-500">Manage and track all project tasks in your workspace.</p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-primary/90">Create Task</Button>
      </div>

      <DataTable columns={columns} data={mockData} />
    </div>
  );
}
