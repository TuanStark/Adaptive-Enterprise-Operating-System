"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";

const publicRoutes = ["/login", "/register", "/forgot-password"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const { setUser } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
    
    const token = localStorage.getItem("aeos_access_token");
    const userStr = localStorage.getItem("aeos_user");
    const isPublicRoute = publicRoutes.includes(pathname);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setUser(user);
      } catch (e) {
        console.error("Failed to parse user from localStorage");
        localStorage.removeItem("aeos_access_token");
        localStorage.removeItem("aeos_refresh_token");
        localStorage.removeItem("aeos_user");
        router.push("/login");
        return;
      }
    }

    if (!token && !isPublicRoute) {
      router.push("/login");
    } else if (token && isPublicRoute) {
      router.push("/");
    }
  }, [pathname, router, setUser]);

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!isMounted) {
    return null;
  }

  // If on a protected route and no token, we shouldn't render children to avoid errors
  // while the redirect is happening.
  const token = typeof window !== "undefined" ? localStorage.getItem("aeos_access_token") : null;
  const isPublicRoute = publicRoutes.includes(pathname);
  
  if (!token && !isPublicRoute) {
    return null; 
  }

  return <>{children}</>;
}
