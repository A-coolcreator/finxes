import { useState, type FormEvent } from "react";
import { CheckCircle2, Clock, FileSearch, ShieldCheck, Users } from "lucide-react";

const focusAreas = [
  "Cyber Fraud / NCRP Investigations",
  "Economic Offences",
  "Banking Fraud",
  "Financial Intelligence Unit",
  "Other",
];

const highlights = [
  { icon: FileSearch, title: "Live case trace", desc: "We run a real fund-flow investigation end-to-end during the demo — not slides." },
  { icon: Users, title: "Shaped to your unit", desc: "Tell us your case type and we tailor the walkthrough to your investigation pattern." },
  { icon: Clock, title: "Under 30 minutes", desc: "From raw statement upload to a complete, court-ready trace." },
  { icon: ShieldCheck, title: "No procurement required", desc: "FinExis is SaaS. Pilots can be running within days of your first call with us." },
];

export default function DemoForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="demo" className="bg-ink py-14 lg:py-20">
      <div className="mx-auto max-w-page px-6">

        <div className="mb-10 text-center">
          <p className="text-[12.5px] font-semibold uppercase tracking-widest2 text-amber-500">
            Request a Demo
          </p>
          <h2 className="mt-3 font-display text-[32px] font-semibold leading-none whitespace-nowrap text-white lg:text-[38px]">
            See FinExis investigate a real case
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/60">
            Tell us about your unit and the kind of cases you work. We'll walk you through a live
            investigation trace — not a scripted product tour.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">

          <div className="space-y-6">
            {highlights.map((h) => (
              <div key={h.title} className="flex gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/[0.06] ring-1 ring-white/10">
                  <h.icon size={16} className="text-white/70" />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-white">{h.title}</p>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-white/55">{h.desc}</p>
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-[11.5px] font-semibold uppercase tracking-widest2 text-white/35">
                From the field
              </p>
              <blockquote className="mt-3 text-[15px] leading-relaxed text-white/70 italic">
                "We traced a layered UPI fraud across 11 accounts in one session. It would have taken us three weeks by hand."
              </blockquote>
              <p className="mt-3 text-[13px] font-medium text-white/40">
                — Cyber Crime Unit, Southern India
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-7 sm:p-9">
            {submitted ? (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forensic-500/20">
                  <CheckCircle2 size={28} className="text-forensic-400" />
                </span>
                <p className="mt-5 font-display text-[20px] font-semibold text-white">Request received</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-white/55">
                  Someone from our team will reach out within one business day to schedule your demo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <DarkField label="Name" id="name" required />
                  <DarkField label="Organisation" id="organization" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DarkField label="Designation" id="department" />
                  <DarkField label="Phone" id="phone" type="tel" />
                </div>
                <DarkField label="Work email" id="email" type="email" required />
                <div>
                  <label htmlFor="focus" className="mb-1.5 block text-[13.5px] font-medium text-white/70">
                    Investigation focus
                  </label>
                  <select id="focus" name="focus" defaultValue=""
                    className="w-full rounded-md border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-[14.5px] text-white/80 outline-none transition-colors focus:border-forensic-500">
                    <option value="" disabled className="bg-ink text-white/50">Select a focus area</option>
                    {focusAreas.map((u) => (
                      <option key={u} value={u} className="bg-ink text-white">{u}</option>
                    ))}
                  </select>
                </div>
                <button type="submit"
                  className="w-full rounded-md bg-forensic-500 px-5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-forensic-600">
                  Request investigation demo
                </button>
                <p className="text-center text-[12.5px] text-white/30">We respond within one business day.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DarkField({ label, id, type = "text", required = false }: { label: string; id: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13.5px] font-medium text-white/70">
        {label}{required && <span className="text-flag-500"> *</span>}
      </label>
      <input id={id} name={id} type={type} required={required}
        className="w-full rounded-md border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-[14.5px] text-white outline-none placeholder:text-white/25 transition-colors focus:border-forensic-500" />
    </div>
  );
}
