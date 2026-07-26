import SectionHeading from "./SectionHeading";

const segments = [
  {
    unit: "Cyber Crime Units",
    dept: "State & Central Police",
    tags: ["NCRP investigation", "Mule account tracing", "Fund flow mapping", "CCTNS linking"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="5" width="22" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 20v3M18 20v3M7 23h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 12l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="21" cy="9" r="3.5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M19.8 9l1 1 1.7-1.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "text-forensic-600",
    bg: "bg-forensic-50",
    border: "border-forensic-100",
  },
  {
    unit: "Economic Offences Wing",
    dept: "EOW / EOU / SFIO",
    tags: ["Shell company detection", "Layering analysis", "Benami transactions", "Asset trail reports"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="8" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 8V7a6 6 0 0 1 12 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 13.5v3M12.5 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="14" cy="15" r="3" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
    color: "text-forensic-600",
    bg: "bg-forensic-50",
    border: "border-forensic-100",
  },
  {
    unit: "Financial Intelligence Unit",
    dept: "FIU-IND / AML Desks",
    tags: ["STR / CTR analysis", "PMLA investigation", "Cross-bank aggregation", "Suspicious pattern alerts"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 8v2.5M14 18v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M11 12.5c0-1.2 1.3-2.2 3-2.2s3 1 3 2.2c0 1.3-1.5 2-3 2.2-1.5.3-3 1.1-3 2.3s1.3 2.2 3 2.2 3-1 3-2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    color: "text-forensic-600",
    bg: "bg-forensic-50",
    border: "border-forensic-100",
  },
  {
    unit: "Income Tax Department",
    dept: "Investigation Wing / TDS",
    tags: ["Undisclosed income", "Hawala detection", "Lifestyle vs income gap", "Offshore fund trails"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M6 22V8l8-4 8 4v14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="11" y="15" width="6" height="7" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M10 8h8M10 12h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M14 4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    unit: "GST Intelligence",
    dept: "DGGI / GST Audit",
    tags: ["Fake ITC detection", "Circular trading", "Suspicious vendor networks", "Cash-to-GST mismatches"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 11h20" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9 16h4M9 19h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M19 15l2 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 17h-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    unit: "Enforcement Directorate",
    dept: "ED / FEMA / FEMA Desk",
    tags: ["PMLA predicate offence", "Cross-border remittances", "Crypto asset tracing", "Proceeds of crime"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3L3 8v6c0 5.5 4.7 10.4 11 11.5C20.3 24.4 25 19.5 25 14V8L14 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 14l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "text-flag-500",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    unit: "Forensic Accounting Teams",
    dept: "Big 4 / Boutique Firms",
    tags: ["Transaction reconstruction", "Expert witness reports", "Litigation support", "Regulatory submissions"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="3" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 7h14" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9 12h6M9 15.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="20" cy="20" r="5" fill="white" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M18 20l1.5 1.5 2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "text-forensic-600",
    bg: "bg-forensic-50",
    border: "border-forensic-100",
  },
  {
    unit: "CA / CS Firms",
    dept: "Concurrent Audit / Risk",
    tags: ["Client due diligence", "Bank audit support", "AML KYC review", "Suspicious transaction reports"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="12" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 8h12" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M7 12h6M7 15.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <rect x="13" y="13" width="11" height="11" rx="1.5" fill="white" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M16 17.5h5M16 20h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M16 15h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    unit: "Asset Recovery Units",
    dept: "Banks / ARCs / NBFCs",
    tags: ["Fund diversion tracing", "Promoter transaction analysis", "Court-ready evidence packs", "NPA investigation"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M5 10h18v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 10h22M10 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="14" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M14 14.5v3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
    color: "text-forensic-600",
    bg: "bg-forensic-50",
    border: "border-forensic-100",
  },
];

export default function ClientSegments() {
  return (
    <section id="who-uses" className="border-b border-line bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-page px-6">
        <SectionHeading
          eyebrow="Who Uses FinExis"
          heading="Built for every team that follows the money"
          description="From first responders to forensic accountants, FinExis is structured around the workflows, outputs, and evidentiary standards each unit actually needs."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {segments.map((s) => (
            <div
              key={s.unit}
              className={`group rounded-xl border bg-white p-6 transition-all hover:shadow-card ${s.border}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
                  {s.icon}
                </div>
                <span className={`mt-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide ${s.bg} ${s.color} border-current/20`}>
                  {s.dept}
                </span>
              </div>

              {/* Name */}
              <p className="mt-4 font-display text-[17px] font-semibold text-ink">{s.unit}</p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-line-soft bg-paper px-2.5 py-1 text-[11.5px] font-medium text-ink-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
