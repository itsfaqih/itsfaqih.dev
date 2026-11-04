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
import { easeInOut, OUT, pct, SCENE_MS, SLIDE_MS, type TopInk, vars } from "./hero-prints.view";
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

type Point = { x: number; y: number };

const ARROW_BARB = 6;

function arrowed(line: Point[]) {
  const tip = line.at(-1)!;
  const before = line.at(-2)!;
  const heading = Math.atan2(tip.y - before.y, tip.x - before.x);
  const barb = (turn: number) => ({
    x: tip.x - ARROW_BARB * Math.cos(heading + turn),
    y: tip.y - ARROW_BARB * Math.sin(heading + turn),
  });
  const path = (pts: Point[]) =>
    `M${pts.map(({ x, y }) => `${+x.toFixed(1)} ${+y.toFixed(1)}`).join(" L")}`;
  return `${path(line)} ${path([barb(-Math.PI / 4), tip, barb(Math.PI / 4)])}`;
}

export function routeGhost(boxY: number) {
  const on = (x: number) => ({
    x,
    y: QUEUE_Y + ((boxY - QUEUE_Y) * (x - SLOT_X[3])) / (WORKER_X - SLOT_X[3]),
  });
  return arrowed([on(SLOT_X[3] + 16), on(WORKER_X - WORKER_SIZE / 2 - 3)]);
}

const RETRY_GHOST_SAMPLES = 24;
export const RETRY_GHOST = arrowed(
  Array.from({ length: RETRY_GHOST_SAMPLES }, (_, k) =>
    arcPoint(0.16 + ((0.93 - 0.16) * k) / (RETRY_GHOST_SAMPLES - 1)),
  ),
);

const REJECT_REACH = 7;
export const REJECT_MARK = (() => {
  const [x, y, r] = [WORKER_X, WORKER_Y[0], REJECT_REACH];
  return `M${x - r} ${y - r} L${x + r} ${y + r} M${x + r} ${y - r} L${x - r} ${y + r}`;
})();

const BACKENDS_MS = SLIDE_MS;
const MOVE_MS = 192;
const ROUTE_MS = 240;
const WORK_MS = 800;
const ABSORB_MS = 128;
const ARC_MS = 448;
const PULSE_MS = 64;
const SETTLE_MS = 256;
const ADVANCE_COUNT = 7;
const ADVANCE_EVERY_MS = (BACKENDS_MS - ROUTE_MS - WORK_MS - SETTLE_MS) / (ADVANCE_COUNT - 1);
const ADVANCES = Array.from({ length: ADVANCE_COUNT }, (_, k) => k * ADVANCE_EVERY_MS);
const HUE_REJECTED = 1;
const HUE_RETURNS = 2;
const HUE_PASSES = 6;
const REJECT_MS = ADVANCES[HUE_RETURNS]!;
const advancesFrom = (from: number, to?: number) =>
  ADVANCES.map((_, advance) => advance).slice(from, to);
const intoWorkerAt = (advance: number) => ADVANCES[advance]! + ROUTE_MS;
const boxOffset = (advance: number) => WORKER_Y[workerOf(advance)] - QUEUE_Y;
const backendsPct = (ms: number) => pct((ms / BACKENDS_MS) * 100);

type JobStop = {
  at: number;
  x: number;
  y?: number;
  scale?: number;
  opacity?: number;
  ease?: string;
};

const jobFrame = ({ at, x, y = 0, scale = 1, opacity = 1, ease }: JobStop) =>
  `${backendsPct(at)} { opacity: ${opacity}; transform: translate(${+x.toFixed(1)}px, ${+y.toFixed(1)}px) scale(${scale});${ease ? ` animation-timing-function: ${ease};` : ""} }`;

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
  [intoWorkerAt(advance) + ABSORB_MS, BACKENDS_MS].map((at) => ({
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

export const RETRY_WORKER = workerOf(HUE_PASSES);
const REJECTED_AT = intoWorkerAt(HUE_REJECTED);

function queueKeyframes() {
  const heldToEnd = (stops: JobStop[]) =>
    stops.at(-1)!.at < BACKENDS_MS
      ? [...stops, { ...stops.at(-1)!, at: BACKENDS_MS, ease: undefined }]
      : stops;
  const jobs = JOBS.map(
    ({ stops }, k) => `@keyframes hp-job-${k} { ${heldToEnd(stops).map(jobFrame).join(" ")} }`,
  );
  const work = (advance: number) => {
    const at = intoWorkerAt(advance);
    const release = advance === HUE_REJECTED ? at : at + WORK_MS;
    return [
      `${backendsPct(at)} { transform: scale(0.72); animation-timing-function: ${SPRING}; }`,
      `${backendsPct(at + PULSE_MS)} { transform: scale(1); animation-timing-function: ${INOUT}; }`,
      ...(advance === HUE_REJECTED
        ? []
        : [
            `${backendsPct(release)} { transform: scale(1); animation-timing-function: ${INOUT}; }`,
          ]),
      `${backendsPct(release + SETTLE_MS)} { transform: scale(0.72); }`,
    ];
  };
  const emit = (advance: number) => {
    const at = intoWorkerAt(advance) + WORK_MS;
    return [
      `${backendsPct(at)} { opacity: 0; transform: none; animation-timing-function: ${OUT}; }`,
      `${backendsPct(at + PULSE_MS / 2)} { opacity: 1; }`,
      `${backendsPct(at + SETTLE_MS)} { opacity: 0; transform: translateX(28px); }`,
    ];
  };
  const workers = WORKER_Y.flatMap((_, worker) => {
    const takes = advancesFrom(0).filter((advance) => workerOf(advance) === worker);
    const inkDone = takes.filter((advance) => advance !== HUE_REJECTED && advance !== HUE_PASSES);
    return [
      `@keyframes hp-work-${worker} { 0% { transform: scale(0.72); } ${takes.flatMap(work).join(" ")} 100% { transform: scale(0.72); } }`,
      `@keyframes hp-out-${worker} { 0% { opacity: 0; } ${inkDone.flatMap(emit).join(" ")} 100% { opacity: 0; } }`,
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
    `@keyframes hp-out-retry { 0% { opacity: 0; } ${emit(HUE_PASSES).join(" ")} 100% { opacity: 0; } }`,
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

export const settledAt = (i: number, span: number, step: number) => (span + step * i) * SCENE_MS;
export const TUMBLE_FLOAT_MS = [1500, 1800, 1600, 1700];
export const WORKER_FLOAT_MS = [1500, 1800, 1700] as const;

export const SCENE_LABELS = [
  "Four tumbling shapes settle into one balanced composition",
  "Four quarters arrive one at a time and close into a whole circle",
  "A ball takes the straight line while its ghost walks the long way round",
  "Three workers take turns draining a queue of jobs; one fails, goes back in line, and passes on another worker",
  "Two snapshots side by side; a scan catches the shape that slipped and it snaps into place",
];
