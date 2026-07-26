import { useState, useEffect} from "react";
import { Search, Plus, ChevronDown, MoreHorizontal, AlertCircle } from "lucide-react";
import Topbar from "./Topbar";
import Badge from "./Badge";
import { UserService, type UserRow, type UserStatus, type UserRole } from "../../services/adminService";

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await UserService.list({
        search: query || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsers(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [query, roleFilter, statusFilter]);

  const formatLastActive = (date: string | null): string => {
    if (!date) return "—";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <div>
      <Topbar title="Users" subtitle="Manage access across every tenant workspace" />

      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex flex-1 items-center gap-2.5 max-w-md">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5">
              <Search size={15} className="text-ink-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or tenant…"
                className="w-full bg-transparent text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
            <button
              onClick={() => setRoleFilter(roleFilter ? "" : "Super admin")}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors ${
                roleFilter
                  ? "bg-forensic-500 border-forensic-500 text-white"
                  : "border-line bg-surface text-ink-muted hover:bg-paper"
              }`}
            >
              Role
              <ChevronDown size={13} />
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter ? "" : "Active")}
              className={`hidden sm:flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors ${
                statusFilter
                  ? "bg-forensic-500 border-forensic-500 text-white"
                  : "border-line bg-surface text-ink-muted hover:bg-paper"
              }`}
            >
              Status
              <ChevronDown size={13} />
            </button>
          </div>

          <button className="flex items-center justify-center gap-1.5 rounded-lg bg-forensic-500 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-forensic-600 transition-colors">
            <Plus size={15} />
            Invite user
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={fetchUsers}
              className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line-soft bg-paper/60">
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">User</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Tenant</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Role</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Status</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Last active</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {loading ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200" />
                          <div className="space-y-1">
                            <div className="h-3 w-24 bg-gray-200 rounded" />
                            <div className="h-3 w-32 bg-gray-200 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><div className="h-3 w-28 bg-gray-200 rounded" /></td>
                      <td className="px-5 py-3.5"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
                      <td className="px-5 py-3.5"><div className="h-5 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-5 py-3.5"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-5 py-3.5"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-ink-faint">
                      {query || roleFilter || statusFilter ? "No users match your filters." : "No users found."}
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-paper/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forensic-100 text-[11.5px] font-semibold text-forensic-700">
                            {u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-semibold text-ink truncate">{u.name}</p>
                            <p className="text-[12px] text-ink-faint truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-ink-muted whitespace-nowrap">{u.tenant || "—"}</td>
                      <td className="px-5 py-3.5 text-[13px] text-ink whitespace-nowrap">{u.role}</td>
                      <td className="px-5 py-3.5">
                        {u.status === "Active" && <Badge tone="green">Active</Badge>}
                        {u.status === "Invited" && <Badge tone="blue">Invited</Badge>}
                        {u.status === "Suspended" && <Badge tone="red">Suspended</Badge>}
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-ink-faint whitespace-nowrap">{formatLastActive(u.lastActiveAt)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="text-ink-faint hover:text-ink transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-line-soft px-5 py-3.5">
            <p className="text-[12.5px] text-ink-faint">
              Showing {users.length} of {total} users
            </p>
            <div className="flex items-center gap-1.5">
              <button
                className="rounded-md border border-line px-2.5 py-1 text-[12.5px] text-ink-muted hover:bg-paper transition-colors disabled:opacity-40"
                disabled
              >
                Prev
              </button>
              <button
                className="rounded-md border border-line px-2.5 py-1 text-[12.5px] text-ink-muted hover:bg-paper transition-colors"
                disabled={users.length >= total}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}