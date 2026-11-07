import { ARROWS, brush, fmt, type Point, unit } from "../../arrows";
import { boxCentre, type Outline } from "./hero-morph";
import {
  ABSORBED_SCALE,
  type Piece,
  QUEUE_Y,
  SLOT_GAP,
  SLOT_X,
  WORKER_SIZE,
  WORKER_X,
  WORKER_Y,
  workerOf,
} from "./hero-pieces";
import { easeInOut, OUT, pct, SLIDE_MS, type TopInk, vars } from "./hero-prints.view";
import { INOUT, SPRING } from "./hero-prints.css";

export const MEANDER = [
  [40, 160],
  [88, 160],
  [88, 40],
  [136, 40],
  [136, 160],
  [184, 160],
  [184, 40],
  [232, 40],
  [232, 160],
  [280, 160],
  [280, 40],
] as const;

function meanderKeyframes() {
  const lengths = MEANDER.slice(1).map(([x, y], k) =>
    Math.hypot(x - MEANDER[k]![0], y - MEANDER[k]![1]),
  );
  const total = lengths.reduce((a, b) => a + b, 0);
  let walked = 0;
  const stops = MEANDER.map(([x, y], k) => {
    if (k) walked += lengths[k - 1]!;
    return `${pct((walked / total) * 100)} { opacity: 1; transform: translate(${x}px, ${y}px); }`;
  });
  return `@keyframes hp-ghost { ${stops.join(" ")} }`;
}

const ARC = [
  [WORKER_X, WORKER_Y[0]],
  [228, WORKER_Y[0] - 50],
  [80, WORKER_Y[0] - 50],
  [SLOT_X[0], QUEUE_Y],
] as const;

function arcPoint(t: number) {
  const u = 1 - t;
  const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  const at = (i: 0 | 1) => ARC.reduce((sum, pt, k) => sum + pt[i] * w[k]!, 0);
  return { x: at(0), y: at(1) };
}

/**
 * A brush arrow along `line`, its last stretch straightened to seat the head on the last heading.
 * `head` runs over the head and a hair past the tip, for a mask to keep it whole between dashes.
 */
function arrowed(line: Point[]) {
  const { head, notch } = ARROWS.hero;
  const tip = line.at(-1)!;
  const from = line.at(-2)!;
  const dir = unit(tip.x - from.x, tip.y - from.y);
  const back = (by: number) => ({ x: tip.x - dir.x * by, y: tip.y - dir.y * by });
  const before = line.filter((p) => Math.hypot(tip.x - p.x, tip.y - p.y) > head);
  return {
    ...brush([...before, back(head), tip], ARROWS.hero),
    head: `M${fmt(back(head + notch))} L${fmt(back(-1))}`,
  };
}

export function routeGhost(boxY: number) {
  const on = (x: number) => ({
    x,
    y: QUEUE_Y + ((boxY - QUEUE_Y) * (x - SLOT_X[3])) / (WORKER_X - SLOT_X[3]),
  });
  return arrowed([on(SLOT_X[3] + 16), on(WORKER_X - WORKER_SIZE / 2 - 3)]);
}

const RETRY_GHOST_SAMPLES = 24;
export function retryGhost() {
  return arrowed(
    Array.from({ length: RETRY_GHOST_SAMPLES }, (_, k) =>
      arcPoint(0.16 + ((0.93 - 0.16) * k) / (RETRY_GHOST_SAMPLES - 1)),
    ),
  );
}

const REJECT_REACH = 7;
export const REJECT_MARK = (() => {
  const [x, y, r] = [WORKER_X, WORKER_Y[0], REJECT_REACH];
  return `M${x - r} ${y - r} L${x + r} ${y + r} M${x + r} ${y - r} L${x - r} ${y + r}`;
})();

const MOVE_MS = 192;
const ROUTE_MS = 240;
const WORK_MS = 800;
const ABSORB_MS = 128;
const ARC_MS = 448;
const PULSE_MS = 64;
const SETTLE_MS = 256;
const ADVANCE_EVERY_MS = 484;
// The queue keeps its pace until the scene hands off, so the last jobs are still working then.
const ADVANCE_COUNT = Math.floor((SLIDE_MS - ROUTE_MS) / ADVANCE_EVERY_MS) + 1;
const ADVANCES = Array.from({ length: ADVANCE_COUNT }, (_, k) => k * ADVANCE_EVERY_MS);
const HUE_REJECTED = 1;
const HUE_RETURNS = 2;
const HUE_PASSES = 6;
const REJECT_MS = ADVANCES[HUE_RETURNS]!;
const advancesFrom = (from: number, to?: number) =>
  ADVANCES.map((_, advance) => advance).slice(from, to);
const intoWorkerAt = (advance: number) => ADVANCES[advance]! + ROUTE_MS;
const boxOffset = (advance: number) => WORKER_Y[workerOf(advance)] - QUEUE_Y;
const backendsPct = (ms: number) => pct((ms / SLIDE_MS) * 100);

type JobStop = {
  at: number;
  x: number;
  y?: number;
  scale?: number;
  opacity?: number;
  ease?: string;
};

function queued(fromSlot: number, advances: number[], since = 0): JobStop[] {
  const stops: JobStop[] = [{ at: since, x: SLOT_X[fromSlot]! }];
  advances.forEach((advance, k) => {
    const at = ADVANCES[advance]!;
    const to = SLOT_X[fromSlot + k + 1];
    stops.push(
      { at, x: SLOT_X[fromSlot + k]!, ease: INOUT },
      to === undefined
        ? { at: intoWorkerAt(advance), x: WORKER_X, y: boxOffset(advance), scale: ABSORBED_SCALE }
        : { at: at + MOVE_MS, x: to },
    );
  });
  return stops;
}

function joining(advances: number[]): JobStop[] {
  const [first, ...rest] = advances;
  const at = ADVANCES[first!]!;
  return [
    { at: 0, x: SLOT_X[0] - SLOT_GAP, opacity: 0 },
    { at, x: SLOT_X[0] - SLOT_GAP, opacity: 0, ease: INOUT },
    ...queued(0, rest, at + MOVE_MS),
  ];
}

const absorbed = (advance: number): JobStop[] =>
  [intoWorkerAt(advance) + ABSORB_MS, SLIDE_MS].map((at) => ({
    at,
    x: WORKER_X,
    y: boxOffset(advance),
    scale: ABSORBED_SCALE,
    opacity: 0,
  }));

function arcBack(): JobStop[] {
  const steps = 16;
  return Array.from({ length: steps - 1 }, (_, k) => {
    const s = (k + 1) / steps;
    const { x, y } = arcPoint(easeInOut(s));
    return {
      at: REJECT_MS + ARC_MS * s,
      x,
      y: y - QUEUE_Y,
      scale: +Math.min(1, ABSORBED_SCALE + s * 1.35).toFixed(2),
    };
  });
}

const STEPS_TO_WORKER = SLOT_X.length + 1;
const joiner = (advance: number) => {
  const advances = advancesFrom(advance, advance + STEPS_TO_WORKER);
  const done = advance + STEPS_TO_WORKER - 1;
  return {
    top: "solid" as const,
    stops: [...joining(advances), ...(done < ADVANCE_COUNT ? absorbed(done) : [])],
  };
};

export const JOBS: { top: TopInk; stops: JobStop[] }[] = [
  { top: "solid", stops: [...queued(3, advancesFrom(0, 1)), ...absorbed(0)] },
  { top: "solid", stops: [...queued(1, advancesFrom(0, 3)), ...absorbed(2)] },
  { top: "solid", stops: [...queued(0, advancesFrom(0, 4)), ...absorbed(3)] },
  {
    top: "hue",
    stops: [
      ...queued(2, advancesFrom(0, HUE_REJECTED + 1)),
      { at: REJECT_MS, x: WORKER_X, y: boxOffset(HUE_REJECTED), scale: ABSORBED_SCALE },
      ...arcBack(),
      ...queued(0, advancesFrom(HUE_RETURNS + 1, HUE_PASSES + 1), REJECT_MS + ARC_MS),
      ...absorbed(HUE_PASSES),
    ],
  },
  ...advancesFrom(0)
    .filter((advance) => advance !== HUE_RETURNS)
    .map(joiner),
];

// With animation off a job stays where it opens the scene, so the queue still holds work.
export const jobRest = ({ stops }: (typeof JOBS)[number]) => {
  const { x, opacity = 1 } = stops[0]!;
  return vars({ "rest-x": `${x}px`, "rest-opacity": opacity });
};

export const RETRY_WORKER = workerOf(HUE_PASSES);
const REJECTED_AT = intoWorkerAt(HUE_REJECTED);

type Key = { at: number; css: string; ease?: string };

// Work still under way when the scene hands off stops where it is.
const keyframes = (name: string, keys: Key[]) => {
  const kept = keys.filter(({ at }) => at <= SLIDE_MS);
  const last = kept.at(-1)!;
  if (last.at < SLIDE_MS) kept.push({ at: SLIDE_MS, css: last.css });
  const frame = ({ at, css, ease }: Key) =>
    `${backendsPct(at)} { ${css}${ease ? ` animation-timing-function: ${ease};` : ""} }`;
  return `@keyframes ${name} { ${kept.map(frame).join(" ")} }`;
};

const jobKey = ({ at, x, y = 0, scale = 1, opacity = 1, ease }: JobStop): Key => ({
  at,
  css: `opacity: ${opacity}; transform: translate(${+x.toFixed(1)}px, ${+y.toFixed(1)}px) scale(${scale});`,
  ease,
});

function queueKeyframes() {
  const jobs = JOBS.map(({ stops }, k) => keyframes(`hp-job-${k}`, stops.map(jobKey)));
  const rest = "transform: scale(0.72);";
  const busy = "transform: scale(1);";
  const work = (advance: number): Key[] => {
    const at = intoWorkerAt(advance);
    const release = advance === HUE_REJECTED ? at : at + WORK_MS;
    return [
      { at, css: rest, ease: SPRING },
      { at: at + PULSE_MS, css: busy, ease: INOUT },
      ...(advance === HUE_REJECTED ? [] : [{ at: release, css: busy, ease: INOUT }]),
      { at: release + SETTLE_MS, css: rest },
    ];
  };
  const hidden = "opacity: 0;";
  const emit = (advance: number): Key[] => {
    const at = intoWorkerAt(advance) + WORK_MS;
    return [
      { at, css: `${hidden} transform: none;`, ease: OUT },
      { at: at + PULSE_MS / 2, css: "opacity: 1;" },
      { at: at + SETTLE_MS, css: `${hidden} transform: translateX(28px);` },
    ];
  };
  const workers = WORKER_Y.flatMap((_, worker) => {
    const takes = advancesFrom(0).filter((advance) => workerOf(advance) === worker);
    const inkDone = takes.filter((advance) => advance !== HUE_REJECTED && advance !== HUE_PASSES);
    return [
      keyframes(`hp-work-${worker}`, [{ at: 0, css: rest }, ...takes.flatMap(work)]),
      keyframes(`hp-out-${worker}`, [{ at: 0, css: hidden }, ...inkDone.flatMap(emit)]),
    ];
  });
  const x = [
    `0%, ${backendsPct(REJECTED_AT + PULSE_MS / 2)} { opacity: 0; transform: scale(0.3) rotate(-45deg); animation-timing-function: ${SPRING}; }`,
    `${backendsPct(REJECTED_AT + PULSE_MS * 2.5)}, ${backendsPct(REJECT_MS + PULSE_MS)} { opacity: 1; transform: none; }`,
    `${backendsPct(REJECT_MS + PULSE_MS * 4)}, 100% { opacity: 0; transform: none; }`,
  ];
  return [
    ...jobs,
    ...workers,
    keyframes("hp-out-retry", [{ at: 0, css: hidden }, ...emit(HUE_PASSES)]),
    `@keyframes hp-x { ${x.join(" ")} }`,
  ].join("\n");
}

export const KEYFRAMES = [meanderKeyframes(), queueKeyframes()].join("\n");

// A piece turns about its outline's box centre, as moved() does for the shape the morph hands over,
// so it doesn't shift when the scene takes over from the morph.
const pivotOf = (outline: Outline) => {
  const [x, y] = boxCentre(outline);
  return `transform-origin:${x}px ${y}px`;
};

export const settleVars = (
  { outline, dx, dy, r = 0 }: Piece,
  i: number,
  span: number,
  step: number,
) => `${vars({ i, dx: `${dx}px`, dy: `${dy}px`, r: `${r}deg`, span, step })};${pivotOf(outline)}`;

export const TUMBLE_FLOAT_MS = [1500, 1800, 1600, 1700];
export const WORKER_FLOAT_MS = [1500, 1800, 1700] as const;

export const SCENE_LABELS = [
  "Four tumbling shapes settle into one balanced composition",
  "Four quarters arrive one at a time and close into a whole circle",
  "A ball takes the straight line while its ghost walks the long way round",
  "Three workers take turns draining a queue of jobs; one fails, goes back in line, and passes on another worker",
  "Two snapshots side by side; a scan catches the shape that slipped and it snaps into place",
];
