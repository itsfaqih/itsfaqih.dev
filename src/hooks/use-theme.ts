import { useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const THEME_CHANGE_EVENT = "theme-change";
const getServerSnapshot = (): Theme => "dark";

function readTheme(): Theme {
  if (typeof window === "undefined") return getServerSnapshot();

  const saved = window.localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeClass(theme: Theme) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerSnapshot);

  useEffect(() => {
    applyThemeClass(theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    applyThemeClass(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  return { theme, toggleTheme };
}
