import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-[400px] bg-gray-200 rounded-xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
