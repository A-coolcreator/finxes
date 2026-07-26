import { ScrollText, Lock, ShieldCheck, KeyRound } from "lucide-react";
import SectionHeading from "./SectionHeading";

const items = [
  { icon: ScrollText, title: "Audit logs", desc: "Every action is attributed to an investigator." },
  { icon: Lock, title: "Role-based access", desc: "Cases and evidence are visible only to assigned roles." },
  { icon: ShieldCheck, title: "Evidence traceability", desc: "Every finding links back to its source transaction." },
  { icon: KeyRound, title: "Encrypted by default", desc: "Data is encrypted in transit and at rest." },
];

export default function SecuritySection() {
  return (
    <section id="security" className="border-b border-line bg-ink py-20 lg:py-28">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          theme="dark"
          eyebrow="Built for sensitive investigations"
          heading="Evidence that holds up outside this platform"
          description="No finding is useful if it can't be traced back to its source. FinExis is built so every output stands on its own in a case file."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/[0.06]">
                <it.icon size={18} className="text-white/80" />
              </span>
              <p className="mt-4 font-display text-[16px] font-semibold text-white">{it.title}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-white/55">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
