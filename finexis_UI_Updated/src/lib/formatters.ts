export function formatInr(amount: number, compact = false): string {
  const value = Number(amount) || 0;
  if (compact) {
    if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)} Cr`;
    if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)} L`;
    if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)} K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 6);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(date);
}

export function formatRelative(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(value);
}

export function mapUiRisk(level?: string): "Low" | "Medium" | "High" {
  const normalized = String(level || "").toUpperCase();
  if (normalized.includes("CRITICAL") || normalized === "HIGH" || normalized === "CONFIRMED_MULE") {
    return "High";
  }
  if (normalized === "MEDIUM") return "Medium";
  return "Low";
}

export function mapSeverity(level?: string): "Critical" | "High" | "Medium" | "Low" {
  const normalized = String(level || "").toUpperCase();
  if (normalized.includes("CRITICAL") || normalized === "CONFIRMED_MULE") return "Critical";
  if (normalized === "HIGH") return "High";
  if (normalized === "MEDIUM") return "Medium";
  return "Low";
}

export function amountOf(tx: { amount?: number; type?: string; credit?: number | null; debit?: number | null }): number {
  if (typeof tx.amount === "number") return tx.amount;
  const type = String(tx.type || "").toLowerCase();
  if (type === "credit" && tx.credit != null) return Number(tx.credit) || 0;
  if (type === "debit" && tx.debit != null) return Number(tx.debit) || 0;
  return Number(tx.credit ?? tx.debit ?? 0) || 0;
}
