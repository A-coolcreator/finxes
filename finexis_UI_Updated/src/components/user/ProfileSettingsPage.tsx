import { useState } from "react";
import { Camera, Smartphone, Monitor, Copy, Trash2 } from "lucide-react";
import Topbar from "./Topbar";
import Badge from "../admin/Badge";

type Tab = "profile" | "security" | "notifications" | "preferences" | "api";
const TABS: { key: Tab; label: string }[] = [
  { key: "profile", label: "Profile" }, { key: "security", label: "Security" },
  { key: "notifications", label: "Notifications" }, { key: "preferences", label: "Preferences" },
  // { key: "api", label: "API Tokens" },
];

const inputClass = "w-full max-w-sm rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint transition-colors focus:border-forensic-500 focus:outline-none focus:ring-2 focus:ring-forensic-500/15";

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn((v) => !v)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-forensic-500" : "bg-line"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 py-4">
      <div><p className="text-[13.5px] font-medium text-ink">{label}</p>{hint && <p className="mt-0.5 text-[12px] text-ink-faint">{hint}</p>}</div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

export default function ProfileSettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div>
      <Topbar title="Profile & Settings" subtitle="Manage your account and investigation preferences" />

      <div className="px-5 py-6 lg:px-8 lg:py-8">
        <div className="flex gap-1 border-b border-line mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`shrink-0 border-b-2 px-4 py-2.5 text-[13.5px] font-medium transition-colors ${tab === t.key ? "border-forensic-500 text-ink" : "border-transparent text-ink-muted hover:text-ink"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="rounded-xl border border-line bg-surface shadow-card px-5 sm:px-6 divide-y divide-line-soft">
            <div className="flex items-center gap-4 py-5">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forensic-500 text-[18px] font-semibold text-white">AN</div>
                <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface border border-line text-ink-muted hover:text-ink transition-colors"><Camera size={12} /></button>
              </div>
              <div>
                <p className="text-[14.5px] font-semibold text-ink">Arjun Nair</p>
                <p className="text-[12.5px] text-ink-muted">Investigator · Ashoka State Police</p>
              </div>
            </div>
            <Field label="Full name"><input className={inputClass} defaultValue="Arjun Nair" /></Field>
            <Field label="Designation"><input className={inputClass} defaultValue="Investigating Officer" /></Field>
            <Field label="Organization"><input className={inputClass} defaultValue="Ashoka State Police" /></Field>
            <Field label="Department"><input className={inputClass} defaultValue="Cyber Crime Cell" /></Field>
            <Field label="Email"><input className={inputClass} defaultValue="arjun.nair@ashokapolice.gov.in" /></Field>
            <Field label="Phone"><input className={inputClass} defaultValue="+91 98765 43210" /></Field>
            <div className="py-5 flex justify-end gap-2">
              <button className="rounded-lg border border-line px-4 py-2.5 text-[13.5px] font-medium text-ink-muted hover:bg-paper transition-colors">Reset</button>
              <button className="rounded-lg bg-forensic-500 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-forensic-600 transition-colors">Save changes</button>
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-line bg-surface shadow-card px-5 sm:px-6 divide-y divide-line-soft">
              <Field label="Password" hint="Last changed 3 months ago"><button className="rounded-lg border border-line px-4 py-2 text-[13px] font-medium text-ink hover:bg-paper transition-colors">Change password</button></Field>
              <Field label="Two-factor authentication" hint="Required by your organization"><Toggle defaultOn /></Field>
            </div>
            <div className="rounded-xl border border-line bg-surface shadow-card">
              <div className="border-b border-line-soft px-5 sm:px-6 py-4"><h2 className="font-display text-[15px] font-semibold text-ink">Active sessions</h2></div>
              <ul className="divide-y divide-line-soft">
                {[
                  { device: "Chrome · Windows", icon: Monitor, loc: "Hyderabad, IN", current: true },
                  { device: "FinExis mobile · Android", icon: Smartphone, loc: "Hyderabad, IN", current: false },
                ].map((s) => (
                  <li key={s.device} className="flex items-center justify-between px-5 sm:px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <s.icon size={16} className="text-ink-muted" />
                      <div>
                        <p className="text-[13px] text-ink">{s.device}</p>
                        <p className="text-[11.5px] text-ink-faint">{s.loc}</p>
                      </div>
                    </div>
                    {s.current ? <Badge tone="green">This device</Badge> : <button className="text-[12px] font-medium text-flag-500 hover:text-flag-500/80">Sign out</button>}
                  </li>
                ))}
              </ul>
            </div>
            <button className="text-[13px] font-medium text-flag-500 hover:text-flag-500/80">Sign out of all devices</button>
          </div>
        )}

        {tab === "notifications" && (
          <div className="rounded-xl border border-line bg-surface shadow-card px-5 sm:px-6 divide-y divide-line-soft">
            <Field label="New high-risk alerts" hint="Notify me when a case crosses the risk threshold."><Toggle defaultOn /></Field>
            <Field label="Task reminders" hint="Email me about upcoming and overdue tasks."><Toggle defaultOn /></Field>
            <Field label="Report ready" hint="Notify when a generated report finishes processing."><Toggle defaultOn /></Field>
            <Field label="Case comments" hint="Notify when a teammate comments on your case."><Toggle /></Field>
          </div>
        )}

        {tab === "preferences" && (
          <div className="rounded-xl border border-line bg-surface shadow-card px-5 sm:px-6 divide-y divide-line-soft">
            <Field label="Theme"><select className={inputClass}><option>Light</option><option>Dark</option><option>System</option></select></Field>
            <Field label="Default dashboard"><select className={inputClass}><option>Dashboard</option><option>Case Manager</option></select></Field>
            <Field label="Language"><select className={inputClass}><option>English</option><option>Hindi</option></select></Field>
            <Field label="Timezone"><select className={inputClass}><option>Asia/Kolkata (IST)</option><option>UTC</option></select></Field>
            <Field label="Default risk threshold" hint="Flag transactions above this score by default."><select className={inputClass}><option>60/100</option><option>70/100</option><option>80/100</option></select></Field>
            <Field label="Default export format"><select className={inputClass}><option>PDF</option><option>Excel</option><option>Word</option></select></Field>
          </div>
        )}

        {tab === "api" && (
          <div className="rounded-xl border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-line-soft px-5 sm:px-6 py-4">
              <div><h2 className="font-display text-[15px] font-semibold text-ink">API tokens</h2><p className="mt-0.5 text-[12.5px] text-ink-muted">For personal scripts and integrations.</p></div>
              <button className="rounded-lg bg-forensic-500 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-forensic-600 transition-colors">Generate token</button>
            </div>
            <ul className="divide-y divide-line-soft">
              {[{ name: "personal-analysis-script", created: "May 2, 2026" }].map((k) => (
                <li key={k.name} className="flex items-center justify-between px-5 sm:px-6 py-4">
                  <div><code className="text-[13px] font-medium text-ink">{k.name}</code><p className="mt-1 text-[12px] text-ink-faint">Created {k.created}</p></div>
                  <div className="flex items-center gap-2"><button className="text-ink-faint hover:text-ink transition-colors"><Copy size={15} /></button><button className="text-ink-faint hover:text-flag-500 transition-colors"><Trash2 size={15} /></button></div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
