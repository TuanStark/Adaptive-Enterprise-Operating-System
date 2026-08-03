"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/api-server";
import type { LoginCredentials, AuthResponse } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function login(credentials: LoginCredentials) {
  try {
    const response = await serverApi.post<AuthResponse>("/auth/login", credentials);

    const cookieStore = await cookies();
    cookieStore.set("aeos_access_token", response.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    cookieStore.set("aeos_refresh_token", response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookieStore.set("aeos_user", JSON.stringify(response.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid email or password";
    return { success: false as const, error: message };
  }
}

export async function logout() {
  const cookieStore = await cookies();

  try {
    const refreshToken = cookieStore.get("aeos_refresh_token")?.value;
    if (refreshToken) {
      await serverApi.post("/auth/logout", { refreshToken });
    }
  } catch {
  }

  cookieStore.delete("aeos_access_token");
  cookieStore.delete("aeos_refresh_token");
  cookieStore.delete("aeos_user");
  redirect("/login");
}
