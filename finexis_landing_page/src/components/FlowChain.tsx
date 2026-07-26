import { useState } from "react";
import { Info } from "lucide-react";

export interface FlowNode {
  id: string;
  label: string;
  sub: string;
  detail: string;
  severity: "neutral" | "watch" | "flag";
}

const severityStyles: Record<FlowNode["severity"], { border: string }> = {
  neutral: { border: "border-l-ink-faint" },
  watch: { border: "border-l-amber-500" },
  flag: { border: "border-l-flag-500" },
};

function Connector({ animate = true }: { animate?: boolean }) {
  return (
    <div className="flex shrink-0 items-center justify-center px-1 py-2 lg:py-0 lg:px-0">
      <svg className="hidden h-6 w-12 lg:block" viewBox="0 0 48 24" fill="none">
        <line
          x1="2" y1="12" x2="40" y2="12"
          stroke="#0E6E5E" strokeWidth="2" strokeLinecap="round"
          className={animate ? "flow-line" : ""}
        />
        <path d="M34 6L42 12L34 18" stroke="#0E6E5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <svg className="block h-10 w-6 lg:hidden" viewBox="0 0 24 40" fill="none">
        <line
          x1="12" y1="2" x2="12" y2="30"
          stroke="#0E6E5E" strokeWidth="2" strokeLinecap="round"
          className={animate ? "flow-line" : ""}
        />
        <path d="M6 24L12 32L18 24" stroke="#0E6E5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
}

export default function FlowChain({ nodes, dense = false }: { nodes: FlowNode[]; dense?: boolean }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col items-stretch lg:flex-row lg:items-start">
      {nodes.map((node, i) => {
        const s = severityStyles[node.severity];
        const isActive = active === node.id;
        return (
          <div key={node.id} className="flex flex-col lg:flex-row lg:items-start">
            <div
              className={`group relative mx-auto w-full max-w-sm rounded-lg border border-line border-l-[3px] bg-white px-4 py-3 shadow-card transition-shadow lg:mx-0 lg:max-w-none ${s.border} ${dense ? "lg:w-[150px]" : "lg:w-[168px]"}`}
              onMouseEnter={() => setActive(node.id)}
              onMouseLeave={() => setActive((v) => (v === node.id ? null : v))}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-[15px] font-semibold leading-tight text-ink">{node.label}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-muted">{node.sub}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Details for ${node.label}`}
                  onClick={() => setActive((v) => (v === node.id ? null : node.id))}
                  className="mt-0.5 text-ink-faint transition-colors hover:text-forensic-500"
                >
                  <Info size={15} />
                </button>
              </div>

              {isActive && (
                <div className="mt-2.5 border-t border-line-soft pt-2.5">
                  <p className="font-mono text-[12px] leading-snug text-ink-muted">{node.detail}</p>
                </div>
              )}
            </div>
            {i < nodes.length - 1 && <Connector />}
          </div>
        );
      })}
    </div>
  );
}
