import React from "react";
import { CHIP_DEFINITIONS } from "../../utils/txnRules";

interface ChipsBarProps {
  activeChips: string[];
  onToggleChip: (chipId: string) => void;
}

export const KeywordChipsBar: React.FC<ChipsBarProps> = ({ activeChips, onToggleChip }) => {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-[13px] font-semibold text-ink">Pattern Lens</p>
        <p className="text-[11.5px] text-ink-faint">Apply forensic rule filters to isolate suspicious patterns</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {CHIP_DEFINITIONS.map((chip) => {
          const isActive = activeChips.includes(chip.id);
          return (
            <button
              key={chip.id}
              onClick={() => onToggleChip(chip.id)}
              className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                isActive
                  ? "border-forensic-500 bg-forensic-50 text-forensic-700 shadow-sm font-semibold"
                  : "border-line bg-surface text-ink-muted hover:bg-paper"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};