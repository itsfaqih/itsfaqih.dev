import { ABSORBED_SCALE, type Piece, QUEUE_Y, SLOT_GAP, SLOT_X, WORKER_X } from "./hero-pieces";
import {
  easeInOut,
  INOUT,
  OUT,
  pct,
  SCENE_MS,
  SLIDE_MS,
  SPRING,
  type TopInk,
  vars,
} from "./hero-prints.styles";

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
  [WORKER_X, QUEUE_Y],
  [230, 40],
  [90, 40],
  [SLOT_X[0], QUEUE_Y],
] as const;

function arcPoint(t: number) {
  const u = 1 - t;
  const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  const at = (i: 0 | 1) => ARC.reduce((sum, pt, k) => sum + pt[i] * w[k]!, 0);
  return { x: at(0), y: at(1) };
}

const BACKENDS_MS = SLIDE_MS;
const MOVE_MS = 192;
const ABSORB_MS = 128;
const ARC_MS = 448;
const PULSE_MS = 64;
const SETTLE_MS = 256;
const ADVANCE_COUNT = 9;
const ADVANCE_EVERY_MS = (BACKENDS_MS - MOVE_MS - SETTLE_MS) / (ADVANCE_COUNT - 1);
const ADVANCES = Array.from({ length: ADVANCE_COUNT }, (_, k) => k * ADVANCE_EVERY_MS);
const HUE_REJECTED = 1;
const HUE_RETURNS = 2;
const HUE_PASSES = 6;
const REJECT_MS = ADVANCES[HUE_RETURNS]!;
const advancesFrom = (from: number, to?: number) => ADVANCES.slice(from, to);
const intoWorkerAt = (advance: number) => ADVANCES[advance]! + MOVE_MS;
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

function queued(fromSlot: number, steps: number[], since = 0): JobStop[] {
  const stops: JobStop[] = [{ at: since, x: SLOT_X[fromSlot]! }];
  steps.forEach((at, k) => {
    const to = SLOT_X[fromSlot + k + 1] ?? WORKER_X;
    const intoWorker = to === WORKER_X;
    stops.push(
      { at, x: SLOT_X[fromSlot + k]!, ease: INOUT },
      { at: at + MOVE_MS, x: to, scale: intoWorker ? ABSORBED_SCALE : 1 },
    );
  });
  return stops;
}

function joining(steps: number[]): JobStop[] {
  const [first, ...rest] = steps;
  return [
    { at: 0, x: SLOT_X[0] - SLOT_GAP, opacity: 0 },
    { at: first!, x: SLOT_X[0] - SLOT_GAP, opacity: 0, ease: INOUT },
    ...queued(0, rest, first! + MOVE_MS),
  ];
}

const absorbed = (advance: number): JobStop[] =>
  [intoWorkerAt(advance) + ABSORB_MS, BACKENDS_MS].map((at) => ({
    at,
    x: WORKER_X,
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
  const steps = advancesFrom(advance, advance + STEPS_TO_WORKER);
  const done = advance + STEPS_TO_WORKER - 1;
  return {
    top: "solid" as const,
    stops: [...joining(steps), ...(done < ADVANCE_COUNT ? absorbed(done) : [])],
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
      { at: REJECT_MS, x: WORKER_X, scale: ABSORBED_SCALE },
      ...arcBack(),
      ...queued(0, advancesFrom(HUE_RETURNS + 1, HUE_PASSES + 1), REJECT_MS + ARC_MS),
      ...absorbed(HUE_PASSES),
    ],
  },
  ...ADVANCES.map((_, advance) => advance)
    .filter((advance) => advance !== HUE_RETURNS)
    .map(joiner),
];

const WORKER_TAKES = ADVANCES.map((_, advance) => intoWorkerAt(advance));
const HUE_TAKES = [HUE_REJECTED, HUE_PASSES].map(intoWorkerAt);
const INK_DONE = WORKER_TAKES.filter((at) => !HUE_TAKES.includes(at));
const REJECTED_AT = HUE_TAKES[0]!;

function queueKeyframes() {
  const heldToEnd = (stops: JobStop[]) =>
    stops.at(-1)!.at < BACKENDS_MS
      ? [...stops, { ...stops.at(-1)!, at: BACKENDS_MS, ease: undefined }]
      : stops;
  const jobs = JOBS.map(
    ({ stops }, k) => `@keyframes hp-job-${k} { ${heldToEnd(stops).map(jobFrame).join(" ")} }`,
  );
  const work = WORKER_TAKES.flatMap((at) => [
    `${backendsPct(at)} { transform: scale(0.72); animation-timing-function: ${SPRING}; }`,
    `${backendsPct(at + PULSE_MS)} { transform: scale(1); animation-timing-function: ${INOUT}; }`,
    `${backendsPct(at + SETTLE_MS)} { transform: scale(0.72); }`,
  ]);
  const emit = (at: number) => [
    `${backendsPct(at)} { opacity: 0; transform: none; animation-timing-function: ${OUT}; }`,
    `${backendsPct(at + PULSE_MS / 2)} { opacity: 1; }`,
    `${backendsPct(at + SETTLE_MS)} { opacity: 0; transform: translateX(34px); }`,
  ];
  const x = [
    `0%, ${backendsPct(REJECTED_AT + PULSE_MS / 2)} { opacity: 0; transform: scale(0.3) rotate(-45deg); animation-timing-function: ${SPRING}; }`,
    `${backendsPct(REJECTED_AT + PULSE_MS * 2.5)}, ${backendsPct(REJECT_MS + PULSE_MS)} { opacity: 1; transform: none; }`,
    `${backendsPct(REJECT_MS + PULSE_MS * 4)}, 100% { opacity: 0; transform: none; }`,
  ];
  return [
    ...jobs,
    `@keyframes hp-work { 0% { transform: scale(0.72); } ${work.join(" ")} 100% { transform: scale(0.72); } }`,
    `@keyframes hp-out { 0% { opacity: 0; } ${INK_DONE.flatMap(emit).join(" ")} 100% { opacity: 0; } }`,
    `@keyframes hp-out-retry { 0% { opacity: 0; } ${emit(HUE_TAKES[1]!).join(" ")} 100% { opacity: 0; } }`,
    `@keyframes hp-x { ${x.join(" ")} }`,
  ].join("\n");
}

export const KEYFRAMES = [meanderKeyframes(), queueKeyframes()].join("\n");

export const settleVars = ({ dx, dy, r = 0 }: Piece, i: number, span: number, step: number) =>
  vars({ i, dx: `${dx}px`, dy: `${dy}px`, r: `${r}deg`, span, step });

export const settledAt = (i: number, span: number, step: number) => (span + step * i) * SCENE_MS;
export const TUMBLE_FLOAT_MS = [1500, 1800, 1600, 1700];
export const DEV_TOOLS_HIT_AT = 0.3 * SCENE_MS;

export const SCENE_LABELS = [
  "Four tumbling shapes settle into one balanced composition",
  "Four quarters arrive one at a time and close into a whole circle",
  "A ball takes the straight line while its ghost walks the long way round",
  "A worker drains a queue of jobs; one fails, goes back in line, and passes on retry",
  "Two snapshots side by side; a scan catches the shape that slipped and it snaps into place",
];
