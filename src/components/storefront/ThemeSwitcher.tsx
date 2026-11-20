"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder of the same size to prevent layout shift
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-full overflow-hidden hover:bg-foreground/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
      aria-label="Toggle Dark Mode"
    >
      <div
        className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out ${
          currentTheme === "dark" ? "translate-y-0 opacity-100 rotate-0" : "translate-y-8 opacity-0 -rotate-90"
        }`}
      >
        <Moon className="w-5 h-5 text-accent" />
      </div>

      <div
        className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out ${
          currentTheme === "dark" ? "-translate-y-8 opacity-0 rotate-90" : "translate-y-0 opacity-100 rotate-0"
        }`}
      >
        <Sun className="w-5 h-5 text-foreground" />
      </div>
    </button>
  );
}
