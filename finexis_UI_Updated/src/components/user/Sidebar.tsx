import React, { useState } from "react";
import {
  LayoutGrid,
  FolderKanban,
  FilePlus2,
  ListChecks,
  FileSearch,
  Fingerprint,
  FileSpreadsheet,
  ArrowLeftRight,
  Wallet,
  QrCode,
  Waypoints,
  Bitcoin,
  Users2,
  ClipboardCheck,
  Archive,
  FileText,
  FileSignature,
  History,
  BookmarkCheck,
  UserCog,
  LogOut,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Logo from "../Logo";
import type { UserPage } from "./UserApp";

interface Props {
  page: UserPage;
  onNavigate: (page: UserPage) => void;
  onSignOut?: () => void;
}

const CASES = [
  { key: "case-manager" as UserPage, label: "Case Manager", icon: ListChecks },
  { key: "create-case" as UserPage, label: "Create Case", icon: FilePlus2 },
  { key: "case-overview" as UserPage, label: "Case Overview", icon: FileSearch },
];

const INVESTIGATION = [
  { key: "statement-analysis" as UserPage, label: "Statement Analysis", icon: FileSpreadsheet },
  { key: "transaction-intelligence" as UserPage, label: "Transaction Intelligence", icon: ArrowLeftRight },
  { key: "digital-spend" as UserPage, label: "Digital Spend Intelligence", icon: Wallet },
  { key: "upi-intelligence" as UserPage, label: "UPI Intelligence", icon: QrCode },
  { key: "fund-flow" as UserPage, label: "Fund Flow Analysis", icon: Waypoints },
  { key: "crypto-intelligence" as UserPage, label: "Crypto Intelligence", icon: Bitcoin },
  { key: "mule-intelligence" as UserPage, label: "Mule Intelligence", icon: Users2 },
  { key: "findings" as UserPage, label: "Investigation Findings", icon: ClipboardCheck },
  { key: "evidence-locker" as UserPage, label: "Evidence Locker", icon: Archive },
  { key: "reports" as UserPage, label: "Reports", icon: FileText },
];

const LEGAL = [
  { key: "notice-generator" as UserPage, label: "Notice Generator", icon: FileSignature },
];

function GroupHeader({ label, icon: Icon, open, onToggle }: { label: string; icon: typeof FolderKanban; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[11.5px] font-semibold uppercase tracking-wide text-forensic-300 hover:text-white transition-colors"
    >
      <Icon size={13} />
      <span className="flex-1 text-left">{label}</span>
      {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
    </button>
  );
}

// 1. Moved NavItem outside of Sidebar
function NavItem({ 
  item, 
  page, 
  onNavigate 
}: { 
  item: { key: UserPage; label: string; icon: React.ElementType }; 
  page: UserPage; 
  onNavigate: (page: UserPage) => void;
}) {
  const active = item.key === page;
  return (
    <button
      onClick={() => onNavigate(item.key)}
      className={`group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
        active ? "bg-white/[0.09] text-white" : "text-forensic-300 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {active && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-amber-500" />}
      <item.icon size={15} strokeWidth={2} className={active ? "text-amber-500" : "text-forensic-300 group-hover:text-forensic-100"} />
      <span className="truncate text-left">{item.label}</span>
    </button>
  );
}

export default function Sidebar({ page, onNavigate, onSignOut }: Props) {
  const [casesOpen, setCasesOpen] = useState(true);
  const [investigationOpen, setInvestigationOpen] = useState(true);
  const [legalOpen, setLegalOpen] = useState(true);

  return (
    <aside className="hidden lg:flex lg:w-[264px] shrink-0 flex-col bg-forensic-900 h-screen sticky top-0">
      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.15) transparent; }
      `}} />

      <div className="px-5 pt-6 pb-5 border-b border-white/[0.07]">
        <Logo variant="light" />
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-widest2 text-forensic-300">
          Investigator Workspace
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto sidebar-scroll">
        <div className="space-y-0.5">
          {/* 2. Added page and onNavigate props to all NavItem calls */}
          <NavItem item={{ key: "dashboard" as UserPage, label: "Dashboard", icon: LayoutGrid }} page={page} onNavigate={onNavigate} />
        </div>

        <div className="space-y-0.5">
          <GroupHeader label="Cases" icon={FolderKanban} open={casesOpen} onToggle={() => setCasesOpen((v) => !v)} />
          {casesOpen && (
            <div className="space-y-0.5 pl-1">
              {CASES.map((item) => (
                <NavItem key={item.key} item={item} page={page} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <GroupHeader label="Investigation" icon={Fingerprint} open={investigationOpen} onToggle={() => setInvestigationOpen((v) => !v)} />
          {investigationOpen && (
            <div className="space-y-0.5 pl-1">
              {INVESTIGATION.map((item) => (
                <NavItem key={item.key} item={item} page={page} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <GroupHeader label="Legal Tools" icon={FileSignature} open={legalOpen} onToggle={() => setLegalOpen((v) => !v)} />
          {legalOpen && (
            <div className="space-y-0.5 pl-1">
              {LEGAL.map((item) => (
                <NavItem key={item.key} item={item} page={page} onNavigate={onNavigate} />
              ))}
              <div className="mt-1 px-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                  LEA Licensed
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-0.5 pt-1 border-t border-white/[0.07]">
          {/* 3. Updated these single item calls as well */}
          <NavItem item={{ key: "recent-activity" as UserPage, label: "Recent Activity", icon: History }} page={page} onNavigate={onNavigate} />
          <NavItem item={{ key: "saved-searches" as UserPage, label: "Saved Searches", icon: BookmarkCheck }} page={page} onNavigate={onNavigate} />
          <NavItem item={{ key: "profile-settings" as UserPage, label: "Profile & Settings", icon: UserCog }} page={page} onNavigate={onNavigate} />
        </div>
      </nav>

      <div className="px-3 pb-4 pt-3 border-t border-white/[0.07]">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.05]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forensic-500 text-[12px] font-semibold text-white">
            AN
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">Arjun Nair</p>
            <p className="truncate text-[11.5px] text-forensic-300">Investigator · Ashoka State Police</p>
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