import Topbar from "./Topbar";
import CaseWorkspaceShell from "./CaseWorkspaceShell";
import { useCaseContext } from "../../context/CaseContext";

export default function ReportsPage() {
  const { selectedCase, workspace, setPage } = useCaseContext();
  const reports = workspace
    ? [
        { name: `${selectedCase?.caseNumber} — Transaction summary`, size: `${workspace.enriched.length} txns` },
        { name: `${selectedCase?.caseNumber} — Findings export`, size: `${workspace.findings.length} findings` },
        { name: `${selectedCase?.caseNumber} — Fund flow map`, size: `${workspace.fundFlow.edges.length} edges` },
      ]
    : [];

  return (
    <div>
      <Topbar title="Reports" subtitle="Derived exports from loaded case workspace" />
      <CaseWorkspaceShell onNavigate={setPage}>
        {workspace && (
          <div className="px-5 py-6 lg:px-8 lg:py-8">
            <div className="rounded-xl border border-line bg-surface shadow-card">
              <ul className="divide-y divide-line-soft">
                {reports.map((report) => (
                  <li key={report.name} className="flex items-center justify-between px-5 py-4">
                    <span className="text-[13px] font-medium text-ink">{report.name}</span>
                    <span className="text-[12px] text-ink-faint">{report.size}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-[12.5px] text-ink-muted">PDF export endpoints are not implemented in the backend yet; this view summarizes data already loaded from the API.</p>
          </div>
        )}
      </CaseWorkspaceShell>
    </div>
  );
}
