import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
});

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: "dark" | "light") {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("auralis_theme") as Theme | null;
    return stored || "dark";
  });

  const resolved: "dark" | "light" =
    theme === "system" ? getSystemTheme() : theme;

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  // Listen to system preference changes
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(getSystemTheme());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = async (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("auralis_theme", t);

    // Persist to Supabase user metadata
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      supabase.auth.updateUser({ data: { theme: t } }).catch(console.error);
    }
  };

  // On mount, try to load from Supabase metadata
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const remoteTheme = user?.user_metadata?.theme as Theme | undefined;
      if (remoteTheme && ["dark", "light", "system"].includes(remoteTheme)) {
        setThemeState(remoteTheme);
        localStorage.setItem("auralis_theme", remoteTheme);
      }
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
