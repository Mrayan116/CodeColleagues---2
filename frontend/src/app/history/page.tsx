"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History as HistoryIcon, MessageSquare } from "lucide-react";
import { PageHeader, Panel, ErrorNote } from "@/components/ui";
import { MarkdownMessage } from "@/components/MarkdownMessage";
import { api, ApiError } from "@/lib/api";
import type { ChatSessionDetail, ChatSessionSummary } from "@/types";

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [selected, setSelected] = useState<ChatSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listChatSessions()
      .then(setSessions)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load history."))
      .finally(() => setLoading(false));
  }, []);

  async function openSession(id: string) {
    setError(null);
    try {
      const detail = await api.getChatSession(id);
      setSelected(detail);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load that conversation.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="History"
        title="Past Conversations"
        description="Every tutor conversation you've had, most recent first."
      />

      <div className="grid gap-6 px-6 py-6 md:grid-cols-[280px_1fr] md:px-10">
        <Panel className="h-fit p-2">
          {loading ? (
            <div className="p-3 text-sm text-text-faint">Loading…</div>
          ) : sessions.length === 0 ? (
            <div className="p-3 text-sm text-text-faint">
              No conversations yet —{" "}
              <Link href="/tutor" className="text-brand hover:underline">
                start one
              </Link>
              .
            </div>
          ) : (
            <ul className="space-y-0.5">
              {sessions.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => openSession(s.id)}
                    className={`w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-ink-raised ${
                      selected?.id === s.id ? "bg-brand-soft text-brand" : "text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate font-medium">
                      <MessageSquare size={12} className="shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-text-faint">
                      {formatDate(s.updated_at)} · {s.message_count} messages · {s.skill_level}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          {error && (
            <div className="mb-3">
              <ErrorNote message={error} />
            </div>
          )}
          {!selected ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-sm text-text-faint">
              <HistoryIcon size={22} className="mb-2 text-text-faint" />
              Select a conversation to view the transcript.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{selected.title}</h2>
                <Link href={`/tutor?session=${selected.id}`} className="text-xs font-medium text-brand hover:underline">
                  Continue this conversation →
                </Link>
              </div>
              {selected.messages.map((m, i) => (
                <MarkdownMessage key={i} content={m.content} tone={m.role} />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
