// ──────────────────────────────────────────────────────────────
// API Client (Browser/Client Components)
// Lấy accessToken từ NextAuth session thay vì localStorage
// ──────────────────────────────────────────────────────────────

import type { ApiEnvelope } from "@/types/api";
import { getSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_PREFIX = "/api/v1";

class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Lấy accessToken từ NextAuth session (client-side).
 * NextAuth tự động quản lý cookie httpOnly nên ta chỉ cần gọi getSession().
 */
async function getClientToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const session = await getSession();
    return session?.accessToken ?? null;
  } catch {
    return null;
  }
}

let isRedirecting = false;

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401 && !response.url.includes("/auth/login")) {
    if (typeof window !== "undefined" && !isRedirecting) {
      isRedirecting = true;
      // Dùng next-auth signOut thay vì clear localStorage
      const { signOut } = await import("next-auth/react");
      await signOut({ callbackUrl: "/login" });
    }
    throw new ApiClientError(401, "UNAUTHORIZED", "Session expired");
  }

  const body = await response.json();

  if (!response.ok || !body.success) {
    const error = body.error ?? { code: "UNKNOWN", message: "An error occurred" };
    throw new ApiClientError(response.status, error.code, error.message);
  }

  return (body as ApiEnvelope<T>).data;
}

async function buildHeaders(): Promise<HeadersInit> {
  const token = await getClientToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export const clientApi = {
  get: async <T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> => {
    const url = new URL(`${API_PREFIX}${path}`, API_BASE);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const headers = await buildHeaders();
    const response = await fetch(url.toString(), { method: "GET", headers });
    return handleResponse<T>(response);
  },

  post: async <T>(path: string, body?: unknown): Promise<T> => {
    const headers = await buildHeaders();
    const response = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(path: string, body?: unknown): Promise<T> => {
    const headers = await buildHeaders();
    const response = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method: "PATCH",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(path: string): Promise<T> => {
    const headers = await buildHeaders();
    const response = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse<T>(response);
  },
};

export { ApiClientError };
