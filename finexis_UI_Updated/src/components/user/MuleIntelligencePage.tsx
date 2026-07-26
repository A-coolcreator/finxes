import Topbar from "./Topbar";
import Badge from "../admin/Badge";
import CaseContextBar from "./CaseContextBar";
import CaseWorkspaceShell from "./CaseWorkspaceShell";
import { useCaseContext } from "../../context/CaseContext";

export default function MuleIntelligencePage() {
  const { selectedCase, workspace, setPage } = useCaseContext();

  return (
    <div>
      <Topbar title="Mule Intelligence" subtitle={selectedCase ? `${selectedCase.caseNumber} · Mule network scoring` : "Mule intelligence"} />
      <CaseWorkspaceShell onNavigate={setPage}>
        {workspace && (
          <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
            <CaseContextBar />
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-3.5">
              {workspace.muleCards.map((c) => (
                <div key={c.label} className="rounded-xl border border-line bg-surface p-4 shadow-card">
                  <p className="font-display text-[18px] font-semibold text-ink">{c.value}</p>
                  <p className="mt-1 text-[11px] text-ink-muted">{c.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line-soft bg-paper/60">
                    {["Detection", "Evidence", "Confidence", "Status", "Amount", "Date"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {workspace.muleDetections.length ? workspace.muleDetections.map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-[13px] font-medium">{row.detection}</td>
                      <td className="px-4 py-3 text-[13px] text-ink-muted">{row.evidence}</td>
                      <td className="px-4 py-3 text-[13px]">{row.confidence}%</td>
                      <td className="px-4 py-3"><Badge tone={row.status === "Confirmed" ? "red" : "amber"}>{row.status}</Badge></td>
                      <td className="px-4 py-3 text-[13px] font-semibold">{row.amount}</td>
                      <td className="px-4 py-3 text-[13px]">{row.date}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-[13px] text-ink-muted">No mule patterns detected yet for this case.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CaseWorkspaceShell>
    </div>
  );
}
