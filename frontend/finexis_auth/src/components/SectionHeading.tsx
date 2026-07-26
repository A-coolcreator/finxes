import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  heading: ReactNode;
  description?: string;
  align?: "center" | "left";
  theme?: "light" | "dark";
}

export default function SectionHeading({
  eyebrow,
  heading,
  description,
  align = "center",
  theme = "light",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const eyebrowColor = theme === "dark" ? "text-amber-500" : "text-forensic-600";
  const headingColor = theme === "dark" ? "text-white" : "text-ink";
  const descColor = theme === "dark" ? "text-white/60" : "text-ink-muted";

  return (
    <div className={`mb-10 lg:mb-12 overflow-x-auto ${isCenter ? "text-center" : ""}`}>
      <p className={`text-[12.5px] font-semibold uppercase tracking-widest2 ${eyebrowColor}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-3 font-display text-[32px] font-semibold leading-none whitespace-nowrap lg:text-[38px] ${headingColor}`}>
        {heading}
      </h2>
      {description && (
        <p
          className={`mt-4 text-[15.5px] leading-relaxed ${descColor} ${
            isCenter ? "mx-auto max-w-xl" : "max-w-2xl"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
