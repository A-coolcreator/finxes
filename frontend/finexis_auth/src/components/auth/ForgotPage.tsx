import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Logo from "../Logo";

interface Props {
  onNavigate: (page: "login" | "signup" | "forgot") => void;
}

type Step = "email" | "otp" | "reset" | "done";

export default function ForgotPage({ onNavigate }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  function next(to: Step) {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(to); }, 1200);
  }

  function handleOtpChange(i: number, v: string) {
    if (!/^\d?$/.test(v)) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`);
      el?.focus();
    }
  }

  const steps: { id: Step; label: string }[] = [
    { id: "email", label: "Email" },
    { id: "otp",   label: "Verify" },
    { id: "reset", label: "Reset" },
  ];
  const stepIdx = steps.findIndex(s => s.id === step);

  if (step === "done") {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-5">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forensic-50 border border-forensic-100">
            <CheckCircle2 size={30} className="text-forensic-500" />
          </div>
          <h2 className="mt-5 font-display text-[24px] font-semibold text-ink">Password reset</h2>
          <p className="mt-2 text-[14.5px] text-ink-muted">Your password has been updated. You can now sign in with your new credentials.</p>
          <button onClick={() => onNavigate("login")}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-forensic-500 py-2.5 text-[14.5px] font-semibold text-white hover:bg-forensic-600 transition-colors">
            Back to sign in <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between bg-forensic-700 relative overflow-hidden p-12 xl:p-16">
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 700 800" preserveAspectRatio="xMidYMid slice">
          {[[80,120],[220,80],[380,150],[540,100],[160,280],[320,240],[480,300],[640,220],[100,420],[260,380],[440,440],[620,390],[180,560],[360,520],[520,580],[680,540]].map(([cx,cy],i)=>(
            <circle key={i} cx={cx} cy={cy} r={i%3===0?5:3} fill="#EAF4F1">
              <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2.2+i*0.18}s`} repeatCount="indefinite"/>
            </circle>
          ))}
          {[[80,120,220,80],[220,80,380,150],[380,150,540,100],[220,80,320,240],[380,150,480,300],[320,240,480,300],[480,300,640,220],[160,280,320,240],[260,380,440,440],[440,440,620,390],[360,520,520,580]].map(([x1,y1,x2,y2],i)=>(
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#EAF4F1" strokeWidth="0.8" strokeDasharray="5 5"
              style={{animation:`flow-dash ${1.3+i*0.07}s linear infinite`}}/>
          ))}
          {/* Lock icon in center */}
          <g transform="translate(320,390)">
            <rect x="-28" y="-18" width="56" height="44" rx="8" fill="rgba(234,244,241,0.12)" stroke="#EAF4F1" strokeWidth="1.5"/>
            <path d="M-14 -18 L-14 -30 A14 14 0 0 1 14 -30 L14 -18" stroke="#EAF4F1" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <circle cx="0" cy="10" r="5" fill="#D97706"/>
          </g>
        </svg>

        <Logo variant="light" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 mb-6">
            <ShieldCheck size={14} className="text-forensic-300" />
            <span className="text-[12px] font-medium text-forensic-300">Secure password reset</span>
          </div>
          <h2 className="font-display text-[34px] xl:text-[38px] font-semibold leading-tight text-white">
            Regain access to your investigation workspace.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-forensic-300">
            We'll send a verification code to your registered work email. Once verified, you can set a new password and get back to your cases.
          </p>

          <div className="mt-8 space-y-4">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-colors ${
                  i < stepIdx ? "bg-forensic-500 text-white"
                  : i === stepIdx ? "bg-white text-forensic-700"
                  : "border border-white/20 text-white/40"
                }`}>
                  {i < stepIdx ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={`text-[13.5px] font-medium ${i === stepIdx ? "text-white" : i < stepIdx ? "text-forensic-300" : "text-white/40"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[12.5px] text-forensic-300">
          All case data stays within your environment.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[400px]">

          <div className="lg:hidden mb-7"><Logo /></div>

          <button onClick={() => step === "email" ? onNavigate("login") : setStep(step === "otp" ? "email" : "otp")}
            className="mb-6 flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink transition-colors">
            <ArrowLeft size={15} /> Back
          </button>

          {/* Step progress (mobile) */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div key={s.id} className={`h-1 flex-1 rounded-full transition-colors ${i <= stepIdx ? "bg-forensic-500" : "bg-line"}`} />
            ))}
          </div>

          {/* ── Step 1: Email ── */}
          {step === "email" && (
            <>
              <div className="mb-1.5 flex h-11 w-11 items-center justify-center rounded-xl bg-forensic-50 border border-forensic-100">
                <Mail size={20} className="text-forensic-500" />
              </div>
              <h2 className="mt-4 font-display text-[26px] font-semibold text-ink">Forgot password?</h2>
              <p className="mt-1.5 text-[14px] text-ink-muted">Enter your work email and we'll send a verification code.</p>

              <form onSubmit={e => { e.preventDefault(); next("otp"); }} className="mt-7 space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">Work email</label>
                  <input type="email" required placeholder="you@gov.in" value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint
                      transition-colors focus:border-forensic-500 focus:outline-none focus:ring-2 focus:ring-forensic-500/15"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-forensic-500 py-2.5 text-[14.5px] font-semibold text-white
                    hover:bg-forensic-600 disabled:opacity-60 transition-colors">
                  {loading ? <Spinner /> : <>Send code <ArrowRight size={15} /></>}
                </button>
              </form>
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <>
              <div className="mb-1.5 flex h-11 w-11 items-center justify-center rounded-xl bg-forensic-50 border border-forensic-100">
                <ShieldCheck size={20} className="text-forensic-500" />
              </div>
              <h2 className="mt-4 font-display text-[26px] font-semibold text-ink">Check your email</h2>
              <p className="mt-1.5 text-[14px] text-ink-muted">
                We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>
              </p>

              <form onSubmit={e => { e.preventDefault(); next("reset"); }} className="mt-7 space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-3">Verification code</label>
                  <div className="flex gap-2">
                    {otp.map((v, i) => (
                      <input key={i} id={`otp-${i}`} type="text" inputMode="numeric"
                        maxLength={1} value={v}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Backspace" && !v && i > 0)
                            document.getElementById(`otp-${i-1}`)?.focus();
                        }}
                        className="flex-1 h-12 rounded-lg border border-line bg-surface text-center text-[20px] font-semibold text-ink
                          transition-colors focus:border-forensic-500 focus:outline-none focus:ring-2 focus:ring-forensic-500/15"
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading || otp.some(v => !v)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-forensic-500 py-2.5 text-[14.5px] font-semibold text-white
                    hover:bg-forensic-600 disabled:opacity-60 transition-colors">
                  {loading ? <Spinner /> : <>Verify <ArrowRight size={15} /></>}
                </button>

                <p className="text-center text-[13px] text-ink-muted">
                  Didn't receive it?{" "}
                  <button type="button" className="font-semibold text-forensic-500 hover:text-forensic-600 transition-colors">
                    Resend code
                  </button>
                </p>
              </form>
            </>
          )}

          {/* ── Step 3: New Password ── */}
          {step === "reset" && (
            <>
              <div className="mb-1.5 flex h-11 w-11 items-center justify-center rounded-xl bg-forensic-50 border border-forensic-100">
                <ShieldCheck size={20} className="text-forensic-500" />
              </div>
              <h2 className="mt-4 font-display text-[26px] font-semibold text-ink">Set new password</h2>
              <p className="mt-1.5 text-[14px] text-ink-muted">Must be at least 8 characters with a number and special character.</p>

              <form onSubmit={e => { e.preventDefault(); next("done"); }} className="mt-7 space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">New password</label>
                  <div className="relative">
                    <input type={show ? "text" : "password"} required placeholder="Min. 8 characters"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 pr-10 text-[14px] text-ink placeholder:text-ink-faint
                        transition-colors focus:border-forensic-500 focus:outline-none focus:ring-2 focus:ring-forensic-500/15"
                    />
                    <button type="button" onClick={() => setShow(v=>!v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted">
                      {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">Confirm password</label>
                  <input type={show ? "text" : "password"} required placeholder="Repeat password"
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint bg-surface
                      transition-colors focus:outline-none focus:ring-2 ${
                        confirm && confirm !== password
                          ? "border-flag-500 focus:ring-flag-500/15"
                          : "border-line focus:border-forensic-500 focus:ring-forensic-500/15"
                      }`}
                  />
                  {confirm && confirm !== password && (
                    <p className="mt-1 text-[12px] text-flag-500">Passwords don't match</p>
                  )}
                </div>

                <button type="submit" disabled={loading || !password || password !== confirm}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-forensic-500 py-2.5 text-[14.5px] font-semibold text-white
                    hover:bg-forensic-600 disabled:opacity-60 transition-colors">
                  {loading ? <Spinner /> : <>Reset password <ArrowRight size={15} /></>}
                </button>
              </form>
            </>
          )}

          <p className="mt-8 text-center text-[13.5px] text-ink-muted">
            Remember your password?{" "}
            <button onClick={() => onNavigate("login")}
              className="font-semibold text-forensic-500 hover:text-forensic-600 transition-colors">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}
