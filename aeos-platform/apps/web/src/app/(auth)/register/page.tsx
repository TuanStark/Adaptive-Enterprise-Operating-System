import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-[400px] bg-gray-200 rounded-xl" />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
