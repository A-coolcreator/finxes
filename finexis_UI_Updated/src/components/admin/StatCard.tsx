import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
}

export default function StatCard({ icon: Icon, label, value, delta, deltaTone = "neutral" }: Props) {
  const deltaColor =
    deltaTone === "up" ? "text-forensic-600" : deltaTone === "down" ? "text-flag-500" : "text-ink-faint";

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
      {/* Changed justify-between to gap-3 for consistent spacing */}
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forensic-50 text-forensic-600">
          <Icon size={17} />
        </span>
        {delta && <span className={`text-[12px] font-semibold ${deltaColor}`}>{delta}</span>}
      </div>
      <p className="mt-3.5 font-display text-[26px] font-semibold leading-none text-ink">{value}</p>
      <p className="mt-1.5 text-[13px] text-ink-muted">{label}</p>
    </div>
  );
}