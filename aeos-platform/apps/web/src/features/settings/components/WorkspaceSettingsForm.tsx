"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceSettings } from "../types";

interface WorkspaceSettingsFormProps {
  initialSettings: WorkspaceSettings;
}

export function WorkspaceSettingsForm({ initialSettings }: WorkspaceSettingsFormProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800">Workspace Details</CardTitle>
        <CardDescription>Update your workspace name and information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Workspace Name</label>
          <Input defaultValue={initialSettings.name} className="max-w-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Custom Domain</label>
          <Input defaultValue={initialSettings.domain} className="max-w-md" />
        </div>
        <Button className="mt-4" onClick={() => console.log("Save Settings")}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
