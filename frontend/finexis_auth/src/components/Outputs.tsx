import { GitBranch, ShieldAlert, Users, Smartphone, FileSearch, Package } from "lucide-react";
import SectionHeading from "./SectionHeading";

const outputs = [
  {
    icon: GitBranch,
    name: "Fund Flow Graphs",
    desc: "Visual, node-by-node maps of how money moved — from source account to final exit point.",
    badge: "Visual",
  },
  {
    icon: ShieldAlert,
    name: "Account Risk Scores",
    desc: "Every account in the case scored by mule probability, velocity, and network centrality.",
    badge: "Scored",
  },
  {
    icon: Users,
    name: "Beneficiary Analysis",
    desc: "Structured breakdown of who received funds, how much, and across how many source victims.",
    badge: "Structured",
  },
  {
    icon: Smartphone,
    name: "UPI Intelligence Reports",
    desc: "VPA-level analysis of payment routes, merchant interactions, and QR collection activity.",
    badge: "Detailed",
  },
  {
    icon: FileSearch,
    name: "NCRP Correlation Reports",
    desc: "Cross-complaint analysis linking shared accounts, UPI IDs, and infrastructure across victims.",
    badge: "Cross-case",
  },
  {
    icon: Package,
    name: "Evidence Packages",
    desc: "Court-ready case files with every finding linked back to its source transaction record.",
    badge: "Court-ready",
  },
];

export default function Outputs() {
  return (
    <section id="outputs" className="border-b border-line bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          eyebrow="Outputs"
          heading="What investigators walk away with"
          description="Every output is formatted for action — not for reading. Attach it to the case file, present it in court, or share with the prosecution."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {outputs.map((o) => (
            <div key={o.name}
              className="group rounded-xl border border-line bg-paper p-6 transition-all hover:border-forensic-200 hover:bg-forensic-50/30 hover:shadow-card">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-soft bg-white shadow-sm">
                  <o.icon size={19} className="text-forensic-600" />
                </span>
                <span className="rounded-full border border-forensic-100 bg-white px-2.5 py-1 text-[11px] font-semibold text-forensic-600">
                  {o.badge}
                </span>
              </div>
              <p className="mt-4 font-display text-[17px] font-semibold text-ink">{o.name}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{o.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-10 rounded-2xl border border-line bg-paper px-8 py-7 flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-display text-[20px] font-semibold text-ink">See a complete investigation output</p>
            <p className="mt-1 text-[14.5px] text-ink-muted">We'll run a live case trace during your demo — from raw statement to full evidence package.</p>
          </div>
          <a href="#demo"
            className="shrink-0 inline-flex items-center gap-2 rounded-md bg-forensic-500 px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-forensic-600">
            Book Demo
          </a>
        </div>
      </div>
    </section>
  );
}
