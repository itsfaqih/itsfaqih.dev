import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, inject, it } from "vite-plus/test";
import { ARROWS } from "../../src/arrows";
import { RING_GAP } from "../../src/rules/hints";
import {
  aimsAt,
  BEND,
  type Box,
  centre,
  crosses,
  grow,
  intersects,
  leaves,
  longEnough,
  outside,
  type Point,
  polyline,
  SHORTEST,
  spineOf,
  squarePixelHead,
  straightWhereItFits,
  tightest,
  touches,
} from "../arrow-rules";
import { openSettledPage, type Viewport } from "./page-setup";
import { routeSlug } from "../site";

// Walks every hint, toggle and Squint arrow the rule pages draw, at both widths, and holds each to
// the rules in tests/arrow-rules.ts. src/arrows.test.ts covers the hero's arrows. An arrow that
// breaks a rule today sits in PARKED and runs as an expected failure, so fixing that arrow turns
// it red until its line goes, and a second arrow breaking the same rule still fails.

type Rule =
  | "aim"
  | "nock"
  | "length"
  | "bend"
  | "straight"
  | "overlap"
  | "head"
  | "no target"
  | "one arrow";
/** An arrow that aims at nothing, or a target with no arrow or two, is never parked. */
type Parkable = Exclude<Rule, "no target" | "one arrow">;

/**
 * Each arrow that breaks a rule on main, by rule page, then reason, then `<viewport> <rule>
 * <arrow>`, where the arrow is its card, the target it points at, and #n for a repeat.
 */
type Park = `${Viewport | "both"} ${Parkable} ${string}`;
const SQUINT_SHORT =
  "button-hierarchy.astro draws Squint's arrow 18px long, under 24px (e6e0c25 shortened it on purpose)";
const OFF_CENTRE =
  "hints.ts shot() runs each pixel hint at a multiple of 45° through the band its label and target share, not centre to centre, so a head can pass wide of its target's centre and a nock of its word's";
const SQUINT_BOX =
  "button-hierarchy.astro draws Squint's pixel arrow in a fixed 5 by 7 cell box, which leaves 11px under the note and stops 9px over the button, past the 6px gaps";
const SLOTS =
  "hints.ts places a hint only in its own slots, so it covers content where the rules' 16-direction search finds a free spot 48px out";
const PARKED = {
  "button-design": {
    [SQUINT_BOX]: [
      "both aim squint → Cancel",
      "both aim squint → Publish",
      "both aim squint → Save draft",
      "both nock squint → Cancel",
      "both nock squint → Publish",
      "both nock squint → Save draft",
    ],
    [SQUINT_SHORT]: [
      "both length squint → Cancel",
      "both length squint → Publish",
      "both length squint → Save draft",
    ],
  },
  "data-loading": {
    [OFF_CENTRE]: [
      "mobile aim Avoid skeleton flickers → 80ms (hint)",
      "mobile aim Avoid skeleton flickers ✕ → 80ms (hint)",
      "desktop aim Render public pages on the server → Load /lamp (hint)",
      "mobile aim Start fetching early → Play (hint)",
      "mobile aim Start fetching early ✕ → Play (hint)",
      "mobile nock Avoid skeleton flickers → 80ms (hint)",
      "mobile nock Avoid skeleton flickers ✕ → 80ms (hint)",
      "desktop nock Render public pages on the server → Load /lamp (hint)",
      "mobile nock Start fetching early → Play (hint)",
      "mobile nock Start fetching early ✕ → Play (hint)",
    ],
  },
  "dialog-design": {
    [OFF_CENTRE]: [
      "mobile aim Ask before you drop a draft → New issue (hint)",
      "mobile aim Ask before you drop a draft ✕ → New issue (hint)",
      "both aim Give it a name → Rename (hint)",
      "mobile aim Give it a name ✕ → Rename (hint)",
      "mobile aim Let Escape close it → What's new (hint)",
      "mobile aim Let Escape close it ✕ → What's new (hint)",
      "mobile aim Lock the page behind → Share (hint)",
      "mobile aim Lock the page behind ✕ → Share (hint)",
      "mobile nock Ask before you drop a draft → New issue (hint)",
      "mobile nock Ask before you drop a draft ✕ → New issue (hint)",
      "both nock Give it a name → Rename (hint)",
      "mobile nock Give it a name ✕ → Rename (hint)",
      "mobile nock Let Escape close it → What's new (hint)",
      "mobile nock Let Escape close it ✕ → What's new (hint)",
      "mobile nock Lock the page behind → Share (hint)",
      "mobile nock Lock the page behind ✕ → Share (hint)",
    ],
    [SLOTS]: ["desktop overlap Focus the safe answer → Delete project (hint)"],
  },
  "handling-timestamps": {
    [OFF_CENTRE]: [
      "both aim Filter by the user's day → <input type=date> (hint)",
      "mobile aim Filter by the user's day ✕ → <input type=date> (hint)",
      "mobile aim Send the zone with the input → <input type=time> (hint)",
      "both nock Filter by the user's day → <input type=date> (hint)",
      "mobile nock Filter by the user's day ✕ → <input type=date> (hint)",
      "mobile nock Send the zone with the input → <input type=time> (hint)",
    ],
  },
  "null-vs-undefined": {
    [OFF_CENTRE]: [
      "desktop aim Clear with null → Remove reviewer Rina (hint)",
      "mobile aim Leave untouched fields out → Save (hint)",
      "mobile aim Leave untouched fields out ✕ → Save (hint)",
      "desktop nock Clear with null → Remove reviewer Rina (hint)",
      "mobile nock Leave untouched fields out → Save (hint)",
      "mobile nock Leave untouched fields out ✕ → Save (hint)",
    ],
    [SLOTS]: [
      "mobile overlap Leave untouched fields out → Save (hint)",
      "mobile overlap Leave untouched fields out ✕ → Save (hint)",
    ],
  },
  "table-design": {
    [OFF_CENTRE]: [
      "both aim Keep the page in the URL → Reload (hint)",
      "mobile aim Keep the page in the URL ✕ → Reload (hint)",
      "desktop aim Put actions in a fixed last column → Ana Li (hint)",
      "mobile aim Put actions in a fixed last column ✕ → Ana Li (hint)",
      "both nock Keep the page in the URL → Reload (hint)",
      "mobile nock Keep the page in the URL ✕ → Reload (hint)",
      "both nock Put actions in a fixed last column → Ana Li (hint)",
      "mobile nock Put actions in a fixed last column ✕ → Ana Li (hint)",
    ],
  },
} satisfies Record<string, Record<string, Park[]>>;
/** Each parked break as its full key, `both` spelled out as one entry per width. */
function known(parked: Record<string, Record<string, Park[]>>) {
  return new Map(
    Object.entries(parked).flatMap(([page, whys]) =>
      Object.entries(whys).flatMap(([why, breaks]) =>
        breaks.flatMap((park) => {
          const [size, ...rest] = park.split(" ");
          const sizes = size === "both" ? ["desktop", "mobile"] : [size];
          return sizes.map((viewport): [string, string] => [
            `rule-of-thumb__${page} ${viewport} ${rest.join(" ")}`,
            why,
          ]);
        }),
      ),
    ),
  );
}
const KNOWN = known(PARKED);

type Kind = "hint" | "toggle" | "squint";
type Seen = {
  card: string;
  spine: string;
  cells: Point[];
  grid: number;
  matrix: number[];
  label: Box;
  /** The index of the arrow's target in `targets`, matched by where the head lands. */
  target?: number;
};
type Card = {
  card: string;
  arrows: Seen[];
  /** `name` is what the target says, so a break names its arrow by the control it points at. */
  targets: { name: string; box: Box; room: Box; inPane: boolean }[];
  // The words, controls and pictures in the card, each with the targets it belongs to.
  marks: { box: Box; of: number[] }[];
};

/** Runs in the page: every lesson card's hint and toggle arrows, their targets and its content. */
function collectHints(): Card[] {
  const box = (r: DOMRect): Box => ({
    left: r.left + window.scrollX,
    top: r.top + window.scrollY,
    right: r.right + window.scrollX,
    bottom: r.bottom + window.scrollY,
  });
  const matrix = (svg: SVGGraphicsElement) => {
    const m = svg.getScreenCTM();
    return m ? [m.a, m.b, m.c, m.d, m.e + window.scrollX, m.f + window.scrollY] : [];
  };
  const holds = (outer: DOMRect, inner: DOMRect) =>
    inner.left >= outer.left &&
    inner.right <= outer.right &&
    inner.top >= outer.top &&
    inner.bottom <= outer.bottom;
  const cards: Card[] = [];
  for (const card of document.querySelectorAll<HTMLElement>("rule-lesson article")) {
    const layer = card.querySelector('[data-part="hints"]');
    if (!layer) continue;
    const targets = [...card.querySelectorAll<HTMLElement>("[data-hint]")].filter((t) => {
      const figure = t.closest<HTMLElement>("figure[data-side]");
      if (figure && getComputedStyle(figure).visibility === "hidden") return false;
      return t.getBoundingClientRect().width > 0;
    });
    const arrows: Seen[] = [];
    for (const svg of layer.querySelectorAll("svg")) {
      // A pixel hint carries its line as data-spine and draws its cells after its ring.
      const spine = svg.dataset.spine ?? "";
      const rects = [...svg.querySelectorAll(":scope > rect")].slice(1);
      const label = svg.nextElementSibling;
      if (!label) continue;
      arrows.push({
        card: card.querySelector("h2, h3")?.textContent?.trim() ?? "",
        spine,
        cells: rects.map((r) => ({
          x: Number(r.getAttribute("x")),
          y: Number(r.getAttribute("y")),
        })),
        grid: Number(rects[0]?.getAttribute("width") ?? 0),
        matrix: matrix(svg),
        label: box(label.getBoundingClientRect()),
      });
    }
    // The same walk hints.ts survey() makes: text line by line, controls and pictures whole,
    // and painted empty boxes such as skeleton bars.
    const marks: Card["marks"] = [];
    const range = document.createRange();
    const rects = targets.map((t) => t.getBoundingClientRect());
    const of = (e: Element, r: DOMRect) =>
      targets.flatMap((t, i) => (t.contains(e) || holds(r, rects[i]!) ? [i] : []));
    const visit = (parent: Element) => {
      for (const e of parent.children) {
        const style = getComputedStyle(e);
        if (style.display === "none" || style.opacity === "0" || e === layer) continue;
        const shown = e.checkVisibility({ visibilityProperty: true });
        const painted =
          style.backgroundImage !== "none" ||
          !/^rgba\(.*,\s*0\)$|\/\s*0\)$/.test(style.backgroundColor);
        if (e.matches("button, input, select, textarea, svg, img") || (!e.firstChild && painted)) {
          const r = e.getBoundingClientRect();
          if (shown && r.width > 1 && r.height > 1) marks.push({ box: box(r), of: of(e, r) });
          continue;
        }
        for (const n of shown ? e.childNodes : []) {
          if (n.nodeType !== Node.TEXT_NODE || !n.textContent?.trim()) continue;
          range.selectNodeContents(n);
          for (const r of range.getClientRects())
            if (r.width > 1) marks.push({ box: box(r), of: of(e, r) });
        }
        visit(e);
      }
    };
    visit(card);
    cards.push({
      card: card.querySelector("h2, h3")?.textContent?.trim() ?? "",
      arrows,
      targets: targets.map((t, i) => {
        const figure = t.closest("figure[data-side]");
        return {
          name:
            t.getAttribute("aria-label") ||
            t.textContent!.replace(/\s+/g, " ").trim() ||
            `<${t.localName}${t.hasAttribute("type") ? ` type=${t.getAttribute("type")}` : ""}>`,
          box: box(rects[i]!),
          room: box((figure ?? card).getBoundingClientRect()),
          inPane: figure !== null,
        };
      }),
      marks,
    });
  }
  return cards;
}

/** Runs in the page: each Squint arrow, the note it hangs from and the button under it. */
function collectSquint() {
  const box = (r: DOMRect): Box => ({
    left: r.left + window.scrollX,
    top: r.top + window.scrollY,
    right: r.right + window.scrollX,
    bottom: r.bottom + window.scrollY,
  });
  const range = document.createRange();
  return [...document.querySelectorAll<SVGSVGElement>('svg[data-arrow="squint"]')].map((svg) => {
    const m = svg.getScreenCTM()!;
    const note = svg.parentElement!;
    range.selectNodeContents(note.firstChild!);
    const rects = [...svg.querySelectorAll("rect")];
    return {
      spine: svg.dataset.spine ?? "",
      cells: rects.map((r) => ({ x: Number(r.getAttribute("x")), y: Number(r.getAttribute("y")) })),
      grid: Number(rects[0]?.getAttribute("width") ?? 0),
      matrix: [m.a, m.b, m.c, m.d, m.e + window.scrollX, m.f + window.scrollY],
      label: box(range.getBoundingClientRect()),
      name: note.parentElement!.querySelector("button")!.textContent!.trim(),
      target: box(note.parentElement!.querySelector("button")!.getBoundingClientRect()),
    };
  });
}

// The ink is one `grid` cell wide: a line keeps off by half its width and a hair, as hints.ts does.
const look = ARROWS.hint;
const INK = look.grid / 2 + 1;
// A hint's line stops short of the ring round its target, which sits RING_GAP out.
const GAPS = {
  hint: { label: ARROWS.hint.labelGap, target: ARROWS.hint.targetGap + RING_GAP },
  toggle: { label: ARROWS.toggle.labelGap, target: ARROWS.toggle.targetGap + RING_GAP },
  squint: { label: 6, target: 6 },
};

type Placed = { kind: Kind; where: string; points: Point[]; label: Box; target: Box; room: Box };

/**
 * A spot round the target where a label `w` by `h` and a straight arrow from it would keep off
 * the content and every other arrow, inside the room. A label tries 16 directions at 16 to 48px.
 */
function freeSlot(a: Placed, w: number, h: number, marks: Box[], others: Placed[]) {
  const t = a.target;
  const tc = centre(t);
  const half = (bw: number, bh: number, d: Point) =>
    Math.min(d.x ? bw / 2 / Math.abs(d.x) : Infinity, d.y ? bh / 2 / Math.abs(d.y) : Infinity);
  for (let k = 0; k < 16; k++) {
    const d = { x: Math.cos((k * Math.PI) / 8), y: Math.sin((k * Math.PI) / 8) };
    for (const off of [16, 24, 32, 48]) {
      const reach = half(t.right - t.left, t.bottom - t.top, d) + half(w, h, d) + off;
      const c = { x: tc.x + d.x * reach, y: tc.y + d.y * reach };
      const label = {
        left: c.x - w / 2,
        top: c.y - h / 2,
        right: c.x + w / 2,
        bottom: c.y + h / 2,
      };
      if (label.left < a.room.left || label.right > a.room.right) continue;
      if (label.top < a.room.top || label.bottom > a.room.bottom) continue;
      const from = half(w, h, d) + 6;
      const to = half(t.right - t.left, t.bottom - t.top, d) + 6;
      const line = [
        { x: c.x - d.x * from, y: c.y - d.y * from },
        { x: tc.x + d.x * to, y: tc.y + d.y * to },
      ];
      if (reach - from - to < SHORTEST) continue;
      const room = grow(label, 2);
      if (marks.some((m) => intersects(room, m) || touches(line, undefined, m, INK))) continue;
      if (
        others.some(
          (o) =>
            intersects(room, o.label) ||
            touches(line, undefined, o.label, INK) ||
            touches(o.points, undefined, room, INK) ||
            crosses(line, o.points, INK),
        )
      )
        continue;
      return `${k * 22.5}° ${off}px out`;
    }
  }
  return undefined;
}

type Break = { rule: Rule; where: string; what: string };

function judge(cards: Card[], squint: ReturnType<typeof collectSquint>) {
  const broken: Break[] = [];
  const flag = (rule: Rule, where: string, what: string | undefined) => {
    if (what) broken.push({ rule, where, what });
  };
  const rules = (a: Placed, seen: Seen) => {
    const gaps = GAPS[a.kind];
    flag("aim", a.where, aimsAt(a.points, a.target, gaps.target));
    flag("nock", a.where, leaves(a.points, a.label, gaps.label));
    flag("length", a.where, longEnough(a.points));
    flag("bend", a.where, tightest(a.points, BEND));
    flag("straight", a.where, straightWhereItFits(a.points, a.label, a.target));
    flag("head", a.where, squarePixelHead(polyline(seen.spine), seen.cells, seen.grid, look.head));
  };
  for (const card of cards) {
    const placed: (Placed & { marks: Box[] })[] = [];
    card.arrows.forEach((seen, i) => {
      const points = spineOf({ spine: polyline(seen.spine), matrix: seen.matrix });
      const tip = points.at(-1)!;
      const nearest = card.targets
        .map((t, k) => ({ k, miss: outside(tip, t.box) }))
        .sort((a, b) => a.miss - b.miss)[0];
      if (!nearest) {
        flag("no target", `${card.card} #${i}`, "points at no [data-hint] target");
        return;
      }
      const t = card.targets[nearest.k]!;
      const a: Placed = {
        kind: t.inPane ? "hint" : "toggle",
        where: `${card.card} → ${t.name} (${t.inPane ? "hint" : "toggle"})`,
        points,
        label: seen.label,
        target: t.box,
        room: t.room,
      };
      rules(a, seen);
      seen.target = nearest.k;
      placed.push({
        ...a,
        marks: card.marks.filter((m) => !m.of.includes(nearest.k)).map((m) => m.box),
      });
    });
    card.targets.forEach((t, k) => {
      const n = card.arrows.filter((a) => a.target === k).length;
      if (n !== 1) flag("one arrow", `${card.card} → ${t.name}`, `has ${n} arrows pointing at it`);
    });
    for (const a of placed) {
      const others = placed.filter((o) => o !== a);
      const onContent = a.marks.some((m) => touches(a.points, a.label, m, INK));
      const onArrow = others.some(
        (o) =>
          intersects(a.label, o.label) ||
          touches(a.points, undefined, o.label, INK) ||
          crosses(a.points, o.points, INK),
      );
      if (!onContent && !onArrow) continue;
      const slot = freeSlot(
        a,
        a.label.right - a.label.left,
        a.label.bottom - a.label.top,
        a.marks,
        others,
      );
      if (slot)
        flag(
          "overlap",
          a.where,
          `covers ${onArrow ? "another arrow" : "content"} though a free slot exists (${slot})`,
        );
    }
  }
  squint.forEach((s) => {
    const points = spineOf({ spine: polyline(s.spine), matrix: s.matrix });
    const a: Placed = {
      kind: "squint",
      where: `squint → ${s.name}`,
      points,
      label: s.label,
      target: s.target,
      room: s.target,
    };
    flag("aim", a.where, aimsAt(points, s.target, GAPS.squint.target));
    flag("nock", a.where, leaves(points, s.label, GAPS.squint.label));
    flag("length", a.where, longEnough(points));
    flag("bend", a.where, tightest(points, BEND));
    flag("head", a.where, squarePixelHead(polyline(s.spine), s.cells, s.grid, look.head));
  });
  return broken;
}

const routes = inject("routes").filter((route) => route.startsWith("/rule-of-thumb/"));
const viewports: Viewport[] = ["desktop", "mobile"];

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch();
});
afterAll(() => browser?.close());

/** Every card's arrows on the side it opens on, then again with every card flipped to ✕. */
async function walk(page: Page) {
  const frames = () =>
    page.evaluate(
      () =>
        new Promise<void>((done) =>
          requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(done, 50))),
        ),
    );
  const first = await page.evaluate(collectHints);
  // Flip each card as a reader does, one click at a time, then let the rows land and the hints
  // re-place before measuring. Wide screens show both panes and hide the keys. A card re-places
  // its hints only while it is near the screen, so each waits for that before the next click
  // scrolls it away.
  const keys = page.locator('article [data-part="bad"]');
  let flips = 0;
  for (let i = 0, n = await keys.count(); i < n; i++) {
    if (!(await keys.nth(i).isVisible())) continue;
    await keys.nth(i).click();
    await frames();
    flips++;
  }
  await page.waitForTimeout(600);
  await frames();
  const flipped = flips
    ? (await page.evaluate(collectHints)).map((c) => ({ ...c, card: `${c.card} ✕` }))
    : [];
  await page.evaluate(() => {
    for (const key of document.querySelectorAll<HTMLElement>('[data-toggle="squint"]')) key.click();
  });
  await frames();
  return { cards: [...first, ...flipped], squint: await page.evaluate(collectSquint) };
}

describe.concurrent("every drawn arrow keeps the arrow rules", () => {
  it.for(routes.flatMap((route) => viewports.map((viewport) => [route, viewport] as const)))(
    "%s %s",
    { timeout: 120_000 },
    async ([route, viewport], { expect: check }) => {
      const { context, page } = await openSettledPage(browser, {
        route,
        viewport,
        scheme: "light",
      });
      try {
        const { cards, squint } = await walk(page);
        const broken = judge(cards, squint);
        const here = `${routeSlug(route)} ${viewport} `;
        const key = (b: Break) => `${here}${b.rule} ${b.where}`;
        const unexpected = broken
          .filter((b) => !KNOWN.has(key(b)))
          .map((b) => `${b.rule}: ${b.where}: ${b.what}`);
        const seen = new Set(broken.map(key));
        const healed = [...KNOWN.keys()].filter((k) => k.startsWith(here) && !seen.has(k));
        // Soft, so a page that breaks a new rule still reports the known ones it fixed.
        check.soft(unexpected, "arrows break a rule").toEqual([]);
        check
          .soft(healed, "parked breaks that no longer happen: delete them from PARKED")
          .toEqual([]);
      } finally {
        await context.close();
      }
    },
  );
});
