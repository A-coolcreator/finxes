import { Clock, FileSearch, GitMerge, Link2, Network, FileText } from "lucide-react";
import SectionHeading from "./SectionHeading";

const tasks = [
  { icon: FileSearch, text: "Reading bank statements line by line, across formats that never match" },
  { icon: Link2, text: "Tracing UPI transactions by hand across apps and PSPs" },
  { icon: GitMerge, text: "Matching UTR numbers manually to stitch transfers together" },
  { icon: Network, text: "Following layered fund flows through account after account" },
  { icon: FileText, text: "Building relationship charts by copying data into slides" },
  { icon: Clock, text: "Drafting the case report once the trail finally makes sense" },
];

export default function ProblemSection() {
  return (
    <section className="border-b border-line bg-paper py-20 lg:py-28">
      <div className="mx-auto grid max-w-page gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow="The current state"
            heading="Financial investigations are still done by hand"
          />
          <ul className="space-y-4">
            {tasks.map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-line-soft">
                  <t.icon size={16} className="text-ink-muted" />
                </span>
                <span className="pt-1 text-[15.5px] leading-relaxed text-ink-muted">{t.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-line bg-white p-7 shadow-card">
            <p className="text-[12.5px] font-semibold uppercase tracking-widest2 text-ink-faint">
              Time to build one fund-flow map
            </p>
            <p className="mt-3 font-display text-[44px] font-semibold leading-none text-ink">Weeks</p>
            <p className="mt-2 text-[14.5px] text-ink-muted">spent on a single layered case, working from raw statements and exports</p>
          </div>
          <div className="rounded-xl border-l-[3px] border-l-flag-500 border-y border-r border-line bg-white p-7 shadow-card">
            <p className="text-[12.5px] font-semibold uppercase tracking-widest2 text-ink-faint">
              Time criminal networks need
            </p>
            <p className="mt-3 font-display text-[44px] font-semibold leading-none text-ink">Hours</p>
            <p className="mt-2 text-[14.5px] text-ink-muted">to layer funds across mules, merchants, and exit points before anyone notices</p>
          </div>
        </div>
      </div>
    </section>
  );
}
