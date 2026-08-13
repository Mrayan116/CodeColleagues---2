import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--ink)",
          surface: "var(--ink-surface)",
          raised: "var(--ink-raised)",
          border: "var(--ink-border)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          faint: "var(--text-faint)",
        },
        brand: {
          DEFAULT: "var(--brand)",
          soft: "var(--brand-soft)",
        },
        hint: {
          DEFAULT: "var(--hint)",
          soft: "var(--hint-soft)",
        },
        severity: {
          critical: "var(--severity-critical)",
          warning: "var(--severity-warning)",
          improvement: "var(--severity-improvement)",
          suggestion: "var(--severity-suggestion)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "rung-glow": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rung-glow": "rung-glow 2.4s ease-in-out infinite",
        "fade-up": "fade-up 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
