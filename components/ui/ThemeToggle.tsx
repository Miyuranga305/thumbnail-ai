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
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "relative flex h-9 w-16 items-center rounded-full border",
        "transition-colors duration-300",
        isDark ? "bg-zinc-900" : "bg-zinc-200"
      )}
    >
      <span
        className={cn(
          "absolute left-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md",
          "transition-all duration-300",
          isDark && "translate-x-7"
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-zinc-800" />
        ) : (
          <Sun className="h-4 w-4 text-black" />
        )}
      </span>
    </button>
  );
}
