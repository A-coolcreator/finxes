import { apiClient } from "./api";

// --- Types ---
export type UserStatus = "Active" | "Invited" | "Suspended";
export type UserRole = "Super admin" | "Tenant admin" | "Investigator" | "Analyst" | "Viewer";
export type TenantStatus = "Active" | "Trial" | "Suspended";
export type TenantPlan = "Enterprise" | "Team" | "Trial";
export type TenantSegment = "Law enforcement" | "Banking & compliance" | "Fraud investigations" | "Regulatory" | "Other";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  tenantId: string | null;
  tenant: string;
  role: UserRole;
  status: UserStatus;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantRow {
  id: string;
  name: string;
  segment: TenantSegment;
  plan: TenantPlan;
  seatsUsed: number;
  seatsLimit: number;
  status: TenantStatus;
  region: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListParams {
  status?: UserStatus;
  role?: UserRole;
  tenantId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TenantListParams {
  status?: TenantStatus;
  plan?: TenantPlan;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// --- User Service ---
export const UserService = {
  async list(params: UserListParams = {}): Promise<ListResponse<UserRow>> {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.role) query.set("role", params.role);
    if (params.tenantId) query.set("tenant_id", params.tenantId);
    if (params.search) query.set("search", params.search);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.offset) query.set("offset", String(params.offset));
    return apiClient.get<ListResponse<UserRow>>(`/admin/users?${query}`);
  },

  async get(id: string): Promise<UserRow | null> {
    return apiClient.get<UserRow | null>(`/admin/users/${id}`);
  },

  async create(data: Omit<UserRow, "id" | "tenant" | "createdAt" | "updatedAt">): Promise<UserRow> {
    return apiClient.post<UserRow>("/admin/users", data);
  },

  async update(id: string, data: Partial<Omit<UserRow, "id" | "tenant" | "createdAt" | "updatedAt">>): Promise<UserRow | null> {
    return apiClient.patch<UserRow | null>(`/admin/users/${id}`, data);
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/admin/users/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

// --- Tenant Service ---
export const TenantService = {
  async list(params: TenantListParams = {}): Promise<ListResponse<TenantRow>> {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.plan) query.set("plan", params.plan);
    if (params.search) query.set("search", params.search);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.offset) query.set("offset", String(params.offset));
    return apiClient.get<ListResponse<TenantRow>>(`/admin/tenants?${query}`);
  },

  async get(id: string): Promise<TenantRow | null> {
    return apiClient.get<TenantRow | null>(`/admin/tenants/${id}`);
  },

  async create(data: Omit<TenantRow, "id" | "seatsUsed" | "createdAt" | "updatedAt">): Promise<TenantRow> {
    return apiClient.post<TenantRow>("/admin/tenants", data);
  },

  async update(id: string, data: Partial<Omit<TenantRow, "id" | "seatsUsed" | "createdAt" | "updatedAt">>): Promise<TenantRow | null> {
    return apiClient.patch<TenantRow | null>(`/admin/tenants/${id}`, data);
  },
};

// --- Helpers ---
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function formatSeats(used: number, limit: number): string {
  return `${used} / ${limit}`;
}

export function isAtSeatsLimit(used: number, limit: number): boolean {
  return used >= limit;
}

// --- Dashboard Service ---
export interface DashboardStats {
  activeTenants: number;
  totalUsers: number;
  casesCount: number;
  flaggedTransactions: number;
}

export interface ActivityItem {
  id: string;
  who: string;
  what: string;
  metadata: string | null;
  time: string;
}

export interface RequestItem {
  id: string;
  org: string;
  type: string;
  meta: string | null;
  status: string;
  createdAt: string;
}

export const DashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>("/admin/dashboard/stats");
  },

  async listActivity(limit = 10): Promise<ActivityItem[]> {
    return apiClient.get<ActivityItem[]>(`/admin/dashboard/activity?limit=${limit}`);
  },

  async listRequests(status = "pending"): Promise<RequestItem[]> {
    return apiClient.get<RequestItem[]>(`/admin/dashboard/requests?status=${status}`);
  },
};