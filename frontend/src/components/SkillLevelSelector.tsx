"use client";

import { clsx } from "clsx";
import type { SkillLevel } from "@/types";

const LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function SkillLevelSelector({
  value,
  onChange,
}: {
  value: SkillLevel;
  onChange: (level: SkillLevel) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-ink-border bg-ink-surface p-0.5">
      {LEVELS.map((level) => (
        <button
          key={level.value}
          onClick={() => onChange(level.value)}
          className={clsx(
            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
            value === level.value
              ? "bg-brand-soft text-brand"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
}
