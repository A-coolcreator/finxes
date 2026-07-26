const BACKEND_NGROK = "https://d1c8-103-186-41-160.ngrok-free.app"; // ← update when backend tunnel changes

const getApiBaseUrl = () => {
  const { hostname } = window.location;
  if (hostname.includes("railway.app")) {
    return "https://finexis-backend-production.up.railway.app/api";
  }
  // When served via any ngrok tunnel, hit the backend ngrok URL
  if (hostname.includes("ngrok-free.app") || hostname.includes("ngrok.io")) {
    return `${BACKEND_NGROK}/api`;
  }
  // Default: local dev
  return "http://localhost:3000/api"; 
};

export const APP_CONFIG = {
  apiBaseUrl: getApiBaseUrl(),
  caseRoutes: {
    manager: "/case-manager.html",
    dashboard: "/case-dashboard.html",
  },
};

