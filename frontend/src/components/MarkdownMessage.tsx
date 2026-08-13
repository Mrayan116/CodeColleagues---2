import ReactMarkdown from "react-markdown";
import { clsx } from "clsx";

export function MarkdownMessage({ content, tone }: { content: string; tone: "user" | "assistant" }) {
  return (
    <div
      className={clsx(
        "max-w-[85%] rounded-card px-4 py-2.5 text-sm leading-relaxed",
        tone === "user"
          ? "self-end bg-brand text-white"
          : "self-start border border-ink-border bg-ink-surface text-text-primary"
      )}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          code: ({ children }) => (
            <code className="rounded bg-ink-raised px-1 py-0.5 font-mono text-[13px]">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded-md bg-ink-raised p-3 font-mono text-[13px] last:mb-0">
              {children}
            </pre>
          ),
          ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
