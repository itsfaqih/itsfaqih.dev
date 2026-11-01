import { THEME_CLASSES } from "../theme";

/** How long the cut-ins wait for the page's islands before they settle without them. */
export const REST_AFTER_MS = 3500;

/**
 * Runs before first paint: the theme, the intro gate, and the rest fallback that settles the
 * cut-ins when the islands that play them are slow to arrive.
 */
export const HEAD_SCRIPT = `(function () {
  var doc = document.documentElement;
  doc.classList.add("js");
  // A saved choice wins; otherwise follow the system.
  var theme = "dark";
  try {
    var saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") theme = saved;
    else if (matchMedia("(prefers-color-scheme: light)").matches) theme = "light";
  } catch (e) {}
  var themes = ${JSON.stringify(THEME_CLASSES)};
  doc.classList.remove.apply(doc.classList, themes.light.concat(themes.dark));
  doc.classList.add.apply(doc.classList, themes[theme]);
  // The metas' media queries follow the system, which a saved choice can contradict.
  document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
    meta.media = meta.dataset.theme === theme ? "all" : "not all";
  });
  try {
    // The home intro plays once per session, only when the visit lands on home,
    // and never under reduced motion.
    if (
      location.pathname !== "/" ||
      sessionStorage.getItem("intro-seen") ||
      /[?&]nointro/.test(location.search) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      doc.classList.add("no-intro");
    }
  } catch (e) {
    doc.classList.add("no-intro");
  }
  // An island that plays the cut-ins cancels the fallback once it hydrates.
  var rest = setTimeout(function () {
    document.querySelectorAll("[data-cut]").forEach(function (piece) {
      piece.setAttribute("data-rest", "");
    });
    doc.classList.add("no-intro");
  }, Math.max(0, ${REST_AFTER_MS} - performance.now()));
  document.addEventListener(
    "astro:hydrate",
    function (event) {
      if (event.target.querySelector("[data-cut]")) clearTimeout(rest);
    },
    true,
  );
})();`;
