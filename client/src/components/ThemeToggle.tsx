"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage or system preference on mount
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      setDark(false);
      document.documentElement.classList.remove("dark");
    } else if (stored === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else {
      // Default to dark
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-300 cursor-pointer group shadow-sm"
    >
      <div className="relative w-5 h-5 overflow-hidden">
        {/* Sun icon — shown in dark mode (click to go light) */}
        <Sun
          className={`w-5 h-5 text-zinc-950 dark:text-white absolute inset-0 transition-all duration-300 ${
            dark
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-50"
          }`}
        />
        {/* Moon icon — shown in light mode (click to go dark) */}
        <Moon
          className={`w-5 h-5 text-zinc-950 dark:text-white absolute inset-0 transition-all duration-300 ${
            dark
              ? "opacity-0 -rotate-90 scale-50"
              : "opacity-100 rotate-0 scale-100"
          }`}
        />
      </div>
    </button>
  );
}
