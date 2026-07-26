import {
  LayoutGrid,
  Building2,
  Users,
  ScrollText,
  Settings,
  LogOut,
  ChevronsUpDown,
  HeartPulse,
} from "lucide-react";
import Logo from "../Logo";
import type { AdminPage } from "./AdminApp";

interface Props {
  page: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onSignOut?: () => void;
}

const NAV: { key: AdminPage; label: string; icon: typeof LayoutGrid }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "tenants", label: "Tenants", icon: Building2 },
  { key: "users", label: "Users", icon: Users },
  { key: "audit", label: "Audit Logs", icon: ScrollText },
  { key: "health", label: "System Health", icon: HeartPulse },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ page, onNavigate, onSignOut }: Props) {
  return (
    <aside className="hidden lg:flex lg:w-[248px] shrink-0 flex-col bg-forensic-900 h-screen sticky top-0">
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.07]">
        <Logo variant="light" />
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-widest2 text-forensic-300">
          Platform Admin
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = item.key === page;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                active
                  ? "bg-white/[0.09] text-white"
                  : "text-forensic-300 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-amber-500" />
              )}
              <item.icon size={16} strokeWidth={2} className={active ? "text-amber-500" : "text-forensic-300 group-hover:text-forensic-100"} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-3 border-t border-white/[0.07]">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.05]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forensic-500 text-[12px] font-semibold text-white">
            RS
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">Rhea Sharma</p>
            <p className="truncate text-[11.5px] text-forensic-300">Super admin</p>
          </div>
          <ChevronsUpDown size={13} className="text-forensic-300" />
        </button>
        <button
          onClick={onSignOut}
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-forensic-300 transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
