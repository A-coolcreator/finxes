import { Search, Bell, Menu, Plus, HelpCircle } from "lucide-react";
import { useCaseContext } from "../../context/CaseContext";
import type { UserPage } from "./UserApp";

export default function Topbar({
  title,
  subtitle,
  onNavigate,
}: {
  title: string;
  subtitle?: string;
  onNavigate?: (page: UserPage) => void;
}) {
  const { setPage } = useCaseContext();
  const navigate = onNavigate || setPage;
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface/90 px-5 py-4 backdrop-blur lg:px-8">
      <button className="lg:hidden text-ink-muted">
        <Menu size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="font-display text-[19px] font-semibold text-ink leading-none">{title}</h1>
        {subtitle && <p className="mt-1 text-[12.5px] text-ink-muted">{subtitle}</p>}
      </div>

      <div className="hidden md:flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-ink-faint w-[260px]">
        <Search size={14} />
        <input
          placeholder="Search cases, accounts, UPI IDs…"
          className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>

      <button
        onClick={() => navigate("create-case")}
        className="hidden sm:flex items-center gap-1.5 rounded-lg bg-forensic-500 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-forensic-600 transition-colors"
      >
        <Plus size={14} />
        New case
      </button>

      <button className="text-ink-muted hover:text-ink transition-colors">
        <HelpCircle size={18} />
      </button>

      <button className="relative text-ink-muted hover:text-ink transition-colors">
        <Bell size={18} />
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-flag-500 ring-2 ring-surface" />
      </button>

      <button
        onClick={() => navigate("profile-settings")}
        className="h-8 w-8 rounded-full bg-forensic-500 text-white flex items-center justify-center text-[12px] font-semibold hover:bg-forensic-600 transition-colors cursor-pointer"
      >
        AN
      </button>
    </header>
  );
}
