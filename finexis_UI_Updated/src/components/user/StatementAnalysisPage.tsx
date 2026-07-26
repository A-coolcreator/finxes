import { useEffect, useMemo, useState } from "react";
import { Search, FileSpreadsheet, Landmark, ArrowDownCircle, ArrowUpCircle, Calendar } from "lucide-react";
import Topbar from "./Topbar";
import Badge from "../admin/Badge";
import CaseContextBar from "./CaseContextBar";
import CaseWorkspaceShell from "./CaseWorkspaceShell";
import TablePagination, { paginateRows } from "./TablePagination";
import { useCaseContext } from "../../context/CaseContext";
import { formatInr } from "../../lib/formatters";

const ROWS_PER_PAGE = 100;

export default function StatementAnalysisPage() {
  const { selectedCase, workspace, persons, setPage } = useCaseContext();
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rows = workspace?.statementRows || [];
  const filtered = useMemo(
    () => rows.filter((row) => row.desc.toLowerCase().includes(query.toLowerCase()) || row.ref.toLowerCase().includes(query.toLowerCase())),
    [rows, query]
  );
  const pagedRows = paginateRows(filtered, currentPage, ROWS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, rows.length, selectedCase?.id]);

  return (
    <div>
      <Topbar title="Statement Analysis" subtitle={selectedCase ? `${selectedCase.caseNumber} · Line-by-line statement view` : "Statements"} />
      <CaseWorkspaceShell onNavigate={setPage}>
        {workspace && (
          <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
            <CaseContextBar />
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3.5">
              {[
                { icon: FileSpreadsheet, label: "Statements uploaded", value: String(persons.length) },
                { icon: Landmark, label: "Accounts", value: String(persons.length) },
                { icon: ArrowDownCircle, label: "Transactions", value: workspace.enriched.length.toLocaleString() },
                { icon: ArrowDownCircle, label: "Credits", value: formatInr(workspace.volume.metrics.total_credits, true) },
                { icon: ArrowUpCircle, label: "Debits", value: formatInr(workspace.volume.metrics.total_debits, true) },
                { icon: Calendar, label: "Counterparties", value: String(workspace.volume.metrics.unique_counterparties) },
                { icon: Landmark, label: "Net flow", value: formatInr(workspace.volume.metrics.net_flow, true) },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-line bg-surface p-4 shadow-card">
                  <m.icon size={15} className="text-forensic-500" />
                  <p className="mt-2 font-display text-[16.5px] font-semibold leading-none text-ink">{m.value}</p>
                  <p className="mt-1 text-[11px] text-ink-muted leading-snug">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 max-w-md">
              <Search size={15} className="text-ink-faint" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search statement lines…" className="w-full bg-transparent text-[13.5px] focus:outline-none" />
            </div>

            <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line-soft bg-paper/60">
                      {["Date", "Description", "Ref", "Debit", "Credit", "Balance", "Mode", "Risk"].map((h) => (
                        <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {pagedRows.map((row, index) => (
                      <tr key={`${row.ref}-${index}`} className="hover:bg-paper/50">
                        <td className="px-4 py-3 text-[12.5px] whitespace-nowrap">{row.date}</td>
                        <td className="px-4 py-3 text-[12.5px] max-w-[220px] truncate">{row.desc}</td>
                        <td className="px-4 py-3 text-[12.5px] font-mono">{row.ref}</td>
                        <td className="px-4 py-3 text-[12.5px]">{row.debit}</td>
                        <td className="px-4 py-3 text-[12.5px]">{row.credit}</td>
                        <td className="px-4 py-3 text-[12.5px]">{row.balance}</td>
                        <td className="px-4 py-3 text-[12.5px]">{row.mode}</td>
                        <td className="px-4 py-3"><Badge tone={row.risk === "High" ? "red" : row.risk === "Medium" ? "amber" : "green"}>{row.risk}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                totalItems={filtered.length}
                currentPage={currentPage}
                rowsPerPage={ROWS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </CaseWorkspaceShell>
    </div>
  );
}
