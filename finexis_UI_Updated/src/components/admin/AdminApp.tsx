import { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardPage from "./DashboardPage";
import UsersPage from "./UsersPage";
import TenantsPage from "./TenantsPage";
import AuditLogsPage from "./AuditLogsPage";
import HealthPage from "./HealthPage";
import SettingsPage from "./SettingsPage";

export type AdminPage = "dashboard" | "tenants" | "users" | "audit" | "health" | "settings";

export default function AdminApp({ onSignOut }: { onSignOut?: () => void }) {
  const [page, setPage] = useState<AdminPage>("dashboard");

  return (
    <div className="min-h-screen bg-paper flex">
      <Sidebar page={page} onNavigate={setPage} onSignOut={onSignOut} />
      <main className="flex-1 min-w-0">
        {page === "dashboard" && <DashboardPage />}
        {page === "tenants" && <TenantsPage />}
        {page === "users" && <UsersPage />}
        {page === "audit" && <AuditLogsPage />}
        {page === "health" && <HealthPage />}
        {page === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}
