import { WorkspaceSettingsForm } from "@/features/settings/components/WorkspaceSettingsForm";
import { WorkspaceSettings } from "@/features/settings/types";

export default async function SettingsPage() {

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your workspace preferences.</p>
      </div>

      <WorkspaceSettingsForm />
    </div>
  );
}
