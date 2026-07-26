import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Activity,
  Gauge,
  Timer,
  Server,
  Database,
  Workflow,
  Webhook,
  ScanText,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import Topbar from "./Topbar";
import Badge from "./Badge";
import Sparkline from "./Sparkline";

type Status = "Operational" | "Degraded" | "Outage";

interface ServiceRow {
  name: string;
  icon: typeof Server;
  status: Status;
  uptime: string;
  latency: string;
  region: string;
  spark: number[];
}

const SERVICES: ServiceRow[] = [
  {
    name: "Ingestion pipeline",
    icon: Workflow,
    status: "Operational",
    uptime: "99.98%",
    latency: "142 ms",
    region: "ap-south-1",
    spark: [120, 130, 118, 140, 135, 128, 142, 138, 130, 142],
  },
  {
    name: "Fund-flow graph engine",
    icon: Activity,
    status: "Operational",
    uptime: "99.95%",
    latency: "310 ms",
    region: "ap-south-1",
    spark: [300, 320, 290, 340, 315, 305, 330, 310, 300, 310],
  },
  {
    name: "OCR & document parsing",
    icon: ScanText,
    status: "Operational",
    uptime: "99.91%",
    latency: "480 ms",
    region: "ap-south-1",
    spark: [460, 470, 490, 510, 470, 460, 480, 500, 470, 480],
  },
  {
    name: "Alerting & webhooks",
    icon: Webhook,
    status: "Degraded",
    uptime: "98.42%",
    latency: "1,120 ms",
    region: "ap-south-1",
    spark: [200, 240, 300, 600, 900, 1100, 980, 1050, 1180, 1120],
  },
  {
    name: "Primary database",
    icon: Database,
    status: "Operational",
    uptime: "99.99%",
    latency: "18 ms",
    region: "ap-south-1",
    spark: [16, 17, 19, 18, 20, 17, 18, 19, 18, 18],
  },
  {
    name: "Auth & SSO",
    icon: ShieldCheck,
    status: "Operational",
    uptime: "100.00%",
    latency: "64 ms",
    region: "ap-south-1",
    spark: [60, 62, 65, 63, 61, 64, 66, 62, 63, 64],
  },
];

const RESOURCES = [
  { name: "Ingestion workers", used: 68, unit: "CPU" },
  { name: "Graph engine nodes", used: 54, unit: "CPU" },
  { name: "Primary database", used: 41, unit: "Memory" },
  { name: "Document parsing queue", used: 82, unit: "Queue depth" },
];

const INCIDENTS = [
  {
    title: "Elevated latency on Alerting & webhooks",
    status: "Investigating",
    started: "Jul 11, 08:52 IST",
    detail: "Webhook delivery delays affecting 3 tenants. Root cause under investigation — likely queue backpressure after the 09:00 batch ingest.",
    tone: "amber" as const,
  },
  {
    title: "Fund-flow graph engine — degraded query performance",
    status: "Resolved",
    started: "Jul 8, 14:10 IST · 41 min",
    detail: "A misconfigured index caused slow graph traversal queries for large cases. Rolled back and re-indexed.",
    tone: "gray" as const,
  },
  {
    title: "Scheduled maintenance — primary database",
    status: "Completed",
    started: "Jul 3, 02:00 IST · 20 min",
    detail: "Routine version upgrade with failover. No customer impact expected or observed.",
    tone: "gray" as const,
  },
];

function ResourceBar({ name, used, unit }: { name: string; used: number; unit: string }) {
  const tone = used >= 80 ? "bg-flag-500" : used >= 60 ? "bg-amber-500" : "bg-forensic-500";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-ink">{name}</span>
        <span className="text-[12px] text-ink-faint">
          {unit} · {used}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-paper overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${used}%` }} />
      </div>
    </div>
  );
}

export default function HealthPage() {
  const [range, setRange] = useState("24 hours");
  const degradedCount = SERVICES.filter((s) => s.status !== "Operational").length;

  return (
    <div>
      <Topbar title="System Health" subtitle="Live status of every service backing the platform" />

      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
        {/* Status banner */}
        <div
          className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${
            degradedCount > 0 ? "border-amber-100 bg-amber-50" : "border-forensic-100 bg-forensic-50"
          }`}
        >
          {degradedCount > 0 ? (
            <AlertTriangle size={19} className="text-amber-500 shrink-0" />
          ) : (
            <CheckCircle2 size={19} className="text-forensic-600 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className={`text-[14px] font-semibold ${degradedCount > 0 ? "text-amber-600" : "text-forensic-700"}`}>
              {degradedCount > 0 ? `${degradedCount} service is experiencing degraded performance` : "All systems operational"}
            </p>
            <p className="text-[12.5px] text-ink-muted mt-0.5">Last checked 30 seconds ago · Auto-refreshing</p>
          </div>
          <button className="shrink-0 rounded-lg border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink hover:bg-paper transition-colors">
            Status page ↗
          </button>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forensic-50 text-forensic-600">
              <Gauge size={17} />
            </span>
            <p className="mt-3.5 font-display text-[26px] font-semibold leading-none text-ink">99.96%</p>
            <p className="mt-1.5 text-[13px] text-ink-muted">Platform uptime (30d)</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forensic-50 text-forensic-600">
              <Timer size={17} />
            </span>
            <p className="mt-3.5 font-display text-[26px] font-semibold leading-none text-ink">356 ms</p>
            <p className="mt-1.5 text-[13px] text-ink-muted">Avg API response time</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
              <Activity size={17} />
            </span>
            <p className="mt-3.5 font-display text-[26px] font-semibold leading-none text-ink">0.34%</p>
            <p className="mt-1.5 text-[13px] text-ink-muted">Error rate (24h)</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
              <AlertTriangle size={17} />
            </span>
            <p className="mt-3.5 font-display text-[26px] font-semibold leading-none text-ink">1</p>
            <p className="mt-1.5 text-[13px] text-ink-muted">Active incident</p>
          </div>
        </div>

        {/* Services table */}
        <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
            <h2 className="font-display text-[15.5px] font-semibold text-ink">Services</h2>
            <button
              onClick={() => setRange(range === "24 hours" ? "7 days" : "24 hours")}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-muted hover:bg-paper transition-colors"
            >
              {range}
              <ChevronDown size={13} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line-soft bg-paper/60">
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Service</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Status</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Uptime (30d)</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Latency</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Response trend</th>
                  <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {SERVICES.map((s) => (
                  <tr key={s.name} className="hover:bg-paper/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            s.status === "Operational" ? "bg-forensic-50 text-forensic-600" : "bg-amber-50 text-amber-500"
                          }`}
                        >
                          <s.icon size={14} />
                        </span>
                        <span className="text-[13.5px] font-semibold text-ink whitespace-nowrap">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {s.status === "Operational" && <Badge tone="green">Operational</Badge>}
                      {s.status === "Degraded" && <Badge tone="amber">Degraded</Badge>}
                      {s.status === "Outage" && <Badge tone="red">Outage</Badge>}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-ink-muted whitespace-nowrap">{s.uptime}</td>
                    <td className="px-5 py-3.5 text-[13px] text-ink-muted whitespace-nowrap font-mono">{s.latency}</td>
                    <td className="px-5 py-3.5">
                      <Sparkline
                        data={s.spark}
                        color={s.status === "Operational" ? "#0E6E5E" : "#D97706"}
                        fillColor={s.status === "Operational" ? "#EAF4F1" : "#FDF3E7"}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-[12.5px] text-ink-faint whitespace-nowrap font-mono">{s.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Resource utilisation */}
          <div className="xl:col-span-1 rounded-xl border border-line bg-surface shadow-card">
            <div className="border-b border-line-soft px-5 py-4">
              <h2 className="font-display text-[15.5px] font-semibold text-ink">Resource utilisation</h2>
            </div>
            <div className="px-5 py-5 space-y-5">
              {RESOURCES.map((r) => (
                <ResourceBar key={r.name} {...r} />
              ))}
            </div>
          </div>

          {/* Incident history */}
          <div className="xl:col-span-2 rounded-xl border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <h2 className="font-display text-[15.5px] font-semibold text-ink">Incident history</h2>
              <button className="text-[12.5px] font-medium text-forensic-500 hover:text-forensic-600">View all</button>
            </div>
            <ul className="divide-y divide-line-soft">
              {INCIDENTS.map((inc, i) => (
                <li key={i} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13.5px] font-semibold text-ink">{inc.title}</p>
                    {inc.tone === "amber" ? (
                      <Badge tone="amber">{inc.status}</Badge>
                    ) : (
                      <Badge tone="gray">{inc.status}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] text-ink-faint">{inc.started}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{inc.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
