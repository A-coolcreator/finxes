import { useEffect, useMemo, useState } from "react";
import { Search, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import Topbar from "./Topbar";
import CaseContextBar from "./CaseContextBar";
import CaseWorkspaceShell from "./CaseWorkspaceShell";
import DateRangePicker from "./DateRangePicker";
import MultiSelectDropdown from "./MultiSelectDropdown";
import TablePagination, { paginateRows } from "./TablePagination";
import { TransactionMetricsCards } from "./TransactionMetricsCards";
import { KeywordChipsBar } from "./KeywordChipsBar";
import Badge from "../admin/Badge";
import { useCaseContext } from "../../context/CaseContext";
import { 
  CHIP_DEFINITIONS, 
  type TransactionRow, 
  extractTxnDetails, 
  calculateRisk, 
  formatCurrency, 
  parseAmountNumber,
  parseCustomDate 
} from "../../utils/txnRules";

// Define chips to hide in this specific page (Transaction Intelligence)
const HIDDEN_CHIPS = [
  "Crypto P2P", "NBFC Payments", "Mobility & Rides", "Fuel & EV Charging",
  "Business B2B Payment", "Education Fees", "Escrow & Nodal", 
  "Self / Internal Transfer", "Govt Direct Benefit Transfer",
  "High Risk / STR", "Political Donation", "Neobanks", "Rent Payments",
  "Dividend Income", "Demat & Securities", "Real Estate & Stamp Duty",
  "Microfinance SFB", "Insurance Aggregators", "Wellness & Fitness",
  "Loan Apps", "Cash Deposit", "NBFC", "Mobility and rides", 
  "Escrue and nodal", "Polictical donation", "Insurence agrigator",
  "Realstate ans stamp dutiy", "Mictofinance sfb"
];

const TXN_TYPES = ["UPI", "IMPS", "RTGS", "NEFT", "NACH", "AEPS", "CASH_WITHDRAW", "CASH_DEPOSIT", "OTHER"];
const ROWS_PER_PAGE = 10;

export default function TransactionIntelligencePage() {
  const { selectedCase, workspace, persons, setPage, toggleTransactionFlag } = useCaseContext();
  
  // ── Filters State ─────────────────────────────────────────────────────────
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string>("all");
  const [drcrFilter, setDrcrFilter] = useState<"all" | "dr" | "cr">("all");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  const toggleChip = (chipId: string) =>
    setActiveChips((prev) => (prev.includes(chipId) ? prev.filter((x) => x !== chipId) : [...prev, chipId]));

  // Normalize incoming workspace rows into unified TransactionRow[]
  const rawRows: TransactionRow[] = useMemo(() => {
    const sourceArray = workspace?.transactionRows || workspace?.enriched || [];

    return sourceArray.map((row: any, idx: number) => {
      const desc = row.desc || row.description || row.narration || row.particulars || "—";
      const drCr =
        row.drCr ||
        row.type ||
        row.direction ||
        row.transactionType ||
        (row.isDebit ? "DR" : "CR") ||
        "DR";

      const date = row.date || row.txnDate || row.transactionDate || "—";
      let type = row.mode || row.txnType || row.type || "OTHER";
      
      // Split CASH into CASH_WITHDRAW (DR) and CASH_DEPOSIT (CR)
      if (String(type).toUpperCase() === "CASH") {
        type = drCr?.toLowerCase().startsWith("d") ? "CASH_WITHDRAW" : "CASH_DEPOSIT";
      }

      return {
        id: row.id || `txn-${idx}`,
        date,
        sortDate: row.sortDate || row.date,
        desc,
        amount: row.amount ?? 0,
        drCr,
        type: String(type).toUpperCase(),
        ref: row.ref || row.referenceNumber || row.utr || row.chqNo,
        balance: row.balance,
        personId: row.personId || row.person,
        personName: row.personName,
        risk: row.risk,
        flagged: Boolean(row.flagged),
        metaIfscCode: row.metaIfscCode || row.ifsc
      };
    });
  }, [workspace]);

  //filtering logic
const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rawRows.filter((row) => {
      // 1. Text Search
      if (q) {
        const text = `${row.desc} ${row.ref || ""} ${row.beneficiary || ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      // 2. Transaction Type Filter
      if (types.length) {
        // Handle "CASH" selector to match both CASH_WITHDRAW and CASH_DEPOSIT
        const hasCashType = types.includes("CASH");
        const hasWithdraw = types.includes("CASH_WITHDRAW");
        const hasDeposit = types.includes("CASH_DEPOSIT");
        
        let typeMatches = false;
        if (hasCashType) {
          typeMatches = row.type === "CASH_WITHDRAW" || row.type === "CASH_DEPOSIT";
        }
        if (hasWithdraw && row.type === "CASH_WITHDRAW") typeMatches = true;
        if (hasDeposit && row.type === "CASH_DEPOSIT") typeMatches = true;
        
        if (!typeMatches) return false;
      }

      // 3. Person / Entity Filter
      if (selectedPerson !== "all" && row.personId !== selectedPerson) return false;

      // 4. Debit / Credit Filter
      const isDebit = row.drCr?.toLowerCase().startsWith("d");
      if (drcrFilter === "dr" && !isDebit) return false;
      if (drcrFilter === "cr" && isDebit) return false;

      // 5. Date Range Filter
      if (dateFrom || dateTo) {
        const rowDate = parseCustomDate(row.sortDate || row.date);
        if (rowDate) {
          if (dateFrom && rowDate < dateFrom) return false;
          if (dateTo && rowDate > dateTo) return false;
        }
      }

      // 6. Pattern Lens Chips (Regex & Keyword match)
      if (activeChips.length > 0) {
        const descLower = (row.desc || "").toLowerCase();
        const matchesAnyChip = activeChips.some((chipId) => {
          const chipDef = CHIP_DEFINITIONS.find((c) => c.id === chipId);
          if (!chipDef) return false;
          return chipDef.regex
            ? chipDef.regex.test(row.desc || "")
            : chipDef.keywords.some((kw) => descLower.includes(kw.toLowerCase()));
        });
        if (!matchesAnyChip) return false;
      }

      // 7. Flagged Transactions Filter
      // We use == 1 or Number() to handle both boolean true and SQLite integer 1
      const isFlagged = Number(row.flagged) === 1 || row.flagged === true;
      if (showFlaggedOnly && !isFlagged) return false;

      return true;
    });
    // CRITICAL: Added showFlaggedOnly to the dependency array below
  }, [rawRows, query, types, selectedPerson, drcrFilter, dateFrom, dateTo, activeChips, showFlaggedOnly]);
  // Aggregate Metrics Computation
  const metrics = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    filtered.forEach((r) => {
      const isDebit = r.drCr?.toLowerCase().startsWith("d");
      const amt: number = parseAmountNumber(r.amount);
      if (isDebit) {
        totalDebit += amt;
      } else {
        totalCredit += amt;
      }
    });

    return {
      totalCount: filtered.length,
      totalDebit,
      totalCredit
    };
  }, [filtered]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, types, selectedPerson, drcrFilter, dateFrom, dateTo, activeChips, showFlaggedOnly, rawRows.length]);

  const pagedRows = paginateRows(filtered, currentPage, ROWS_PER_PAGE);

  return (
    <div>
      <Topbar
        title="Transaction Intelligence"
        subtitle={selectedCase ? `${selectedCase.caseNumber} · Pattern detection` : "Transactions"}
      />
      <CaseWorkspaceShell onNavigate={setPage}>
        {workspace && (
          <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-5">
            <CaseContextBar />

            {/* Entity Overview Bar */}
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 rounded-xl border border-line bg-surface px-5 py-3.5 shadow-card">
              <div className="flex items-center gap-2.5">
                <User size={15} className="text-forensic-500" />
                <p className="text-[13.5px] font-semibold text-ink">
                  {persons?.length || 0} entities · {rawRows.length.toLocaleString()} total transactions
                </p>
              </div>
            </div>

            {/* Metric Cards Component */}
            <TransactionMetricsCards
              totalCount={metrics.totalCount}
              totalDebit={metrics.totalDebit}
              totalCredit={metrics.totalCredit}
            />

            {/* Primary Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
                <Search size={15} className="text-ink-faint" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search description, reference, beneficiary..."
                  className="w-full bg-transparent text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
                />
              </div>

              {/* Entity Selector */}
              {persons && persons.length > 0 && (
                <select
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none"
                >
                  <option value="all">All Entities</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}

              {/* Dr/Cr Selector */}
              <select
                value={drcrFilter}
                onChange={(e) => setDrcrFilter(e.target.value as "all" | "dr" | "cr")}
                className="rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none"
              >
                <option value="all">All Dr / Cr</option>
                <option value="dr">Debit Only (Outflow)</option>
                <option value="cr">Credit Only (Inflow)</option>
              </select>

              <MultiSelectDropdown label="Type" options={TXN_TYPES} selected={types} onChange={setTypes} />
              <DateRangePicker from={dateFrom} to={dateTo} onChange={(from, to) => { setDateFrom(from); setDateTo(to); }} />
              
              {/* Flagged Toggle */}
              <button
                onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                  showFlaggedOnly
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-line bg-surface text-ink hover:bg-paper"
                }`}
              >
                <AlertTriangle size={14} className={showFlaggedOnly ? "text-amber-600" : "text-ink-faint"} />
                {showFlaggedOnly ? "Flagged Only" : "All Transactions"}
              </button>
            </div>

            {/* Pattern Lens Chips Bar */}
            <div className="flex flex-wrap gap-2">
              {CHIP_DEFINITIONS
                .filter(chip => !HIDDEN_CHIPS.includes(chip.label))
                .map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => toggleChip(chip.id)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                      activeChips.includes(chip.id)
                        ? "bg-forensic-500 text-white"
                        : "bg-surface text-ink hover:bg-paper border border-line"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
            </div>

            {/* Transactions Forensics Table */}
            <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line-soft bg-paper/60">
                      {[
                        "Date",
                        "Risk",
                        "Description",
                        "Type",
                        "Debit (₹)",
                        "Credit (₹)",
                        "Balance",
                        "Ref / Chq",
                        "Matched Alerts",
                        "Phone",
                        "UPI ID",
                        "IFSC",
                        "Flag"
                      ].map((h) => (
                        <th key={h} className="px-3.5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft text-[12.5px]">
                    {pagedRows.map((row) => {
                      const isDebit = row.drCr?.toLowerCase().startsWith("d");
                      const riskLevel = calculateRisk(row);
                      const extracted = extractTxnDetails(row);

                      return (
                        <tr key={row.id} className="hover:bg-paper/50 transition-colors">
                          <td className="px-3.5 py-3 text-ink-muted whitespace-nowrap">{row.date}</td>

                          {/* Risk Badge */}
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <Badge tone={riskLevel === "High" ? "red" : riskLevel === "Medium" ? "amber" : "green"}>
                              {riskLevel}
                            </Badge>
                          </td>

                          {/* Description */}
                          <td className="px-3.5 py-3 font-medium text-ink " title={row.desc}>
                            {row.desc}
                          </td>

                          <td className="px-3.5 py-3 font-semibold uppercase text-ink-muted">{row.type}</td>

                          {/* Debit Amount */}
                          <td className="px-3.5 py-3 font-semibold text-red-600 whitespace-nowrap">
                            {isDebit ? formatCurrency(row.amount) : "—"}
                          </td>

                          {/* Credit Amount */}
                          <td className="px-3.5 py-3 font-semibold text-green-600 whitespace-nowrap">
                            {!isDebit ? formatCurrency(row.amount) : "—"}
                          </td>

                          {/* Running Balance */}
                          <td className="px-3.5 py-3 font-mono text-ink-muted whitespace-nowrap">
                            {typeof row.balance === "number" || typeof row.balance === "string" ? formatCurrency(row.balance) : "—"}
                          </td>

                          <td className="px-3.5 py-3 font-mono text-[11px] text-ink-faint">{row.ref || row.chqNo || "—"}</td>

                          {/* Matched Pattern Alerts */}
                          <td className="px-3.5 py-3">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {extracted.matchedChips.length > 0 ? (
                                extracted.matchedChips.map((chip) => (
                                  <span
                                    key={chip.id}
                                    className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded border border-amber-300 whitespace-nowrap"
                                  >
                                    {chip.label}
                                  </span>
                                ))
                              ) : (
                                <span className="text-ink-faint text-[11px]">—</span>
                              )}
                            </div>
                          </td>

                          {/* Extracted Entities */}
                          <td className="px-3.5 py-3 font-mono text-[11px] text-blue-600 font-semibold">{extracted.phone || "—"}</td>
                          <td className="px-3.5 py-3 font-mono text-[11px] text-purple-600 font-semibold truncate max-w-[120px]" title={extracted.upi || ""}>
                            {extracted.upi || "—"}
                          </td>
                          <td className="px-3.5 py-3 font-mono text-[11px] text-teal-600 font-semibold">{extracted.ifsc || "—"}</td>

                          {/* Flag Action */}
                          <td className="px-3.5 py-3">
                            <button
                              onClick={() => void toggleTransactionFlag(row.id)}
                              className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
                                row.flagged
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                  : "bg-paper text-ink-faint hover:text-ink"
                              }`}
                            >
                              {row.flagged ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                              {row.flagged ? "Flagged" : "Flag"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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