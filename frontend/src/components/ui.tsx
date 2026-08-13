import { clsx } from "clsx";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink-border px-6 py-6 md:flex-row md:items-end md:justify-between md:px-10">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-brand">{eyebrow}</div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-card border border-ink-border bg-ink-surface p-5 shadow-panel", className)}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-brand text-white hover:bg-brand/90",
        variant === "secondary" &&
          "border border-ink-border bg-ink-raised text-text-primary hover:border-brand/50",
        variant === "ghost" && "text-text-secondary hover:text-text-primary",
        className
      )}
    >
      {children}
    </button>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-severity-critical/30 bg-severity-critical/10 px-3 py-2 text-sm text-severity-critical">
      {message}
    </div>
  );
}
