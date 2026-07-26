import { useMemo, useState } from "react";
import { Search, Plus, LayoutGrid, List, Trash2, FolderKanban } from "lucide-react"; // Updated import
import Topbar from "./Topbar";
import Badge from "../admin/Badge";
import { useCaseContext } from "../../context/CaseContext";
import { caseService } from "../../services/caseService";
import { formatDate, formatRelative } from "../../lib/formatters";

export default function CaseManagerPage() {
  const { cases, casesLoading, casesError, openCase, setPage, refreshCases } = useCaseContext();
  const [view, setView] = useState<"grid" | "list">("list");
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDeleteCase(caseId: string, caseName: string) {
    if (!window.confirm(`Delete case "${caseName}"? This cannot be undone.`)) return;

    setDeletingId(caseId);
    try {
      await caseService.deleteCase(caseId);
      await refreshCases();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete case");
    } finally {
      setDeletingId(null);
    }
  }

  const rows = useMemo(
    () =>
      cases.map((record) => ({
        id: record.id,
        num: record.caseNumber,
        name: record.title,
        risk: Math.min(100, Math.max(10, (record.triggerCount || 0) * 3 + 25)),
        investigator: "—",
        statements: 0,
        txns: String(record.triggerCount || 0),
        created: formatDate(record.createdAt),
        modified: formatRelative(record.updatedAt || record.createdAt),
        status:
          record.status === "CLOSED"
            ? ("Closed" as const)
            : record.status === "CRITICAL"
              ? ("Review" as const)
              : ("Active" as const),
        priority:
          record.triggerCount >= 20 ? ("High" as const) : record.triggerCount >= 5 ? ("Medium" as const) : ("Low" as const),
      })),
    [cases]
  );

  const filtered = useMemo(
    () =>
      rows.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.num.toLowerCase().includes(query.toLowerCase())
      ),
    [rows, query]
  );

  return (
    <div>
      <Topbar title="Case Manager" subtitle="All investigations across your workspace" />

      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
        {casesError && (
          <div className="rounded-lg border border-flag-200 bg-flag-50 px-4 py-3 text-[13px] text-flag-700">
            {casesError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex flex-1 items-center gap-2.5 max-w-2xl flex-wrap">
            <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5">
              <Search size={15} className="text-ink-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cases…"
                className="w-full bg-transparent text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-line bg-surface p-1">
              <button
                onClick={() => setView("list")}
                className={`rounded-md p-1.5 transition-colors ${view === "list" ? "bg-forensic-500 text-white" : "text-ink-faint hover:text-ink"}`}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setView("grid")}
                className={`rounded-md p-1.5 transition-colors ${view === "grid" ? "bg-forensic-500 text-white" : "text-ink-faint hover:text-ink"}`}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
            <button
              onClick={() => setPage("create-case")}
              className="flex items-center gap-1.5 rounded-lg bg-forensic-500 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-forensic-600 transition-colors"
            >
              <Plus size={15} />
              Create case
            </button>
          </div>
        </div>

        {casesLoading ? (
          <div className="rounded-xl border border-line bg-surface px-5 py-10 text-center text-[13.5px] text-ink-muted">
            Loading cases from backend…
          </div>
        ) : view === "list" ? (
          <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line-soft bg-paper/60">
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Case</th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Risk</th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Transactions</th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Modified</th>
                    <th className="px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-paper/50 transition-colors">
                      <td
                        className="px-5 py-3.5 cursor-pointer"
                        onClick={() => openCase(c.id, "case-overview")}
                      >
                        <p className="text-[13.5px] font-semibold text-ink">{c.name}</p>
                        <p className="text-[12px] text-ink-faint">{c.num}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={c.risk >= 75 ? "red" : c.risk >= 45 ? "amber" : "green"}>{c.risk}/100</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-ink-muted font-mono">{c.txns}</td>
                      <td className="px-5 py-3.5 text-[12.5px] text-ink-faint">{c.modified}</td>
                      <td className="px-5 py-3.5">
                        {c.status === "Active" && <Badge tone="green">Active</Badge>}
                        {c.status === "Review" && <Badge tone="amber">In review</Badge>}
                        {c.status === "Closed" && <Badge tone="gray">Closed</Badge>}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          disabled={deletingId === c.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteCase(c.id, c.name);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => openCase(c.id, "case-overview")}
                className="rounded-xl border border-line bg-surface p-5 shadow-card hover:border-forensic-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forensic-50 text-forensic-600">
                    <FolderKanban size={16} />
                  </span>
                  <Badge tone={c.risk >= 75 ? "red" : c.risk >= 45 ? "amber" : "green"}>{c.risk}/100</Badge>
                </div>
                <p className="mt-3.5 text-[14px] font-semibold text-ink leading-snug">{c.name}</p>
                <p className="text-[12px] text-ink-faint">{c.num}</p>
                <div className="mt-3.5 flex items-center justify-between text-[12px] text-ink-muted">
                  <span>{c.txns} txns</span>
                  <span>{c.modified}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}