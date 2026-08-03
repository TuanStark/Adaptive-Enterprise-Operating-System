import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientApi } from "@/lib/api-client";
import type { User } from "../types";

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
}

export function useLoginForm() {
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
      const response = await clientApi.post<LoginResult>("/auth/login", { email, password });
      
      localStorage.setItem("aeos_access_token", response.accessToken);
      localStorage.setItem("aeos_refresh_token", response.refreshToken);
      
      // Fetch full user profile since login only returns userId and email
      const user = await clientApi.get<User>("/auth/me");
      localStorage.setItem("aeos_user", JSON.stringify(user));
      
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to login");
      }
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    error,
    handleSubmit
  };
}
