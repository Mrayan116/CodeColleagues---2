"use client";

import { useState } from "react";
import { ClipboardList, Lightbulb, ChevronDown } from "lucide-react";
import { PageHeader, Panel, Button, ErrorNote } from "@/components/ui";
import { LanguageSelector } from "@/components/LanguageSelector";
import { api, ApiError } from "@/lib/api";
import type { Difficulty, Language, PracticeQuestion, PracticeResponse } from "@/types";
import { clsx } from "clsx";

const TOPICS = [
  "Arrays",
  "Linked Lists",
  "Recursion",
  "Object-Oriented Programming",
  "Sorting",
  "Searching",
  "Pointers",
  "Trees",
  "Graphs",
  "Dynamic Programming",
];

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function QuestionCard({ question, index }: { question: PracticeQuestion; index: number }) {
  const [hintsShown, setHintsShown] = useState(0); // how many of the 2 hints are revealed
  const [solutionShown, setSolutionShown] = useState(false);

  return (
    <div className="rounded-card border border-ink-border p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-medium text-brand">
          {index + 1}
        </span>
        <h3 className="text-sm font-semibold">{question.title}</h3>
      </div>

      <p className="mt-2.5 text-sm text-text-secondary">{question.problem_statement}</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-md bg-ink-raised p-2.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-text-faint">Example input</div>
          <div className="mt-0.5 font-mono text-xs">{question.example_input}</div>
        </div>
        <div className="rounded-md bg-ink-raised p-2.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-text-faint">Example output</div>
          <div className="mt-0.5 font-mono text-xs">{question.example_output}</div>
        </div>
      </div>

      {question.constraints.length > 0 && (
        <ul className="mt-3 list-disc space-y-0.5 pl-4 text-xs text-text-secondary">
          {question.constraints.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2 border-t border-ink-border pt-3">
        {question.hints.slice(0, hintsShown).map((hint, i) => (
          <div key={i} className="flex items-start gap-2 rounded-md bg-hint-soft px-2.5 py-2 text-xs text-text-secondary">
            <Lightbulb size={13} className="mt-0.5 shrink-0 text-hint" />
            <span>
              <span className="font-medium text-hint">Hint {i + 1}: </span>
              {hint}
            </span>
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          {hintsShown < question.hints.length && (
            <Button variant="secondary" onClick={() => setHintsShown((n) => n + 1)}>
              <Lightbulb size={13} /> {hintsShown === 0 ? "Get a hint" : "Another hint"}
            </Button>
          )}
          <Button variant="ghost" onClick={() => setSolutionShown((s) => !s)}>
            <ChevronDown size={13} className={clsx("transition-transform", solutionShown && "rotate-180")} />
            {solutionShown ? "Hide solution" : "Show solution"}
          </Button>
        </div>

        {solutionShown && (
          <pre className="animate-fade-up overflow-x-auto rounded-md bg-ink-raised p-3 font-mono text-xs">
            {question.solution}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function PracticePage() {
  const [language, setLanguage] = useState<Language>("python");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [count, setCount] = useState(3);
  const [result, setResult] = useState<PracticeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.generatePractice({ language, topic, difficulty, count });
      setResult(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Learn"
        title="Practice Questions"
        description="Generate practice problems by topic and difficulty. Hints and solutions stay hidden until you ask."
      />

      <div className="px-6 py-6 md:px-10">
        <Panel className="mb-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-faint">Language</label>
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-faint">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-md border border-ink-border bg-ink-surface px-2.5 py-1.5 text-sm outline-none focus:border-brand"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-faint">Difficulty</label>
              <div className="inline-flex w-full rounded-md border border-ink-border bg-ink-surface p-0.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={clsx(
                      "flex-1 rounded px-2 py-1 text-xs font-medium capitalize transition-colors",
                      difficulty === d ? "bg-brand-soft text-brand" : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-faint"># Questions</label>
              <input
                type="number"
                min={1}
                max={5}
                value={count}
                onChange={(e) => setCount(Math.min(5, Math.max(1, Number(e.target.value))))}
                className="w-full rounded-md border border-ink-border bg-ink-surface px-2.5 py-1.5 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          <Button className="mt-4" onClick={generate} disabled={loading}>
            <ClipboardList size={14} /> {loading ? "Generating…" : "Generate practice questions"}
          </Button>
          {error && (
            <div className="mt-3">
              <ErrorNote message={error} />
            </div>
          )}
        </Panel>

        {result && (
          <div className="space-y-4">
            {result.questions.map((q, i) => (
              <QuestionCard key={i} question={q} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
