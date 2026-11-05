import Fuse from "fuse.js";
import { colorOf, VISIBLE_GUIDELINES as RULES } from "../data/guidelines";
import type { PublishedGuideline } from "../data/guidelines";
import { reducedMotion } from "../hooks/media-query";
import { play } from "../hooks/sound";
import { isTransitioning, watchRuleOpen } from "./rule-open";
import { countClass } from "./chips.view";
import { beamClass } from "./rule-select.view";

type Point = [x: number, y: number];

function hull(points: Point[]) {
  const sorted = [...points].sort(([ax, ay], [bx, by]) => ax - bx || ay - by);
  const turn = ([ox, oy]: Point, [ax, ay]: Point, [bx, by]: Point) =>
    (ax - ox) * (by - oy) - (ay - oy) * (bx - ox);
  const chain = (list: Point[]) => {
    const kept: Point[] = [];
    for (const point of list) {
      while (kept.length >= 2 && turn(kept.at(-2)!, kept.at(-1)!, point) <= 0) kept.pop();
      kept.push(point);
    }
    return kept.slice(0, -1);
  };
  return [...chain(sorted), ...chain([...sorted].reverse())];
}

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVXYZ0123456789#%<>";
const NARROW = "il1!|:;.,'";
const IS_NARROW = /[iljtfrI1.,:;'!|()-]/;

function glyphLike(char: string) {
  if (IS_NARROW.test(char)) return NARROW[Math.floor(Math.random() * NARROW.length)]!;
  const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
  return char === char.toLowerCase() ? glyph.toLowerCase() : glyph;
}

/**
 * Settles `text` into its cells (one per letter, spaces skipped) over 300ms, each unsettled cell
 * showing a fresh stand-in glyph every frame. Returns the cancel.
 */
function scramble(cells: HTMLElement[], text: string) {
  if (reducedMotion()) return () => {};
  const indexes = Array.from(text).flatMap((char, index) => (char === " " ? [] : [index]));
  const start = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / 300);
    const settled = Math.floor(progress * text.length);
    const glyphs = Array.from(text, glyphLike);
    cells.forEach((cell, at) => {
      const index = indexes[at]!;
      if (index >= settled) cell.dataset.glyph = glyphs[index];
      else delete cell.dataset.glyph;
    });
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

/**
 * The rule select (rule-select.astro): a search box and topic chips filter the tiles, and the tile
 * under the pointer or keyboard focus is picked, playing its art and showing it on the panel. A
 * lit tile (hovered with a mouse, or focused from the keyboard) projects onto the panel through
 * the beam. A new filter deals a fresh hand of tiles, which cut in again.
 */
class RuleSelect extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const part = <T extends Element = HTMLElement>(name: string) =>
      this.querySelector<T>(`[data-part="${name}"]`)!;
    const panel = part("panel");
    const grid = part("tiles");
    const beam = part("beam");
    const search = part<HTMLInputElement>("search");
    const topicText = part("topic");
    const empty = document.importNode(
      part<HTMLTemplateElement>("empty").content.firstElementChild!,
      true,
    );
    const deck = new Map(
      Array.from(
        part<HTMLTemplateElement>("deck").content.querySelectorAll("a"),
        (tile) => [tile.getAttribute("href")!, tile] as const,
      ),
    );
    const panels = new Map(
      Array.from(
        this.querySelectorAll<HTMLTemplateElement>("template[data-panel]"),
        (template) => [template.dataset.panel!, template] as const,
      ),
    );
    const standby = Array.from(panel.children);
    const chipButtons = Array.from(
      this.querySelectorAll<HTMLButtonElement>("button[data-topic]"),
      (chip) => ({ chip, topic: chip.dataset.topic!, count: chip.querySelector("b")! }),
    );
    const fuse = new Fuse(RULES, {
      keys: [
        { name: "title", weight: 3 },
        { name: "label", weight: 1.5 },
        { name: "description", weight: 1 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
    });

    const controller = new AbortController();
    const { signal } = controller;

    // Leaving a rule zooms back out onto its tile here, so this page voices it, as a rule page
    // voices the dive in. The head script types it on pagereveal, which can come before or after.
    const voiceRise = () => {
      if (isTransitioning("rule-close")) play("rise");
    };
    if (document.documentElement.dataset.vt) voiceRise();
    else addEventListener("pagereveal", voiceRise, { once: true, signal });
    let query = "";
    let category = "All";
    let selectedId: string | null = null;
    let litId: string | null = null;
    let litTile: HTMLElement | null = null;
    let aimed: string | null = null;
    let dealt = "All|";
    let shown: string | null = null;
    let stopScramble = () => {};
    let stopAim = () => {};
    let tiles = new Map<string, HTMLElement>();

    const matchesNow = () => {
      const normalized = query.trim().toLowerCase();
      const found = normalized ? fuse.search(normalized).map(({ item }) => item) : RULES;
      return found.filter((rule) => category === "All" || rule.label === category);
    };

    const aim = () => {
      if (!litTile) return;
      const box = this.getBoundingClientRect();
      const from = litTile.getBoundingClientRect();
      const to = panel.getBoundingClientRect();
      const corners = ({ left, top, right, bottom }: DOMRect): Point[] => {
        const [x0, y0, x1, y1] = [
          left - box.left,
          top - box.top,
          right - box.left,
          bottom - box.top,
        ];
        return [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ];
      };
      const lens: Point = [
        from.left + from.width / 2 - box.left,
        from.top + from.height / 2 - box.top,
      ];
      const reach = Math.max(...corners(to).map(([x, y]) => Math.hypot(x - lens[0], y - lens[1])));
      beam.style.clipPath = `polygon(${hull([...corners(from), ...corners(to)])
        .map(([x, y]) => `${x}px ${y}px`)
        .join(", ")})`;
      beam.style.setProperty("--lens-x", `${lens[0]}px`);
      beam.style.setProperty("--lens-y", `${lens[1]}px`);
      beam.style.setProperty("--reach", `${reach}px`);
    };

    // Once the panel shows what the lit tile projects, the beam follows that tile, while the panel
    // is on screen.
    const follow = () => {
      if (litId === aimed) return;
      aimed = litId;
      stopAim();
      stopAim = () => {};
      if (!litId || !panel.checkVisibility()) return;
      aim();
      const following = new AbortController();
      addEventListener("scroll", aim, { passive: true, signal: following.signal });
      addEventListener("resize", aim, { signal: following.signal });
      stopAim = () => following.abort();
    };

    const showPanel = (rule: PublishedGuideline | undefined) => {
      const id = rule?.id ?? null;
      if (id === shown) return;
      shown = id;
      stopScramble();
      stopScramble = () => {};
      if (!rule) {
        panel.replaceChildren(...standby);
        return;
      }
      const content = document.importNode(panels.get(rule.id)!.content, true);
      const cells = Array.from(
        content.querySelectorAll<HTMLElement>('[data-part="scramble"] > span > span'),
      );
      panel.replaceChildren(content);
      stopScramble = scramble(cells, rule.title);
    };

    const paint = () => {
      // Chromium fires pointerleave between pageswap and the old page's snapshot, which would put
      // the panel back on standby under a dive that morphs from it.
      if (isTransitioning()) return;
      const matches = matchesNow();
      const selected = matches.find((rule) => rule.id === selectedId);
      const key = `${category}|${query.trim().toLowerCase()}`;
      if (key !== dealt) {
        dealt = key;
        tiles = new Map(
          matches.map((rule) => [rule.id, document.importNode(deck.get(rule.href)!, true)]),
        );
        tiles.forEach((tile, id) => watchTile(tile, id));
        grid.replaceChildren(...tiles.values());
      }
      if (matches.length === 0) {
        // Separate text nodes, as each is shaped on its own: the closing quote takes no kerning.
        empty.replaceChildren(
          "No rules match “",
          query.trim(),
          "”",
          category !== "All" ? ` in ${category}` : "",
          ".",
        );
        grid.after(empty);
      } else {
        empty.remove();
      }

      this.toggleAttribute("data-lit", litId !== null);
      for (const [id, tile] of tiles) {
        tile.toggleAttribute("data-on", id === selected?.id);
        tile.toggleAttribute("data-lit", id === litId);
        tile.querySelector(".thumb")!.toggleAttribute("data-play", id === selected?.id);
      }
      panel.toggleAttribute("data-empty", !selected);
      const hue = selected ? colorOf(selected.label) : null;
      for (const element of [panel, beam]) {
        if (hue) element.style.setProperty("--c", hue);
        else element.style.removeProperty("--c");
      }
      beam.className = beamClass(Boolean(selected));
      topicText.textContent = category;
      showPanel(selected);
      for (const { chip, topic, count } of chipButtons) {
        chip.setAttribute("aria-pressed", String(topic === category));
        count.className = countClass(topic === category);
      }
      follow();
    };

    // Whether the latest light came from a pointer that moved, as `select` decides for `move`.
    let lightVoiced = false;
    const light = (id: string, tile: HTMLElement, voiced = true) => {
      litTile = tile;
      litId = id;
      lightVoiced = voiced;
    };

    const select = (id: string, voiced = true) => {
      if (selectedId !== id && voiced) play("move");
      selectedId = id;
    };
    // The beam's stutter (beamOn in rule-select.css.ts) catches at 20% and 60% of its 260ms, and
    // crackles each time. Keyed to the animation, it stays quiet wherever the stutter doesn't run.
    let crackles: number[] = [];
    const quiet = () => crackles.splice(0).forEach((timer) => clearTimeout(timer));
    beam.addEventListener(
      "animationstart",
      (event) => {
        if (event.target !== beam || !lightVoiced) return;
        quiet();
        crackles = [52, 156].map((ms) => window.setTimeout(() => play("flicker"), ms));
      },
      { signal },
    );
    beam.addEventListener("animationcancel", quiet, { signal });
    // A tile also enters under a still pointer, as when the palette over the grid closes. Only a
    // pointer that moved onto it sounds.
    let restingAt = "";
    document.addEventListener(
      "pointermove",
      (event) => (restingAt = `${event.clientX},${event.clientY}`),
      { capture: true, passive: true, signal },
    );

    function watchTile(tile: HTMLElement, id: string) {
      tile.addEventListener(
        "pointerenter",
        (event) => {
          const moved = `${event.clientX},${event.clientY}` !== restingAt;
          select(id, moved);
          if (event.pointerType !== "touch") light(id, tile, moved);
          paint();
        },
        { signal },
      );
      tile.addEventListener(
        "focus",
        () => {
          select(id);
          if (tile.matches(":focus-visible")) light(id, tile);
          paint();
        },
        { signal },
      );
      tile.addEventListener(
        "blur",
        () => {
          if (litId === id) litId = null;
          if (selectedId === id) selectedId = null;
          paint();
        },
        { signal },
      );
    }

    for (const tile of grid.querySelectorAll<HTMLElement>("a")) {
      const id = RULES.find((rule) => rule.href === tile.getAttribute("href"))!.id;
      tiles.set(id, tile);
      watchTile(tile, id);
    }

    grid.addEventListener(
      "pointerleave",
      () => {
        litId = null;
        if (!grid.querySelector(":focus-visible")) selectedId = null;
        paint();
      },
      { signal },
    );
    search.addEventListener(
      "input",
      () => {
        query = search.value;
        paint();
      },
      { signal },
    );
    for (const { chip, topic } of chipButtons) {
      chip.addEventListener(
        "click",
        () => {
          category = topic;
          paint();
        },
        { signal },
      );
    }
    addEventListener(
      "keydown",
      (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const typing = target?.closest("input, textarea, [contenteditable='true']");
        if (event.key === "/" && !typing) {
          event.preventDefault();
          search.focus();
        }
      },
      { signal },
    );
    watchRuleOpen(this, signal, panel);

    this.#stop = () => {
      controller.abort();
      stopAim();
      stopScramble();
      quiet();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("rule-select", RuleSelect);
