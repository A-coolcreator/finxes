type Tone = "green" | "amber" | "red" | "gray" | "blue";

const TONES: Record<Tone, string> = {
  green: "bg-forensic-50 text-forensic-600 border-forensic-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  red: "bg-red-50 text-flag-500 border-red-100",
  gray: "bg-paper text-ink-muted border-line",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
};

export default function Badge({ tone = "gray", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold leading-none ${TONES[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}
