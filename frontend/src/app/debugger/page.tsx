"use client";

import { useState } from "react";
import { Bug } from "lucide-react";
import { PageHeader, Panel, Button, ErrorNote } from "@/components/ui";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CodeEditor } from "@/components/CodeEditor";
import { HintLadder, type LadderStep } from "@/components/HintLadder";
import { api, ApiError } from "@/lib/api";
import type { DebugResponse, Language } from "@/types";

const PLACEHOLDER_CODE = `def average(numbers):
    total = sum(numbers)
    return total / len(numbers)

print(average([]))`;

export default function DebuggerPage() {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(PLACEHOLDER_CODE);
  const [errorMessage, setErrorMessage] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [result, setResult] = useState<DebugResponse | null>(null);
  const [fixRevealed, setFixRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runDebugger(revealFix: boolean) {
    setLoading(true);
    setError(null);
    try {
      const response = await api.debugCode({
        language,
        code,
        error_message: errorMessage || null,
        expected_behavior: expectedBehavior || null,
        reveal_fix: revealFix,
      });
      setResult(response);
      setFixRevealed(revealFix);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const steps: LadderStep[] = result
    ? [
        { key: "problem", label: "Problem", content: result.problem, revealed: true },
        { key: "why", label: "Why it happens", content: result.why_it_happens, revealed: true },
        { key: "hint", label: "Hint", content: result.hint, revealed: true },
        {
          key: "solution",
          label: "Suggested fix",
          isSolution: true,
          revealed: fixRevealed,
          content: fixRevealed ? (
            <div className="space-y-2">
              <pre className="overflow-x-auto rounded-md bg-ink-raised p-3 font-mono text-[13px]">
                {result.suggested_fix}
              </pre>
              <p>{result.explanation}</p>
            </div>
          ) : null,
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Code"
        title="Debugger"
        description="Paste your code and error. We'll walk through the problem before showing the fix."
      />

      <div className="grid gap-6 px-6 py-6 md:grid-cols-2 md:px-10">
        <div className="space-y-4">
          <Panel>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Your code</span>
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>
            <CodeEditor value={code} onChange={setCode} language={language} />
          </Panel>

          <Panel>
            <label className="mb-1.5 block text-sm font-medium">Error message (optional)</label>
            <textarea
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="Paste the traceback or error text here…"
              rows={3}
              className="w-full resize-none rounded-md border border-ink-border bg-ink-raised px-3 py-2 font-mono text-xs outline-none focus:border-brand"
            />
            <label className="mb-1.5 mt-3 block text-sm font-medium">
              What did you expect to happen? (optional)
            </label>
            <textarea
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-md border border-ink-border bg-ink-raised px-3 py-2 text-xs outline-none focus:border-brand"
            />
            <Button className="mt-3" onClick={() => runDebugger(false)} disabled={loading || !code.trim()}>
              <Bug size={14} /> {loading ? "Analyzing…" : "Debug my code"}
            </Button>
            {error && (
              <div className="mt-3">
                <ErrorNote message={error} />
              </div>
            )}
          </Panel>
        </div>

        <Panel className="h-fit">
          {!result ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-sm text-text-faint">
              <Bug size={22} className="mb-2 text-text-faint" />
              Results will appear here once you debug your code.
            </div>
          ) : (
            <>
              <HintLadder steps={steps} />
              {!fixRevealed && (
                <Button variant="secondary" className="mt-2" onClick={() => runDebugger(true)} disabled={loading}>
                  {loading ? "Loading…" : "Show suggested fix"}
                </Button>
              )}
              {result.concepts.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5 border-t border-ink-border pt-4">
                  {result.concepts.map((c) => (
                    <span key={c} className="rounded-full bg-ink-raised px-2 py-0.5 text-xs text-text-secondary">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
