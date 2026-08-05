import { redirect } from "next/navigation";
import type { ApiEnvelope } from "@/types/api";
import { auth } from "@/auth";

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

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await auth();
  const token = session?.accessToken;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401 && !response.url.includes("/auth/login")) {
    redirect("/api/auth/clear");
  }

  const body = await response.json();

  if (!response.ok || !body.success) {
    let errorMessage = "An error occurred";
    let errorCode = "UNKNOWN";

    if (body.error && typeof body.error === 'object' && body.error.message) {
      errorMessage = Array.isArray(body.error.message) ? body.error.message.join(", ") : body.error.message;
      errorCode = body.error.code || "UNKNOWN";
    } else if (body.message) {
      errorMessage = Array.isArray(body.message) ? body.message.join(", ") : body.message;
      errorCode = typeof body.error === 'string' ? body.error : "UNKNOWN";
    }

    throw new ApiClientError(response.status, errorCode, errorMessage);
  }

  return (body as ApiEnvelope<T>).data;
}

export const serverApi = {
  get: async <T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> => {
    const url = new URL(`${API_PREFIX}${path}`, API_BASE);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const headers = await getAuthHeaders();
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return handleResponse<T>(response);
  },

  post: async <T>(path: string, body?: unknown): Promise<T> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse<T>(response);
  },

  patch: async <T>(path: string, body?: unknown): Promise<T> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method: "PATCH",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse<T>(response);
  },

  delete: async <T>(path: string): Promise<T> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method: "DELETE",
      headers,
    });

    return handleResponse<T>(response);
  },
};

export { ApiClientError };
