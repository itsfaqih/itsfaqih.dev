import { describe, expect, it } from "vite-plus/test";
import {
  aimsAt,
  type Box,
  type Drawn,
  leaves,
  longEnough,
  polyline,
  spineOf,
  squareHead,
  straightWhereItFits,
  tightest,
} from "../tests/arrow-rules";
import { ARROWS, downArrow } from "./arrows";
import { QUEUE_Y, SLOT_X, WORKER_SIZE, WORKER_X, WORKER_Y } from "./sections/hero/hero-pieces";
import { retryGhost, routeGhost } from "./sections/hero/hero-scenes";

// The Squint and hero arrows come from constants, so their rules hold here, in their own units
// (the hero's viewBox units draw at about 1px each). tests/visual/arrows.test.ts checks the hint and
// toggle arrows, which the rule pages place at run time, and where Squint's arrows land.

/**
 * Rules an arrow on main breaks today, keyed `<arrow> <rule>`. Each runs as an expected failure,
 * so it turns red once the arrow is fixed: then delete its line here.
 */
const KNOWN = new Map([
  [
    "squint length",
    "downArrow draws ARROWS.squint.length = 12px, under 24px (e6e0c25 shortened Squint's arrows on purpose)",
  ],
]);

const slot = (x: number): Box => ({
  left: x - 14,
  top: QUEUE_Y - 14,
  right: x + 14,
  bottom: QUEUE_Y + 14,
});
const worker = (y: number): Box => ({
  left: WORKER_X - WORKER_SIZE / 2,
  top: y - WORKER_SIZE / 2,
  right: WORKER_X + WORKER_SIZE / 2,
  bottom: y + WORKER_SIZE / 2,
});

const drawn = ({ spine, ink }: { spine: string; ink: string }): Drawn => ({
  spine: polyline(spine),
  ink,
});

// Each arrow with the box it leaves and the box it points at, and how far off each it stops.
const ARROWS_DRAWN = [
  ...WORKER_Y.map((y) => ({
    name: `hero route to worker at ${y}`,
    arrow: drawn(routeGhost(y)),
    source: slot(SLOT_X[3]),
    target: worker(y),
    gaps: { source: 2, target: 3 },
  })),
  {
    name: "hero retry",
    arrow: drawn(retryGhost()),
    source: worker(WORKER_Y[0]),
    target: slot(SLOT_X[0]),
    gaps: { source: 8, target: 8 },
  },
];

const check = (name: string, rule: string, run: () => string | undefined) => {
  const known = KNOWN.get(`${name} ${rule}`);
  (known ? it.fails : it)(`${rule}${known ? ` (known: ${known})` : ""}`, () => {
    expect(run() ?? "keeps the rule").toBe("keeps the rule");
  });
};

describe.each(ARROWS_DRAWN)("$name", ({ name, arrow, source, target, gaps }) => {
  const points = spineOf(arrow);
  check(
    name,
    "aim",
    () => aimsAt(points, target, gaps.target) ?? leaves(points, source, gaps.source),
  );
  check(name, "length", () => longEnough(points));
  check(name, "bend", () => tightest(points, ARROWS.hint.bend));
  check(name, "straight", () => straightWhereItFits(points, source, target));
  check(name, "head", () => squareHead(arrow));
});

describe("squint", () => {
  const arrow = drawn(downArrow(ARROWS.squint));
  const points = spineOf(arrow);
  check("squint", "length", () => longEnough(points));
  check("squint", "bend", () => tightest(points, ARROWS.hint.bend));
  check("squint", "head", () => squareHead(arrow));
});
