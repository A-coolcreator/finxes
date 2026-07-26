import { useState, useEffect } from "react";
import { Building2, Users, ShieldAlert, FolderKanban, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Topbar from "./Topbar";
import StatCard from "./StatCard";
import Badge from "./Badge";
import { DashboardService, type DashboardStats, type ActivityItem, type RequestItem } from "../../services/adminService";

const services = [
  { name: "Ingestion pipeline", status: "Operational" },
  { name: "Fund-flow graph engine", status: "Operational" },
  { name: "OCR & document parsing", status: "Operational" },
  { name: "Alerting & webhooks", status: "Degraded" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [approvals, setApprovals] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsData, activityData, approvalsData] = await Promise.all([
          DashboardService.getStats(),
          DashboardService.listActivity(10),
          DashboardService.listRequests("pending"),
        ]);
        setStats(statsData);
        setActivity(activityData);
        setApprovals(approvalsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div>
      <Topbar title="Dashboard" subtitle="Platform-wide overview across all tenants" />

      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-200" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>
            ))
          ) : stats ? (
            <>
              <StatCard
                icon={Building2}
                label="Active tenants"
                value={formatNumber(stats.activeTenants)}
                delta="+4 this month"
                deltaTone="up"
              />
              <StatCard
                icon={Users}
                label="Total users"
                value={formatNumber(stats.totalUsers)}
                delta="+62 this month"
                deltaTone="up"
              />
              <StatCard
                icon={FolderKanban}
                label="Cases under investigation"
                value={formatNumber(stats.casesCount)}
                delta="+18 this week"
                deltaTone="up"
              />
              <StatCard
                icon={ShieldAlert}
                label="Flagged transactions (24h)"
                value={formatNumber(stats.flaggedTransactions)}
                delta="-6% vs yesterday"
                deltaTone="down"
              />
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Activity feed */}
          <div className="xl:col-span-2 rounded-xl border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <h2 className="font-display text-[15.5px] font-semibold text-ink">Platform activity</h2>
              <button className="text-[12.5px] font-medium text-forensic-500 hover:text-forensic-600">View all</button>
            </div>
            <ul className="divide-y divide-line-soft">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-200" />
                    <div className="min-w-0 flex-1">
                      <div className="h-4 w-48 bg-gray-200 rounded mb-1" />
                    </div>
                    <span className="shrink-0 h-3 w-16 bg-gray-200 rounded" />
                  </li>
                ))
              ) : activity.length === 0 ? (
                <li className="px-5 py-10 text-center text-[13px] text-ink-faint">
                  No recent activity
                </li>
              ) : (
                activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-forensic-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] text-ink">
                        <span className="font-semibold">{a.who}</span> {a.what}
                      </p>
                    </div>
                    <span className="shrink-0 text-[12px] text-ink-faint whitespace-nowrap">{a.time}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* System health */}
          <div className="rounded-xl border border-line bg-surface shadow-card">
            <div className="border-b border-line-soft px-5 py-4">
              <h2 className="font-display text-[15.5px] font-semibold text-ink">System health</h2>
            </div>
            <ul className="divide-y divide-line-soft">
              {services.map((s) => (
                <li key={s.name} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-[13.5px] text-ink">{s.name}</span>
                  {s.status === "Operational" ? (
                    <Badge tone="green">Operational</Badge>
                  ) : (
                    <Badge tone="amber">Degraded</Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pending approvals */}
        <div className="rounded-xl border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
            <h2 className="font-display text-[15.5px] font-semibold text-ink">Pending approvals</h2>
            <span className="text-[12.5px] text-ink-faint">{approvals.length} awaiting review</span>
          </div>
          {loading ? (
            <div className="divide-y divide-line-soft">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-gray-200" />
                    <div className="space-y-1">
                      <div className="h-4 w-40 bg-gray-200 rounded" />
                      <div className="h-3 w-32 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="h-7 w-16 bg-gray-200 rounded" />
                    <div className="h-7 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : approvals.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-ink-faint">
              No pending approvals
            </div>
          ) : (
            <ul className="divide-y divide-line-soft">
              {approvals.map((ap) => (
                <li key={ap.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                      <Clock size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold text-ink">{ap.org}</p>
                      <p className="truncate text-[12.5px] text-ink-muted">
                        {ap.type} · {ap.meta}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-medium text-ink-muted hover:bg-paper transition-colors">
                      Decline
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg bg-forensic-500 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-forensic-600 transition-colors">
                      <CheckCircle2 size={13} />
                      Approve
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <a href="#" className="flex items-center gap-1.5 text-[13px] font-medium text-forensic-500 hover:text-forensic-600 w-fit">
          View full platform report
          <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
}