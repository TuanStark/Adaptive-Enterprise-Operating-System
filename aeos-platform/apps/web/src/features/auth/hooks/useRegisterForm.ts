import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { clientApi } from "@/lib/api-client";

export function useRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extract invite token and email if present
  const callbackUrl = searchParams.get("callbackUrl");
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (callbackUrl) {
      try {
        // Handle relative URLs as well by parsing it safely
        const urlStr = callbackUrl.startsWith("http") ? callbackUrl : window.location.origin + callbackUrl;
        const url = new URL(urlStr);
        const token = url.searchParams.get("token");
        if (token) {
          clientApi.get(`/workspaces/invites/validate?token=${token}`)
            .then(res => {
              if (res.data?.email) {
                setInvitedEmail(res.data.email);
              }
            })
            .catch(err => console.error("Failed to validate invite token on register page", err));
        }
      } catch (err) {
        console.error("Failed to parse callbackUrl or token", err);
      }
    }
  }, [callbackUrl]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) || invitedEmail;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      setIsPending(false);
      return;
    }

    try {
      // 1. Register via Backend API
      await clientApi.post("/auth/register", {
        email,
        password,
        firstName,
        lastName,
        tenantId: "default", // AEOS standard default
      });

      // 2. Sign In with NextAuth
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Tạo tài khoản thành công nhưng không thể tự động đăng nhập.");
      } else if (result?.ok) {
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Tạo tài khoản thất bại. Email có thể đã tồn tại.");
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    error,
    handleSubmit,
    invitedEmail,
    callbackUrl,
  };
}
