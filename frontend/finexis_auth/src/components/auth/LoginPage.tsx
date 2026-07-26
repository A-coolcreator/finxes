import { useState, type FormEvent } from "react";
import { Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import Logo from "../Logo";

interface Props {
  onNavigate: (page: "login" | "signup" | "forgot") => void;
}

export default function LoginPage({ onNavigate }: Props) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  }

  return (
    <div className="min-h-screen bg-paper flex">

      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[56%] flex-col justify-between bg-forensic-700 relative overflow-hidden p-12 xl:p-16">

        {/* Background graph illustration */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          {[
            [120,200],[280,140],[440,220],[600,160],[720,300],
            [160,380],[340,340],[500,400],[660,360],[200,520],
            [380,480],[540,540],[700,500],[120,620],[460,620],[680,640],
          ].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r={i%3===0?6:4} fill="#EAF4F1">
              <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2.5+i*0.2}s`} repeatCount="indefinite"/>
            </circle>
          ))}
          {[
            [120,200,280,140],[280,140,440,220],[440,220,600,160],[600,160,720,300],
            [280,140,340,340],[440,220,500,400],[340,340,500,400],[500,400,660,360],
            [160,380,340,340],[340,340,380,480],[380,480,540,540],[540,540,700,500],
            [200,520,380,480],[460,620,680,640],[120,620,460,620],
          ].map(([x1,y1,x2,y2],i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#EAF4F1" strokeWidth="1"
              strokeDasharray="5 5"
              style={{ animation: `flow-dash ${1.2+i*0.05}s linear infinite` }}/>
          ))}
          {/* Highlighted path — red node */}
          <circle cx={500} cy={400} r={8} fill="#D97706">
            <animate attributeName="r" values="6;9;6" dur="2s" repeatCount="indefinite"/>
          </circle>
          <line x1={280} y1={140} x2={500} y2={400} stroke="#D97706" strokeWidth="2" strokeDasharray="6 4"/>
          <line x1={500} y1={400} x2={680} y2={640} stroke="#D97706" strokeWidth="2" strokeDasharray="6 4"/>
        </svg>

        {/* Content */}
        <Logo variant="light" />

        <div className="relative z-10 max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-widest2 text-forensic-300 mb-4">
            Financial Intelligence Operating System
          </p>
          <h1 className="font-display text-[36px] xl:text-[42px] font-semibold leading-tight text-white">
            Follow the money.<br />Uncover the network.
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-forensic-300">
            Upload bank statements, UPI exports, and NCRP complaints.
            FinExis automatically maps fund flows, mule networks, and cash-out trails.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { v: "100+", l: "Bank formats" },
              { v: "< 10 min", l: "To fund-flow map" },
              { v: "500K+", l: "Transactions/case" },
              { v: "95%", l: "Less manual work" },
            ].map(m => (
              <div key={m.l} className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5">
                <p className="font-display text-[22px] font-semibold text-white">{m.v}</p>
                <p className="mt-0.5 text-[12.5px] text-forensic-300">{m.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 text-forensic-300 text-[13px]">
          <ShieldCheck size={15} className="text-forensic-300" />
          Tenant-isolated · Evidence-grade · SOC2 compliant
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <h2 className="font-display text-[28px] font-semibold text-ink">Welcome back</h2>
          <p className="mt-1.5 text-[14.5px] text-ink-muted">Sign in to your investigation workspace.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Work email</label>
              <input
                type="email" required placeholder="you@gov.in"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint
                  transition-colors focus:border-forensic-500 focus:outline-none focus:ring-2 focus:ring-forensic-500/15"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-medium text-ink">Password</label>
                <button type="button" onClick={() => onNavigate("forgot")}
                  className="text-[12.5px] font-medium text-forensic-500 hover:text-forensic-600 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={show ? "text" : "password"} required placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 pr-10 text-[14px] text-ink placeholder:text-ink-faint
                    transition-colors focus:border-forensic-500 focus:outline-none focus:ring-2 focus:ring-forensic-500/15"
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-forensic-500 py-2.5 text-[14.5px] font-semibold text-white
                transition-all hover:bg-forensic-600 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[12px] text-ink-faint">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <button type="button"
            className="mt-4 w-full flex items-center justify-center gap-2.5 rounded-lg border border-line bg-surface py-2.5 text-[14px] font-medium text-ink
              transition-colors hover:bg-paper hover:border-line-soft">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-8 text-center text-[13.5px] text-ink-muted">
            Don't have an account?{" "}
            <button onClick={() => onNavigate("signup")}
              className="font-semibold text-forensic-500 hover:text-forensic-600 transition-colors">
              Request access
            </button>
          </p>

          <p className="mt-6 text-center text-[11.5px] text-ink-faint">
            Protected by end-to-end encryption. All case data stays within your environment.
          </p>
        </div>
      </div>
    </div>
  );
}
