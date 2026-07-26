import { useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import Topbar from "./Topbar";
import Badge from "./Badge";

type Tab = "general" | "security" | "notifications" | "api";

const TABS: { key: Tab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "security", label: "Security" },
  { key: "notifications", label: "Notifications" },
  { key: "api", label: "API & Webhooks" },
];

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-forensic-500" : "bg-line"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 py-4">
      <div>
        <p className="text-[13.5px] font-medium text-ink">{label}</p>
        {hint && <p className="mt-0.5 text-[12px] text-ink-faint">{hint}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full max-w-sm rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint transition-colors focus:border-forensic-500 focus:outline-none focus:ring-2 focus:ring-forensic-500/15";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general");

  return (
    <div>
      <Topbar title="Settings" subtitle="Platform-wide configuration for FinExis admins" />

      <div className="px-5 py-6 lg:px-8 lg:py-8">
        <div className="flex gap-1 border-b border-line mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-[13.5px] font-medium transition-colors ${
                tab === t.key
                  ? "border-forensic-500 text-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "general" && (
          <div className="rounded-xl border border-line bg-surface shadow-card px-5 sm:px-6 divide-y divide-line-soft">
            <Field label="Platform name" hint="Shown in emails and the browser tab.">
              <input className={inputClass} defaultValue="FinExis" />
            </Field>
            <Field label="Support email" hint="Where tenant escalations are routed.">
              <input className={inputClass} defaultValue="platform-support@finexis.io" />
            </Field>
            <Field label="Default timezone" hint="Used for new tenants unless overridden.">
              <select className={inputClass}>
                <option>Asia/Kolkata (IST, UTC+5:30)</option>
                <option>UTC</option>
                <option>Asia/Dubai (GST, UTC+4:00)</option>
              </select>
            </Field>
            <Field label="Default case retention" hint="How long closed cases are retained before archival.">
              <select className={inputClass}>
                <option>7 years</option>
                <option>5 years</option>
                <option>3 years</option>
                <option>Indefinite</option>
              </select>
            </Field>
            <div className="py-5 flex justify-end">
              <button className="rounded-lg bg-forensic-500 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-forensic-600 transition-colors">
                Save changes
              </button>
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="rounded-xl border border-line bg-surface shadow-card px-5 sm:px-6 divide-y divide-line-soft">
            <Field label="Enforce SSO / SAML" hint="Require all tenants to authenticate via configured identity provider.">
              <Toggle defaultOn />
            </Field>
            <Field label="Require two-factor authentication" hint="Applies to all users with admin or investigator roles.">
              <Toggle defaultOn />
            </Field>
            <Field label="Session timeout" hint="Users are signed out after this period of inactivity.">
              <select className={inputClass}>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
                <option>8 hours</option>
              </select>
            </Field>
            <Field label="IP allowlist" hint="Restrict platform admin console access to these ranges.">
              <textarea rows={3} className={inputClass} placeholder="103.22.14.0/24&#10;182.64.9.0/24" />
            </Field>
            <div className="py-5 flex justify-end">
              <button className="rounded-lg bg-forensic-500 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-forensic-600 transition-colors">
                Save changes
              </button>
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div className="rounded-xl border border-line bg-surface shadow-card px-5 sm:px-6 divide-y divide-line-soft">
            <Field label="New tenant requests" hint="Email admins when a new organisation requests access.">
              <Toggle defaultOn />
            </Field>
            <Field label="Suspicious login attempts" hint="Alert when repeated failed logins occur across tenants.">
              <Toggle defaultOn />
            </Field>
            <Field label="Weekly platform digest" hint="Summary of tenant activity, cases, and system health.">
              <Toggle />
            </Field>
            <Field label="System degradation alerts" hint="Notify on-call admins when a service reports degraded status.">
              <Toggle defaultOn />
            </Field>
          </div>
        )}

        {tab === "api" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-line bg-surface shadow-card">
              <div className="flex items-center justify-between border-b border-line-soft px-5 sm:px-6 py-4">
                <div>
                  <h2 className="font-display text-[15.5px] font-semibold text-ink">API keys</h2>
                  <p className="mt-0.5 text-[12.5px] text-ink-muted">Used for platform-level integrations.</p>
                </div>
                <button className="flex items-center gap-1.5 rounded-lg bg-forensic-500 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-forensic-600 transition-colors">
                  <Plus size={14} />
                  Generate key
                </button>
              </div>
              <ul className="divide-y divide-line-soft">
                {[
                  { name: "prod-key-0091", created: "Jul 10, 2026", scope: "Read & write" },
                  { name: "reporting-readonly", created: "Feb 2, 2026", scope: "Read only" },
                ].map((k) => (
                  <li key={k.name} className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-[13px] font-medium text-ink">{k.name}</code>
                        <Badge tone="green">{k.scope}</Badge>
                      </div>
                      <p className="mt-1 text-[12px] text-ink-faint">Created {k.created}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="text-ink-faint hover:text-ink transition-colors">
                        <Copy size={15} />
                      </button>
                      <button className="text-ink-faint hover:text-flag-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-line bg-surface shadow-card px-5 sm:px-6 divide-y divide-line-soft">
              <Field label="Webhook endpoint" hint="Receives platform-level events (tenant, user, case lifecycle).">
                <input className={inputClass} defaultValue="https://hooks.finexis-internal.io/platform" />
              </Field>
              <Field label="Signing secret" hint="Used to verify webhook payload authenticity.">
                <div className="flex items-center gap-2 max-w-sm">
                  <input className={inputClass + " max-w-none"} defaultValue="whsec_••••••••••••••••" readOnly />
                  <button className="text-ink-faint hover:text-ink transition-colors shrink-0">
                    <Copy size={15} />
                  </button>
                </div>
              </Field>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
