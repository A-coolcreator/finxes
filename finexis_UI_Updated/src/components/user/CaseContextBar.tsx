import { ChevronDown, ShieldAlert } from "lucide-react";
import Badge from "../admin/Badge";
import { useCaseContext } from "../../context/CaseContext";

export default function CaseContextBar() {
  const { selectedCase, workspace } = useCaseContext();

  if (!selectedCase) return null;

  const risk = Math.min(
    100,
    Math.max(
      selectedCase.triggerCount * 3 + 25,
      ...(workspace?.enriched.map((tx) => tx.mule_score || 0) || [0])
    )
  );
  const riskTone = risk >= 75 ? "red" : risk >= 45 ? "amber" : "green";
  const status = selectedCase.status?.toUpperCase() || "ACTIVE";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-card">
      <button className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-1.5 hover:bg-line-soft transition-colors">
        <span className="text-[12.5px] font-semibold text-ink">{selectedCase.caseNumber}</span>
        <span className="hidden sm:inline text-[12.5px] text-ink-muted">· {selectedCase.title}</span>
        <ChevronDown size={13} className="text-ink-faint" />
      </button>

      {status === "ACTIVE" && <Badge tone="green">Active</Badge>}
      {status === "CRITICAL" && <Badge tone="amber">Critical</Badge>}
      {status === "CLOSED" && <Badge tone="gray">Closed</Badge>}
      <Badge tone={riskTone}>
        <ShieldAlert size={11} className="mr-0.5" />
        Risk {risk}/100
      </Badge>

      <span className="text-[12px] text-ink-faint ml-auto hidden md:inline">
        {workspace ? `${workspace.enriched.length.toLocaleString()} transactions loaded from backend` : "Loading case workspace…"}
      </span>
    </div>
  );
}
