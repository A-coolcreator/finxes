import { Search, Bell, Menu } from "lucide-react";

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-line bg-surface/90 px-5 py-4 backdrop-blur lg:px-8">
      <button className="lg:hidden text-ink-muted">
        <Menu size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="font-display text-[19px] font-semibold text-ink leading-none">{title}</h1>
        {subtitle && <p className="mt-1 text-[12.5px] text-ink-muted">{subtitle}</p>}
      </div>

      <div className="hidden md:flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-ink-faint w-[240px]">
        <Search size={14} />
        <input
          placeholder="Search…"
          className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>

      <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-forensic-100 bg-forensic-50 px-2.5 py-1 text-[11px] font-semibold text-forensic-600">
        <span className="h-1.5 w-1.5 rounded-full bg-forensic-500 pulse-soft" />
        Production
      </span>

      <button className="relative text-ink-muted hover:text-ink transition-colors">
        <Bell size={18} />
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-flag-500 ring-2 ring-surface" />
      </button>

      <div className="h-8 w-8 rounded-full bg-forensic-500 text-white flex items-center justify-center text-[12px] font-semibold">
        RS
      </div>
    </header>
  );
}
