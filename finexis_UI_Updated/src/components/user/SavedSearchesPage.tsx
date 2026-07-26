import Topbar from "./Topbar";
import CaseWorkspaceShell from "./CaseWorkspaceShell";
import { useCaseContext } from "../../context/CaseContext";

export default function SavedSearchesPage() {
  const { workspace, setPage } = useCaseContext();
  const saved = (workspace?.findings || []).slice(0, 6).map((finding) => ({
    name: finding.title,
    scope: "Current case",
    results: finding.txns,
    alert: finding.severity === "Critical" || finding.severity === "High",
  }));

  return (
    <div>
      <Topbar title="Saved Searches" subtitle="Rule hits saved from the current case workspace" />
      <CaseWorkspaceShell onNavigate={setPage}>
        {workspace && (
          <div className="px-5 py-6 lg:px-8 lg:py-8">
            <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line-soft bg-paper/60">
                    {["Search", "Scope", "Results", "Alert"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {saved.map((item) => (
                    <tr key={item.name}>
                      <td className="px-4 py-3 text-[13px] font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-[13px]">{item.scope}</td>
                      <td className="px-4 py-3 text-[13px]">{item.results}</td>
                      <td className="px-4 py-3 text-[13px]">{item.alert ? "Yes" : "No"}</td>
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
