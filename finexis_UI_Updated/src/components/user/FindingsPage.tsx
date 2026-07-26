import { useState } from "react";
import Topbar from "./Topbar";
import Badge from "../admin/Badge";
import CaseContextBar from "./CaseContextBar";
import CaseWorkspaceShell from "./CaseWorkspaceShell";
import { useCaseContext } from "../../context/CaseContext";

export default function FindingsPage() {
  const { selectedCase, workspace, setPage } = useCaseContext();
  const findings = workspace?.findings || [];
  const [selected, setSelected] = useState(findings[0] || null);

  const severityCounts = {
    Critical: findings.filter((f) => f.severity === "Critical").length,
    High: findings.filter((f) => f.severity === "High").length,
    Medium: findings.filter((f) => f.severity === "Medium").length,
    Low: findings.filter((f) => f.severity === "Low").length,
  };

  return (
    <div>
      <Topbar title="Investigation Findings" subtitle={selectedCase ? `${selectedCase.caseNumber} · Rule engine findings` : "Findings"} />
      <CaseWorkspaceShell onNavigate={setPage}>
        {workspace && (
          <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
            <CaseContextBar />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {Object.entries(severityCounts).map(([label, value]) => (
                <div key={label} className="rounded-xl border border-line bg-surface p-4 shadow-card text-center">
                  <p className="font-display text-[20px] font-semibold text-ink">{value}</p>
                  <p className="mt-1 text-[11.5px] text-ink-muted">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 rounded-xl border border-line bg-surface shadow-card overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line-soft bg-paper/60">
                      {["Finding", "Severity", "Txns", "Confidence"].map((h) => (
                        <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {findings.map((finding) => (
                      <tr key={finding.id} onClick={() => setSelected(finding)} className={`cursor-pointer hover:bg-paper/50 ${selected?.id === finding.id ? "bg-forensic-50/40" : ""}`}>
                        <td className="px-4 py-3 text-[13px] font-medium">{finding.title}</td>
                        <td className="px-4 py-3"><Badge tone={finding.severity === "Critical" || finding.severity === "High" ? "red" : finding.severity === "Medium" ? "amber" : "gray"}>{finding.severity}</Badge></td>
                        <td className="px-4 py-3 text-[13px]">{finding.txns}</td>
                        <td className="px-4 py-3 text-[13px]">{finding.confidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl border border-line bg-surface shadow-card p-5">
                <h2 className="font-display text-[15px] font-semibold text-ink mb-3">Finding detail</h2>
                {selected ? (
                  <div className="space-y-3 text-[13px]">
                    <p className="font-semibold text-ink">{selected.title}</p>
                    <p className="text-ink-muted">{selected.evidence}</p>
                    <p className="text-ink-faint">{selected.txns} linked transactions · {selected.confidence}% confidence</p>
                  </div>
                ) : (
                  <p className="text-[13px] text-ink-muted">Select a finding to inspect rule evidence.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CaseWorkspaceShell>
    </div>
  );
}
