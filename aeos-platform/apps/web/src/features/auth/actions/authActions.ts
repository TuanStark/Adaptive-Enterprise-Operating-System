"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginCredentials, AuthResponse } from "../types";

const API_BASE = process.env.API_URL || "http://localhost:4000";

async function fetchLoginAPI(credentials: LoginCredentials): Promise<AuthResponse> {
  // TODO: Replace with real API call when BE is deployed
  // const res = await fetch(`${API_BASE}/auth/login`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(credentials),
  // });
  // if (!res.ok) throw new Error("Invalid credentials");
  // return res.json();

  // Mock for development — will be replaced by real fetch above
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email === "admin@aeos.io") {
        resolve({
          user: {
            id: "user-1",
            tenantId: "tenant-1",
            email: "admin@aeos.io",
            firstName: "Tony",
            lastName: "Stark",
            avatarUrl: null,
            status: "ACTIVE",
            emailVerified: true,
          },
          accessToken: "mock.jwt.access.token",
          refreshToken: "mock.jwt.refresh.token",
        });
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 500);
  });
}

export async function login(credentials: LoginCredentials) {
  try {
    const response = await fetchLoginAPI(credentials);
    
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

    return { success: true };
  } catch (error) {
    return { success: false, error: "Invalid email or password" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("aeos_access_token");
  cookieStore.delete("aeos_refresh_token");
  cookieStore.delete("aeos_user");
  redirect("/login");
}
