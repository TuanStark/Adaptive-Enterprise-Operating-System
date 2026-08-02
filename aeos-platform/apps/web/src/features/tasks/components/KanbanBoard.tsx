"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { Task } from "../types";

const columnsConfig: ColumnDef<Task>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "title", header: "Title", cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue("title")}</div> },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "priority", header: "Priority" },
];

interface KanbanBoardProps {
  initialTasks: Record<string, Task[]>;
  view: "board" | "list";
}

export function KanbanBoard({ initialTasks, view }: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialTasks);
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

  if (view === "list") {
    return (
      <div className="flex-1 overflow-auto">
        <DataTable columns={columnsConfig} data={allTasks} />
      </div>
    );
  }

  return (
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
                                  <Avatar className="h-6 w-6"><AvatarImage src={task.assignee.avatar} /><AvatarFallback>{task.assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
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
      <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
    </div>
  );
}
