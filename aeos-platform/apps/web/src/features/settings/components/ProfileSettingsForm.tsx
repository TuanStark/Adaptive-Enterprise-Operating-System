"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ProfileSettings } from "../types";

interface ProfileSettingsFormProps {
  initialSettings: ProfileSettings;
}

export function ProfileSettingsForm({ initialSettings }: ProfileSettingsFormProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800">Profile Details</CardTitle>
        <CardDescription>Update your personal information and avatar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 border-2 border-gray-100 shadow-sm">
            <AvatarImage src={initialSettings.avatarUrl ?? undefined} alt="Avatar" />
            <AvatarFallback className="text-2xl">{(initialSettings.firstName ?? "?")[0]}{(initialSettings.lastName ?? "?")[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button variant="outline" size="sm">Change Avatar</Button>
            <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <Input defaultValue={initialSettings.firstName ?? ""} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <Input defaultValue={initialSettings.lastName ?? ""} />
          </div>
        </div>
        
        <div className="space-y-2 max-w-2xl">
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <Input defaultValue={initialSettings.email} type="email" />
        </div>
        
        <div className="space-y-2 max-w-2xl">
          <label className="text-sm font-medium text-gray-700">Bio</label>
          <textarea 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={initialSettings.bio} 
            placeholder="Tell us a little bit about yourself"
          />
        </div>
        
        <div className="pt-2">
          <Button onClick={() => console.log("Save Profile")}>Save Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
}
