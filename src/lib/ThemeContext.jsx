import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const KEY = "gg.theme";

/** Dark-first theme with a persistent light mode, applied straight to <html>. */
export function ThemeProvider({ children }) {
  // Same value on server and first client render, so hydration matches.
  const [theme, setTheme] = useState("dark");
  const [ready, setReady] = useState(false);

  // After hydration, load the saved choice.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(KEY) === "light") setTheme("light");
    } catch {
      /* storage blocked */
    }
    setReady(true);
  }, []);

  // Apply and persist only once the saved value has been read.
  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      /* storage blocked */
    }
  }, [theme, ready]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}