"use client";

import { useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { PageHeader, Panel, Button, ErrorNote } from "@/components/ui";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CodeEditor } from "@/components/CodeEditor";
import { api, ApiError } from "@/lib/api";
import type { ExplainDetail, ExplainResponse, Language } from "@/types";
import { clsx } from "clsx";

const PLACEHOLDER_CODE = `def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`;

export default function ExplainPage() {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(PLACEHOLDER_CODE);
  const [detail, setDetail] = useState<ExplainDetail>("quick");
  const [result, setResult] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runExplain() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.explainCode({ language, code, detail });
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
        eyebrow="Learn"
        title="Explain Code"
        description="Paste code you don't fully understand yet — get a plain-language breakdown."
      />

      <div className="grid gap-6 px-6 py-6 md:grid-cols-2 md:px-10">
        <div className="space-y-4">
          <Panel>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Code</span>
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>
            <CodeEditor value={code} onChange={setCode} language={language} height="360px" />

            <div className="mt-3 flex items-center justify-between">
              <div className="inline-flex rounded-md border border-ink-border bg-ink-raised p-0.5">
                {(["quick", "detailed"] as ExplainDetail[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDetail(d)}
                    className={clsx(
                      "rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                      detail === d ? "bg-brand-soft text-brand" : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <Button onClick={runExplain} disabled={loading || !code.trim()}>
                <BookOpen size={14} /> {loading ? "Explaining…" : "Explain this code"}
              </Button>
            </div>
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
              <BookOpen size={22} className="mb-2 text-text-faint" />
              An explanation will appear here.
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-text-faint">
                  What it does
                </div>
                <p className="text-sm text-text-secondary">{result.high_level}</p>
              </div>

              {result.line_by_line.length > 0 && (
                <div>
                  <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-text-faint">
                    Walkthrough
                  </div>
                  <div className="space-y-2">
                    {result.line_by_line.map((chunk, i) => (
                      <div key={i} className="rounded-md border border-ink-border p-2.5">
                        <span className="font-mono text-xs text-brand">{chunk.lines}</span>
                        <p className="mt-1 text-sm text-text-secondary">{chunk.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-text-faint">
                  Inputs &amp; outputs
                </div>
                <p className="text-sm text-text-secondary">{result.inputs_outputs}</p>
              </div>

              {result.edge_cases.length > 0 && (
                <div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-text-faint">
                    Edge cases to consider
                  </div>
                  <ul className="list-disc space-y-0.5 pl-4 text-sm text-text-secondary">
                    {result.edge_cases.map((edge, i) => (
                      <li key={i}>{edge}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-4 border-t border-ink-border pt-3 text-sm">
                <span className="text-text-faint">
                  Time <span className="font-mono text-text-primary">{result.complexity.time}</span>
                </span>
                <span className="text-text-faint">
                  Space <span className="font-mono text-text-primary">{result.complexity.space}</span>
                </span>
              </div>

              {result.concepts.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.concepts.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 rounded-full bg-ink-raised px-2 py-0.5 text-xs text-text-secondary">
                      <Sparkles size={10} /> {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
