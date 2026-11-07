import { PAGE_FILE_END } from "../page-path";
import { OPENING_KEY } from "../sections/rule-open";

/** How long the cut-ins wait for the page's islands before they settle without them. */
export const REST_AFTER_MS = 3500;

/**
 * Runs before first paint: the theme, the sound toggle's glyph, the intro gate, the header carried
 * across pages, the rest fallback that settles the cut-ins when the islands that play them are slow
 * to arrive, and the cross-document view transitions' types. Opening a rule from its tile dives
 * into it (rule-open); leaving a rule for the index zooms back out onto its tile (rule-close); every
 * other page change fades through (page-fade). A rule's "Back to home" link zooms out the same way,
 * onto the rule's card in the home deck.
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
  var saved = null;
  try {
    saved = localStorage.getItem("theme");
  } catch (e) {}
  if (saved === "dark" || saved === "light") theme = saved;
  else if (matchMedia("(prefers-color-scheme: light)").matches) theme = "light";
  doc.classList.remove("light", "dark");
  doc.classList.add(theme);
  // The metas' media queries follow the system, which a saved choice can contradict.
  document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
    meta.media = meta.dataset.theme === theme ? "all" : "not all";
  });
  try {
    if (localStorage.getItem("sound") === "off") doc.classList.add("sound-off");
  } catch (e) {}
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
    // A rule page's back link returns home when the visit came from there.
    if (sameSite && new URL(document.referrer).pathname === "/") doc.classList.add("from-home");
  } catch (e) {}
  function atRest() {
    document.querySelectorAll("[data-cut]").forEach(function (piece) {
      piece.style.animation = "none";
      piece.classList.add("in");
    });
  }
  // Whatever plays the cut-ins cancels the fallback once it starts: an island once it hydrates, a
  // custom element once it watches them (cut-ins.ts).
  var rest = setTimeout(function () {
    atRest();
    doc.classList.add("no-intro");
  }, Math.max(0, ${REST_AFTER_MS} - performance.now()));
  function settle(event) {
    if (event.target.querySelector("[data-cut]")) clearTimeout(rest);
  }
  document.addEventListener("astro:hydrate", settle, true);
  document.addEventListener("cut-ins", settle, true);

  var RULE_PAGE = /^\/rule-of-thumb\/[^/]+$/;
  var RULE_INDEX = /^\/rule-of-thumb$/;
  var HOME_DECK = "#rules";
  function pathOf(url) {
    return new URL(url, location.href).pathname.replace(${PAGE_FILE_END}, "") || "/";
  }
  function dive() {
    try {
      return JSON.parse(sessionStorage.getItem("${OPENING_KEY}") || "null");
    } catch (e) {
      return null;
    }
  }
  function transitionType(fromUrl, toUrl) {
    var from = pathOf(fromUrl);
    var to = pathOf(toUrl);
    if (from === to) return null;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "page-fade";
    var toDeck = to === "/" && new URL(toUrl, location.href).hash === HOME_DECK;
    if (RULE_PAGE.test(from) && (RULE_INDEX.test(to) || toDeck)) return "rule-close";
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
    var type = transitionType(location.href, event.activation.entry.url);
    if (type) event.viewTransition.types.add(type);
    else event.viewTransition.skipTransition();
  });
  addEventListener("pagereveal", function (event) {
    // A page restored from the back-forward cache still names the card its dive left from, and two
    // elements sharing a transition name would skip the morph.
    document.querySelectorAll("[data-opening]").forEach(function (card) {
      card.removeAttribute("data-opening");
    });
    if (!event.viewTransition) return;
    var from = self.navigation && navigation.activation && navigation.activation.from;
    var type = from && from.url ? transitionType(from.url, location.href) : null;
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
      // The index or the home deck lands at rest, as the dive left it, with the rule's tile named
      // for the morph and the zoom centred on it.
      atRest();
      // The browser scrolls to the home deck after the first frame, too late for the morph.
      var mark = location.hash && document.getElementById(location.hash.slice(1));
      if (mark) mark.scrollIntoView({ behavior: "instant" });
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
