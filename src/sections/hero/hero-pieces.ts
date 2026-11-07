import {
  circle,
  dot,
  type Frame,
  moved,
  movedFrame,
  type Outline,
  polygon,
  rect,
  sector,
  shifted,
} from "./hero-morph";
import type { TopInk } from "./hero-prints.view";

export const WORKER_Y = [55, 103, 151] as const;
export const QUEUE_Y = WORKER_Y[1];
export const SLOT_X = [44, 86, 128, 170] as const;
export const SLOT_GAP = SLOT_X[1] - SLOT_X[0];
export const WORKER_X = 260;
export const WORKER_SIZE = 40;
export const WORKER_TOKENS = [0, 1, 3] as const;
// It starts at the bottom box so the job that fails (advance 1) lands on the top box, whose way back
// to the queue is clear.
const ROTATION = [2, 0, 1] as const;
export const workerOf = (advance: number) => ROTATION[advance % ROTATION.length]!;
export const ABSORBED_SCALE = 0.55;

export type Piece = { outline: Outline; top: TopInk; dx: number; dy: number; r?: number };

export const TUMBLE: Piece[] = [
  { outline: rect(96, 56, 84, 84), top: "solid", dx: -70, dy: -46, r: -38 },
  { outline: rect(64, 150, 200, 16), top: "solid", dx: -40, dy: 44, r: 16 },
  { outline: polygon([226, 150], [266, 150], [246, 112]), top: "outline", dx: 64, dy: -90, r: 70 },
  { outline: circle(212, 68, 34), top: "hue", dx: 80, dy: 58 },
];

export const QUARTERS: Piece[] = [
  { outline: sector(160, 100, 70, -90, 0), top: "solid", dx: 70, dy: -56, r: 40 },
  { outline: sector(160, 100, 70, 0, 90), top: "hue", dx: 84, dy: 48, r: -30 },
  { outline: sector(160, 100, 70, 90, 180), top: "solid", dx: -72, dy: 52, r: 50 },
  { outline: sector(160, 100, 70, 180, 270), top: "hue", dx: -84, dy: -50, r: -40 },
];

export const QUARTER_TOKENS = [0, 2, 3, 1];

// `frame` is what the scene draws the token's print in when it opens, unmoved unless stated.
export type Token = { outline: Outline; top: TopInk; frame?: Frame };
type SceneTokens = { enter: Token[]; exit: Token[] };

const scattered = (pieces: Piece[]) =>
  pieces.map(({ outline, top, dx, dy, r }) => ({
    outline: moved(outline, dx, dy, r),
    top,
    frame: movedFrame(outline, dx, dy, r),
  }));
const settled = (pieces: Piece[]) => pieces.map(({ outline, top }) => ({ outline, top }));
const settling = (pieces: Piece[]): SceneTokens => ({
  enter: scattered(pieces),
  exit: settled(pieces),
});

const devToolsTokens = (ball: Outline, ballFrame: Frame): Token[] => [
  { outline: ball, top: "solid", frame: ballFrame },
  { outline: polygon([37.8, 155.5], [277.8, 35.5], [282.2, 44.5], [42.2, 164.5]), top: "hue" },
  { outline: rect(264, 24, 32, 32), top: "outline" },
  { outline: circle(40, 160, 14), top: "outline" },
];

const workerBox = (y: number): Token => ({
  outline: rect(WORKER_X - WORKER_SIZE / 2, y - WORKER_SIZE / 2, WORKER_SIZE, WORKER_SIZE),
  top: "outline",
});
// In this order the morph travels least, from the scene before and into the one after.
const queueTokens = (job: Token): Token[] => [
  workerBox(WORKER_Y[0]),
  workerBox(WORKER_Y[1]),
  job,
  workerBox(WORKER_Y[2]),
];
const SNAPSHOT_CIRCLES: Token[] = [
  { outline: circle(60, 74, 18), top: "hue" },
  { outline: circle(216, 74, 18), top: "hue" },
];
const SNAPSHOT_SQUARE: Token = { outline: rect(82, 92, 34, 34), top: "solid" };
const SLIPPED = { dx: 12, dy: -14, r: 16 };
const SLIPPED_SQUARE = rect(238, 92, 34, 34);

export const SCENE_TOKENS: SceneTokens[] = [
  settling(TUMBLE),
  settling(QUARTER_TOKENS.map((q) => QUARTERS[q]!)),
  {
    enter: devToolsTokens(dot(40, 160), shifted(40, 160)),
    exit: devToolsTokens(circle(280, 40, 10), shifted(280, 40)),
  },
  {
    enter: queueTokens({
      outline: circle(SLOT_X[3], QUEUE_Y, 11),
      top: "solid",
      frame: shifted(SLOT_X[3]),
    }),
    exit: queueTokens({ outline: dot(WORKER_X, QUEUE_Y), top: "solid" }),
  },
  {
    enter: [
      SNAPSHOT_SQUARE,
      {
        outline: moved(SLIPPED_SQUARE, SLIPPED.dx, SLIPPED.dy, SLIPPED.r),
        top: "solid",
        frame: movedFrame(SLIPPED_SQUARE, SLIPPED.dx, SLIPPED.dy, SLIPPED.r),
      },
      ...SNAPSHOT_CIRCLES,
    ],
    exit: [SNAPSHOT_SQUARE, { outline: SLIPPED_SQUARE, top: "solid" }, ...SNAPSHOT_CIRCLES],
  },
];
