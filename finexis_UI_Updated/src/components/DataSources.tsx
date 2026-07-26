import SectionHeading from "./SectionHeading";

const banks = ["SBI","ICICI","HDFC","Axis","PNB","BOB","Kotak","Yes","Union","Canara","IDFC","IndusInd"];
const bankFormats = ["PDF","CSV","XLSX"];
const upiApps = [
  { name: "PhonePe", initial: "P", color: "#5f259f" },
  { name: "Google Pay", initial: "G", color: "#4285f4" },
  { name: "Paytm", initial: "Pa", color: "#00BAF2" },
  { name: "BHIM", initial: "B", color: "#00a651" },
  { name: "Amazon Pay", initial: "A", color: "#ff9900" },
  { name: "WhatsApp Pay", initial: "W", color: "#25d366" },
];
const ncrpTypes = ["NCRP Complaints","Victim Lists","Account Lists","UPI Lists"];

export default function DataSources() {
  return (
    <section id="sources" className="border-b border-line bg-paper py-14 lg:py-20">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          eyebrow="Investigation Data Sources"
          heading="Every input investigators actually have"
          description="Drop in what you have — statements, exports, or complaint data. FinExis normalises and analyses everything automatically."
        />

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Bank Statements */}
          <div id="bank" className="rounded-2xl border border-line bg-white p-7 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-forensic-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-forensic-600">01</span>
            </div>
            <h3 className="mt-3 font-display text-[21px] font-semibold text-ink">Bank Statement Intelligence</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
              Ingest statements from any Indian bank, in any format. Automatically parsed, normalised, and ready for investigation.
            </p>

            <div className="mt-5 flex gap-2">
              {bankFormats.map(f => (
                <span key={f} className="rounded-md border border-forensic-100 bg-forensic-50 px-3 py-1.5 font-mono text-[12px] font-semibold text-forensic-700">{f}</span>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {banks.map(b => (
                <div key={b} className="flex items-center justify-center rounded-lg border border-line-soft bg-paper py-2.5 text-[12px] font-semibold text-ink-muted">
                  {b}
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[12px] text-ink-faint">100+ Indian banks supported</p>
          </div>

          {/* UPI Intelligence */}
          <div id="upi" className="rounded-2xl border border-line bg-white p-7 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-forensic-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-forensic-600">02</span>
            </div>
            <h3 className="mt-3 font-display text-[21px] font-semibold text-ink">UPI Intelligence</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
              Analyse UPI exports, merchant activity, QR collection patterns, and payment networks across all major rails.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {upiApps.map(app => (
                <div key={app.name} className="flex items-center gap-2.5 rounded-lg border border-line-soft bg-paper px-3.5 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: app.color }}>
                    {app.initial}
                  </span>
                  <span className="text-[13px] font-medium text-ink">{app.name}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-line-soft bg-paper px-4 py-3.5">
              <p className="text-[13px] text-ink-muted">Extracts <span className="font-semibold text-ink">VPA identities</span>, merchant IDs, QR collection accounts, and UPI payment networks.</p>
            </div>
          </div>

          {/* NCRP Intelligence */}
          <div id="ncrp" className="rounded-2xl border border-line bg-white p-7 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-forensic-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-forensic-600">03</span>
            </div>
            <h3 className="mt-3 font-display text-[21px] font-semibold text-ink">NCRP Intelligence</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
              Correlate victims, beneficiaries, and fraud infrastructure. Map connections across complaints to surface shared accounts and mule networks.
            </p>

            <div className="mt-6 space-y-2.5">
              {ncrpTypes.map((t, i) => (
                <div key={t} className="flex items-center gap-3 rounded-lg border border-line-soft bg-paper px-4 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forensic-500 font-mono text-[11px] font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="text-[13.5px] font-medium text-ink">{t}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-line-soft bg-paper px-4 py-3.5">
              <p className="text-[13px] text-ink-muted">Link <span className="font-semibold text-ink">multiple complaints</span> to reveal shared fraud infrastructure across victims.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
