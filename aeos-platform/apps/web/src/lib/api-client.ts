import type { ApiEnvelope } from "@/types/api";

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

function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aeos_access_token");
}

let isRedirecting = false;

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401 && !response.url.includes("/auth/login")) {
    if (typeof window !== "undefined" && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem("aeos_access_token");
      localStorage.removeItem("aeos_refresh_token");
      localStorage.removeItem("aeos_user");
      window.location.href = "/login";
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

    const token = getClientToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url.toString(), { method: "GET", headers, credentials: "include" });
    return handleResponse<T>(response);
  },

  post: async <T>(path: string, body?: unknown): Promise<T> => {
    const token = getClientToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(path: string, body?: unknown): Promise<T> => {
    const token = getClientToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method: "PATCH",
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(path: string): Promise<T> => {
    const token = getClientToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });
    return handleResponse<T>(response);
  },
};

export { ApiClientError };
