"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="w-9 h-9 flex-shrink-0" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-zinc-500 transition-all duration-200 flex-shrink-0"
      aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-orange-400" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
