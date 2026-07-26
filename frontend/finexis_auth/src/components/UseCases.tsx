import { Smartphone, Scale, Receipt, Landmark } from "lucide-react";
import SectionHeading from "./SectionHeading";

const groups = [
  {
    domain: "Cybercrime Investigations",
    icon: Smartphone,
    items: ["UPI fraud", "Investment scams", "Online frauds"],
  },
  {
    domain: "Economic Offences",
    icon: Scale,
    items: ["Money laundering", "Corporate fraud", "Asset tracing"],
  },
  {
    domain: "Tax Intelligence",
    icon: Receipt,
    items: ["Undisclosed income", "Business revenue analysis", "GST mismatch detection"],
  },
  {
    domain: "Banking Fraud",
    icon: Landmark,
    items: ["Mule networks", "Account abuse", "Suspicious fund flows"],
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="border-b border-line bg-paper py-20 lg:py-28">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          eyebrow="Built for investigators"
          heading="Purpose-built for every kind of financial case"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.domain} className="rounded-xl border border-line bg-white p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-forensic-50">
                  <g.icon size={17} className="text-forensic-600" />
                </span>
                <p className="font-display text-[18px] font-semibold text-ink">{g.domain}</p>
              </div>
              <ul className="mt-4 space-y-2.5">
                {g.items.map((it) => (
                  <li key={it} className="flex items-center gap-2.5 text-[14.5px] text-ink-muted">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-forensic-500" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
