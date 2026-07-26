import { UploadCloud } from "lucide-react";
import Topbar from "./Topbar";
import Badge from "../admin/Badge";
import CaseContextBar from "./CaseContextBar";
import CaseWorkspaceShell from "./CaseWorkspaceShell";
import { useCaseContext } from "../../context/CaseContext";

export default function EvidenceLockerPage() {
  const { selectedCase, workspace, setPage } = useCaseContext();
  const files = workspace?.evidenceFiles || [];

  return (
    <div>
      <Topbar title="Evidence Locker" subtitle={selectedCase ? `${selectedCase.caseNumber} · Case persons / uploaded statements` : "Evidence"} />
      <CaseWorkspaceShell onNavigate={setPage}>
        {workspace && (
          <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
            <CaseContextBar />
            <div className="rounded-xl border-2 border-dashed border-line bg-surface px-6 py-8 text-center">
              <UploadCloud size={22} className="mx-auto text-forensic-500" />
              <p className="mt-2 text-[13px] font-medium text-ink">Evidence is derived from persons uploaded via POST /api/cases/:id/documents</p>
            </div>
            <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line-soft bg-paper/60">
                    {["File", "Category", "Uploaded", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {files.map((file) => (
                    <tr key={file.name}>
                      <td className="px-4 py-3 text-[13px] font-medium">{file.name}</td>
                      <td className="px-4 py-3 text-[13px]">{file.category}</td>
                      <td className="px-4 py-3 text-[13px]">{file.on}</td>
                      <td className="px-4 py-3"><Badge tone="green">{file.status}</Badge></td>
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
