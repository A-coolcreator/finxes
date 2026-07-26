import Topbar from "./Topbar";
import Badge from "../admin/Badge";
import CaseContextBar from "./CaseContextBar";
import CaseWorkspaceShell from "./CaseWorkspaceShell";
import { useCaseContext } from "../../context/CaseContext";

export default function CryptoIntelligencePage() {
  const { selectedCase, workspace, setPage } = useCaseContext();

  return (
    <div>
      <Topbar title="Crypto Intelligence" subtitle={selectedCase ? `${selectedCase.caseNumber} · Exchange exposure` : "Crypto"} />
      <CaseWorkspaceShell onNavigate={setPage}>
        {workspace && (
          <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
            <CaseContextBar />
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
              {workspace.cryptoCards.map((c) => (
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
                    {["Date", "Exchange", "Amount", "Direction", "Method", "Risk", "Reason"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {workspace.cryptoRows.length ? workspace.cryptoRows.map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-[13px]">{row.date}</td>
                      <td className="px-4 py-3 text-[13px]">{row.exchange}</td>
                      <td className="px-4 py-3 text-[13px] font-semibold">{row.amount}</td>
                      <td className="px-4 py-3 text-[13px]">{row.direction}</td>
                      <td className="px-4 py-3 text-[13px]">{row.method}</td>
                      <td className="px-4 py-3"><Badge tone={row.risk === "High" ? "red" : row.risk === "Medium" ? "amber" : "green"}>{row.risk}</Badge></td>
                      <td className="px-4 py-3 text-[13px] text-ink-muted">{row.reason}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-[13px] text-ink-muted">No crypto-related transactions detected in this case yet.</td></tr>
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
