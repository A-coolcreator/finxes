import { ArrowRight, FileText, Zap, ShieldCheck } from "lucide-react";

const inputs = [
  { label: "Bank Statements", sub: "PDF · CSV · XLSX" },
  { label: "UPI Exports", sub: "PhonePe · GPay · Paytm" },
  { label: "NCRP Complaints", sub: "Victim & account lists" },
];

const outputs = [
  { label: "Mule Networks", sub: "Mapped & risk-scored" },
  { label: "Fund Flow Maps", sub: "Hop-by-hop traces" },
  { label: "Collection Accounts", sub: "With source victims" },
  { label: "Cash-Out Trails", sub: "ATM · AEPS · Crypto" },
  { label: "Evidence Packages", sub: "Court-ready reports" },
];

const steps = ["Normalise", "Resolve", "Map", "Detect"];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line bg-paper">
      {/* subtle grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#12161C 1px,transparent 1px),linear-gradient(90deg,#12161C 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-page px-4 pb-14 pt-12 sm:px-6 lg:pb-20 lg:pt-16">

        {/* ── Headline block ── */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-forensic-100 bg-forensic-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest2 text-forensic-600 sm:px-3.5 sm:py-1.5 sm:text-[12px]">
            Financial Intelligence Operating System
          </span>

          <h1 className="mt-5 font-display text-[40px] font-semibold leading-[1.06] text-ink sm:text-[52px] lg:text-[68px]">
            Find where<br />the money went.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-ink-muted sm:text-[17.5px]">
            Upload bank statements, UPI exports, and NCRP complaints.
            FinExis automatically uncovers fund flows, mule networks,
            collection accounts, and cash-out trails.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-forensic-500 px-7 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-forensic-600"
            >
              Login <ArrowRight size={16} />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-7 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-ink-faint"
            >
              Request Pilot
            </a>
          </div>
        </div>

        {/* ── Input → Engine → Output panel ── */}
        <div className="mx-auto mt-14 max-w-4xl lg:mt-16">
          <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-widest2 text-ink-faint sm:text-[11.5px]">
            What investigators bring — what FinExis returns
          </p>

          {/* MOBILE: stacked card  |  DESKTOP: 3-col panel */}
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">

            {/* ── DESKTOP layout (lg+) ── */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_160px_1fr]">

              {/* You provide */}
              <div className="border-r border-line p-7">
                <div className="mb-5 flex items-center gap-2">
                  <FileText size={13} className="text-ink-faint" />
                  <p className="text-[11px] font-semibold uppercase tracking-widest2 text-ink-faint">You provide</p>
                </div>
                <div className="space-y-3">
                  {inputs.map((i) => (
                    <div key={i.label} className="flex items-start gap-3 rounded-xl border border-line-soft bg-paper px-4 py-3.5">
                      <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-ink-faint" />
                      <div>
                        <p className="text-[14px] font-semibold text-ink">{i.label}</p>
                        <p className="mt-0.5 text-[12px] text-ink-faint">{i.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engine */}
              <div className="flex flex-col items-center justify-center border-r border-line bg-forensic-50 px-5 py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forensic-500 shadow-md">
                  <Zap size={22} className="text-white" fill="white" />
                </div>
                <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-widest2 text-forensic-700">FinExis</p>
                <div className="mt-4 flex flex-col items-center gap-1.5">
                  {steps.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-forensic-400" />
                      <span className="text-[11.5px] font-medium text-forensic-600">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* You get */}
              <div className="p-7">
                <div className="mb-5 flex items-center gap-2">
                  <ShieldCheck size={13} className="text-forensic-500" />
                  <p className="text-[11px] font-semibold uppercase tracking-widest2 text-forensic-600">You get</p>
                </div>
                <div className="space-y-2.5">
                  {outputs.map((o) => (
                    <div key={o.label} className="flex items-start gap-3 rounded-xl border border-forensic-100 bg-forensic-50 px-4 py-3">
                      <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-forensic-500" />
                      <div>
                        <p className="text-[13.5px] font-semibold text-forensic-800">{o.label}</p>
                        <p className="mt-0.5 text-[11.5px] text-forensic-600/70">{o.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── MOBILE layout (< lg): stacked ── */}
            <div className="lg:hidden">

              {/* You provide */}
              <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <FileText size={13} className="text-ink-faint" />
                  <p className="text-[11px] font-semibold uppercase tracking-widest2 text-ink-faint">You provide</p>
                </div>
                <div className="space-y-2.5">
                  {inputs.map((i) => (
                    <div key={i.label} className="flex items-start gap-3 rounded-xl border border-line-soft bg-paper px-4 py-3">
                      <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-ink-faint" />
                      <div>
                        <p className="text-[14px] font-semibold text-ink">{i.label}</p>
                        <p className="mt-0.5 text-[12px] text-ink-faint">{i.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engine — horizontal strip on mobile */}
              <div className="flex items-center gap-4 border-y border-line bg-forensic-50 px-5 py-4 sm:px-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forensic-500 shadow-sm">
                  <Zap size={18} className="text-white" fill="white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest2 text-forensic-700">FinExis</p>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    {steps.map((s) => (
                      <span key={s} className="flex items-center gap-1.5 text-[12px] font-medium text-forensic-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-forensic-400" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* You get */}
              <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck size={13} className="text-forensic-500" />
                  <p className="text-[11px] font-semibold uppercase tracking-widest2 text-forensic-600">You get</p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {outputs.map((o) => (
                    <div key={o.label} className="flex items-start gap-3 rounded-xl border border-forensic-100 bg-forensic-50 px-4 py-3">
                      <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-forensic-500" />
                      <div>
                        <p className="text-[13.5px] font-semibold text-forensic-800">{o.label}</p>
                        <p className="mt-0.5 text-[11.5px] text-forensic-600/70">{o.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
