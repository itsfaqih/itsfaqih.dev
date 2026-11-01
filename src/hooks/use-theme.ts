import { useEffect, useSyncExternalStore } from "react";
import { THEME_CLASSES, type Theme } from "../theme";
import { reducedMotion } from "./use-media-query";

const THEME_CHANGE_EVENT = "theme-change";

const getPlaceholderServerTheme = (): Theme => "dark";

function readTheme(): Theme {
  const saved = window.localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyThemeClass(theme: Theme) {
  const root = window.document.documentElement;
  root.classList.remove(...THEME_CLASSES.light, ...THEME_CLASSES.dark);
  root.classList.add(...THEME_CLASSES[theme]);
  // The metas' media queries follow the system, which a saved choice can contradict (see the
  // head script in src/layouts/head-script.ts).
  for (const meta of root.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.media = meta.dataset.theme === theme ? "all" : "not all";
  }
}

function subscribe(onStoreChange: () => void) {
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
  const theme = useSyncExternalStore(subscribe, readTheme, getPlaceholderServerTheme);

  // Read the live value: the hydration pass renders the server snapshot, which must not
  // overwrite the class the inline script already set.
  useEffect(() => {
    applyThemeClass(readTheme());
  }, [theme]);

  const toggleTheme = (origin?: { x: number; y: number }) => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    const commit = () => {
      applyThemeClass(nextTheme);
      window.localStorage.setItem("theme", nextTheme);
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    };

    const root = window.document.documentElement;
    const reduceMotion = reducedMotion();
    if (!origin || reduceMotion || !("startViewTransition" in window.document)) {
      commit();
      return;
    }
    root.style.setProperty("--theme-x", `${origin.x}px`);
    root.style.setProperty("--theme-y", `${origin.y}px`);
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

  return { toggleTheme };
}
