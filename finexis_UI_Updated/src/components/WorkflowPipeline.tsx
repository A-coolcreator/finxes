import SectionHeading from "./SectionHeading";

const steps = [
  {
    n: "01",
    title: "Ingest evidence",
    desc: "Drop in statements and exports in whatever format they arrive.",
    chips: ["PDF", "CSV", "Excel", "ZIP", "Bank statements", "UPI exports"],
  },
  {
    n: "02",
    title: "Normalize data",
    desc: "FinExis reads each format and reconciles it into one consistent record.",
    chips: ["100+ bank formats", "Auto classification", "Entity extraction"],
  },
  {
    n: "03",
    title: "Generate intelligence",
    desc: "The platform reconstructs flows and surfaces risk on its own.",
    chips: ["Fund flows", "Mule detection", "Layering detection", "Risk scores"],
  },
  {
    n: "04",
    title: "Build evidence",
    desc: "Every finding is exported in a form an investigator can act on.",
    chips: ["Visual reports", "Fund-flow charts", "Case files"],
  },
];

export default function WorkflowPipeline() {
  return (
    <section id="workflow" className="border-b border-line bg-paper py-20 lg:py-28">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          eyebrow="Investigation workflow"
          heading="From raw statement to case-ready evidence"
        />

        <div className="grid gap-0 lg:grid-cols-4 lg:gap-8">
          {steps.map((s, i) => (
            <div key={s.n} className="relative flex gap-5 pb-10 last:pb-0 lg:flex-col lg:gap-0 lg:pb-0">
              <div className="flex flex-col items-center lg:items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line-soft bg-white font-mono text-[12px] font-medium text-ink-muted lg:h-auto lg:w-auto lg:rounded-none lg:border-0 lg:bg-transparent lg:text-[13px] lg:text-ink-faint">
                  {s.n}
                </span>
                {i < steps.length - 1 && (
                  <span className="mt-2 w-px flex-1 bg-line lg:mt-3 lg:h-px lg:w-full lg:flex-none" />
                )}
              </div>
              <div className="lg:mt-4">
                <p className="font-display text-[18px] font-semibold text-ink">{s.title}</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{s.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.chips.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-line-soft bg-white px-2.5 py-1 text-[12px] font-medium text-ink-muted"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
