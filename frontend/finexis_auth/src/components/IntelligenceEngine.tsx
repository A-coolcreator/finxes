import SectionHeading from "./SectionHeading";

const pipeline = [
  {
    label: "Bank Statements · UPI Exports · NCRP Data",
    sub: "Your raw investigation inputs",
    isInput: true,
  },
  {
    label: "Normalisation",
    sub: "Parsed across 100+ formats into a unified transaction record",
  },
  {
    label: "Entity Resolution",
    sub: "Accounts, VPAs, merchants, and institutions identified and classified",
  },
  {
    label: "Fund Flow Mapping",
    sub: "Money movement reconstructed hop by hop across accounts",
  },
  {
    label: "Risk Detection",
    sub: "Mule roles, velocity flags, and network anomalies surfaced automatically",
  },
  {
    label: "Investigation Intelligence",
    sub: "Fund flows · Mule networks · Evidence packages · Case reports",
    isOutput: true,
  },
];

const stats = [
  { v: "100+", l: "Bank formats" },
  { v: "500K+", l: "Transactions per case" },
  { v: "< 10 min", l: "To fund-flow map" },
  { v: "95%", l: "Less manual work" },
];

export default function IntelligenceEngine() {
  return (
    <section id="engine" className="border-b border-line bg-ink py-14 lg:py-20">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          theme="dark"
          eyebrow="Intelligence Engine"
          heading="From raw data to actionable intelligence"
          description="One pipeline. Every input automatically processed into investigation-ready intelligence."
        />

        <div className="mx-auto max-w-lg">
          {pipeline.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-full rounded-xl px-6 py-4 text-center transition-colors ${
                step.isInput
                  ? "border border-white/15 bg-white/[0.07]"
                  : step.isOutput
                  ? "border-2 border-forensic-300 bg-forensic-500"
                  : "border border-white/10 bg-white/[0.04]"
              }`}>
                <p className={`font-semibold ${
                  step.isInput ? "text-[14px] text-white/80" :
                  step.isOutput ? "text-[17px] text-white" :
                  "text-[15px] text-white"
                }`}>{step.label}</p>
                <p className={`mt-1 text-[13px] ${step.isOutput ? "text-white/75" : "text-white/40"}`}>
                  {step.sub}
                </p>
              </div>

              {i < pipeline.length - 1 && (
                <div className="my-1.5 flex flex-col items-center">
                  <div className="h-4 w-px bg-white/15" />
                  <svg width="10" height="6" viewBox="0 0 10 6"><path d="M5 6L0 0h10L5 6z" fill="rgba(255,255,255,0.18)" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(m => (
            <div key={m.l} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 text-center">
              <p className="font-display text-[30px] font-semibold text-forensic-300">{m.v}</p>
              <p className="mt-1 text-[13px] text-white/50">{m.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
