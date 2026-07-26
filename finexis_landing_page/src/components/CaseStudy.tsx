import { Users, Network, Layers, Coins, FileCheck, Sparkles } from "lucide-react";
import SectionHeading from "./SectionHeading";

const steps = [
  { icon: Users, title: "Victim transfers identified", desc: "Inbound UPI transfers from the victim's account are flagged and timestamped." },
  { icon: Network, title: "Mule accounts mapped", desc: "FinExis traces where the funds land and surfaces the collection accounts receiving them." },
  { icon: Layers, title: "Layering network detected", desc: "Splits, merges, and pass-through hops across accounts are reconstructed automatically." },
  { icon: Coins, title: "Crypto exit point found", desc: "The trail is followed to the P2P exchange where funds convert out of the banking system." },
  { icon: FileCheck, title: "Investigation report generated", desc: "The full trace, with every supporting transaction, is exported as a case-ready report." },
];

export default function CaseStudy() {
  return (
    <section className="border-b border-line bg-paper py-20 lg:py-28">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          eyebrow="Case study"
          heading="Crypto investment scam"
          description="A victim reports a fraudulent transfer made through a fake investment app. Here's what the investigation looks like end to end."
        />

        <div className="mx-auto max-w-2xl">
          {steps.map((s, i) => (
            <div key={s.title} className="flex gap-5">
              <div className="flex flex-col items-center">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white">
                  <s.icon size={17} className="text-forensic-600" />
                </span>
                {i < steps.length - 1 && <span className="my-1 w-px flex-1 bg-line" />}
              </div>
              <div className="pb-9">
                <p className="font-display text-[17px] font-semibold text-ink">{s.title}</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{s.desc}</p>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-3 rounded-xl border border-l-[3px] border-l-forensic-500 border-line bg-white p-5">
            <Sparkles size={18} className="mt-0.5 shrink-0 text-forensic-600" />
            <p className="text-[14.5px] leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">What used to take weeks of manual cross-referencing</span>{" "}
              now runs as one continuous trace — from the first complaint to a report ready for the case file.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
