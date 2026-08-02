"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bug, Bookmark, CheckSquare, Plus } from "lucide-react";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { Task } from "../types";

const columnsConfig: ColumnDef<Task>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "title", header: "Title", cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue("title")}</div> },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "priority", header: "Priority" },
];

const TypeIcon = ({ type }: { type?: string }) => {
  if (type === "BUG") return <Bug className="w-4 h-4 text-red-500 shrink-0" />;
  if (type === "STORY") return <Bookmark className="w-4 h-4 text-emerald-500 shrink-0" />;
  return <CheckSquare className="w-4 h-4 text-blue-500 shrink-0" />;
};

interface KanbanBoardProps {
  initialTasks: Record<string, Task[]>;
  view: "board" | "list";
  searchQuery?: string;
  selectedAvatar?: string | null;
}

export function KanbanBoard({ initialTasks, view, searchQuery, selectedAvatar }: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [addingTaskCol, setAddingTaskCol] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceCol = [...columns[source.droppableId]];
      const destCol = [...columns[destination.droppableId]];
      
      const taskIndex = sourceCol.findIndex(t => t.id === draggableId);
      if (taskIndex === -1) return;
      const [removed] = sourceCol.splice(taskIndex, 1);
      removed.status = destination.droppableId;
      
      let realDestIndex = destination.index;
      if (searchQuery || selectedAvatar) {
         realDestIndex = destCol.length;
      }
      destCol.splice(realDestIndex, 0, removed);

      setColumns({ ...columns, [source.droppableId]: sourceCol, [destination.droppableId]: destCol });
    } else {
      const column = [...columns[source.droppableId]];
      const taskIndex = column.findIndex(t => t.id === draggableId);
      if (taskIndex === -1) return;
      const [removed] = column.splice(taskIndex, 1);
      
      let realDestIndex = destination.index;
      if (searchQuery || selectedAvatar) {
         realDestIndex = column.length;
      }
      column.splice(realDestIndex, 0, removed);

      setColumns({ ...columns, [source.droppableId]: column });
    }
  };

  const handleCreateTask = (colId: string) => {
    if (!newTaskTitle.trim()) {
      setAddingTaskCol(null);
      return;
    }
    const newTask: Task = {
      id: `AEOS-${Math.floor(Math.random() * 1000) + 100}`,
      title: newTaskTitle,
      status: colId,
      type: "TASK",
      priority: "MEDIUM",
      assignee: { name: "Tony Stark", avatar: "https://github.com/shadcn.png" }
    };
    setColumns({
      ...columns,
      [colId]: [...(columns[colId] || []), newTask]
    });
    setNewTaskTitle("");
    setAddingTaskCol(null);
  };

  const handleCreateColumn = () => {
    const colId = newColName.toUpperCase().replace(/ /g, '_');
    if (newColName.trim() && !columns[colId]) {
      setColumns({
        ...columns,
        [colId]: []
      });
    }
    setIsAddingCol(false);
    setNewColName("");
  };

  const filteredColumns = Object.entries(columns).reduce((acc, [colId, items]) => {
    acc[colId] = items.filter(task => {
      const matchSearch = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAvatar = !selectedAvatar || task.assignee.name === selectedAvatar;
      return matchSearch && matchAvatar;
    });
    return acc;
  }, {} as Record<string, Task[]>);

  const allFilteredTasks = Object.values(filteredColumns).flat();

  if (view === "list") {
    return (
      <div className="flex-1 overflow-auto">
        <DataTable columns={columnsConfig} data={allFilteredTasks} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full gap-4 min-w-max pb-4 items-start">
          {Object.entries(filteredColumns).map(([colId, items]) => (
            <div key={colId} className="w-[320px] flex flex-col bg-gray-50/50 rounded-xl border border-gray-100 shrink-0 max-h-full">
              <div className="p-3 font-semibold text-gray-500 text-sm uppercase tracking-wide flex justify-between items-center shrink-0">
                <span>{colId.replace(/_/g, ' ')} <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{items.length}</span></span>
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
                                <div className="flex items-start gap-2 mb-2">
                                  <div className="mt-0.5"><TypeIcon type={task.type} /></div>
                                  <p className={`text-sm font-medium leading-snug ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-gray-900'}`}>{task.title}</p>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50 font-normal">{task.id}</Badge>
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
              <div className="px-2 pb-2 shrink-0">
                {addingTaskCol === colId ? (
                  <div className="space-y-2 mt-2">
                    <Input autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateTask(colId); if (e.key === 'Escape') setAddingTaskCol(null); }} placeholder="What needs to be done?" className="h-8 text-sm" />
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs" onClick={() => handleCreateTask(colId)}>Create</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingTaskCol(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setAddingTaskCol(colId)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-200 bg-gray-100/50 p-2 rounded-md cursor-pointer transition-colors mt-2">
                    <Plus className="w-4 h-4" /> Create issue
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Column Button */}
          <div className="w-[320px] shrink-0">
            {isAddingCol ? (
              <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-3 space-y-2">
                <Input autoFocus value={newColName} onChange={e => setNewColName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateColumn(); if (e.key === 'Escape') setIsAddingCol(false); }} placeholder="Column name..." className="h-8 text-sm" />
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs" onClick={handleCreateColumn}>Add</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setIsAddingCol(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div onClick={() => setIsAddingCol(true)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-200 bg-gray-50/80 p-3 rounded-xl border border-dashed border-gray-300 cursor-pointer transition-colors font-medium">
                <Plus className="w-4 h-4" /> Add column
              </div>
            )}
          </div>

        </div>
      </DragDropContext>
      <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
    </div>
  );
}
