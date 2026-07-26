interface Segment {
  label: string;
  value: number;
  color: string;
}

export default function DonutChart({ segments, size = 128, thickness = 18 }: { segments: Segment[]; size?: number; thickness?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EDEFF3" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * circumference;
          const gap = circumference - dash;
          const circle = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offsetAcc}
              strokeLinecap="butt"
            />
          );
          offsetAcc += dash;
          return circle;
        })}
      </svg>
      <ul className="space-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-[12.5px]">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-ink-muted">{s.label}</span>
            <span className="ml-auto font-medium text-ink">{s.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
