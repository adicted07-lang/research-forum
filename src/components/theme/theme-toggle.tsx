"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function toggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-md text-text-tertiary hover:bg-muted hover:text-accent-foreground transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="size-5 hidden dark:block" />
      <Moon className="size-5 dark:hidden" />
    </button>
  );
}
