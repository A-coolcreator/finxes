import { useState } from "react";
import { ArrowLeftRight, Network, UserSearch, Smartphone, Building2 } from "lucide-react";
import SectionHeading from "./SectionHeading";
import ModuleScreenshot from "./ModuleScreenshot";

const moduleDetails = [
  {
    key: "transaction",
    name: "Transaction Intelligence",
    icon: ArrowLeftRight,
    blurb: "Reads every statement the same way, regardless of which bank it came from.",
    breadcrumb: "Case #2024-1187 › Transaction Intelligence",
    features: ["Transaction classification", "Keyword intelligence", "Rail detection", "Narration analysis", "Behavioral analytics"],
  },
  {
    key: "fundflow",
    name: "Fund Flow Intelligence",
    icon: Network,
    blurb: "Reconstructs how money actually moved, hop by hop, across accounts.",
    breadcrumb: "Case #2024-1187 › Fund Flow Intelligence",
    features: ["UTR matching", "UPI matching", "IMPS matching", "Cheque matching", "Multi-hop tracking", "Split trails", "Merge trails", "Circular flows"],
  },
  {
    key: "mule",
    name: "Mule Intelligence",
    icon: UserSearch,
    blurb: "Flags the accounts built to receive, hold briefly, and pass money on.",
    breadcrumb: "Case #2024-1187 › Mule Intelligence",
    features: ["Mule risk score", "Collection detection", "Distribution detection", "Pass-through detection", "Holding time analysis", "Velocity analysis", "Cash-out detection", "Crypto mule detection"],
  },
  {
    key: "upi",
    name: "UPI Intelligence",
    icon: Smartphone,
    blurb: "Pulls structured identity out of UPI activity most tools just store as text.",
    breadcrumb: "Case #2024-1187 › UPI Intelligence",
    features: ["VPA extraction", "Merchant detection", "QR collection analysis", "UPI funnel detection", "UPI network analysis"],
  },
  {
    key: "entity",
    name: "Entity Intelligence",
    icon: Building2,
    blurb: "Identifies who's actually on the other end of a transaction.",
    breadcrumb: "Case #2024-1187 › Entity Intelligence",
    features: ["Banks", "NBFCs", "Loan apps", "Payment gateways", "UPI apps", "Brokerages", "Crypto exchanges", "Government payments"],
  },
];

export default function ModuleDetail() {
  const [active, setActive] = useState(0);
  const current = moduleDetails[active];

  return (
    <section id="modules" className="border-b border-line bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          eyebrow="Inside the platform"
          heading="Core intelligence modules"
          description="Each module is a different lens on the same case. Switch between them to see what the platform surfaces."
        />

        <div className="flex flex-wrap justify-center gap-2">
          {moduleDetails.map((m, i) => (
            <button
              key={m.key}
              onClick={() => setActive(i)}
              className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
                active === i
                  ? "bg-forensic-500 text-white"
                  : "border border-line bg-paper text-ink-muted hover:border-ink-faint"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-3xl">
          <ModuleScreenshot moduleKey={current.key} breadcrumb={current.breadcrumb} />

          <div className="rounded-b-xl border border-line bg-paper p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-forensic-50">
                <current.icon size={20} className="text-forensic-600" />
              </span>
              <div>
                <p className="font-display text-[18px] font-semibold text-ink">{current.name}</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-ink-muted">{current.blurb}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line-soft pt-5">
              {current.features.map((f) => (
                <span
                  key={f}
                  className="rounded-md border border-line-soft bg-white px-3 py-1.5 font-mono text-[12.5px] text-ink-muted"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
