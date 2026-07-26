import { APP_CONFIG } from "../config/app.config.js";

async function request(path, options = {}) {
  const response = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
