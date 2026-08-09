import { ProfileSettingsForm } from "@/features/settings/components/ProfileSettingsForm";

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile Settings</h1>
        <p className="text-gray-500">Manage your personal information and preferences.</p>
      </div>

      <ProfileSettingsForm />
    </div>
  );
}
