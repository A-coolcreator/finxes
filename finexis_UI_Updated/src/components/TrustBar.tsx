const agencies = [
  {
    label: "Cyber Crime Units",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M6 13v2M12 13v2M4.5 15h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M5.5 7.5 L7.5 9.5 L10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="13" cy="6" r="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1"/>
        <path d="M12.3 6l.7.7 1.2-1.2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Economic Offences Wing",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="5" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M5 5V4a4 4 0 0 1 8 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9 9v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "State Police",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L3 5v4c0 3.3 2.5 6.4 6 7 3.5-.6 6-3.7 6-7V5L9 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M6.5 9l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Financial Intelligence Units",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9 5.5v1.8M9 11v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M7 8.5c0-.8.9-1.5 2-1.5s2 .7 2 1.5-1 1.3-2 1.5c-1 .2-2 .8-2 1.5s.9 1.5 2 1.5 2-.7 2-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function TrustBar() {
  return (
    <section className="border-b border-line bg-white py-6">
      <div className="mx-auto max-w-page px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-widest2 text-ink-faint">
            Trusted for financial crime investigations
          </p>
          <span className="hidden h-4 w-px bg-line sm:block" />
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {agencies.map((a) => (
              <span
                key={a.label}
                className="flex items-center gap-2 rounded-lg border border-line-soft bg-paper px-3 py-2 text-[12.5px] font-medium text-ink-muted"
              >
                <span className="text-forensic-500">{a.icon}</span>
                {a.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
