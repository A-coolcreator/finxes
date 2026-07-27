import { useEffect, useMemo, useState } from "react";
import Topbar from "./Topbar";
import Badge from "../admin/Badge";
import CaseContextBar from "./CaseContextBar";
import CaseWorkspaceShell from "./CaseWorkspaceShell";
import TablePagination, { paginateRows } from "./TablePagination";
import { useCaseContext } from "../../context/CaseContext";
import { formatInr } from "../../lib/formatters";
import { X } from "lucide-react"; // Import for clear button

const ROWS_PER_PAGE = 100;
const CHART_COLORS = ["#007AFF", "#34C759", "#5856D6", "#FF9500", "#AF52DE", "#FF2D55", "#5AC8FA", "#FFCC00"];
const APPLE_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

function SpendDonutChart({
  categories,
  total,
}: {
  categories: [string, number][];
  total: number;
}) {
  const circumference = 2 * Math.PI;
  let cumulative = 0;

  const segments = categories.map(([name, amount], index) => {
    const length = total > 0 ? (amount / total) * circumference : 0;
    const segment = {
      name,
      amount,
      color: CHART_COLORS[index % CHART_COLORS.length],
      dasharray: `${length} ${circumference - length}`,
      dashoffset: -cumulative,
    };
    cumulative += length;
    return segment;
  });

  return (
    <div className="relative flex h-[160px] w-[160px] shrink-0 items-center justify-center">
      <svg viewBox="-1.2 -1.2 2.4 2.4" className="h-full w-full -rotate-90" aria-hidden="true">
        {total > 0 ? (
          segments.map((seg) => (
            <circle
              key={seg.name}
              cx="0"
              cy="0"
              r="1"
              fill="none"
              stroke={seg.color}
              strokeWidth="0.4"
              strokeLinecap="round"
              strokeDasharray={seg.dasharray}
              strokeDashoffset={seg.dashoffset}
            />
          ))
        ) : (
          <circle cx="0" cy="0" r="1" fill="none" stroke="#E5E5EA" strokeWidth="0.4" />
        )}
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ fontFamily: APPLE_FONT }}
      >
        <span className="text-[12px] font-medium text-ink-muted uppercase tracking-tight">Total</span>
        <span className="text-[24px] font-bold text-ink">{formatInr(total, true)}</span>
      </div>
    </div>
  );
}

export default function DigitalSpendPage() {
  const { selectedCase, workspace, setPage } = useCaseContext();
  const [currentPage, setCurrentPage] = useState(1);
  // NEW: State to track which category is currently selected for filtering
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const digitalTxs = useMemo(() => (workspace?.enriched || []).filter(
    (tx) => tx.digital_category && tx.digital_category !== "UNCATEGORISED"
  ), [workspace?.enriched]);

  // Derived filtered transactions based on selection
  const filteredTxs = useMemo(() => {
    if (!filterCategory) return digitalTxs;
    return digitalTxs.filter(tx => 
      String(tx.digital_category || "").replace(/_/g, " ").toLowerCase() === filterCategory.toLowerCase()
    );
  }, [digitalTxs, filterCategory]);

  const grouped = digitalTxs.reduce<Record<string, number>>((acc, tx) => {
    const key = String(tx.digital_category || "OTHER").replace(/_/g, " ");
    acc[key] = (acc[key] || 0) + Number(tx.amount || 0);
    return acc;
  }, {});

  const categories = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const totalSpend = useMemo(
    () => categories.reduce((sum, [, amount]) => sum + amount, 0),
    [categories]
  );

  const pagedRows = paginateRows(filteredTxs, currentPage, ROWS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTxs.length, selectedCase?.id, filterCategory]);

  return (
    <div>
      <Topbar
        title="Digital Spend Analysis"
        subtitle={selectedCase ? `${selectedCase.caseNumber} · Digital merchant categories` : "Digital spend"}
      />
      <CaseWorkspaceShell onNavigate={setPage}>
        {workspace && (
          <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
            <CaseContextBar />
            
            <div className="flex flex-col gap-6">
              <div className="flex w-full flex-col rounded-xl border border-line bg-surface p-6 shadow-card">
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-[15px] font-semibold text-ink">Spend by category</h2>
                    {filterCategory && (
                        <button 
                            onClick={() => setFilterCategory(null)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                        >
                            <X size={12} /> Clear Filter: {filterCategory}
                        </button>
                    )}
                </div>
                
                <div className="mt-6 flex flex-1 items-center justify-start gap-12">
                  <SpendDonutChart categories={categories} total={totalSpend} />
                  
                  <div
                    className="grid min-w-0 flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-4"
                    style={{ fontFamily: APPLE_FONT }}
                  >
                    {categories.length === 0 ? (
                      <p className="col-span-full text-[13px] font-medium text-ink-muted">No categorized spend yet</p>
                    ) : (
                      categories.map(([name, amount], index) => (
                        <div 
                            key={name} 
                            className={`flex flex-col min-w-0 gap-0.5 cursor-pointer group p-1.5 rounded-lg transition-colors ${filterCategory === name ? 'bg-paper ring-1 ring-line' : 'hover:bg-paper/50'}`}
                            onClick={() => setFilterCategory(name === filterCategory ? null : name)}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className={`truncate text-[13px] font-medium transition-colors ${filterCategory === name ? 'text-blue-600' : 'text-ink'} capitalize`}>
                                {name.toLowerCase()}
                            </span>
                          </div>
                          <div className="pl-4 text-[11px] text-ink-muted">
                            {formatInr(amount, true)} • {totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0}%
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full overflow-hidden rounded-xl border border-line bg-surface shadow-card">
                <div className="px-4 py-3 border-b border-line-soft bg-paper/30 flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-ink-muted uppercase tracking-wider">
                        {filterCategory ? `Showing ${filterCategory} Transactions` : "All Categorized Transactions"}
                    </span>
                    <span className="text-[11px] text-ink-faint font-mono">{filteredTxs.length} items</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-line-soft bg-paper/60">
                        {["Date", "Merchant / narration", "Category", "Amount", "Risk"].map((h) => (
                          <th key={h} className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-soft">
                      {pagedRows.map((tx, index) => (
                        <tr key={`${tx.id}-${index}`} className="hover:bg-paper/50 transition-colors">
                          <td className="whitespace-nowrap px-4 py-3 text-[13px] text-ink-muted font-mono">{String(tx.date || "").slice(0, 10)}</td>
                          <td className="max-w-[300px] truncate px-4 py-3 text-[13px] font-medium text-ink">{tx.description}</td>
                          <td className="px-4 py-3 text-[13px] text-ink-muted capitalize">{String(tx.digital_category || "").replace(/_/g, " ").toLowerCase()}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-[13px] font-semibold text-ink">{formatInr(Number(tx.amount || 0))}</td>
                          <td className="px-4 py-3">
                            <Badge tone={tx.digital_risk_level === "CRITICAL" || tx.digital_risk_level === "HIGH" ? "red" : tx.digital_risk_level === "MEDIUM" ? "amber" : "green"}>
                              {tx.digital_risk_level || "LOW"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePagination totalItems={filteredTxs.length} currentPage={currentPage} rowsPerPage={ROWS_PER_PAGE} onPageChange={setCurrentPage} />
              </div>
            </div>
          </div>
        )}
      </CaseWorkspaceShell>
    </div>
  );
}