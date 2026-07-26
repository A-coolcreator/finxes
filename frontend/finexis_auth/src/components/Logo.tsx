interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

export default function Logo({ variant = "dark", className = "" }: LogoProps) {
  const wordColor = variant === "dark" ? "text-ink" : "text-white";
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#0A4F44" />
        <circle cx="16" cy="46" r="4.5" fill="#EAF4F1" />
        <circle cx="32" cy="30" r="4.5" fill="#EAF4F1" />
        <circle cx="48" cy="40" r="4.5" fill="#D97706" />
        <circle cx="40" cy="18" r="4.5" fill="#EAF4F1" />
        <path d="M19 43L29 32" stroke="#EAF4F1" strokeWidth="2" strokeLinecap="round" />
        <path d="M35 28L37 21" stroke="#EAF4F1" strokeWidth="2" strokeLinecap="round" />
        <path d="M35 32L45 38" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className={`font-display font-semibold text-[19px] tracking-tight ${wordColor}`}>
        FinExis
      </span>
    </div>
  );
}
