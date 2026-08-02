"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { TaskDetailPanel } from "@/components/layout/TaskDetailPanel";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignee: { name: string; avatar?: string };
};

const initialData: Record<string, Task[]> = {
  "TODO": [
    { id: "AEOS-14", title: "Write Documentation", status: "TODO", priority: "MEDIUM", assignee: { name: "Natasha Romanoff", avatar: "https://i.pravatar.cc/150?u=4" } },
    { id: "AEOS-15", title: "Setup Notification Service", status: "TODO", priority: "HIGH", assignee: { name: "Tony Stark" } },
  ],
  "IN_PROGRESS": [
    { id: "AEOS-12", title: "Implement CQRS Pattern", status: "IN_PROGRESS", priority: "URGENT", assignee: { name: "Peter Parker", avatar: "https://i.pravatar.cc/150?u=2" } },
  ],
  "DONE": [
    { id: "AEOS-1", title: "Design System Architecture", status: "DONE", priority: "HIGH", assignee: { name: "Tony Stark", avatar: "https://github.com/shadcn.png" } },
  ],
};

const columnsConfig: ColumnDef<Task>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "title", header: "Title", cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue("title")}</div> },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "priority", header: "Priority" },
];

export default function TasksPage() {
  const [columns, setColumns] = useState(initialData);
  const [view, setView] = useState<"board" | "list">("board");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceCol = [...columns[source.droppableId]];
      const destCol = [...columns[destination.droppableId]];
      const [removed] = sourceCol.splice(source.index, 1);
      removed.status = destination.droppableId as Task["status"];
      destCol.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: sourceCol, [destination.droppableId]: destCol });
    } else {
      const column = [...columns[source.droppableId]];
      const [removed] = column.splice(source.index, 1);
      column.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: column });
    }
  };

  const allTasks = Object.values(columns).flat();

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <span>Projects</span><span className="mx-2">/</span><span>AEOS-CORE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Active Sprint</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-9">Complete Sprint</Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex bg-gray-100/80 p-1 rounded-lg">
          <div onClick={() => setView("board")} className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer transition-colors ${view === "board" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}>Board</div>
          <div onClick={() => setView("list")} className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer transition-colors ${view === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}>List</div>
        </div>
      </div>

      {view === "list" ? (
        <div className="flex-1 overflow-auto"><DataTable columns={columnsConfig} data={allTasks} /></div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-4 min-w-max pb-4">
              {Object.entries(columns).map(([colId, items]) => (
                <div key={colId} className="w-[320px] flex flex-col bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="p-3 font-semibold text-gray-500 text-sm uppercase tracking-wide flex justify-between items-center">
                    <span>{colId.replace('_', ' ')} <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{items.length}</span></span>
                  </div>
                  <Droppable droppableId={colId}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[150px]">
                        {items.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => setSelectedTaskId(task.id)} style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.8 : 1 }}>
                                <Card className="shadow-sm border-gray-200 hover:border-primary/50 transition-colors">
                                  <CardContent className="p-3">
                                    <p className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-gray-900'}`}>{task.title}</p>
                                    <div className="flex items-center justify-between mt-4">
                                      <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50">{task.id}</Badge>
                                      <Avatar className="h-6 w-6"><AvatarImage src={task.assignee.avatar} /><AvatarFallback>{task.assignee.name.substring(0,2).toUpperCase()}</AvatarFallback></Avatar>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}

      <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
    </div>
  );
}
