"use client";

import type { Language } from "@/types";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
];

export function LanguageSelector({
  value,
  onChange,
}: {
  value: Language;
  onChange: (language: Language) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Language)}
      className="rounded-md border border-ink-border bg-ink-surface px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-brand"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.value} value={lang.value}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
