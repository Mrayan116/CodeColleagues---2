"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bug,
  ClipboardList,
  Code2,
  History,
  LayoutDashboard,
  Moon,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { clsx } from "clsx";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  phase?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Learn",
    items: [
      { label: "AI Tutor", href: "/tutor", icon: Sparkles },
      { label: "Explain Code", href: "/explain", icon: Code2 },
      { label: "Practice", href: "/practice", icon: ClipboardList },
    ],
  },
  {
    label: "Code",
    items: [
      { label: "Debugger", href: "/debugger", icon: Bug },
      { label: "Code Review", href: "/review", icon: Code2 },
    ],
  },
  {
    label: "",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, phase: 3 },
      { label: "History", href: "/history", icon: History },
      { label: "Settings", href: "/settings", icon: Settings, phase: 3 },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen bg-ink text-text-primary">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-border bg-ink-surface md:flex">
        <Link href="/" className="flex items-center gap-2 px-5 py-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-soft text-brand">
            <Code2 size={16} />
          </span>
          <span className="font-semibold tracking-tight">Code Colleague</span>
        </Link>

        <nav className="flex-1 space-y-6 px-3 pb-6">
          {NAV.map((group) => (
            <div key={group.label || group.items[0].href}>
              {group.label && (
                <div className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-text-faint">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.phase ? "#" : item.href}
                      aria-disabled={Boolean(item.phase)}
                      className={clsx(
                        "flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-brand-soft text-brand"
                          : item.phase
                          ? "cursor-default text-text-faint"
                          : "text-text-secondary hover:bg-ink-raised hover:text-text-primary"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={15} />
                        {item.label}
                      </span>
                      {item.phase && (
                        <span className="rounded border border-ink-border px-1.5 py-0.5 text-[10px] text-text-faint">
                          Phase {item.phase}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-ink-border px-3 py-3">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary hover:bg-ink-raised hover:text-text-primary"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {!isHome && (
          <header className="flex h-14 items-center justify-between border-b border-ink-border px-6 md:hidden">
            <Link href="/" className="font-semibold">
              Code Colleague
            </Link>
            <button onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </header>
        )}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
