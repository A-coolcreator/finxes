import {
  Landmark, FileSpreadsheet, ArrowLeftRight, ArrowDownCircle, ArrowUpCircle, Banknote, FileText, Hash, Clock,
} from "lucide-react";
import Topbar from "./Topbar";
import Badge from "../admin/Badge";
import DonutChart from "./DonutChart";
import CaseContextBar from "./CaseContextBar";
import CaseWorkspaceShell from "./CaseWorkspaceShell";
import { useCaseContext } from "../../context/CaseContext";
import { formatInr } from "../../lib/formatters";

export default function CaseOverviewPage() {
  const { selectedCase, workspace, persons, setPage } = useCaseContext();

  return (
    <div>
      <Topbar title="Case Overview" subtitle={selectedCase ? `${selectedCase.caseNumber} · ${selectedCase.title}` : "Case overview"} />
      <CaseWorkspaceShell onNavigate={setPage}>
        {workspace && selectedCase && (
          <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
            <CaseContextBar />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[
                { icon: Landmark, label: "Accounts involved", value: String(persons.length) },
                { icon: FileSpreadsheet, label: "Files uploaded", value: String(persons.length) },
                { icon: ArrowLeftRight, label: "Total net flow", value: formatInr(workspace.volume.metrics.net_flow, true) },
                { icon: ArrowDownCircle, label: "Total credits", value: formatInr(workspace.volume.metrics.total_credits, true) },
                { icon: ArrowUpCircle, label: "Total debits", value: formatInr(workspace.volume.metrics.total_debits, true) },
                { icon: Banknote, label: "Transactions", value: workspace.enriched.length.toLocaleString() },
                { icon: FileText, label: "Findings", value: String(workspace.findings.length) },
                { icon: ArrowLeftRight, label: "Trigger count", value: String(selectedCase.triggerCount || 0) },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-line bg-surface p-4 shadow-card">
                  <m.icon size={16} className="text-forensic-500" />
                  <p className="mt-2.5 font-display text-[19px] font-semibold leading-none text-ink">{m.value}</p>
                  <p className="mt-1 text-[11.5px] text-ink-muted">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-xl border border-line bg-surface shadow-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Hash size={15} className="text-forensic-500" />
                  <h2 className="font-display text-[15.5px] font-semibold text-ink">Entities tracked</h2>
                </div>
                <DonutChart segments={workspace.entitySegments} />
              </div>

              <div className="rounded-xl border border-line bg-surface shadow-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={15} className="text-forensic-500" />
                  <h2 className="font-display text-[15.5px] font-semibold text-ink">Timeline</h2>
                </div>
                <div className="flex items-end gap-3 h-40">
                  {workspace.timeline.map((t) => {
                    const max = Math.max(...workspace.timeline.map((x) => x.value), 1);
                    return (
                      <div key={t.month} className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex w-full flex-1 items-end">
                          <div className="w-full rounded-t bg-forensic-500/75" style={{ height: `${(t.value / max) * 100}%` }} />
                        </div>
                        <span className="text-[11px] text-ink-faint">{t.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface shadow-card p-5">
              <h2 className="font-display text-[15.5px] font-semibold text-ink mb-4">Top findings</h2>
              <ul className="space-y-3">
                {workspace.findings.slice(0, 5).map((finding) => (
                  <li key={finding.id} className="flex items-start justify-between gap-3 border-b border-line-soft pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-[13.5px] font-medium text-ink">{finding.title}</p>
                      <p className="text-[12px] text-ink-faint mt-1">{finding.evidence}</p>
                    </div>
                    <Badge tone={finding.severity === "Critical" || finding.severity === "High" ? "red" : finding.severity === "Medium" ? "amber" : "gray"}>
                      {finding.severity}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CaseWorkspaceShell>
    </div>
  );
}
