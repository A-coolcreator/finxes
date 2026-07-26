import Logo from "./Logo";

const cols = [
  {
    title: "Platform",
    links: [
      { label: "Bank Statement Intelligence", href: "#bank" },
      { label: "UPI Intelligence", href: "#upi" },
      { label: "NCRP Intelligence", href: "#ncrp" },
      { label: "How It Works", href: "#engine" },
      { label: "Outputs", href: "#outputs" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Cyber Crime", href: "#workflows" },
      { label: "Law Enforcement", href: "#workflows" },
      { label: "Banking Fraud", href: "#workflows" },
      { label: "Financial Intelligence", href: "#workflows" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Book Demo", href: "#demo" },
      { label: "Request Pilot", href: "#demo" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink py-14">
      <div className="mx-auto max-w-page px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="light" />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-white/55">
              The financial intelligence operating system for law enforcement — built around inputs investigators actually have.
            </p>
            <p className="mt-4 text-[12.5px] text-white/30">Cloud-delivered · Tenant-isolated · Evidence-grade</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-[12px] font-semibold uppercase tracking-widest2 text-white/40">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-[14px] text-white/65 transition-colors hover:text-white">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="flex items-center gap-2 text-[13px] text-white/40">
            <svg width="20" height="13" viewBox="0 0 20 13" className="shrink-0">
              <rect width="20" height="4.33" y="0" fill="#FF9933" />
              <rect width="20" height="4.33" y="4.33" fill="#FFFFFF" />
              <rect width="20" height="4.33" y="8.66" fill="#138808" />
              <circle cx="10" cy="6.5" r="1.4" fill="none" stroke="#0A4F44" strokeWidth="0.3" />
            </svg>
            © {new Date().getFullYear()} SPYINT Technologies Pvt. Ltd. — FinExis
          </p>
          <p className="text-[13px] text-white/40">All case data stays within your environment.</p>
        </div>
      </div>
    </footer>
  );
}
