import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle(opt: string) {
    onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors ${
          selected.length > 0 ? "border-forensic-300 bg-forensic-50 text-forensic-700" : "border-line bg-surface text-ink-muted hover:bg-paper"
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-forensic-500 px-1 text-[10px] font-semibold text-white">
            {selected.length}
          </span>
        )}
        <ChevronDown size={13} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[190px] rounded-xl border border-line bg-surface p-2 shadow-2xl">
          {options.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-ink hover:bg-paper transition-colors"
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${active ? "border-forensic-500 bg-forensic-500" : "border-line"}`}>
                  {active && <Check size={11} className="text-white" />}
                </span>
                {opt}
              </button>
            );
          })}
          {selected.length > 0 && (
            <button onClick={() => onChange([])} className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-ink-faint hover:text-ink transition-colors border-t border-line-soft">
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
