"use client";

import { clsx } from "clsx";
import { Check, Lightbulb, Lock } from "lucide-react";
import type { ReactNode } from "react";

export interface LadderStep {
  key: string;
  label: string;
  content: ReactNode;
  /** Rendered once the step is unlocked. */
  revealed: boolean;
  /** True for the terminal "solution" step — gets the check styling instead of the bulb. */
  isSolution?: boolean;
}

/**
 * The application's signature visual: a vertical rail of progressively
 * revealed steps (Problem → Hint → ... → Solution). Used by the Debugger
 * now, and reused as-is by Hint Mode / Practice in later phases.
 */
export function HintLadder({ steps }: { steps: LadderStep[] }) {
  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                className={clsx(
                  "absolute left-[15px] top-8 h-[calc(100%-1.75rem)] w-px",
                  step.revealed ? "bg-hint/40" : "bg-ink-border"
                )}
                aria-hidden
              />
            )}
            <span
              className={clsx(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                step.revealed
                  ? step.isSolution
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-hint bg-hint-soft text-hint animate-rung-glow"
                  : "border-ink-border bg-ink-surface text-text-faint"
              )}
            >
              {step.revealed ? (
                step.isSolution ? (
                  <Check size={14} />
                ) : (
                  <Lightbulb size={14} />
                )
              ) : (
                <Lock size={12} />
              )}
            </span>

            <div className="flex-1 pt-1">
              <div
                className={clsx(
                  "text-sm font-medium",
                  step.revealed ? "text-text-primary" : "text-text-faint"
                )}
              >
                {step.label}
              </div>
              {step.revealed && (
                <div className="mt-1.5 animate-fade-up text-sm leading-relaxed text-text-secondary">
                  {step.content}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
