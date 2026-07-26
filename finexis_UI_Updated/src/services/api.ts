import { APP_CONFIG } from "../config/app.config";
import { getAuthHeaders } from "./authService";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = APP_CONFIG.apiBaseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      // 1. Get the raw text
      const errorText = await response.text();
      let errorDetail;
      
      try {
        // 2. Try to parse as JSON in case the server sent a JSON error
        errorDetail = JSON.parse(errorText);
      } catch {
        // 3. Fallback to raw text if not JSON
        errorDetail = { message: errorText };
      }

      // 4. Throw a structured object so callers can read .status safely
      throw {
        message: errorDetail.message || errorDetail.error || `Request failed: ${response.status}`,
        status: response.status,
        data: errorDetail
      };
    }

    return response.status === 204 ? (null as T) : response.json();
  } catch (error: any) {
    // If it's already our structured error, just re-throw it
    if (error.status) throw error;
    
    // Otherwise, it's a network/generic error, wrap it
    throw {
      message: error.message || "Network Error",
      status: 500
    };
  }
} 

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
