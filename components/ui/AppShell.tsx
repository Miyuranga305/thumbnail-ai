"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";

export default function AppShell({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 via-white to-white dark:from-black dark:via-zinc-950 dark:to-black" />
        <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18),transparent_65%)] blur-2xl dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.22),transparent_65%)]" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-zinc-800 dark:bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <Link href="/" className="block truncate text-sm font-semibold tracking-tight">
              AI Thumbnail Studio
            </Link>
            {subtitle ? (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 ">
            <ThemeToggle />
            <Link href="/history">
              <Button variant="outline" size="sm">
                History
              </Button>
            </Link>
            {right}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
