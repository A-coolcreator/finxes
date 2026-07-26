import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";

const badgeStyles: Record<"neutral" | "watch" | "flag", string> = {
  neutral: "bg-paper text-ink-muted ring-1 ring-line-soft",
  watch: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  flag: "bg-red-50 text-flag-500 ring-1 ring-red-100",
};

function Badge({ tone, children }: { tone: "neutral" | "watch" | "flag"; children: ReactNode }) {
  return (
    <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium ${badgeStyles[tone]}`}>
      {children}
    </span>
  );
}

function TransactionMockup() {
  const rows: { time: string; narration: string; tag: string; tone: "neutral" | "watch" | "flag"; amount: string }[] = [
    { time: "09:41", narration: "UPI/9876543210@ybl/Payment", tag: "P2P transfer", tone: "neutral", amount: "₹45,000" },
    { time: "09:44", narration: "NEFT/COLLECTPVT/Settlement", tag: "Business settlement", tone: "watch", amount: "₹2,40,000" },
    { time: "10:10", narration: "UPI/cryptoxchange@paytm", tag: "Crypto exchange", tone: "flag", amount: "₹1,85,000" },
    { time: "10:52", narration: "IMPS/RAJESH KUMAR/Transfer", tag: "P2P transfer", tone: "neutral", amount: "₹12,500" },
  ];
  return (
    <div>
      <div className="flex items-center justify-between px-1 pb-2 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        <span>Transaction</span>
        <span>Classification</span>
      </div>
      <div className="divide-y divide-line-soft rounded-lg border border-line-soft bg-paper">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="font-mono text-[11.5px] text-ink-faint">{r.time}</span>
              <span className="truncate font-mono text-[12px] text-ink-muted">{r.narration}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <Badge tone={r.tone}>{r.tag}</Badge>
              <span className="font-mono text-[12.5px] font-medium text-ink">{r.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FundFlowMockup() {
  const nodes = [
    { label: "Account •••1187", tone: "neutral" as const },
    { label: "Account •••4452", tone: "watch" as const },
    { label: "Account •••9930", tone: "flag" as const },
  ];
  return (
    <div>
      <div className="flex flex-col items-stretch gap-0 sm:flex-row sm:items-center sm:gap-3">
        {nodes.map((n, i) => (
          <div key={i} className="flex flex-col items-center sm:contents">
            <div
              className={`w-full rounded-lg border px-3 py-2.5 text-center text-[12.5px] font-medium sm:w-auto sm:flex-1 ${
                n.tone === "flag" ? "border-flag-500/40 bg-red-50 text-flag-500" : n.tone === "watch" ? "border-amber-400/40 bg-amber-50 text-amber-600" : "border-line-soft bg-paper text-ink-muted"
              }`}
            >
              {n.label}
            </div>
            {i < nodes.length - 1 && (
              <div className="flex h-7 items-center justify-center sm:h-auto sm:w-10 sm:flex-none">
                <svg className="hidden h-4 w-full sm:block" viewBox="0 0 60 16" fill="none">
                  <line x1="2" y1="8" x2="50" y2="8" stroke="#0E6E5E" strokeWidth="2" strokeDasharray="5 5" />
                  <path d="M44 3L52 8L44 13" stroke="#0E6E5E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <ArrowDown size={14} className="text-forensic-500 sm:hidden" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line-soft pt-4 text-center">
        <div>
          <p className="font-display text-[18px] font-semibold text-ink">6</p>
          <p className="text-[11px] text-ink-faint">UTRs matched</p>
        </div>
        <div>
          <p className="font-display text-[18px] font-semibold text-ink">3</p>
          <p className="text-[11px] text-ink-faint">Hops traced</p>
        </div>
        <div>
          <p className="font-display text-[18px] font-semibold text-forensic-600">98%</p>
          <p className="text-[11px] text-ink-faint">Match confidence</p>
        </div>
      </div>
    </div>
  );
}

function MuleMockup() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] font-medium text-ink-muted">Mule risk score</p>
        <Badge tone="flag">High risk</Badge>
      </div>
      <div className="mt-2 flex items-end gap-1.5">
        <p className="font-display text-[36px] font-semibold leading-none text-ink">87</p>
        <p className="pb-1 text-[13px] text-ink-faint">/ 100</p>
      </div>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-line-soft">
        <div className="h-full rounded-full bg-flag-500" style={{ width: "87%" }} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-line-soft pt-4">
        <div className="rounded-lg bg-paper px-2.5 py-2 text-center">
          <p className="text-[13px] font-semibold text-ink">38 min</p>
          <p className="text-[10.5px] text-ink-faint">Holding time</p>
        </div>
        <div className="rounded-lg bg-paper px-2.5 py-2 text-center">
          <p className="text-[13px] font-semibold text-ink">High</p>
          <p className="text-[10.5px] text-ink-faint">Velocity</p>
        </div>
        <div className="rounded-lg bg-paper px-2.5 py-2 text-center">
          <p className="text-[13px] font-semibold text-flag-500">Detected</p>
          <p className="text-[10.5px] text-ink-faint">Cash-out path</p>
        </div>
      </div>
    </div>
  );
}

function UpiMockup() {
  const rows = [
    { vpa: "ramesh.k@oksbi", merchant: "QuickPay Solutions", qr: "14 collections" },
    { vpa: "9876543210@ybl", merchant: "—", qr: "2 collections" },
    { vpa: "shopnow.merchant@paytm", merchant: "ShopNow Retail", qr: "31 collections" },
  ];
  return (
    <div>
      <div className="flex items-center justify-between px-1 pb-2 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        <span>VPA</span>
        <span>Merchant · QR activity</span>
      </div>
      <div className="divide-y divide-line-soft rounded-lg border border-line-soft bg-paper">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <span className="truncate font-mono text-[12px] text-ink">{r.vpa}</span>
            <div className="flex shrink-0 items-center gap-2.5 text-right">
              <span className="text-[12px] text-ink-muted">{r.merchant}</span>
              <span className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-ink-muted ring-1 ring-line-soft">
                {r.qr}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntityMockup() {
  const entities = [
    { name: "ABC NBFC Pvt Ltd", type: "NBFC", tone: "neutral" as const, risk: "Low" },
    { name: "PayEase Gateway", type: "Payment gateway", tone: "watch" as const, risk: "Medium" },
    { name: "CoinTrade P2P", type: "Crypto exchange", tone: "flag" as const, risk: "High" },
  ];
  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      {entities.map((e, i) => (
        <div key={i} className="rounded-lg border border-line-soft bg-paper p-3">
          <p className="truncate text-[13px] font-semibold text-ink">{e.name}</p>
          <p className="mt-0.5 text-[11.5px] text-ink-faint">{e.type}</p>
          <div className="mt-2.5">
            <Badge tone={e.tone}>{e.risk} risk</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

const mockups: Record<string, () => ReactNode> = {
  transaction: TransactionMockup,
  fundflow: FundFlowMockup,
  mule: MuleMockup,
  upi: UpiMockup,
  entity: EntityMockup,
};

export default function ModuleScreenshot({ moduleKey, breadcrumb }: { moduleKey: string; breadcrumb: string }) {
  const Mockup = mockups[moduleKey];
  return (
    <div className="overflow-hidden rounded-t-xl border border-b-0 border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line-soft bg-paper px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="ml-2 truncate font-mono text-[11.5px] text-ink-faint">{breadcrumb}</span>
        <span className="ml-auto shrink-0 text-[11px] text-ink-faint">Illustrative case data</span>
      </div>
      <div className="p-5 sm:p-6">
        <Mockup />
      </div>
    </div>
  );
}
