"use client";

import { useState } from "react";
import { useWorkspaceFormInit } from "@/hooks/useWorkspaceFormInit";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaces, useWorkspaceMutations } from "@/features/workspace/hooks/useWorkspaces";
import { useSession } from "next-auth/react";
import { Briefcase, AlignLeft, Globe, Check, AlertCircle, Building2 } from "lucide-react";
import { toast } from "sonner";

export function WorkspaceSettingsForm() {
  const { data: session, update: updateSession } = useSession();
  const { data: workspacesData, isLoading } = useWorkspaces();
  const { update } = useWorkspaceMutations();

  const currentWorkspaceId = session?.user?.workspaceId;
  const currentWorkspace = workspacesData?.find(w => w.id === currentWorkspaceId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [mounted, setMounted] = useState(false);

  useWorkspaceFormInit(
    currentWorkspace as any,
    setMounted,
    setName,
    setDescription
  );

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 animate-pulse">
        <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3" />
        Loading workspace settings...
      </div>
    );
  }

  if (!currentWorkspaceId) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-slate-900">No workspace selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select or create a workspace to view its settings.</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!currentWorkspaceId) return;
    
    try {
      await update.mutateAsync({
        workspaceId: currentWorkspaceId,
        name,
        description,
        domain: domain || undefined,
      });
      
      toast.success("Workspace updated successfully");
      
      // update session name if name changed
      if (name !== currentWorkspace?.name) {
        await updateSession({
          workspaceId: currentWorkspaceId,
          workspaceName: name,
        });
        window.location.reload(); // hard refresh to update context
      }
    } catch (error) {
      toast.error("Failed to update workspace");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">Workspace Details</CardTitle>
              <CardDescription>Manage your workspace name and general information.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" /> Workspace Name
              </label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="focus-visible:ring-indigo-500 transition-shadow"
                placeholder="e.g. Stark Industries"
              />
              <p className="text-[11px] text-slate-500">This is the visible name of your workspace.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" /> Workspace Domain
              </label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                  https://
                </span>
                <Input 
                  value={domain} 
                  onChange={e => setDomain(e.target.value)} 
                  className="rounded-l-none focus-visible:ring-indigo-500 transition-shadow"
                  placeholder="stark-industries.aeos.app"
                />
              </div>
              <p className="text-[11px] text-slate-500">Custom domain for your workspace (optional).</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-400" /> Description
            </label>
            <textarea 
              className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 transition-shadow resize-y"
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="What is this workspace used for?"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button 
          onClick={handleSave} 
          disabled={update.isPending || !name.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 h-auto text-sm font-medium rounded-lg shadow-sm transition-all flex items-center gap-2"
        >
          {update.isPending ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> Save Changes
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
