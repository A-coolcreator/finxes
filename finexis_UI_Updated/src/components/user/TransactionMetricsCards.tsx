import React from "react";
import { formatCurrency } from "../../utils/txnRules";

interface MetricsProps {
  totalCount: number;
  totalDebit: number;
  totalCredit: number;
}

export const TransactionMetricsCards: React.FC<MetricsProps> = ({ totalCount, totalDebit, totalCredit }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-3.5 bg-surface rounded-xl border border-line shadow-card">
        <span className="text-[11px] font-semibold text-ink-faint uppercase tracking-wide">Filtered Transactions</span>
        <div className="text-xl font-bold font-display text-ink mt-0.5">{totalCount.toLocaleString()}</div>
      </div>
      <div className="p-3.5 bg-surface rounded-xl border border-line shadow-card">
        <span className="text-[11px] font-semibold text-red-500 uppercase tracking-wide">Total Debits (Outflow)</span>
        <div className="text-xl font-bold font-display text-red-600 mt-0.5">{formatCurrency(totalDebit)}</div>
      </div>
      <div className="p-3.5 bg-surface rounded-xl border border-line shadow-card">
        <span className="text-[11px] font-semibold text-green-500 uppercase tracking-wide">Total Credits (Inflow)</span>
        <div className="text-xl font-bold font-display text-green-600 mt-0.5">{formatCurrency(totalCredit)}</div>
      </div>
    </div>
  );
};