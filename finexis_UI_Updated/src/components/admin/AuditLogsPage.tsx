import { Search, ChevronDown, Download } from "lucide-react";
import Topbar from "./Topbar";
import Badge from "./Badge";

interface LogRow {
  time: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  status: "Success" | "Failed";
}

const LOGS: LogRow[] = [
  { time: "Jul 11, 09:42:11", actor: "rhea.sharma@finexis.io", action: "tenant.suspended", target: "RBI Liaison Office", ip: "103.22.14.8", status: "Success" },
  { time: "Jul 11, 09:12:03", actor: "arjun.nair@ashokapolice.gov.in", action: "case.exported", target: "CS-4471", ip: "182.64.9.201", status: "Success" },
  { time: "Jul 11, 08:55:47", actor: "system", action: "alert.threshold_triggered", target: "128 transactions", ip: "internal", status: "Success" },
  { time: "Jul 11, 08:30:19", actor: "kabir.m@vertexfraud.com", action: "auth.login", target: "—", ip: "45.112.8.4", status: "Failed" },
  { time: "Jul 11, 08:03:52", actor: "priya.d@surakshacyber.gov.in", action: "user.role_changed", target: "farhan.q@meridiancyber.in → Investigator", ip: "117.98.2.66", status: "Success" },
  { time: "Jul 10, 22:41:08", actor: "d.menon@northbridge-bank.com", action: "document.uploaded", target: "NCRP_export_batch_14.csv", ip: "203.192.4.11", status: "Success" },
  { time: "Jul 10, 21:15:33", actor: "s.iyer@rbi-liaison.gov.in", action: "auth.login", target: "—", ip: "77.81.3.90", status: "Failed" },
  { time: "Jul 10, 20:02:57", actor: "rhea.sharma@finexis.io", action: "api_key.generated", target: "prod-key-0091", ip: "103.22.14.8", status: "Success" },
];

export default function AuditLogsPage() {
  return (
    <div>
      <Topbar title="Audit Logs" subtitle="Every privileged action taken across the platform" />

      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex flex-1 items-center gap-2.5 max-w-lg">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5">
              <Search size={15} className="text-ink-faint" />
              <input
                placeholder="Search by actor, action, or target…"
                className="w-full bg-transparent text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2.5 text-[13px] font-medium text-ink-muted hover:bg-paper transition-colors">
              Action type
              <ChevronDown size={13} />
            </button>
            <button className="hidden sm:flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2.5 text-[13px] font-medium text-ink-muted hover:bg-paper transition-colors">
              Last 7 days
              <ChevronDown size={13} />
            </button>
          </div>

          <button className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-4 py-2.5 text-[13.5px] font-semibold text-ink hover:bg-paper transition-colors">
            <Download size={15} />
            Export CSV
          </button>
        </div>

        <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line-soft bg-paper/60">
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Timestamp</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Actor</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Action</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Target</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">IP address</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {LOGS.map((l, i) => (
                  <tr key={i} className="hover:bg-paper/50 transition-colors">
                    <td className="px-5 py-3.5 text-[12.5px] text-ink-muted whitespace-nowrap font-mono">{l.time}</td>
                    <td className="px-5 py-3.5 text-[13px] text-ink whitespace-nowrap">{l.actor}</td>
                    <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap">
                      <code className="rounded bg-paper px-1.5 py-0.5 text-[12px] text-forensic-700">{l.action}</code>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-ink-muted max-w-[220px] truncate">{l.target}</td>
                    <td className="px-5 py-3.5 text-[12.5px] text-ink-faint whitespace-nowrap font-mono">{l.ip}</td>
                    <td className="px-5 py-3.5">
                      {l.status === "Success" ? <Badge tone="green">Success</Badge> : <Badge tone="red">Failed</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-line-soft px-5 py-3.5">
            <p className="text-[12.5px] text-ink-faint">Showing {LOGS.length} of 4,208 events</p>
            <div className="flex items-center gap-1.5">
              <button className="rounded-md border border-line px-2.5 py-1 text-[12.5px] text-ink-muted hover:bg-paper transition-colors disabled:opacity-40" disabled>
                Prev
              </button>
              <button className="rounded-md border border-line px-2.5 py-1 text-[12.5px] text-ink-muted hover:bg-paper transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
