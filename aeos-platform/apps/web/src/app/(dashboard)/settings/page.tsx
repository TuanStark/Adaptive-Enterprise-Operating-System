import { WorkspaceSettingsForm } from "@/features/settings/components/WorkspaceSettingsForm";
import { WorkspaceSettings } from "@/features/settings/types";

async function getWorkspaceSettings(): Promise<WorkspaceSettings> {
  return {
    id: "ws-1",
    tenantId: "tenant-1",
    name: "Stark Industries",
    domain: "stark.aeos.io",
    createdAt: "2026-06-01T00:00:00Z",
  };
}

export default async function SettingsPage() {
  const settings = await getWorkspaceSettings();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your workspace preferences.</p>
      </div>

      <WorkspaceSettingsForm initialSettings={settings} />
    </div>
  );
}
