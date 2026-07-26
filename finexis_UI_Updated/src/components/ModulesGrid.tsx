import { ArrowLeftRight, Network, UserSearch, Smartphone, Coins, Building2 } from "lucide-react";
import SectionHeading from "./SectionHeading";

const modules = [
  {
    icon: ArrowLeftRight,
    name: "Transaction Intelligence",
    desc: "Normalize and analyze transactions across banks, formats, and statement layouts.",
  },
  {
    icon: Network,
    name: "Fund Flow Intelligence",
    desc: "Automatically trace money as it moves across accounts and institutions.",
  },
  {
    icon: UserSearch,
    name: "Mule Intelligence",
    desc: "Identify collection accounts, pass-through accounts, cash-out mules, and layering networks.",
  },
  {
    icon: Smartphone,
    name: "UPI Intelligence",
    desc: "Extract VPAs, merchant IDs, payment patterns, and QR collection activity.",
  },
  {
    icon: Coins,
    name: "Crypto Intelligence",
    desc: "Detect crypto exposure, exchange interactions, and P2P laundering patterns.",
  },
  {
    icon: Building2,
    name: "Entity Intelligence",
    desc: "Identify merchants, banks, loan apps, payment gateways, brokers, and high-risk entities.",
  },
];

export default function ModulesGrid() {
  return (
    <section id="platform" className="border-b border-line bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          eyebrow="One platform"
          heading="Every layer of financial intelligence, in one place"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div
              key={m.name}
              className="rounded-xl border border-line bg-paper p-6 transition-shadow hover:shadow-card sm:p-7"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-forensic-50">
                <m.icon size={19} className="text-forensic-600" />
              </span>
              <p className="mt-4 font-display text-[17px] font-semibold text-ink">{m.name}</p>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
