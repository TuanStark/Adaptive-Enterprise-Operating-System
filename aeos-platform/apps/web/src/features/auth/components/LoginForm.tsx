"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientApi } from "@/lib/api-client";
import type { AuthResponse } from "../types";

export function LoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Please fill in all fields.");
      setIsPending(false);
      return;
    }

    try {
      const response = await clientApi.post<AuthResponse>("/auth/login", { email, password });
      
      localStorage.setItem("aeos_access_token", response.accessToken);
      localStorage.setItem("aeos_refresh_token", response.refreshToken);
      localStorage.setItem("aeos_user", JSON.stringify(response.user));
      
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-lg mt-20">
      <CardHeader className="space-y-2 text-center pb-6">
        <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</CardTitle>
        <CardDescription className="text-gray-500">Sign in to your AEOS workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <Input 
              name="email" 
              type="email" 
              placeholder="admin@aeos.io" 
              autoComplete="email"
              required 
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
            </div>
            <Input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              autoComplete="current-password"
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
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t border-gray-100 pt-6">
        <p className="text-sm text-gray-500">
          Don't have an account? <a href="#" className="text-primary font-medium hover:underline">Request access</a>
        </p>
      </CardFooter>
    </Card>
  );
}
