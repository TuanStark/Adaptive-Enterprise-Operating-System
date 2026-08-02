import { ProfileSettingsForm } from "@/features/settings/components/ProfileSettingsForm";
import { ProfileSettings } from "@/features/settings/types";

async function getProfileSettings(): Promise<ProfileSettings> {
  return {
    firstName: "Tony",
    lastName: "Stark",
    email: "tony@starkindustries.com",
    avatarUrl: "https://github.com/shadcn.png",
    bio: "Genius, billionaire, playboy, philanthropist."
  };
}

export default async function ProfileSettingsPage() {
  const settings = await getProfileSettings();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile Settings</h1>
        <p className="text-gray-500">Manage your personal information and preferences.</p>
      </div>

      <ProfileSettingsForm initialSettings={settings} />
    </div>
  );
}
