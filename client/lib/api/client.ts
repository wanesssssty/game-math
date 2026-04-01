import { config } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import type { ApiResponse } from "./types";

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    const message =
      "error" in payload ? payload.error.message : "Unexpected API error";
    const details = "error" in payload ? payload.error.details : null;
    throw new ApiError(message, response.status, details);
  }

  return payload.data;
}
