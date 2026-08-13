"use client";

import Link from "next/link";
import { ArrowRight, Bug, Code2, Sparkles } from "lucide-react";
import { HintLadder } from "@/components/HintLadder";
import { Button } from "@/components/ui";

const DEMO_STEPS = [
  { key: "problem", label: "Problem", content: "Your sum() function returns the wrong total for negative numbers.", revealed: true },
  { key: "hint1", label: "Hint 1", content: "What does your loop condition actually check — the value, or the index?", revealed: true },
  { key: "hint2", label: "Hint 2", content: "Trace it by hand for [-3, 5]. Where does the running total diverge from what you expect?", revealed: true },
  { key: "hint3", label: "Hint 3", content: "The bug is in how the accumulator is initialized before the loop starts.", revealed: false },
  { key: "solution", label: "Solution", content: "Full corrected code with an explanation of why it works.", revealed: false, isSolution: true },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Tutor",
    description: "Ask about errors, concepts, or algorithms. Explanations adjust to your skill level.",
    href: "/tutor",
  },
  {
    icon: Bug,
    title: "Code Debugger",
    description: "Paste your code and error. Get a hint before the fix — not just the fix.",
    href: "/debugger",
  },
  {
    icon: Code2,
    title: "Code Review",
    description: "Structured, severity-tagged feedback on bugs, style, and performance.",
    href: "/review",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
      <section className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink-border px-3 py-1 text-xs text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Built for students, not for copy-pasting
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Learn to code.
            <br />
            <span className="text-text-secondary">Don&apos;t just copy code.</span>
          </h1>
          <p className="mt-5 max-w-md text-text-secondary">
            Code Colleague explains errors, reviews your code, and answers programming
            questions the way a good TA would — with hints before answers.
          </p>
          <div className="mt-7 flex items-center gap-3">
            <Link href="/tutor">
              <Button>
                Ask the tutor <ArrowRight size={14} />
              </Button>
            </Link>
            <Link href="/debugger">
              <Button variant="secondary">Debug some code</Button>
            </Link>
          </div>
        </div>

        <div className="rounded-card border border-ink-border bg-ink-surface p-6 shadow-panel">
          <div className="mb-4 text-xs font-medium uppercase tracking-wider text-text-faint">
            How a hint unfolds
          </div>
          <HintLadder steps={DEMO_STEPS} />
        </div>
      </section>

      <section className="mt-24 grid gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="group rounded-card border border-ink-border bg-ink-surface p-5 transition-colors hover:border-brand/40"
          >
            <feature.icon size={18} className="text-brand" />
            <h3 className="mt-3 text-sm font-semibold">{feature.title}</h3>
            <p className="mt-1.5 text-sm text-text-secondary">{feature.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
              Open <ArrowRight size={12} />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
