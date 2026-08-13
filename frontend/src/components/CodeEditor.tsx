"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { useTheme } from "@/lib/theme";
import type { Language } from "@/types";

const MONACO_LANGUAGE: Record<Language, string> = {
  python: "python",
  java: "java",
  cpp: "cpp",
  c: "c",
  javascript: "javascript",
  typescript: "typescript",
};

export function CodeEditor({
  value,
  onChange,
  language,
  height = "320px",
}: {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  height?: string;
}) {
  const { theme } = useTheme();

  const handleMount: OnMount = (editor) => {
    editor.updateOptions({ fontFamily: "var(--font-mono)", fontSize: 13.5 });
  };

  return (
    <div className="overflow-hidden rounded-card border border-ink-border">
      <Editor
        height={height}
        language={MONACO_LANGUAGE[language]}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={handleMount}
        theme={theme === "dark" ? "vs-dark" : "vs"}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          fontLigatures: true,
          renderLineHighlight: "none",
        }}
      />
    </div>
  );
}
