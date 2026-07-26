const BACKEND_NGROK = "https://dd17-103-186-41-160.ngrok-free.app";

export function getApiBaseUrl(): string {
  const { hostname, port } = window.location;

  if (hostname.includes("railway.app")) {
    return "https://finexis-backend-production.up.railway.app/api";
  }

  if (hostname.includes("ngrok-free.app") || hostname.includes("ngrok.io")) {
    return `${BACKEND_NGROK}/api`;
  }

  // Vite dev server with proxy (port 5173) or local backend (port 8000)
  if (
    hostname.includes("run.app") ||
    port === "5173" ||
    port === "8000" ||
    port === "" // standard http (80) / https (443) ports
  ) {
    return "/api";
  }

  return "http://localhost:8000/api";
}

export const APP_CONFIG = {
  get apiBaseUrl() {
    return getApiBaseUrl();
  },
};