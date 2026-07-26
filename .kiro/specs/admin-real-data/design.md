# Design Document: admin-real-data

## Introduction

This document defines the technical design for integrating real data into the UsersPage and TenantsPage components. The feature establishes a complete backend-to-frontend data pipeline including database tables, API endpoints, service layer modules, and React component integration with proper loading states, error handling, and debounced search functionality.

## Glossary

- **AdminUser**: Database record representing an administrative user with id, name, email, tenant_id, role, status, last_active_at, created_at, updated_at
- **AdminTenant**: Database record representing a tenant organization with id, name, segment, plan, seats_used, seats_limit, status, region, created_at, updated_at
- **UserService**: TypeScript module providing user data access and manipulation functions
- **TenantService**: TypeScript module providing tenant data access and manipulation functions
- **Debounced Search**: Search pattern that delays API calls until user input pauses for a configurable duration (typically 300ms)
- **Row Mapper**: Function that converts database query results into typed application objects

## Architecture Overview

The feature follows a layered architecture pattern:

**Database Layer**: SQLite database with admin_users and admin_tenants tables storing all administrative data.

**API Layer**: Flask endpoints at /api/admin/users and /api/admin/tenants providing RESTful CRUD operations with JSON request/response payloads.

**Service Layer**: TypeScript modules (UserService, TenantService) abstracting data access with typed interfaces, error handling, and consistent return patterns.

**Presentation Layer**: React components using custom hooks (useUsers, useTenants) providing loading states, error handling, and debounced search integration.

## Database Schema Design

### admin_users Table

```sql
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    tenant_id INTEGER NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    last_active_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES admin_tenants(id)
);

CREATE INDEX idx_admin_users_tenant_id ON admin_users(tenant_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_status ON admin_users(status);
CREATE INDEX idx_admin_users_role ON admin_users(role);
```

### admin_tenants Table

```sql
CREATE TABLE admin_tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    segment TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'basic',
    seats_used INTEGER NOT NULL DEFAULT 0,
    seats_limit INTEGER NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'active',
    region TEXT NOT NULL DEFAULT 'us-east-1',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_admin_tenants_segment ON admin_tenants(segment);
CREATE INDEX idx_admin_tenants_status ON admin_tenants(status);
CREATE INDEX idx_admin_tenants_plan ON admin_tenants(plan);
```

### Row Mapper Functions

**Python Row Mappers** (backend/api/index.py):

```python
def map_admin_user_row(row: sqlite3.Row) -> dict:
    """Convert database row to AdminUser object."""
    return {
        'id': row['id'],
        'name': row['name'],
        'email': row['email'],
        'tenant_id': row['tenant_id'],
        'role': row['role'],
        'status': row['status'],
        'last_active_at': row['last_active_at'],
        'created_at': row['created_at'],
        'updated_at': row['updated_at']
    }

def map_admin_tenant_row(row: sqlite3.Row) -> dict:
    """Convert database row to AdminTenant object."""
    return {
        'id': row['id'],
        'name': row['name'],
        'segment': row['segment'],
        'plan': row['plan'],
        'seats_used': row['seats_used'],
        'seats_limit': row['seats_limit'],
        'status': row['status'],
        'region': row['region'],
        'created_at': row['created_at'],
        'updated_at': row['updated_at']
    }
```

**TypeScript Row Mappers** (frontend/src/services/userService.ts, tenantService.ts):

```typescript
interface AdminUser {
  id: number;
  name: string;
  email: string;
  tenant_id: number;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

interface AdminTenant {
  id: number;
  name: string;
  segment: 'enterprise' | 'business' | 'starter';
  plan: 'basic' | 'professional' | 'enterprise';
  seats_used: number;
  seats_limit: number;
  status: 'active' | 'inactive' | 'trial';
  region: string;
  created_at: string;
  updated_at: string;
}
```

## API Design

### User Endpoints (/api/admin/users)

#### GET /api/admin/users

Retrieves paginated list of users with optional filtering.

**Request Parameters**:
- page (optional, default: 1): Page number for pagination
- limit (optional, default: 20): Number of items per page
- search (optional): Search term for filtering by name or email
- status (optional): Filter by status
- role (optional): Filter by role
- tenant_id (optional): Filter by tenant

**Response Schema**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "tenant_id": 1,
      "role": "admin",
      "status": "active",
      "last_active_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

#### GET /api/admin/users/:id

Retrieves a single user by ID.

**Response Schema**: Same as user object above (no pagination wrapper).

#### POST /api/admin/users

Creates a new user.

**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "tenant_id": 1,
  "role": "user",
  "status": "active"
}
```

**Response**: Created user object with HTTP 201 status.

#### PUT /api/admin/users/:id

Updates an existing user.

**Request Body**: Any subset of user fields (partial update supported).

**Response**: Updated user object.

#### DELETE /api/admin/users/:id

Deletes a user by ID.

**Response**: Empty response with HTTP 204 status.

### Tenant Endpoints (/api/admin/tenants)

#### GET /api/admin/tenants

Retrieves paginated list of tenants with optional filtering.

**Request Parameters**:
- page (optional, default: 1): Page number for pagination
- limit (optional, default: 20): Number of items per page
- search (optional): Search term for filtering by name
- status (optional): Filter by status
- segment (optional): Filter by segment
- plan (optional): Filter by plan

**Response Schema**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Acme Corporation",
      "segment": "enterprise",
      "plan": "professional",
      "seats_used": 45,
      "seats_limit": 100,
      "status": "active",
      "region": "us-east-1",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "total_pages": 2
  }
}
```

#### GET /api/admin/tenants/:id

Retrieves a single tenant by ID.

**Response**: Same as tenant object above (no pagination wrapper).

#### POST /api/admin/tenants

Creates a new tenant.

**Request Body**:
```json
{
  "name": "Tech Startup Inc",
  "segment": "business",
  "plan": "basic",
  "seats_limit": 20,
  "region": "eu-west-1"
}
```

**Response**: Created tenant object with HTTP 201 status.

#### PUT /api/admin/tenants/:id

Updates an existing tenant.

**Request Body**: Any subset of tenant fields (partial update supported).

**Response**: Updated tenant object.

#### DELETE /api/admin/tenants/:id

Deletes a tenant by ID.

**Response**: Empty response with HTTP 204 status.

### Error Response Schema

All endpoints use consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "email": "Email already exists"
    }
  }
}
```

**Common Error Codes**:
- VALIDATION_ERROR: Request validation failed
- NOT_FOUND: Resource not found
- CONFLICT: Resource already exists
- INTERNAL_ERROR: Server error

## Service Layer Design

### UserService Module (frontend/src/services/userService.ts)

```typescript
import { AdminUser } from '../types';

interface UserFilters {
  search?: string;
  status?: AdminUser['status'];
  role?: AdminUser['role'];
  tenant_id?: number;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface UserService {
  getUsers(filters?: UserFilters, pagination?: PaginationParams): Promise<PaginatedResponse<AdminUser>>;
  
  getUserById(id: number): Promise<AdminUser>;
  
  createUser(user: Partial<AdminUser>): Promise<AdminUser>;
  
  updateUser(id: number, user: Partial<AdminUser>): Promise<AdminUser>;
  
  deleteUser(id: number): Promise<void>;
}

class UserServiceImpl implements UserService {
  private baseUrl = '/api/admin/users';
  
  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }
  
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }
    
    if (response.status === 204) {
      return undefined as T;
    }
    
    return response.json();
  }
  
  async getUsers(filters?: UserFilters, pagination?: PaginationParams): Promise<PaginatedResponse<AdminUser>> {
    const params: Record<string, unknown> = { ...filters, ...pagination };
    const queryString = this.buildQueryString(params);
    const endpoint = queryString ? `?${queryString}` : '';
    return this.request<PaginatedResponse<AdminUser>>('GET', endpoint);
  }
  
  async getUserById(id: number): Promise<AdminUser> {
    return this.request<AdminUser>('GET', `/${id}`);
  }
  
  async createUser(user: Partial<AdminUser>): Promise<AdminUser> {
    return this.request<AdminUser>('POST', '', user);
  }
  
  async updateUser(id: number, user: Partial<AdminUser>): Promise<AdminUser> {
    return this.request<AdminUser>('PUT', `/${id}`, user);
  }
  
  async deleteUser(id: number): Promise<void> {
    await this.request<void>('DELETE', `/${id}`);
  }
}

export const userService = new UserServiceImpl();
export type { UserService, UserFilters, PaginationParams, PaginatedResponse };
```

### TenantService Module (frontend/src/services/tenantService.ts)

```typescript
import { AdminTenant } from '../types';

interface TenantFilters {
  search?: string;
  status?: AdminTenant['status'];
  segment?: AdminTenant['segment'];
  plan?: AdminTenant['plan'];
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface TenantService {
  getTenants(filters?: TenantFilters, pagination?: PaginationParams): Promise<PaginatedResponse<AdminTenant>>;
  
  getTenantById(id: number): Promise<AdminTenant>;
  
  createTenant(tenant: Partial<AdminTenant>): Promise<AdminTenant>;
  
  updateTenant(id: number, tenant: Partial<AdminTenant>): Promise<AdminTenant>;
  
  deleteTenant(id: number): Promise<void>;
}

class TenantServiceImpl implements TenantService {
  private baseUrl = '/api/admin/tenants';
  
  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }
  
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }
    
    if (response.status === 204) {
      return undefined as T;
    }
    
    return response.json();
  }
  
  async getTenants(filters?: TenantFilters, pagination?: PaginationParams): Promise<PaginatedResponse<AdminTenant>> {
    const params: Record<string, unknown> = { ...filters, ...pagination };
    const queryString = this.buildQueryString(params);
    const endpoint = queryString ? `?${queryString}` : '';
    return this.request<PaginatedResponse<AdminTenant>>('GET', endpoint);
  }
  
  async getTenantById(id: number): Promise<AdminTenant> {
    return this.request<AdminTenant>('GET', `/${id}`);
  }
  
  async createTenant(tenant: Partial<AdminTenant>): Promise<AdminTenant> {
    return this.request<AdminTenant>('POST', '', tenant);
  }
  
  async updateTenant(id: number, tenant: Partial<AdminTenant>): Promise<AdminTenant> {
    return this.request<AdminTenant>('PUT', `/${id}`, tenant);
  }
  
  async deleteTenant(id: number): Promise<void> {
    await this.request<void>('DELETE', `/${id}`);
  }
}

export const tenantService = new TenantServiceImpl();
export type { TenantService, TenantFilters, PaginationParams, PaginatedResponse };
```

## Component Integration Design

### React Hook Pattern

#### useUsers Hook (frontend/src/hooks/useUsers.ts)

```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';
import { userService, UserFilters, PaginationParams } from '../services/userService';
import { AdminUser } from '../types';

interface UseUsersOptions {
  initialFilters?: UserFilters;
  initialPage?: number;
  debounceMs?: number;
}

interface UseUsersReturn {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createUser: (user: Partial<AdminUser>) => Promise<void>;
  updateUser: (id: number, user: Partial<AdminUser>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const {
    initialFilters = {},
    initialPage = 1,
    debounceMs = 300,
  } = options;
  
  const [filters, setFiltersState] = useState<UserFilters>(initialFilters);
  const [page, setPageState] = useState(initialPage);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.getUsers(filters, { page, limit: 20 });
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);
  
  useEffect(() => {
    const timer = setTimeout(fetchUsers, debounceMs);
    return () => clearTimeout(timer);
  }, [fetchUsers, debounceMs]);
  
  const setFilters = useCallback((newFilters: UserFilters) => {
    setFiltersState(newFilters);
    setPageState(1);
  }, []);
  
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);
  
  const createUser = useCallback(async (user: Partial<AdminUser>) => {
    await userService.createUser(user);
    await fetchUsers();
  }, [fetchUsers]);
  
  const updateUser = useCallback(async (id: number, user: Partial<AdminUser>) => {
    await userService.updateUser(id, user);
    await fetchUsers();
  }, [fetchUsers]);
  
  const deleteUser = useCallback(async (id: number) => {
    await userService.deleteUser(id);
    await fetchUsers();
  }, [fetchUsers]);
  
  return {
    users,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    setPage,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}
```

#### useTenants Hook (frontend/src/hooks/useTenants.ts)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { tenantService, TenantFilters, PaginationParams } from '../services/tenantService';
import { AdminTenant } from '../types';

interface UseTenantsOptions {
  initialFilters?: TenantFilters;
  initialPage?: number;
  debounceMs?: number;
}

interface UseTenantsReturn {
  tenants: AdminTenant[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  filters: TenantFilters;
  setFilters: (filters: TenantFilters) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createTenant: (tenant: Partial<AdminTenant>) => Promise<void>;
  updateTenant: (id: number, tenant: Partial<AdminTenant>) => Promise<void>;
  deleteTenant: (id: number) => Promise<void>;
}

export function useTenants(options: UseTenantsOptions = {}): UseTenantsReturn {
  const {
    initialFilters = {},
    initialPage = 1,
    debounceMs = 300,
  } = options;
  
  const [filters, setFiltersState] = useState<TenantFilters>(initialFilters);
  const [page, setPageState] = useState(initialPage);
  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  
  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tenantService.getTenants(filters, { page, limit: 20 });
      setTenants(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);
  
  useEffect(() => {
    const timer = setTimeout(fetchTenants, debounceMs);
    return () => clearTimeout(timer);
  }, [fetchTenants, debounceMs]);
  
  const setFilters = useCallback((newFilters: TenantFilters) => {
    setFiltersState(newFilters);
    setPageState(1);
  }, []);
  
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);
  
  const createTenant = useCallback(async (tenant: Partial<AdminTenant>) => {
    await tenantService.createTenant(tenant);
    await fetchTenants();
  }, [fetchTenants]);
  
  const updateTenant = useCallback(async (id: number, tenant: Partial<AdminTenant>) => {
    await tenantService.updateTenant(id, tenant);
    await fetchTenants();
  }, [fetchTenants]);
  
  const deleteTenant = useCallback(async (id: number) => {
    await tenantService.deleteTenant(id);
    await fetchTenants();
  }, [fetchTenants]);
  
  return {
    tenants,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    setPage,
    refetch: fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
  };
}
```

### Debounced Search Implementation

The debounced search is implemented within the useUsers and useTenants hooks using a combination of useEffect and setTimeout. The key pattern:

```typescript
useEffect(() => {
  const timer = setTimeout(fetchData, debounceMs);
  return () => clearTimeout(timer);
}, [fetchData, debounceMs]);
```

This pattern ensures:
- API calls are delayed until user input pauses for the specified duration (default 300ms)
- Previous pending requests are cancelled when filters change
- Loading state is properly managed during the debounce period

### Loading and Error State Patterns

All hooks follow consistent patterns for loading and error states:

**Loading State**: Set to true before API call, false after completion. Components display loading spinners or skeletons when loading is true.

**Error State**: Captures error messages from failed API calls. Components display error alerts with the error message and optional retry action.

**Empty State**: When loading is false and data array is empty, components display empty state messages.

## File Changes Summary

### Files Created

**Backend**:
- backend/api/admin_users.py: User CRUD endpoints and helpers
- backend/api/admin_tenants.py: Tenant CRUD endpoints and helpers

**Frontend**:
- frontend/src/types/admin.ts: TypeScript type definitions for AdminUser and AdminTenant
- frontend/src/services/userService.ts: UserService implementation
- frontend/src/services/tenantService.ts: TenantService implementation
- frontend/src/hooks/useUsers.ts: useUsers React hook
- frontend/src/hooks/useTenants.ts: useTenants React hook

### Files Modified

**Backend**:
- backend/api/index.py: Import admin endpoints, register blueprints, initialize tables
- backend/db.py: Add table initialization function

**Frontend**:
- frontend/src/pages/UsersPage.tsx: Integrate useUsers hook, replace mock data
- frontend/src/pages/TenantsPage.tsx: Integrate useTenants hook, replace mock data
- frontend/src/main.tsx or App.tsx: Import new hooks and services

## Data Seeding

### Seed Function Logic

The seed function creates initial admin data for development and testing:

```python
def seed_admin_data():
    """Seed admin_users and admin_tenants tables with initial data."""
    db = get_db()
    
    # Check if data already exists
    cursor = db.execute('SELECT COUNT(*) FROM admin_tenants')
    if cursor.fetchone()[0] > 0:
        return  # Data already seeded
    
    # Insert tenants
    tenants = [
        ('Acme Corporation', 'enterprise', 'professional', 150, 200, 'active', 'us-east-1'),
        ('Tech Startup Inc', 'business', 'basic', 5, 20, 'active', 'us-west-2'),
        ('Local Shop', 'starter', 'basic', 2, 5, 'active', 'eu-west-1'),
        ('Global Industries', 'enterprise', 'enterprise', 500, 1000, 'active', 'ap-southeast-1'),
    ]
    
    tenant_ids = []
    for tenant in tenants:
        cursor = db.execute(
            '''INSERT INTO admin_tenants 
               (name, segment, plan, seats_used, seats_limit, status, region) 
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            tenant
        )
        tenant_ids.append(cursor.lastrowid)
    
    # Insert users
    users = [
        ('John Doe', 'john@acme.com', tenant_ids[0], 'admin', 'active'),
        ('Jane Smith', 'jane@acme.com', tenant_ids[0], 'user', 'active'),
        ('Bob Wilson', 'bob@techstartup.com', tenant_ids[1], 'admin', 'active'),
        ('Alice Brown', 'alice@techstartup.com', tenant_ids[1], 'user', 'active'),
        ('Charlie Davis', 'charlie@localshop.com', tenant_ids[2], 'admin', 'active'),
        ('Diana Evans', 'diana@global.com', tenant_ids[3], 'admin', 'active'),
        ('Eric Foster', 'eric@global.com', tenant_ids[3], 'user', 'active'),
        ('Grace Hill', 'grace@global.com', tenant_ids[3], 'viewer', 'inactive'),
    ]
    
    for user in users:
        db.execute(
            '''INSERT INTO admin_users 
               (name, email, tenant_id, role, status) 
               VALUES (?, ?, ?, ?, ?)''',
            user
        )
    
    db.commit()
```

### Sample Data

**Tenants**:
| Name | Segment | Plan | Seats Used/Limit | Status | Region |
|------|---------|------|------------------|--------|--------|
| Acme Corporation | enterprise | professional | 150/200 | active | us-east-1 |
| Tech Startup Inc | business | basic | 5/20 | active | us-west-2 |
| Local Shop | starter | basic | 2/5 | active | eu-west-1 |
| Global Industries | enterprise | enterprise | 500/1000 | active | ap-southeast-1 |

**Users**:
| Name | Email | Tenant | Role | Status |
|------|-------|--------|------|--------|
| John Doe | john@acme.com | Acme Corporation | admin | active |
| Jane Smith | jane@acme.com | Acme Corporation | user | active |
| Bob Wilson | bob@techstartup.com | Tech Startup Inc | admin | active |
| Alice Brown | alice@techstartup.com | Tech Startup Inc | user | active |
| Charlie Davis | charlie@localshop.com | Local Shop | admin | active |
| Diana Evans | diana@global.com | Global Industries | admin | active |
| Eric Foster | eric@global.com | Global Industries | user | active |
| Grace Hill | grace@global.com | Global Industries | viewer | inactive |

### Seed Execution

The seed function is called during application startup:

```python
def init_db():
    """Initialize database tables and seed data."""
    create_tables()
    seed_admin_data()

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
```

## Correctness Properties

### Property 1: User List Round Trip

*For any* valid user list request with filters and pagination parameters, the API SHALL return a response where the data array contains users matching the specified filters, and the pagination metadata correctly reflects the total count relative to the requested limit.

**Validates: Requirements 4, 5**

### Property 2: Tenant List Round Trip

*For any* valid tenant list request with filters and pagination parameters, the API SHALL return a response where the data array contains tenants matching the specified filters, and the pagination metadata correctly reflects the total count relative to the requested limit.

**Validates: Requirements 4, 5**

### Property 3: User Service CRUD Invariance

*For any* AdminUser object, performing a create followed by retrieve SHALL return an object with all original fields preserved, and performing an update followed by retrieve SHALL return an object with all updated fields reflected.

**Validates: Requirements 3, 4**

### Property 4: Tenant Service CRUD Invariance

*For any* AdminTenant object, performing a create followed by retrieve SHALL return an object with all original fields preserved, and performing an update followed by retrieve SHALL return an object with all updated fields reflected.

**Validates: Requirements 3, 5**

### Property 5: Debounce Invariance

*For any* sequence of rapid filter changes within a debounce period, the useUsers and useTenants hooks SHALL only trigger exactly one API request after the debounce delay, and the final results SHALL reflect the most recent filter state.

**Validates: Requirements 5, 6**

### Property 6: Pagination Consistency

*For any* paginated API response, the relationship total = page × limit + remaining where remaining < limit SHALL hold true, ensuring consistent pagination behavior across all page sizes.

**Validates: Requirements 4, 5**