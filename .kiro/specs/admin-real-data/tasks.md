# Implementation Plan: Admin Real Data Integration

## Overview

This plan integrates real data into the Admin pages by adding database tables, API endpoints, and a TypeScript service layer. The implementation follows the existing patterns in db.js for database operations and FastAPI for API endpoints.

## Tasks

- [ ] 1. Add database schema and seed data for admin_users and admin_tenants
  - [ ] 1.1 Add CREATE TABLE statements for admin_users and admin_tenants in backend/db.js
    - Add admin_users table with id, name, email, tenant_id, role, status, last_active_at, created_at, updated_at
    - Add admin_tenants table with id, name, segment, plan, seats_used, seats_limit, status, region, created_at, updated_at
    - Add foreign key constraint from admin_users.tenant_id to admin_tenants.id
    - _Requirements: 1.2, 2.2_

  - [ ] 1.2 Add helper functions for row-to-object mapping in backend/db.js
    - Add rowToUser function to map user database rows to UserRow objects
    - Add rowToTenant function to map tenant database rows to Tenant objects
    - _Requirements: 1.1, 2.1_

  - [ ] 1.3 Add CRUD helper functions in backend/db.js
    - Add listUsers function with optional filters (status, role, tenant_id, search, limit, offset)
    - Add getUserById, createUser, updateUser, deleteUser functions
    - Add listTenants function with optional filters (status, plan, search, limit, offset)
    - Add getTenantById, createTenant, updateTenant functions
    - _Requirements: 1.4, 2.3, 2.4_

  - [ ] 1.4 Add data seeding functions in backend/db.js
    - Add seedAdminTenants function with 7 tenant records from requirements
    - Add seedAdminUsers function with 7 user records from requirements
    - Add automatic seats_used calculation for tenants
    - _Requirements: 7.1, 7.2_

  - [ ] 1.5 Export new functions from backend/db.js
    - Export all user and tenant CRUD functions
    - Export seed functions for use by API layer
    - _Requirements: 1.3, 1.4, 2.3, 2.4_

- [ ] 2. Add FastAPI endpoints for admin users and tenants
  - [ ] 2.1 Add GET /api/admin/users endpoint
    - Implement query parameter handling (status, role, tenant_id, search, limit, offset)
    - Return JSON array of user objects with pagination metadata
    - _Requirements: 3.1_

  - [ ] 2.2 Add GET /api/admin/users/{id}, POST /api/admin/users, PATCH /api/admin/users/{id}, DELETE /api/admin/users/{id}
    - Implement single user retrieval by UUID
    - Implement user creation with validation
    - Implement partial update for user fields
    - Implement user deletion with cascade to related records
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [ ] 2.3 Add GET /api/admin/tenants endpoint
    - Implement query parameter handling (status, plan, search, limit, offset)
    - Return JSON array of tenant objects with seats_used calculated
    - _Requirements: 4.1_

  - [ ] 2.4 Add GET /api/admin/tenants/{id}, POST /api/admin/tenants, PATCH /api/admin/tenants/{id}
    - Implement single tenant retrieval by UUID
    - Implement tenant creation with validation
    - Implement partial update for tenant fields
    - Auto-suspend users when tenant status changes to Suspended
    - _Requirements: 4.2, 4.3, 4.4, 4.6_

  - [ ] 2.5 Wire up database seeding on startup
    - Import and call seed functions when tables are empty
    - _Requirements: 7.1, 7.2_

- [ ] 3. Create TypeScript service layer for admin operations
  - [ ] 3.1 Create finexis_UI_Updated/src/services/adminService.ts
    - Define UserRow interface with all required fields (id, name, email, tenantId, role, status, lastActiveAt, createdAt, updatedAt)
    - Define Tenant interface with all required fields (id, name, segment, plan, seatsUsed, seatsLimit, status, region, createdAt, updatedAt)
    - Define UserStatus, UserRole, TenantStatus, TenantPlan types
    - _Requirements: 5.1, 5.2_

  - [ ] 3.2 Implement UserService functions
    - Implement listUsers(params) with query parameters and pagination
    - Implement getUser(id), createUser(data), updateUser(id, data), deleteUser(id)
    - Add proper error handling with typed errors
    - _Requirements: 5.1, 5.3_

  - [ ] 3.3 Implement TenantService functions
    - Implement listTenants(params) with query parameters and pagination
    - Implement getTenant(id), createTenant(data), updateTenant(id, data)
    - Add proper error handling with typed errors
    - _Requirements: 5.2, 5.3_

- [ ] 4. Integrate UserService into UsersPage component
  - [ ] 4.1 Add loading state and skeleton to UsersPage
    - Add loading state variable
    - Create loading skeleton matching table structure
    - Show skeleton while initial fetch is in progress
    - _Requirements: 6.1_

  - [ ] 4.2 Replace USERS mock data with UserService.listUsers()
    - Import UserService from adminService.ts
    - Fetch users on mount with empty params
    - Store users in state and display filtered results
    - _Requirements: 6.1_

  - [ ] 4.3 Add error handling with retry button
    - Add error state variable
    - Display error message and retry button when fetch fails
    - Clear error and retry on button click
    - _Requirements: 6.2_

  - [ ] 4.4 Add debounced search for users
    - Implement useEffect with 300ms debounce for search input
    - Refetch users with search parameter on query change
    - _Requirements: 6.3_

  - [ ] 4.5 Add role and status filter buttons
    - Add filter state for role and status
    - Refetch users when filter buttons are clicked
    - Update filter button active state styling
    - _Requirements: 6.4_

  - [ ] 4.6 Add Invite user modal and CRUD operations
    - Create modal form with user fields
    - Call UserService.createUser() on form submit
    - Refresh user list after creation
    - Add UserService.updateUser() and deleteUser() handlers
    - _Requirements: 6.5_

  - [ ] 4.7 Calculate initials from user name for avatars
    - Add helper function to extract initials (first char of first and last name)
    - Convert to uppercase for display
    - _Requirements: 6.6_

- [ ] 5. Integrate TenantService into TenantsPage component
  - [ ] 5.1 Add loading state and skeleton to TenantsPage
    - Add loading state variable
    - Create loading skeleton matching table structure
    - Show skeleton while initial fetch is in progress
    - _Requirements: 7.7_

  - [ ] 5.2 Replace TENANTS mock data with TenantService.listTenants()
    - Import TenantService from adminService.ts
    - Fetch tenants on mount with empty params
    - Store tenants in state and display filtered results
    - _Requirements: 7.7_

  - [ ] 5.3 Add error handling with retry button to TenantsPage
    - Add error state variable
    - Display error message and retry button when fetch fails
    - Clear error and retry on button click
    - _Requirements: 7.7_

  - [ ] 5.4 Add debounced search and filter buttons to TenantsPage
    - Implement debounced search for tenant name/segment
    - Add plan and status filter buttons with refetch
    - _Requirements: 7.7_

  - [ ] 5.5 Display seats as formatted string with limit warning
    - Format seats as `${seatsUsed} / ${seatsLimit}`
    - Add warning styling when seatsUsed >= seatsLimit
    - _Requirements: 7.8_

- [ ] 6. Final checkpoint - Verify all integrations
  - [ ] 6.1 Ensure all tests pass
    - Verify backend db.js functions work correctly
    - Verify API endpoints return expected data
    - Verify frontend components load real data
    - Verify search and filtering works end-to-end
    - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The UUID format should match existing patterns: `UUID-${timestamp}`
- All datetime fields use ISO 8601 format (UTC implied)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "1.5"] },
    { "id": 3, "tasks": ["2.1", "2.2"] },
    { "id": 4, "tasks": ["2.3", "2.4", "2.5"] },
    { "id": 5, "tasks": ["3.1"] },
    { "id": 6, "tasks": ["3.2", "3.3"] },
    { "id": 7, "tasks": ["4.1", "4.2", "4.3"] },
    { "id": 8, "tasks": ["4.4", "4.5"] },
    { "id": 9, "tasks": ["4.6", "4.7"] },
    { "id": 10, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 11, "tasks": ["5.4", "5.5"] },
    { "id": 12, "tasks": ["6.1"] }
  ]
}
```