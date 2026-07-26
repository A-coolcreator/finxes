import Topbar from "./Topbar";
import Badge from "../admin/Badge";
import CaseContextBar from "./CaseContextBar";
import CaseWorkspaceShell from "./CaseWorkspaceShell";
import { useCaseContext } from "../../context/CaseContext";

export default function UpiIntelligencePage() {
  const { selectedCase, workspace, setPage } = useCaseContext();

  return (
    <div>
      <Topbar title="UPI Intelligence" subtitle={selectedCase ? `${selectedCase.caseNumber} · VPA network analysis` : "UPI"} />
      <CaseWorkspaceShell onNavigate={setPage}>
        {workspace && (
          <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
            <CaseContextBar />
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
              {workspace.upiCards.map((c) => (
                <div key={c.label} className="rounded-xl border border-line bg-surface p-3.5 shadow-card text-center">
                  <p className="font-display text-[16px] font-semibold text-ink">{c.value}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{c.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line-soft bg-paper/60">
                    {["Date", "Amount", "UPI ID", "Merchant", "Ref", "Risk", "Beneficiary"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {workspace.upiRows.map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-[13px]">{row.date}</td>
                      <td className="px-4 py-3 text-[13px] font-semibold">{row.amount}</td>
                      <td className="px-4 py-3 text-[13px] font-mono">{row.upi}</td>
                      <td className="px-4 py-3 text-[13px]">{row.merchant}</td>
                      <td className="px-4 py-3 text-[13px] font-mono">{row.ref}</td>
                      <td className="px-4 py-3"><Badge tone={row.risk === "High" ? "red" : row.risk === "Medium" ? "amber" : "green"}>{row.risk}</Badge></td>
                      <td className="px-4 py-3 text-[13px]">{row.beneficiary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CaseWorkspaceShell>
    </div>
  );
}
