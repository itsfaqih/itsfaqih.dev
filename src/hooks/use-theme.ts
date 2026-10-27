import { useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const THEME_CHANGE_EVENT = "theme-change";

// The server cannot read the visitor's system preference. The inline script in
// the root document applies the real preference before the page is painted.
const getServerSnapshot = (): Theme => "dark";

function readTheme(): Theme {
  if (typeof window === "undefined") return getServerSnapshot();

  const saved = window.localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
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

  // Read the live value: the hydration pass renders the server snapshot, which must not
  // overwrite the class the inline script already set.
  useEffect(() => {
    applyThemeClass(readTheme());
  }, [theme]);

  // `origin` is the viewport point the new theme spreads out from, usually the toggle.
  const toggleTheme = (origin?: { x: number; y: number }) => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    const commit = () => {
      applyThemeClass(nextTheme);
      window.localStorage.setItem("theme", nextTheme);
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    };

    const root = window.document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!origin || reduceMotion || !("startViewTransition" in window.document)) {
      commit();
      return;
    }
    root.style.setProperty("--theme-x", `${origin.x}px`);
    root.style.setProperty("--theme-y", `${origin.y}px`);
    // End the circle exactly at the farthest corner so the whole curve is spent on screen.
    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );
    root.style.setProperty("--theme-r", `${radius}px`);
    root.dataset.themeSwap = "";
    window.document
      .startViewTransition(commit)
      .finished.finally(() => delete root.dataset.themeSwap);
  };

  return { theme, toggleTheme };
}
