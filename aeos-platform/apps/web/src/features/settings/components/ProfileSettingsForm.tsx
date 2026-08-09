"use client";

import { useState, useRef } from "react";
import { useProfileFormInit } from "@/hooks/useProfileFormInit";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/features/auth/hooks/useProfile";
import { Camera, Mail, User, Clock, Phone, AlignLeft, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadFileDirectly } from "@/lib/upload";

export function ProfileSettingsForm() {
  const { profile, updateProfile, isUpdating, isLoading } = useProfile();
  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useProfileFormInit(
    profile,
    setMounted,
    setFirstName,
    setLastName,
    setBio,
    setTimezone,
    setPhone,
    setAvatarUrl
  );

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500 animate-pulse bg-white/50 rounded-xl border border-slate-100">
        <Loader2 className="h-8 w-8 border-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading profile settings...</p>
      </div>
    );
  }

  const handleSave = () => {
    updateProfile({
      firstName,
      lastName,
      bio,
      timezone,
      phone,
      avatarUrl: avatarUrl || null,
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      toast.error("File size must be less than 800KB");
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await uploadFileDirectly(file, "avatars");
      if (uploadResult?.url) {
        setAvatarUrl(uploadResult.url);
        toast.success("Avatar uploaded successfully. Remember to save changes!");
      } else {
        toast.error("Failed to upload avatar");
      }
    } catch (error) {
      toast.error("An error occurred during upload");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-800">Profile Picture</CardTitle>
          <CardDescription>This is your public presence. A clear photo helps your team recognize you.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md transition-all duration-300 group-hover:shadow-lg">
                <AvatarImage src={avatarUrl || undefined} alt="Avatar" className="object-cover" />
                <AvatarFallback className="text-3xl bg-slate-100 text-slate-600 font-medium">
                  {(firstName ?? "?")[0]}{(lastName ?? "?")[0]}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full cursor-pointer disabled:cursor-not-allowed"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 mb-1 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Change</span>
                  </>
                )}
              </button>
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
              />
              <div className="flex gap-2 justify-center sm:justify-start">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                  {isUploading ? "Uploading..." : "Upload new photo"}
                </Button>
                {avatarUrl && (
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setAvatarUrl("")} disabled={isUploading}>
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-slate-500">Supported formats: JPG, GIF, or PNG. Maximum size 800KB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info Section */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-800">Personal Information</CardTitle>
          <CardDescription>Update your personal details and how others can contact you.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> First Name
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="focus-visible:ring-indigo-500 transition-shadow"
                placeholder="Tony"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 opacity-0" /> Last Name
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="focus-visible:ring-indigo-500 transition-shadow"
                placeholder="Stark"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" /> Email Address
              </label>
              <div className="relative">
                <Input value={profile?.email || ""} type="email" disabled className="bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200" />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> Email address cannot be changed here.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> Phone Number
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="focus-visible:ring-indigo-500 transition-shadow"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Timezone
            </label>
            <Input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="focus-visible:ring-indigo-500 transition-shadow"
              placeholder="e.g. America/Los_Angeles"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-400" /> Bio
            </label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 transition-shadow resize-y"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little bit about yourself, your role, and what you do."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={isUpdating || isUploading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 h-auto text-sm font-medium rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isUpdating ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> Save Profile
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
