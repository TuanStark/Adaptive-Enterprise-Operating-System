"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegisterForm } from "../hooks/useRegisterForm";

export function RegisterForm() {
  const { isPending, error, handleSubmit, invitedEmail, callbackUrl } = useRegisterForm();

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-lg mt-10">
      <CardHeader className="space-y-2 text-center pb-6">
        <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">Create Account</CardTitle>
        <CardDescription className="text-gray-500">
          {invitedEmail 
            ? "Complete your registration to accept the workspace invite." 
            : "Sign up to start using AEOS."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <Input 
                name="firstName" 
                placeholder="John" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <Input 
                name="lastName" 
                placeholder="Doe" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <Input 
              name="email" 
              type="email" 
              placeholder="you@example.com" 
              autoComplete="email"
              defaultValue={invitedEmail || ""}
              disabled={!!invitedEmail}
              className={invitedEmail ? "bg-gray-50 text-gray-500" : ""}
              required 
            />
            {invitedEmail && (
              <p className="text-xs text-amber-600 mt-1">Email is locked because you are accepting an invite.</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              autoComplete="new-password"
              minLength={8}
              required 
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full mt-4" 
            disabled={isPending}
          >
            {isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t border-gray-100 pt-6">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link 
            href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"} 
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
