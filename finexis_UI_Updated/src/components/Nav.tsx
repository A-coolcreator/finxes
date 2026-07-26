
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "./Logo";

const navItems = [
  {
    label: "Platform",
    children: [
      { label: "Bank Statement Intelligence", href: "#bank" },
      { label: "UPI Intelligence", href: "#upi" },
      { label: "NCRP Intelligence", href: "#ncrp" },
    ],
  },
  {
    label: "Solutions",
    children: [
      { label: "Cyber Crime", href: "#workflows" },
      { label: "Law Enforcement", href: "#workflows" },
      { label: "Banking Fraud", href: "#workflows" },
      { label: "Financial Intelligence", href: "#workflows" },
    ],
  },
  { label: "How It Works", href: "#engine" },
  { label: "Contact", href: "#demo" },
];

interface NavProps {
  onLogin?: () => void;
}

export default function Nav({ onLogin }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-colors ${scrolled ? "bg-white/95 backdrop-blur border-line shadow-sm" : "bg-white border-transparent"}`}>
      <nav className="mx-auto flex max-w-page items-center justify-between px-6 py-4">
        <a href="#top" className="shrink-0"><Logo /></a>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label} className="relative"
                onMouseEnter={() => setDropdown(item.label)}
                onMouseLeave={() => setDropdown(null)}>
                <button className="flex items-center gap-1 rounded-md px-3 py-2 text-[14px] font-medium text-ink-muted transition-colors hover:text-ink">
                  {item.label} <ChevronDown size={13} className={`transition-transform ${dropdown === item.label ? "rotate-180" : ""}`} />
                </button>
                {dropdown === item.label && (
                  <div className="absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-xl border border-line bg-white p-2 shadow-card">
                    {item.children.map((c) => (
                      <a key={c.label} href={c.href}
                        className="block rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-ink-muted transition-colors hover:bg-paper hover:text-ink">
                        {c.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a key={item.label} href={item.href}
                className="rounded-md px-3 py-2 text-[14px] font-medium text-ink-muted transition-colors hover:text-ink">
                {item.label}
              </a>
            )
          )}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={onLogin}
            className="rounded-md bg-forensic-500 px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-forensic-600 cursor-pointer"
          >
            Login
          </button>
        </div>

        <button className="text-ink lg:hidden" onClick={() => setOpen(v => !v)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-white px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <p className="mb-1 text-[12px] font-semibold uppercase tracking-widest2 text-ink-faint">{item.label}</p>
                  {item.children.map((c) => (
                    <a key={c.label} href={c.href} onClick={() => setOpen(false)}
                      className="block py-1.5 text-[14px] text-ink-muted">{c.label}</a>
                  ))}
                </div>
              ) : (
                <a key={item.label} href={item.href} onClick={() => setOpen(false)}
                  className="text-[14px] font-medium text-ink-muted">{item.label}</a>
              )
            )}
            <button
              onClick={() => {
                setOpen(false);
                onLogin?.();
              }}
              className="mt-2 rounded-md bg-forensic-500 px-4 py-2.5 text-center text-[14px] font-semibold text-white cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
