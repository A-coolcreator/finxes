import { useState, useEffect } from "react";
import { Search, Plus, ChevronDown, MoreHorizontal, Building2, AlertCircle } from "lucide-react";
import Topbar from "./Topbar";
import Badge from "./Badge";
import { TenantService, type TenantRow, type TenantStatus, type TenantPlan } from "../../services/adminService";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<TenantPlan | "">("");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "">("");
  const [total, setTotal] = useState(0);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TenantService.list({
        search: query || undefined,
        plan: planFilter || undefined,
        status: statusFilter || undefined,
      });
      setTenants(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTenants();
    }, 300);
    return () => clearTimeout(timer);
  }, [query, planFilter, statusFilter]);

  const formatCreated = (date: string): string => {
    const d = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const isAtLimit = (used: number, limit: number) => used >= limit;

  return (
    <div>
      <Topbar title="Tenants" subtitle="Every organisation provisioned on FinExis" />

      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex flex-1 items-center gap-2.5 max-w-md">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5">
              <Search size={15} className="text-ink-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tenants…"
                className="w-full bg-transparent text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
            <button
              onClick={() => setPlanFilter(planFilter ? "" : "Enterprise")}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors ${
                planFilter
                  ? "bg-forensic-500 border-forensic-500 text-white"
                  : "border-line bg-surface text-ink-muted hover:bg-paper"
              }`}
            >
              Plan
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
            Add tenant
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={fetchTenants}
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
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Tenant</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Plan</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Seats</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Status</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Region</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Created</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {loading ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gray-200" />
                          <div className="space-y-1">
                            <div className="h-3 w-32 bg-gray-200 rounded" />
                            <div className="h-3 w-24 bg-gray-200 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><div className="h-5 w-20 bg-gray-200 rounded" /></td>
                      <td className="px-5 py-3.5"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-5 py-3.5"><div className="h-5 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-5 py-3.5"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-5 py-3.5"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-5 py-3.5"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
                    </tr>
                  ))
                ) : tenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-ink-faint">
                      {query || planFilter || statusFilter ? "No tenants match your filters." : "No tenants found."}
                    </td>
                  </tr>
                ) : (
                  tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-paper/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forensic-50 text-forensic-600">
                            <Building2 size={14} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-semibold text-ink truncate">{t.name}</p>
                            <p className="text-[12px] text-ink-faint truncate">{t.segment}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {t.plan === "Enterprise" && <Badge tone="green">Enterprise</Badge>}
                        {t.plan === "Team" && <Badge tone="blue">Team</Badge>}
                        {t.plan === "Trial" && <Badge tone="amber">Trial</Badge>}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-[13px] whitespace-nowrap ${
                          isAtLimit(t.seatsUsed, t.seatsLimit)
                            ? "text-amber-600 font-medium"
                            : "text-ink-muted"
                        }`}
                      >
                        {t.seatsUsed} / {t.seatsLimit}
                        {isAtLimit(t.seatsUsed, t.seatsLimit) && (
                          <span className="ml-1 text-xs text-amber-600">(Full)</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {t.status === "Active" && <Badge tone="green">Active</Badge>}
                        {t.status === "Trial" && <Badge tone="amber">Trial</Badge>}
                        {t.status === "Suspended" && <Badge tone="red">Suspended</Badge>}
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-ink-faint whitespace-nowrap font-mono">
                        {t.region}
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-ink-faint whitespace-nowrap">
                        {formatCreated(t.createdAt)}
                      </td>
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
              Showing {tenants.length} of {total} tenants
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
                disabled={tenants.length >= total}
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