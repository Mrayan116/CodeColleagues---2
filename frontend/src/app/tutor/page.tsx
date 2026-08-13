"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Lightbulb, ChevronDown } from "lucide-react";
import { PageHeader, Button, ErrorNote } from "@/components/ui";
import { SkillLevelSelector } from "@/components/SkillLevelSelector";
import { MarkdownMessage } from "@/components/MarkdownMessage";
import { HintLadder, type LadderStep } from "@/components/HintLadder";
import { api, ApiError } from "@/lib/api";
import type { ChatMessageIn, HintResponse, SkillLevel } from "@/types";
import { clsx } from "clsx";

type DisplayMessage =
  | { id: string; kind: "text"; role: "user" | "assistant"; content: string }
  | { id: string; kind: "hint"; role: "user"; problem: string }
  | {
      id: string;
      kind: "hint-result";
      role: "assistant";
      problem: string;
      hint: HintResponse;
      revealed: number;
      solutionRevealed: boolean;
    };

const SUGGESTED_PROMPTS = [
  "Can you explain recursion?",
  "What does 'IndexError: list index out of range' mean?",
  "Why is my nested loop so slow?",
  "Explain the difference between a stack and a queue.",
];

function TutorPageInner() {
  const searchParams = useSearchParams();
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");
  const [hintMode, setHintMode] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Resume a past conversation when arriving from /history with ?session=<id>.
  useEffect(() => {
    const existingSessionId = searchParams.get("session");
    if (!existingSessionId || hydratedRef.current) return;
    hydratedRef.current = true;

    api
      .getChatSession(existingSessionId)
      .then((detail) => {
        setSessionId(detail.id);
        setSkillLevel((detail.skill_level as SkillLevel) ?? "beginner");
        setMessages(
          detail.messages.map((m, i) => ({
            id: `${detail.id}-${i}`,
            kind: "text" as const,
            role: m.role,
            content: m.content,
          }))
        );
      })
      .catch(() => setError("Couldn't load that conversation — starting fresh."));
  }, [searchParams]);

  function chatHistoryPayload(): ChatMessageIn[] {
    return messages
      .filter((m): m is Extract<DisplayMessage, { kind: "text" }> => m.kind === "text")
      .map(({ role, content }) => ({ role, content }));
  }

  async function sendTutorMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), kind: "text", role: "user", content: trimmed }]);
    setInput("");
    setError(null);
    setFollowUps([]);
    setLoading(true);

    try {
      const response = await api.askTutor({
        session_id: sessionId,
        message: trimmed,
        skill_level: skillLevel,
        history: chatHistoryPayload(),
      });
      setSessionId(response.session_id);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), kind: "text", role: "assistant", content: response.reply },
      ]);
      setFollowUps(response.follow_up_suggestions);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function sendHintRequest(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), kind: "hint", role: "user", problem: trimmed }]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await api.getHints({ problem: trimmed, skill_level: skillLevel, reveal_solution: false });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: "hint-result",
          role: "assistant",
          problem: trimmed,
          hint: response,
          revealed: 0,
          solutionRevealed: false,
        },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function revealNextHint(messageId: string) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.kind === "hint-result" ? { ...m, revealed: Math.min(3, m.revealed + 1) } : m
      )
    );
  }

  async function revealSolution(messageId: string, problem: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getHints({ problem, skill_level: skillLevel, reveal_solution: true });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId && m.kind === "hint-result" ? { ...m, hint: response, solutionRevealed: true } : m
        )
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load the solution. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(text: string) {
    if (hintMode) sendHintRequest(text);
    else sendTutorMessage(text);
  }

  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        eyebrow="Learn"
        title="AI Tutor"
        description={
          hintMode
            ? "Describe what you're stuck on — hints unlock progressively, solution last."
            : "Ask about errors, concepts, or algorithms. Explanations adapt to your level."
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHintMode((v) => !v)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                hintMode
                  ? "border-hint bg-hint-soft text-hint"
                  : "border-ink-border text-text-secondary hover:text-text-primary"
              )}
            >
              <Lightbulb size={13} /> Hint Mode
            </button>
            <SkillLevelSelector value={skillLevel} onChange={setSkillLevel} />
          </div>
        }
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-lg pt-10 text-center">
            <p className="text-sm text-text-secondary">
              {hintMode ? "Describe a problem you're stuck on, for example:" : "Try asking something like:"}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSubmit(prompt)}
                  className="rounded-full border border-ink-border px-3 py-1.5 text-xs text-text-secondary hover:border-brand/40 hover:text-text-primary"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {messages.map((m) => {
              if (m.kind === "text") return <MarkdownMessage key={m.id} content={m.content} tone={m.role} />;
              if (m.kind === "hint") return <MarkdownMessage key={m.id} content={m.problem} tone="user" />;

              const steps: LadderStep[] = [
                { key: "h1", label: "Hint 1", content: m.hint.hint_1, revealed: m.revealed >= 1 },
                { key: "h2", label: "Hint 2", content: m.hint.hint_2, revealed: m.revealed >= 2 },
                { key: "h3", label: "Hint 3", content: m.hint.hint_3, revealed: m.revealed >= 3 },
                {
                  key: "solution",
                  label: "Solution",
                  isSolution: true,
                  revealed: m.solutionRevealed,
                  content: m.solutionRevealed ? (
                    <pre className="overflow-x-auto rounded-md bg-ink-raised p-3 font-mono text-[13px]">
                      {m.hint.solution}
                    </pre>
                  ) : null,
                },
              ];

              return (
                <div
                  key={m.id}
                  className="w-full max-w-[85%] self-start rounded-card border border-ink-border bg-ink-surface p-4"
                >
                  <HintLadder steps={steps} />
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-ink-border pt-3">
                    {m.revealed < 3 && (
                      <Button variant="secondary" onClick={() => revealNextHint(m.id)}>
                        <Lightbulb size={13} /> {m.revealed === 0 ? "Give me a hint" : "Another hint"}
                      </Button>
                    )}
                    {!m.solutionRevealed && (
                      <Button variant="ghost" onClick={() => revealSolution(m.id, m.problem)} disabled={loading}>
                        <ChevronDown size={13} /> Show solution
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="self-start rounded-card border border-ink-border bg-ink-surface px-4 py-2.5 text-sm text-text-faint">
                Thinking…
              </div>
            )}
            {error && <ErrorNote message={error} />}
            {followUps.length > 0 && !loading && (
              <div className="mt-1 flex flex-wrap gap-2">
                {followUps.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSubmit(prompt)}
                    className="rounded-full border border-ink-border px-3 py-1.5 text-xs text-text-secondary hover:border-brand/40 hover:text-text-primary"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(input);
        }}
        className="border-t border-ink-border px-6 py-4 md:px-10"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hintMode ? "Describe what you're stuck on…" : "Ask a programming question…"}
            className="flex-1 rounded-md border border-ink-border bg-ink-surface px-3.5 py-2 text-sm outline-none focus:border-brand"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send size={14} />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={null}>
      <TutorPageInner />
    </Suspense>
  );
}
