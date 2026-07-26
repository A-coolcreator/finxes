import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function sameDay(a: Date | null, b: Date | null) {
  return !!a && !!b && a.toDateString() === b.toDateString();
}
function fmt(d: Date | null) {
  if (!d) return "";
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}
function buildGrid(viewMonth: Date) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: Date | null;
  to: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date(2026, 4, 1));
  const [draftFrom, setDraftFrom] = useState<Date | null>(from);
  const [draftTo, setDraftTo] = useState<Date | null>(to);

  function pickDay(d: Date) {
    if (!draftFrom || (draftFrom && draftTo)) {
      setDraftFrom(d);
      setDraftTo(null);
    } else if (d < draftFrom) {
      setDraftFrom(d);
      setDraftTo(draftFrom);
    } else {
      setDraftTo(d);
    }
  }

  function renderMonth(monthDate: Date) {
    const cells = buildGrid(monthDate);
    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-1.5">
          {WEEKDAYS.map((w, i) => (
            <div key={i} className="text-center text-[10.5px] font-semibold text-ink-faint">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const isStart = sameDay(d, draftFrom);
            const isEnd = sameDay(d, draftTo);
            const inRange = draftFrom && draftTo && d > draftFrom && d < draftTo;
            return (
              <button
                key={i}
                onClick={() => pickDay(d)}
                className={`h-7 w-7 rounded-md text-[12px] transition-colors ${
                  isStart || isEnd
                    ? "bg-forensic-500 text-white font-semibold"
                    : inRange
                    ? "bg-forensic-50 text-forensic-700"
                    : "text-ink hover:bg-paper"
                }`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-[13px] font-medium text-ink-muted hover:bg-paper transition-colors"
      >
        <Calendar size={14} />
        {from && to ? (
          <span className="text-ink">{fmt(from)} – {fmt(to)}</span>
        ) : (
          <span>Date range</span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[300px] rounded-xl border border-line bg-surface p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} className="text-ink-faint hover:text-ink transition-colors">
              <ChevronLeft size={15} />
            </button>
            <span className="text-[13px] font-semibold text-ink">{MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} className="text-ink-faint hover:text-ink transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>

          {renderMonth(viewMonth)}

          <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3">
            <div className="text-[11.5px] text-ink-faint">
              {draftFrom ? fmt(draftFrom) : "Start"} → {draftTo ? fmt(draftTo) : "End"}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setDraftFrom(null); setDraftTo(null); onChange(null, null); }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-faint hover:text-ink transition-colors"
              >
                <X size={11} /> Clear
              </button>
              <button
                onClick={() => { onChange(draftFrom, draftTo); setOpen(false); }}
                disabled={!draftFrom || !draftTo}
                className="rounded-md bg-forensic-500 px-3 py-1 text-[11.5px] font-semibold text-white hover:bg-forensic-600 transition-colors disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
