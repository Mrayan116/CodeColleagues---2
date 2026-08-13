"use client";

import { useState } from "react";
import { CheckCircle2, ScanSearch } from "lucide-react";
import { PageHeader, Panel, Button, ErrorNote } from "@/components/ui";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CodeEditor } from "@/components/CodeEditor";
import { SeverityBadge } from "@/components/SeverityBadge";
import { api, ApiError } from "@/lib/api";
import type { Language, ReviewResponse } from "@/types";

const PLACEHOLDER_CODE = `def calc(a,b,op):
    if op == '+':
        return a+b
    if op == '-':
        return a-b
    if op == '*':
        return a*b
    if op == '/':
        return a/b`;

export default function ReviewPage() {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(PLACEHOLDER_CODE);
  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runReview() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.reviewCode({ language, code });
      setResult(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Code"
        title="Code Review"
        description="Structured, severity-tagged feedback — not a silent rewrite."
      />

      <div className="grid gap-6 px-6 py-6 md:grid-cols-2 md:px-10">
        <div className="space-y-4">
          <Panel>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Your code</span>
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>
            <CodeEditor value={code} onChange={setCode} language={language} height="380px" />
            <Button className="mt-3" onClick={runReview} disabled={loading || !code.trim()}>
              <ScanSearch size={14} /> {loading ? "Reviewing…" : "Review my code"}
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
              <ScanSearch size={22} className="mb-2 text-text-faint" />
              Findings will appear here once you run a review.
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-text-secondary">{result.summary}</p>

              {result.findings.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-severity-suggestion">
                  <CheckCircle2 size={16} /> No issues found.
                </div>
              ) : (
                <div className="space-y-3">
                  {result.findings.map((finding, i) => (
                    <div key={i} className="rounded-md border border-ink-border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <SeverityBadge severity={finding.severity} />
                        <span className="font-mono text-xs text-text-faint">{finding.location}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-text-primary">{finding.problem}</p>
                      <p className="mt-1 text-sm text-text-secondary">{finding.explanation}</p>
                      <p className="mt-2 rounded bg-ink-raised px-2.5 py-1.5 text-xs text-text-secondary">
                        <span className="font-medium text-text-primary">Suggestion: </span>
                        {finding.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {result.strengths.length > 0 && (
                <div className="border-t border-ink-border pt-4">
                  <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-text-faint">
                    What you did well
                  </div>
                  <ul className="space-y-1 text-sm text-text-secondary">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-severity-suggestion" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
