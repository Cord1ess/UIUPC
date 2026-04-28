"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: React.MouseEvent) => void;
  isSwitching: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isSwitching, setIsSwitching] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Priority: Saved Choice > Default Light
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "light";
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setMounted(true);
  }, []);

  const toggleTheme = async (event?: React.MouseEvent) => {
    if (isSwitching) return;

    // Capture click coordinates for radial wipe
    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;
    document.documentElement.style.setProperty('--theme-x', `${x}px`);
    document.documentElement.style.setProperty('--theme-y', `${y}px`);

    setIsSwitching(true);

    const newTheme = theme === "light" ? "dark" : "light";

    const performSwap = () => {
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    if (!document.startViewTransition) {
      performSwap();
      setTimeout(() => setIsSwitching(false), 200);
      return;
    }

    const transition = document.startViewTransition(() => {
      performSwap();
    });

    try {
      await transition.finished;
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isSwitching }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
