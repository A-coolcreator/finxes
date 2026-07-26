import { Database, FileStack, GaugeCircle, Timer } from "lucide-react";

const metrics = [
  { icon: Database, value: "500,000+", label: "Transactions processed" },
  { icon: FileStack, value: "50+", label: "Bank formats supported" },
  { icon: GaugeCircle, value: "95%", label: "Reduction in manual review" },
  { icon: Timer, value: "Minutes", label: "To generate a fund-flow map" },
];

export default function MetricsSection() {
  return (
    <section className="border-b border-line bg-white py-14">
      <div className="mx-auto max-w-page px-6">
        <div className="grid grid-cols-2 divide-y divide-line-soft lg:grid-cols-4 lg:divide-y-0 lg:divide-x">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`flex flex-col items-center py-5 text-center lg:py-0 ${
                i % 2 === 0 ? "pr-4 lg:pr-0" : "pl-4 lg:pl-0"
              }`}
            >
              <m.icon size={18} className="text-forensic-500" />
              <p className="mt-2.5 font-display text-[32px] font-semibold leading-none text-ink lg:text-[38px]">
                {m.value}
              </p>
              <p className="mt-1.5 text-[13.5px] text-ink-muted">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
