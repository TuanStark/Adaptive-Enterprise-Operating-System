"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLoginForm } from "../hooks/useLoginForm";

export function LoginForm() {
  const { isPending, error, handleSubmit } = useLoginForm();

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
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
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
          Don't have an account? <Link href="/register" className="text-primary font-medium hover:underline">Request access</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
