import { Download } from "lucide-react";
import Topbar from "./Topbar";
import CaseContextBar from "./CaseContextBar";
import CaseWorkspaceShell from "./CaseWorkspaceShell";
import { useCaseContext } from "../../context/CaseContext";

export default function FundFlowPage() {
  const { selectedCase, workspace, setPage } = useCaseContext();

  return (
    <div>
      <Topbar title="Fund Flow Analysis" subtitle={selectedCase ? `${selectedCase.caseNumber} · Tracing money across accounts` : "Fund flow"} />
      <CaseWorkspaceShell onNavigate={setPage}>
        {workspace && (
          <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
            <CaseContextBar />
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
              {workspace.fundFlowCards.map((c) => (
                <div key={c.label} className="rounded-xl border border-line bg-surface p-4 shadow-card">
                  <p className="font-display text-[18px] font-semibold leading-none text-ink">{c.value}</p>
                  <p className="mt-1 text-[11px] text-ink-muted">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-line bg-surface shadow-card p-5">
              <h2 className="font-display text-[15.5px] font-semibold text-ink mb-4">Interactive fund flow graph</h2>
              <svg viewBox="0 0 480 220" className="w-full h-[300px]">
                {workspace.fundFlowEdges.map(([from, to], i) => {
                  const a = workspace.fundFlowNodes.find((n) => n.id === from)!;
                  const b = workspace.fundFlowNodes.find((n) => n.id === to)!;
                  if (!a || !b) return null;
                  return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#CFE6DF" strokeWidth="2" strokeDasharray="5 4" />;
                })}
                {workspace.fundFlowNodes.map((n) => (
                  <g key={n.id}>
                    <circle cx={n.x} cy={n.y} r={n.flag ? 16 : 13} fill={n.flag ? "#FDF3E7" : "#EAF4F1"} stroke={n.flag ? "#D97706" : "#0E6E5E"} strokeWidth="2" />
                    <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill={n.flag ? "#B8650A" : "#0A4F44"}>{n.id}</text>
                    <text x={n.x} y={n.y + 32} textAnchor="middle" fontSize="10" fill="#12161C" fontWeight="600">{n.label}</text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
              <div className="border-b border-line-soft px-5 py-4 flex items-center justify-between">
                <h2 className="font-display text-[15.5px] font-semibold text-ink">Fund flow chain</h2>
                <button className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[13px]"><Download size={14} />Export</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line-soft bg-paper/60">
                      {["From", "To", "Amount", "Date", "Method", "Ref"].map((h) => (
                        <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {workspace.fundFlowChain.map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-[13px]">{row.from}</td>
                        <td className="px-4 py-3 text-[13px]">{row.to}</td>
                        <td className="px-4 py-3 text-[13px] font-semibold">{row.amount}</td>
                        <td className="px-4 py-3 text-[13px]">{row.date}</td>
                        <td className="px-4 py-3 text-[13px]">{row.method}</td>
                        <td className="px-4 py-3 text-[13px] font-mono">{row.ref}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
              <h2 className="font-display text-[15px] font-semibold text-ink mb-3">Fund-flow alerts</h2>
              <ul className="space-y-2">
                {workspace.fundFlow.alerts.slice(0, 8).map((alert, index) => (
                  <li key={`${alert.id}-${index}`} className="text-[13px] text-ink-muted">{alert.details}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CaseWorkspaceShell>
    </div>
  );
}
