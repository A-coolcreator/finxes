import { apiClient } from "./api";

// --- Auth Types ---
export interface User {
  id: string;
  email: string;
  tenant: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  tenant?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// --- Auth Service ---
export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/login", payload);
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/register", payload);
  },

  async getMe(): Promise<User> {
    return apiClient.get<User>("/auth/me");
  },

  async listUsers(): Promise<User[]> {
    return apiClient.get<User[]>("/users");
  },
};

// --- Auth State Management ---
let currentUser: User | null = null;
let authToken: string | null = null;

export function setAuth(user: User, token: string) {
  currentUser = user;
  authToken = token;
  localStorage.setItem("finexis_user", JSON.stringify(user));
  localStorage.setItem("finexis_token", token);
}

export function getAuth(): { user: User | null; token: string | null } {
  if (!currentUser && typeof window !== "undefined") {
    const stored = localStorage.getItem("finexis_user");
    const storedToken = localStorage.getItem("finexis_token");
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
        authToken = storedToken;
      } catch {
        // Invalid JSON, ignore
      }
    }
  }
  return { user: currentUser, token: authToken };
}

export function clearAuth() {
  currentUser = null;
  authToken = null;
  localStorage.removeItem("finexis_user");
  localStorage.removeItem("finexis_token");
}

export function getUserId(): string | null {
  return currentUser?.id || null;
}

export function getAuthHeaders(): Record<string, string> {
  const { token } = getAuth();
  return token ? { Authorization: `Bearer ${token}` } : {};
}