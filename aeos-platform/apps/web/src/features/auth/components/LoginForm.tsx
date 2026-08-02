"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "../actions/authActions";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    startTransition(async () => {
      const result = await login({ email, password });
      
      if (result.success) {
        // Redirect to dashboard on success
        router.push("/");
      } else {
        setError(result.error || "Failed to login");
      }
    });
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
