"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  setResolvedTheme: (theme: "light" | "dark") => void;
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "system",
      resolvedTheme: "light",
      setTheme: (theme: Theme) => {
        set({ theme });

        // Apply theme immediately
        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
          applyTheme(systemTheme);
          set({ resolvedTheme: systemTheme });
        } else {
          applyTheme(theme);
          set({ resolvedTheme: theme });
        }
      },
      setResolvedTheme: (resolvedTheme: "light" | "dark") => {
        set({ resolvedTheme });
        applyTheme(resolvedTheme);
      }
    }),
    {
      name: "restaurant-daily-theme",
      partialize: (state) => ({ theme: state.theme })
    }
  )
);

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
    root.style.setProperty("--background", "#0a0a0a");
    root.style.setProperty("--foreground", "#ededed");
  } else {
    root.classList.remove("dark");
    root.style.setProperty("--background", "#ffffff");
    root.style.setProperty("--foreground", "#171717");
  }
}

// Initialize theme on client side
if (typeof window !== "undefined") {
  // Listen for system theme changes
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  mediaQuery.addEventListener("change", (e) => {
    const { theme, setResolvedTheme } = useTheme.getState();
    if (theme === "system") {
      const systemTheme = e.matches ? "dark" : "light";
      setResolvedTheme(systemTheme);
    }
  });

  // Apply initial theme
  const { theme, setResolvedTheme } = useTheme.getState();
  if (theme === "system") {
    const systemTheme = mediaQuery.matches ? "dark" : "light";
    setResolvedTheme(systemTheme);
  } else {
    applyTheme(theme);
  }
}