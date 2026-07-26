  import {
    FolderKanban,
    FileSpreadsheet,
    ArrowLeftRight,
    ShieldAlert,
    FileText,
    Sparkles,
    UploadCloud,
    FilePlus2,
    FolderOpen,
    DatabaseZap,
  } from "lucide-react";
  import Topbar from "./Topbar";
  import StatCard from "../admin/StatCard";
  import Badge from "../admin/Badge";
  import { useCaseContext } from "../../context/CaseContext";
  import { mapCaseToDashboardRow } from "../../lib/caseAnalytics";

  export default function DashboardPage() {
    const { cases, casesLoading, openCase, setPage } = useCaseContext();
    const recentCases = cases.slice(0, 6).map(mapCaseToDashboardRow);
    const activeCount = cases.filter((record) => record.status !== "CLOSED").length;
    const totalTransactions = cases.reduce((sum, record) => sum + (record.triggerCount || 0), 0);
    const highRisk = cases.filter((record) => (record.triggerCount || 0) >= 10).length;

    return (
      <div>
        <Topbar title="Dashboard" subtitle="Welcome back — here's what's happening across your cases" />

        <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
          <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
            <StatCard icon={FolderKanban} label="Active cases" value={String(activeCount)} delta="from backend" deltaTone="neutral" />
            <StatCard icon={FileSpreadsheet} label="Cases loaded" value={String(cases.length)} delta="SQLite API" deltaTone="neutral" />
            <StatCard icon={ArrowLeftRight} label="Transactions indexed" value={totalTransactions.toLocaleString()} delta="trigger counts" deltaTone="neutral" />
            <StatCard icon={ShieldAlert} label="High activity cases" value={String(highRisk)} delta="10+ txns" deltaTone="down" />
            <StatCard icon={FileText} label="Reports generated" value="—" delta="coming soon" deltaTone="neutral" />
            <StatCard icon={Sparkles} label="Backend status" value="Live" delta="/api connected" deltaTone="up" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button onClick={() => setPage("create-case")} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 shadow-card hover:border-forensic-300 transition-colors text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forensic-50 text-forensic-600"><FilePlus2 size={16} /></span>
              <span className="text-[13.5px] font-semibold text-ink">Create new case</span>
            </button>
            <button onClick={() => setPage("case-manager")} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 shadow-card hover:border-forensic-300 transition-colors text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forensic-50 text-forensic-600"><FolderOpen size={16} /></span>
              <span className="text-[13.5px] font-semibold text-ink">Open recent case</span>
            </button>
            <button onClick={() => recentCases[0] && openCase(recentCases[0].id, "transaction-intelligence")} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 shadow-card hover:border-forensic-300 transition-colors text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forensic-50 text-forensic-600"><UploadCloud size={16} /></span>
              <span className="text-[13.5px] font-semibold text-ink">Analyze transactions</span>
            </button>
            <button onClick={() => setPage("fund-flow")} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 shadow-card hover:border-forensic-300 transition-colors text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forensic-50 text-forensic-600"><DatabaseZap size={16} /></span>
              <span className="text-[13.5px] font-semibold text-ink">Fund flow map</span>
            </button>
          </div>

          <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <h2 className="font-display text-[15.5px] font-semibold text-ink">Recent cases</h2>
              <button onClick={() => setPage("case-manager")} className="text-[12.5px] font-medium text-forensic-500 hover:text-forensic-600">View all</button>
            </div>
            {casesLoading ? (
              <div className="px-5 py-10 text-center text-[13px] text-ink-muted">Loading cases from backend…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line-soft bg-paper/60">
                      <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Case</th>
                      <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Status</th>
                      <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Risk</th>
                      <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Transactions</th>
                      <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {recentCases.map((c) => (
                      <tr key={c.id} onClick={() => openCase(c.id, "case-overview")} className="hover:bg-paper/50 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5">
                          <p className="text-[13.5px] font-semibold text-ink">{c.name}</p>
                          <p className="text-[12px] text-ink-faint">{c.num}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          {c.status === "Active" && <Badge tone="green">Active</Badge>}
                          {c.status === "Review" && <Badge tone="amber">In review</Badge>}
                          {c.status === "Closed" && <Badge tone="gray">Closed</Badge>}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge tone={c.risk >= 75 ? "red" : c.risk >= 45 ? "amber" : "green"}>{c.risk}/100</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-ink-muted font-mono">{c.txns}</td>
                        <td className="px-5 py-3.5 text-[12.5px] text-ink-faint">{c.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-xl border border-forensic-100 bg-forensic-50 p-5">
              <Megaphone size={18} className="text-forensic-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13.5px] font-semibold text-forensic-700">Backend connected</p>
                <p className="mt-1 text-[12.5px] text-forensic-600/80">Investigator pages now load cases, persons, and transactions from the Express API and run the same rule engine as the legacy HTML frontend.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-5 shadow-card">
              <GraduationCap size={18} className="text-ink-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-[13.5px] font-semibold text-ink">Getting started</p>
                <p className="mt-1 text-[12.5px] text-ink-muted">Select a case to unlock transaction intelligence, fund flow, crypto, mule scoring, and findings pages.</p>
                <button onClick={() => setPage("case-manager")} className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-forensic-500 hover:text-forensic-600">
                  Open case manager <ArrowUpRight size={12} />
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    );
  }
