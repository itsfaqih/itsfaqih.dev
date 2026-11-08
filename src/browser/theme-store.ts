import type { Theme } from "../theme";
import { reducedMotion } from "./media-query";

const THEME_CHANGE_EVENT = "theme-change";

// Stands in for localStorage when the browser refuses it.
let unsaved: string | null = null;

/** The saved theme, else the system's. */
export function readTheme(): Theme {
  let saved = unsaved;
  try {
    saved = localStorage.getItem("theme");
  } catch {}
  if (saved === "dark" || saved === "light") return saved;
  return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  // The metas' media queries follow the system, which a saved choice can contradict (see the
  // head script in src/layouts/head-script.ts).
  for (const meta of root.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.media = meta.dataset.theme === theme ? "all" : "not all";
  }
}

/**
 * Calls `onChange` whenever the theme may have changed: a toggle here, a save in another tab, or
 * the system scheme. Returns the unsubscribe.
 */
export function watchTheme(onChange: () => void) {
  const scheme = matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener("change", onChange);
  addEventListener("storage", onChange);
  addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => {
    scheme.removeEventListener("change", onChange);
    removeEventListener("storage", onChange);
    removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

/** Keeps the root's theme classes on the current theme. Returns the unsubscribe. */
export function followTheme() {
  return watchTheme(() => applyThemeClass(readTheme()));
}

/** Saves and applies the other theme. With `origin`, the new one spreads as a circle from there. */
export function toggleTheme(origin?: { x: number; y: number }) {
  const next: Theme = readTheme() === "light" ? "dark" : "light";
  const commit = () => {
    applyThemeClass(next);
    unsaved = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  const root = document.documentElement;
  if (!origin || reducedMotion() || !("startViewTransition" in document)) {
    commit();
    return;
  }
  root.style.setProperty("--theme-x", `${origin.x}px`);
  root.style.setProperty("--theme-y", `${origin.y}px`);
  const radius = Math.hypot(
    Math.max(origin.x, innerWidth - origin.x),
    Math.max(origin.y, innerHeight - origin.y),
  );
  root.style.setProperty("--theme-r", `${radius}px`);
  root.dataset.themeSwap = "";
  document.startViewTransition(commit).finished.finally(() => delete root.dataset.themeSwap);
}
