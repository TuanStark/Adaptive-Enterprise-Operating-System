"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginCredentials, AuthResponse } from "../types";

// Mock API Call (To be replaced with real backend fetch)
async function fetchLoginAPI(credentials: LoginCredentials): Promise<AuthResponse> {
  // Simulate network delay & response
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email === "admin@aeos.io") {
        resolve({
          user: { id: "1", name: "Tony Stark", email: "admin@aeos.io", role: "Admin" },
          accessToken: "mock.jwt.token.server.only",
        });
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 1000);
  });
}

export async function login(credentials: LoginCredentials) {
  try {
    const response = await fetchLoginAPI(credentials);
    
    // Set HTTP-Only, Secure Cookie
    const cookieStore = await cookies();
    cookieStore.set("aeos_access_token", response.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Also store user info safely (without sensitive data) for fast client access if needed
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
  cookieStore.delete("aeos_user");
  redirect("/login");
}
