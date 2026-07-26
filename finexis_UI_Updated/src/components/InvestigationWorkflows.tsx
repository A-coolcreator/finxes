import SectionHeading from "./SectionHeading";

const workflows = [
  {
    id: "cyber",
    eyebrow: "Cyber Fraud Investigations",
    desc: "UPI fraud, investment scams, online extortion — follow the money from victim to cash-out.",
    steps: [
      { title: "Victim", detail: "NCRP complaint or bank complaint received" },
      { title: "UPI Transfer", detail: "Payment traced to collection VPA or merchant" },
      { title: "Bank Account", detail: "Funds land in mule network, split across accounts" },
      { title: "Cash-Out", detail: "ATM withdrawal, AEPS, or crypto exit detected" },
    ],
    accent: { badge: "bg-forensic-50 text-forensic-700 border-forensic-100", num: "bg-forensic-500", line: "bg-forensic-100" },
  },
  {
    id: "banking",
    eyebrow: "Banking Fraud Investigations",
    desc: "Loan fraud, account abuse, suspicious fund flows — from bank statements to beneficiaries.",
    steps: [
      { title: "Statements", detail: "Bank records ingested and normalised automatically" },
      { title: "Fund Flow", detail: "Transaction graph reconstructed across accounts" },
      { title: "Beneficiaries", detail: "Distribution accounts and end-recipients identified" },
      { title: "Evidence", detail: "Court-ready report with every source transaction cited" },
    ],
    accent: { badge: "bg-amber-50 text-amber-700 border-amber-100", num: "bg-amber-500", line: "bg-amber-100" },
  },
  {
    id: "ncrp",
    eyebrow: "NCRP Investigations",
    desc: "Correlate victims across complaints to reveal shared collection infrastructure and fraud rings.",
    steps: [
      { title: "Victims", detail: "Multiple NCRP complaints ingested and correlated" },
      { title: "Collection Accounts", detail: "Shared beneficiary accounts surfaced across victims" },
      { title: "Layering", detail: "Fund movement mapped through the mule network" },
      { title: "Cash-Out", detail: "Terminal exit points identified with transaction evidence" },
    ],
    accent: { badge: "bg-red-50 text-flag-500 border-red-100", num: "bg-flag-500", line: "bg-red-100" },
  },
];

export default function InvestigationWorkflows() {
  return (
    <section id="workflows" className="border-b border-line bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          eyebrow="Investigation Workflows"
          heading="Built around how investigators actually work"
          description="Not features. Not modules. End-to-end investigation patterns that match real cases."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {workflows.map((w) => (
            <div key={w.id} className="rounded-2xl border border-line bg-paper p-7">
              <span className={`inline-block rounded-full border px-3 py-1 text-[11.5px] font-semibold ${w.accent.badge}`}>
                {w.eyebrow}
              </span>
              <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">{w.desc}</p>

              <div className="mt-7 space-y-0">
                {w.steps.map((s, i) => (
                  <div key={s.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold text-white ${w.accent.num}`}>
                        {i + 1}
                      </div>
                      {i < w.steps.length - 1 && (
                        <div className={`my-1 w-px ${w.accent.line}`} style={{ minHeight: "28px" }} />
                      )}
                    </div>
                    <div className={`${i < w.steps.length - 1 ? "pb-4" : ""}`}>
                      <p className="text-[15px] font-semibold text-ink">{s.title}</p>
                      <p className="mt-0.5 text-[13px] text-ink-muted">{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
