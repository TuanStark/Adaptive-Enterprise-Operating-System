"use client";

import React, { useState } from "react";
import { ClipboardList, Plus, FileText, BarChart2, ToggleLeft, ToggleRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CreateFormDialog, type FormItem } from "./CreateFormDialog";

// ── Mock Forms ──
const mockForms: FormItem[] = [
  {
    id: "form-1",
    name: "Bug Report",
    description: "Collect structured bug reports from users and team members",
    isActive: true,
    submissionsCount: 23,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "form-2",
    name: "Feature Request",
    description: "Gather feature requests and improvement suggestions",
    isActive: true,
    submissionsCount: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: "form-3",
    name: "Sprint Feedback",
    description: "Post-sprint feedback form for retrospectives",
    isActive: false,
    submissionsCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function FormsView() {
  const [forms, setForms] = useState<FormItem[]>(mockForms);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateForm = (form: FormItem) => {
    setForms(prev => [form, ...prev]);
  };

  const handleToggleActive = (formId: string) => {
    setForms(prev => prev.map(f => 
      f.id === formId ? { ...f, isActive: !f.isActive } : f
    ));
  };

  if (forms.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-10 flex flex-col items-center text-center shadow-sm">
           <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
              <ClipboardList className="w-10 h-10 text-purple-600" />
           </div>
           <h2 className="text-xl font-semibold text-gray-900 mb-3">Capture work with Forms</h2>
           <p className="text-sm text-gray-500 mb-8">
             Create forms to collect requests, bug reports, or any other structured data directly into your project backlog.
           </p>
           <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(true)}>
             <Plus className="w-4 h-4 mr-2" /> Create form
           </Button>
        </div>
        <CreateFormDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onCreateForm={handleCreateForm} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-purple-600" />
          <h2 className="font-semibold text-gray-900">Forms</h2>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs ml-1">{forms.length}</Badge>
        </div>
        <Button size="sm" onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1" /> Create form
        </Button>
      </div>

      {/* Form Grid */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.map((form, i) => (
          <motion.div
            key={form.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.08 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-purple-50 rounded-lg">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{form.name}</h3>
                    </div>
                    {form.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 ml-8">{form.description}</p>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(form.id); }}
                    className="border-none bg-transparent cursor-pointer p-0 shrink-0"
                    title={form.isActive ? "Deactivate form" : "Activate form"}
                  >
                    {form.isActive 
                      ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                      : <ToggleLeft className="w-6 h-6 text-gray-300" />
                    }
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>{form.submissionsCount} submissions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(form.createdAt)}</span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0 ${form.isActive 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                      : "bg-gray-50 text-gray-400 border-gray-200"
                    }`}
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <CreateFormDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onCreateForm={handleCreateForm} />
    </div>
  );
}
