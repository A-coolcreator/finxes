import { useState, type FormEvent } from "react";
import { Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import Logo from "../Logo";

interface Props {
  onNavigate: (page: "login" | "signup" | "forgot") => void;
}

const roles = [
  "Investigating Officer / SP / DSP",
  "Cyber Crime Analyst",
  "FIU / Compliance Officer",
  "Economic Offences Officer",
  "Tax / Revenue Intelligence",
  "Other",
];

const strength = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "bg-flag-500", "bg-amber-500", "bg-amber-400", "bg-forensic-500"];

export default function SignupPage({ onNavigate }: Props) {
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", org: "", role: "", email: "", phone: "", password: "" });
  const pw_strength = strength(form.password);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1600);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-5">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forensic-50 border border-forensic-100">
            <CheckCircle2 size={30} className="text-forensic-500" />
          </div>
          <h2 className="mt-5 font-display text-[26px] font-semibold text-ink">Request received</h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">
            Your access request has been submitted. Our team will review and get back to you at{" "}
            <span className="font-semibold text-ink">{form.email}</span> within one business day.
          </p>
          <div className="mt-6 rounded-xl border border-line bg-surface p-5 text-left space-y-3">
            {[
              { l: "Name", v: form.name },
              { l: "Organisation", v: form.org },
              { l: "Role", v: form.role },
            ].map(r => (
              <div key={r.l} className="flex justify-between text-[13.5px]">
                <span className="text-ink-faint">{r.l}</span>
                <span className="font-medium text-ink">{r.v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate("login")}
            className="mt-6 w-full rounded-lg border border-line bg-surface py-2.5 text-[14px] font-medium text-ink hover:bg-paper transition-colors">
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-between bg-forensic-700 relative overflow-hidden p-12 xl:p-14">
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 700 900" preserveAspectRatio="xMidYMid slice">
          {[[100,150],[250,100],[420,180],[580,120],[140,310],[320,280],[500,320],[660,260],[80,460],[260,420],[440,480],[620,430],[160,600],[380,560],[540,620],[700,580],[200,740],[450,700],[620,760]].map(([cx,cy],i)=>(
            <circle key={i} cx={cx} cy={cy} r={i%4===0?6:3.5} fill="#EAF4F1">
              <animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${2+i*0.15}s`} repeatCount="indefinite"/>
            </circle>
          ))}
          {[[100,150,250,100],[250,100,420,180],[420,180,580,120],[250,100,320,280],[420,180,500,320],[320,280,500,320],[500,320,660,260],[140,310,320,280],[260,420,440,480],[440,480,620,430],[380,560,540,620],[200,740,450,700]].map(([x1,y1,x2,y2],i)=>(
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#EAF4F1" strokeWidth="0.8" strokeDasharray="5 5"
              style={{animation:`flow-dash ${1.4+i*0.06}s linear infinite`}}/>
          ))}
          <circle cx={440} cy={480} r={9} fill="#D97706"><animate attributeName="r" values="7;11;7" dur="2.2s" repeatCount="indefinite"/></circle>
          <circle cx={500} cy={320} r={7} fill="#D97706" opacity="0.7"/>
        </svg>

        <Logo variant="light" />

        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest2 text-forensic-300 mb-4">
            Join FinExis
          </p>
          <h2 className="font-display text-[34px] xl:text-[38px] font-semibold leading-tight text-white">
            Built for those who follow the money.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-forensic-300">
            FinExis is available exclusively to law enforcement, economic offences units, FIUs, and tax authorities. Access is reviewed and approved by our team.
          </p>

          <div className="mt-8 space-y-3.5">
            {[
              "Bank statements, UPI exports & NCRP complaints supported",
              "Fund flows and mule networks surfaced automatically",
              "Court-ready evidence packages in minutes",
              "Tenant-isolated — your data never leaves your environment",
            ].map(t => (
              <div key={t} className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-forensic-300 mt-0.5 shrink-0" />
                <p className="text-[13.5px] text-forensic-300 leading-snug">{t}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-forensic-300 text-[12.5px]">
          <ShieldCheck size={14} />
          Access restricted to verified law enforcement & government units
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-start justify-center px-5 py-10 sm:px-10 overflow-y-auto">
        <div className="w-full max-w-[420px] py-4">

          <div className="lg:hidden mb-7"><Logo /></div>

          <h2 className="font-display text-[26px] font-semibold text-ink">Request access</h2>
          <p className="mt-1.5 text-[14px] text-ink-muted">Tell us about your unit and we'll get you set up.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full name" id="name" required placeholder="Rajan Mehta"
                value={form.name} onChange={v => setForm(f=>({...f,name:v}))} />
              <Field label="Organisation" id="org" required placeholder="Cyber Crime Unit, MH"
                value={form.org} onChange={v => setForm(f=>({...f,org:v}))} />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Role / Designation <span className="text-flag-500">*</span></label>
              <select required value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink
                  transition-colors focus:border-forensic-500 focus:outline-none focus:ring-2 focus:ring-forensic-500/15">
                <option value="" disabled>Select your role</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Work email" id="email" type="email" required placeholder="you@gov.in"
                value={form.email} onChange={v => setForm(f=>({...f,email:v}))} />
              <Field label="Phone" id="phone" type="tel" placeholder="+91 98765 43210"
                value={form.phone} onChange={v => setForm(f=>({...f,phone:v}))} />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">
                Password <span className="text-flag-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"} required placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm(f=>({...f,password:e.target.value}))}
                  className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 pr-10 text-[14px] text-ink placeholder:text-ink-faint
                    transition-colors focus:border-forensic-500 focus:outline-none focus:ring-2 focus:ring-forensic-500/15"
                />
                <button type="button" onClick={() => setShow(v=>!v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pw_strength ? strengthColor[pw_strength] : "bg-line"}`} />
                    ))}
                  </div>
                  <p className="text-[11.5px] text-ink-faint">{strengthLabel[pw_strength]}</p>
                </div>
              )}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-line text-forensic-500 focus:ring-forensic-500/20" />
              <span className="text-[12.5px] text-ink-muted leading-relaxed">
                I confirm this request is for official law enforcement or government use. I agree to the{" "}
                <a href="#" className="text-forensic-500 hover:underline">Terms of Use</a> and{" "}
                <a href="#" className="text-forensic-500 hover:underline">Privacy Policy</a>.
              </span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-forensic-500 py-2.5 text-[14.5px] font-semibold text-white
                transition-all hover:bg-forensic-600 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Submitting…
                </>
              ) : (
                <>Submit request <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13.5px] text-ink-muted">
            Already have access?{" "}
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

function Field({ label, id, type="text", required=false, placeholder="", value, onChange }: {
  label: string; id: string; type?: string; required?: boolean;
  placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-ink mb-1.5">
        {label}{required && <span className="text-flag-500"> *</span>}
      </label>
      <input id={id} type={type} required={required} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint
          transition-colors focus:border-forensic-500 focus:outline-none focus:ring-2 focus:ring-forensic-500/15"
      />
    </div>
  );
}
