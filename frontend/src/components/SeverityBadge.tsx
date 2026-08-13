import type { Severity } from "@/types";

const SEVERITY_META: Record<Severity, { label: string; dot: string; text: string; bg: string }> = {
  critical: { label: "Critical", dot: "🔴", text: "text-severity-critical", bg: "bg-severity-critical/10" },
  warning: { label: "Warning", dot: "🟠", text: "text-severity-warning", bg: "bg-severity-warning/10" },
  improvement: {
    label: "Improvement",
    dot: "🟡",
    text: "text-severity-improvement",
    bg: "bg-severity-improvement/10",
  },
  suggestion: {
    label: "Suggestion",
    dot: "🔵",
    text: "text-severity-suggestion",
    bg: "bg-severity-suggestion/10",
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${meta.text} ${meta.bg}`}
    >
      <span aria-hidden>{meta.dot}</span>
      {meta.label}
    </span>
  );
}
