import { Users, ArrowRightLeft, Share2, Banknote, Store, Bitcoin, Network } from "lucide-react";
import SectionHeading from "./SectionHeading";

const detections = [
  {
    icon: Users,
    name: "Collection Accounts",
    desc: "Accounts receiving funds from multiple victims across different complaints and time windows.",
    tag: "HIGH",
    tagColor: "bg-flag-500/10 text-flag-500 border-flag-500/20",
    border: "border-flag-500/20 hover:border-flag-500/40",
  },
  {
    icon: ArrowRightLeft,
    name: "Mule Accounts",
    desc: "Accounts used to receive, hold briefly, and forward illicit funds to the next layer.",
    tag: "HIGH",
    tagColor: "bg-flag-500/10 text-flag-500 border-flag-500/20",
    border: "border-flag-500/20 hover:border-flag-500/40",
  },
  {
    icon: Share2,
    name: "Distribution Accounts",
    desc: "Accounts dispersing received funds to multiple beneficiaries — the splitting layer.",
    tag: "MED",
    tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    border: "border-amber-500/20 hover:border-amber-500/40",
  },
  {
    icon: Banknote,
    name: "Cash-Out Accounts",
    desc: "Accounts linked to ATM withdrawals, AEPS transactions, and physical fund extraction.",
    tag: "HIGH",
    tagColor: "bg-flag-500/10 text-flag-500 border-flag-500/20",
    border: "border-flag-500/20 hover:border-flag-500/40",
  },
  {
    icon: Store,
    name: "Merchant Accounts",
    desc: "Businesses and QR merchants involved in receiving or moving illicit funds.",
    tag: "MED",
    tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    border: "border-amber-500/20 hover:border-amber-500/40",
  },
  {
    icon: Bitcoin,
    name: "Crypto Exposure",
    desc: "Potential links to crypto exchanges, P2P platforms, and virtual asset conversions.",
    tag: "MED",
    tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    border: "border-amber-500/20 hover:border-amber-500/40",
  },
  {
    icon: Network,
    name: "Fraud Networks",
    desc: "Connected accounts, UPI IDs, and beneficiaries forming an identifiable fraud ring.",
    tag: "HIGH",
    tagColor: "bg-flag-500/10 text-flag-500 border-flag-500/20",
    border: "border-flag-500/20 hover:border-flag-500/40",
  },
];

export default function AutoDetects() {
  return (
    <section id="detects" className="border-b border-line bg-paper py-14 lg:py-20">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          eyebrow="What FinExis Automatically Detects"
          heading="Outcomes, not features"
          description="Investigators don't need modules — they need answers. FinExis surfaces these automatically from the data you provide."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {detections.map((d) => (
            <div key={d.name}
              className={`rounded-xl border bg-white p-6 transition-all hover:shadow-card ${d.border}`}>
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line-soft bg-paper">
                  <d.icon size={18} className="text-ink-muted" />
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-bold tracking-wider ${d.tagColor}`}>
                  {d.tag}
                </span>
              </div>
              <p className="mt-4 font-display text-[16px] font-semibold text-ink">{d.name}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{d.desc}</p>
            </div>
          ))}

          {/* CTA card */}
          <div className="rounded-xl border border-forensic-200 bg-forensic-500 p-6 flex flex-col justify-between">
            <div>
              <p className="font-display text-[20px] font-semibold leading-tight text-white">
                Find the mule.<br />Find the money.
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-white/75">
                Every detection links back to source transactions — every finding stands up in a case file.
              </p>
            </div>
            <a href="#demo"
              className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white/90 hover:text-white">
              See a live trace →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
