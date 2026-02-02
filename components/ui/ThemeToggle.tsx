"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className={cn(
        "relative flex h-9 w-16 items-center rounded-full border cursor cursor-pointer",
        "transition-colors duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "ring-offset-background",
        isDark
          ? "border-zinc-800 bg-zinc-900"
          : "border-zinc-300 bg-zinc-200"
      )}
    >
      {/* Track glow */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full opacity-70 blur",
          isDark
            ? "bg-[radial-gradient(circle_at_75%_50%,rgba(99,102,241,0.35),transparent_60%)]"
            : "bg-[radial-gradient(circle_at_25%_50%,rgba(251,191,36,0.35),transparent_60%)]"
        )}
      />

      {/* Thumb */}
      <span
        className={cn(
          "relative z-10 ml-1 flex h-7 w-7 items-center justify-center rounded-full",
          "bg-white shadow-md",
          "transition-all duration-300 ease-out",
          isDark && "translate-x-7"
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-zinc-800" />
        ) : (
          <Sun className="h-4 w-4 text-zinc-900" />
        )}
      </span>
    </button>
  );
}
