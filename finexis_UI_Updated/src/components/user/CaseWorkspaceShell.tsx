import type { ReactNode } from "react";
import { useCaseContext } from "../../context/CaseContext";
import type { UserPage } from "./UserApp";

export default function CaseWorkspaceShell({
  children,
  onNavigate,
}: {
  children: ReactNode;
  onNavigate: (page: UserPage) => void;
}) {
  const { selectedCaseId, workspaceLoading, workspaceError } = useCaseContext();

  if (!selectedCaseId) {
    return (
      <div className="px-5 py-16 lg:px-8 text-center">
        <p className="text-[15px] font-semibold text-ink">No case selected</p>
        <p className="mt-2 text-[13px] text-ink-muted">
          Open a case from the dashboard or case manager to load backend data.
        </p>
        <button
          onClick={() => onNavigate("case-manager")}
          className="mt-5 rounded-lg bg-forensic-500 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-forensic-600"
        >
          Go to Case Manager
        </button>
      </div>
    );
  }

  if (workspaceLoading) {
    return (
      <div className="px-5 py-16 lg:px-8 text-center text-[13.5px] text-ink-muted">
        Loading case data from backend…
      </div>
    );
  }

  if (workspaceError) {
    return (
      <div className="px-5 py-10 lg:px-8">
        <div className="rounded-lg border border-flag-200 bg-flag-50 px-4 py-3 text-[13px] text-flag-700">
          {workspaceError}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
