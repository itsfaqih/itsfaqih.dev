import { OPENING_KEY } from "../sections/rule-open";
import { THEME_CLASSES } from "../theme";

/** How long the cut-ins wait for the page's islands before they settle without them. */
export const REST_AFTER_MS = 3500;

/**
 * Runs before first paint: the theme, the intro gate, the header carried across pages, the rest
 * fallback that settles the cut-ins when the islands that play them are slow to arrive, and the
 * cross-document view transitions' types. Opening a rule from its tile dives into it (rule-open);
 * leaving a rule for the index zooms back out onto its tile (rule-close); every other page change
 * fades through (page-fade).
 * The transition's pictures live on the new page, so the dive's origin crosses in sessionStorage.
 */
export const HEAD_SCRIPT = String.raw`(function () {
  var doc = document.documentElement;
  doc.classList.add("js");
  // page-scrollbar.client.ts draws the bar on these pointers. Its script arrives once the browser is
  // idle, so the native bar goes here, or the page would widen when it did.
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) doc.classList.add("sb-own");
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
  try {
    var entry = performance.getEntriesByType("navigation")[0];
    var sameSite = document.referrer.indexOf(location.origin + "/") === 0;
    if (sameSite && !(entry && entry.type === "reload")) {
      doc.classList.add("from-site");
    }
  } catch (e) {}
  // Whatever plays the cut-ins cancels the fallback once it starts: an island once it hydrates, a
  // custom element once it watches them (cut-ins.ts).
  var rest = setTimeout(function () {
    document.querySelectorAll("[data-cut]").forEach(function (piece) {
      piece.setAttribute("data-rest", "");
    });
    doc.classList.add("no-intro");
  }, Math.max(0, ${REST_AFTER_MS} - performance.now()));
  function settle(event) {
    if (event.target.querySelector("[data-cut]")) clearTimeout(rest);
  }
  document.addEventListener("astro:hydrate", settle, true);
  document.addEventListener("cut-ins", settle, true);

  var RULE_PAGE = /^\/rule-of-thumb\/[^/]+$/;
  var RULE_INDEX = /^\/rule-of-thumb$/;
  function pathOf(url) {
    return new URL(url, location.href).pathname.replace(/(\/index)?(\.html|\/)$/, "") || "/";
  }
  function dive() {
    try {
      return JSON.parse(sessionStorage.getItem("${OPENING_KEY}") || "null");
    } catch (e) {
      return null;
    }
  }
  function transitionType(from, to) {
    if (from === to) return null;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "page-fade";
    if (RULE_PAGE.test(from) && RULE_INDEX.test(to)) return "rule-close";
    var opening = dive();
    return opening && opening.href === to ? "rule-open" : "page-fade";
  }
  var SWELL_PAST_EDGES = 1.5;
  function aimAt(card) {
    var x = card.x + card.width / 2;
    var y = card.y + card.height / 2;
    var reach = Math.max(
      Math.max(x, innerWidth - x) / (card.width / 2),
      Math.max(y, innerHeight - y) / (card.height / 2),
    );
    doc.style.setProperty("--open-x", x + "px");
    doc.style.setProperty("--open-y", y + "px");
    doc.style.setProperty("--dive-scale", String(reach * SWELL_PAST_EDGES));
  }
  addEventListener("pageswap", function (event) {
    if (!event.viewTransition || !event.activation) return;
    var type = transitionType(pathOf(location.href), pathOf(event.activation.entry.url));
    if (type) event.viewTransition.types.add(type);
    else event.viewTransition.skipTransition();
  });
  addEventListener("pagereveal", function (event) {
    if (!event.viewTransition) return;
    var from = self.navigation && navigation.activation && navigation.activation.from;
    var type = from && from.url ? transitionType(pathOf(from.url), pathOf(location.href)) : null;
    if (!type) return event.viewTransition.skipTransition();
    event.viewTransition.types.add(type);
    doc.dataset.vt = type;
    if (type === "rule-open") {
      var opening = dive();
      aimAt(opening);
      var cover = document.querySelector('[data-part="cover"] .thumb');
      if (cover && opening.phase != null) {
        cover.getAnimations({ subtree: true }).forEach(function (art) {
          art.currentTime = opening.phase;
        });
      }
    }
    if (type === "rule-close") {
      // The index lands at rest, as the dive left it, with the rule's tile named for the morph
      // and the zoom centred on it.
      document.querySelectorAll("[data-cut]").forEach(function (piece) {
        piece.style.animation = "none";
        piece.classList.add("in");
      });
      var tile = document.querySelector('[data-cut][href="' + pathOf(from.url) + '"]');
      if (tile) {
        tile.setAttribute("data-opening", "");
        aimAt(tile.getBoundingClientRect());
        event.viewTransition.finished.finally(function () {
          tile.removeAttribute("data-opening");
        });
      }
    }
    try {
      sessionStorage.removeItem("${OPENING_KEY}");
    } catch (e) {}
  });
})();`;
