# Requirements Document

## Introduction

This specification defines the requirements for integrating real data into the Admin pages (UsersPage and TenantsPage) within the finexis_UI_Updated application. The feature replaces hardcoded mock data with live data from the backend SQLite database, exposing CRUD operations via FastAPI endpoints and a TypeScript service layer.

## Glossary

- **AdminSystem**: The React-based admin interface in finexis_UI_Updated/src/components/admin/
- **BackendAPI**: FastAPI application serving at backend/api/index.py
- **Database**: SQLite database at backend/data/finexis.sqlite
- **UserService**: TypeScript service module for user data operations
- **TenantService**: TypeScript service module for tenant data operations
- **UserRow**: Interface representing a single user record displayed in UsersPage
- **Tenant**: Interface representing a single tenant record displayed in TenantsPage

## Requirements

### Requirement 1: User Data Schema

**User Story:** As an admin, I want to view and manage system users so that I can control access to the platform.

#### Acceptance Criteria

1. WHEN an admin requests the user list, THE AdminSystem SHALL display users with the following fields:
   - id (UUID primary key)
   - name (full name, required)
   - email (email address, required, unique)
   - tenantId (foreign key to tenants table)
   - role (Super admin | Tenant admin | Investigator | Analyst | Viewer)
   - status (Active | Invited | Suspended)
   - lastActiveAt (ISO 8601 timestamp or null)
   - createdAt (ISO 8601 timestamp)
   - updatedAt (ISO 8601 timestamp)

2. THE Database SHALL store user records in a SQLite table named `admin_users` with the schema:
   ```sql
   CREATE TABLE IF NOT EXISTS admin_users (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT NOT NULL UNIQUE,
     tenant_id TEXT,
     role TEXT NOT NULL DEFAULT 'Viewer',
     status TEXT NOT NULL DEFAULT 'Invited',
     last_active_at TEXT,
     created_at TEXT NOT NULL,
     updated_at TEXT NOT NULL,
     FOREIGN KEY(tenant_id) REFERENCES admin_tenants(id)
   );
   ```

3. WHERE pagination is requested, THE UserService SHALL return users with limit and offset parameters.

4. WHERE search is requested, THE UserService SHALL filter users by name, email, or tenant name using case-insensitive partial matching.

### Requirement 2: Tenant Data Schema

**User Story:** As an admin, I want to view and manage tenant organizations so that I can provision and monitor workspaces.

#### Acceptance Criteria

1. WHEN an admin requests the tenant list, THE AdminSystem SHALL display tenants with the following fields:
   - id (UUID primary key)
   - name (organization name, required)
   - segment (Law enforcement | Banking & compliance | Fraud investigations | Regulatory | Other)
   - plan (Enterprise | Team | Trial)
   - seatsUsed (integer count of active users)
   - seatsLimit (integer maximum seats)
   - status (Active | Trial | Suspended)
   - region (AWS region code, e.g., ap-south-1)
   - createdAt (ISO 8601 timestamp)
   - updatedAt (ISO 8601 timestamp)

2. THE Database SHALL store tenant records in a SQLite table named `admin_tenants` with the schema:
   ```sql
   CREATE TABLE IF NOT EXISTS admin_tenants (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     segment TEXT NOT NULL,
     plan TEXT NOT NULL DEFAULT 'Trial',
     seats_used INTEGER NOT NULL DEFAULT 0,
     seats_limit INTEGER NOT NULL DEFAULT 10,
     status TEXT NOT NULL DEFAULT 'Trial',
     region TEXT NOT NULL DEFAULT 'ap-south-1',
     created_at TEXT NOT NULL,
     updated_at TEXT NOT NULL
   );
   ```

3. THE seats_used value SHALL be automatically calculated as the count of users with matching tenant_id and status IN ('Active', 'Invited').

### Requirement 3: User CRUD API Endpoints

**User Story:** As an admin, I want to create, read, update, and delete user accounts so that I can maintain the user directory.

#### Acceptance Criteria

1. WHEN a GET request is received at `/api/admin/users`, THE BackendAPI SHALL return a JSON array of user objects with optional query parameters:
   - `?status=` filter by status (Active | Invited | Suspended)
   - `?role=` filter by role
   - `?tenant_id=` filter by tenant
   - `?search=` search term for name/email/tenant matching
   - `?limit=` pagination limit (default 50)
   - `?offset=` pagination offset (default 0)

2. WHEN a GET request is received at `/api/admin/users/{id}`, THE BackendAPI SHALL return a single user object or 404 if not found.

3. WHEN a POST request is received at `/api/admin/users` with JSON body, THE BackendAPI SHALL create a new user record and return the created object with HTTP 201.

4. WHEN a PATCH request is received at `/api/admin/users/{id}` with JSON body containing partial fields, THE BackendAPI SHALL update only the provided fields and return the updated object.

5. WHEN a DELETE request is received at `/api/admin/users/{id}`, THE BackendAPI SHALL remove the user record and return HTTP 204.

### Requirement 4: Tenant CRUD API Endpoints

**User Story:** As an admin, I want to create, read, update, and delete tenant organizations so that I can manage platform access.

#### Acceptance Criteria

1. WHEN a GET request is received at `/api/admin/tenants`, THE BackendAPI SHALL return a JSON array of tenant objects with optional query parameters:
   - `?status=` filter by status (Active | Trial | Suspended)
   - `?plan=` filter by plan (Enterprise | Team | Trial)
   - `?search=` search term for name/segment matching
   - `?limit=` pagination limit (default 50)
   - `?offset=` pagination offset (default 0)

2. WHEN a GET request is received at `/api/admin/tenants/{id}`, THE BackendAPI SHALL return a single tenant object or 404 if not found.

3. WHEN a POST request is received at `/api/admin/tenants` with JSON body, THE BackendAPI SHALL create a new tenant record and return the created object with HTTP 201.

4. WHEN a PATCH request is received at `/api/admin/tenants/{id}` with JSON body, THE BackendAPI SHALL update only the provided fields and return the updated object.

5. WHEN a DELETE request is received at `/api/admin/tenants/{id}`, THE BackendAPI SHALL return HTTP 405 (tenants cannot be deleted, only archived).

6. WHERE a tenant status is updated to Suspended, THE BackendAPI SHALL automatically suspend all users belonging to that tenant by setting their status to Suspended.

### Requirement 5: TypeScript Service Layer

**User Story:** As a frontend developer, I want a typed service layer so that I can fetch admin data with type safety.

#### Acceptance Criteria

1. THE UserService SHALL export the following functions with corresponding return types:
   ```typescript
   interface UserListParams {
     status?: UserStatus;
     role?: UserRole;
     tenantId?: string;
     search?: string;
     limit?: number;
     offset?: number;
   }

   interface UserListResponse {
     data: UserRow[];
     total: number;
     limit: number;
     offset: number;
   }

   function listUsers(params: UserListParams): Promise<UserListResponse>;
   function getUser(id: string): Promise<UserRow | null>;
   function createUser(data: Omit<UserRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRow>;
   function updateUser(id: string, data: Partial<UserRow>): Promise<UserRow | null>;
   function deleteUser(id: string): Promise<boolean>;
   ```

2. THE TenantService SHALL export the following functions:
   ```typescript
   interface TenantListParams {
     status?: TenantStatus;
     plan?: TenantPlan;
     search?: string;
     limit?: number;
     offset?: number;
   }

   interface TenantListResponse {
     data: Tenant[];
     total: number;
     limit: number;
     offset: number;
   }

   function listTenants(params: TenantListParams): Promise<TenantListResponse>;
   function getTenant(id: string): Promise<Tenant | null>;
   function createTenant(data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant>;
   function updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant | null>;
   ```

3. WHERE API requests fail, THE services SHALL throw typed errors with status codes and messages for component error handling.

### Requirement 6: Component Integration

**User Story:** As an admin user, I want the UsersPage and TenantsPage to display real data with proper loading and error states.

#### Acceptance Criteria

1. WHEN the UsersPage mounts, THE component SHALL fetch user data using UserService.listUsers() and display a loading skeleton until data arrives.

2. WHEN user data fetch fails, THE UsersPage SHALL display an error message with a retry button.

3. WHEN search input changes, THE UsersPage SHALL debounce API calls with 300ms delay and update the filtered list.

4. WHEN role or status filter buttons are clicked, THE UsersPage SHALL refetch data with appropriate query parameters.

5. WHEN the Invite user button is clicked, THE UsersPage SHALL open a modal form that POSTs to UserService.createUser() and refreshes the list.

6. THE UsersPage SHALL calculate initials from the user name for avatar display (first character of first and last name, uppercase).

7. THE TenantsPage SHALL implement the same loading, error, and filtering patterns for tenant data.

8. THE TenantsPage SHALL display seats as `${seats_used} / ${seats_limit}` format and highlight when seats_used >= seats_limit.

### Requirement 7: Data Seeding

**User Story:** As a developer, I want the database to populate with initial sample data so that the admin pages are functional on first run.

#### Acceptance Criteria

1. WHERE the admin_users table is empty on startup, THE BackendAPI SHALL seed the table with the following users:
   - Rhea Sharma (Super admin, FinExis Internal)
   - Arjun Nair (Tenant admin, Ashoka State Police)
   - Divya Menon (Investigator, Northbridge Bank)
   - Kabir Malhotra (Analyst, Vertex Fraud Unit)
   - Sanya Iyer (Viewer, RBI Liaison Office)
   - Farhan Qureshi (Investigator, Meridian Cyber Cell)
   - Priya Deshmukh (Tenant admin, Suraksha Cyber Cell)

2. WHERE the admin_tenants table is empty on startup, THE BackendAPI SHALL seed the table with the following tenants:
   - Ashoka State Police (Law enforcement, Enterprise, 38/40 seats)
   - Northbridge Bank (Banking & compliance, Enterprise, 112/150 seats)
   - Vertex Fraud Unit (Fraud investigations, Team, 18/20 seats)
   - RBI Liaison Office (Regulatory, Enterprise, 9/25 seats)
   - Meridian Cyber Cell (Law enforcement, Team, 24/25 seats)
   - Suraksha Cyber Cell (Law enforcement, Trial, 6/10 seats)

3. THE seed data SHALL set last_active_at to null for invited users and ISO timestamps for active users.

## Technical Constraints

1. All API endpoints SHALL implement CORS to allow requests from the finexis_UI_Updated origin.

2. All datetime fields SHALL use ISO 8601 format without timezone (UTC implied).

3. UUID generation SHALL use `UUID-${timestamp}` format matching existing patterns in db.js.

4. All CRUD operations SHALL be synchronous (DatabaseSync API) and complete within 100ms.