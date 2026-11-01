import {
  circle,
  dot,
  moved,
  type Outline,
  polygon,
  rect,
  sector,
} from "./hero-morph";
import type { TopInk } from "./hero-prints.styles";

export const QUEUE_Y = 124;
export const SLOT_X = [54, 96, 138, 180] as const;
export const SLOT_GAP = SLOT_X[1] - SLOT_X[0];
export const WORKER_X = 262;
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

export type Token = { outline: Outline; top: TopInk };
export type SceneTokens = { enter: Token[]; exit: Token[] };

const scattered = (pieces: Piece[]) =>
  pieces.map(({ outline, top, dx, dy, r }) => ({ outline: moved(outline, dx, dy, r), top }));
const settled = (pieces: Piece[]) => pieces.map(({ outline, top }) => ({ outline, top }));
const settling = (pieces: Piece[]): SceneTokens => ({
  enter: scattered(pieces),
  exit: settled(pieces),
});

const DEV_TOOLS_TOKENS = (ball: Outline): Token[] => [
  { outline: ball, top: "solid" },
  { outline: polygon([37.8, 155.5], [277.8, 35.5], [282.2, 44.5], [42.2, 164.5]), top: "hue" },
  { outline: rect(264, 24, 32, 32), top: "outline" },
  { outline: circle(40, 160, 14), top: "outline" },
];

const WORKER: Token = { outline: rect(230, 92, 64, 64), top: "outline" };
const WORK: Token = { outline: moved(rect(246, 108, 32, 32), 0, 0, 0, 0.72), top: "hue" };
const SNAPSHOT_CIRCLES: Token[] = [
  { outline: circle(60, 74, 18), top: "hue" },
  { outline: circle(216, 74, 18), top: "hue" },
];
const SNAPSHOT_SQUARE: Token = { outline: rect(82, 92, 34, 34), top: "solid" };
const SLIPPED = { dx: 12, dy: -14, r: 16 };

export const SCENE_TOKENS: SceneTokens[] = [
  settling(TUMBLE),
  settling(QUARTER_TOKENS.map((q) => QUARTERS[q]!)),
  { enter: DEV_TOOLS_TOKENS(dot(40, 160)), exit: DEV_TOOLS_TOKENS(circle(280, 40, 10)) },
  {
    enter: [
      { outline: circle(SLOT_X[3], QUEUE_Y, 11), top: "solid" },
      { outline: circle(SLOT_X[1], QUEUE_Y, 11), top: "solid" },
      WORKER,
      WORK,
    ],
    exit: [
      { outline: dot(WORKER_X, QUEUE_Y), top: "solid" },
      { outline: dot(WORKER_X, QUEUE_Y), top: "solid" },
      WORKER,
      WORK,
    ],
  },
  {
    enter: [
      SNAPSHOT_SQUARE,
      { outline: moved(rect(238, 92, 34, 34), SLIPPED.dx, SLIPPED.dy, SLIPPED.r), top: "solid" },
      ...SNAPSHOT_CIRCLES,
    ],
    exit: [SNAPSHOT_SQUARE, { outline: rect(238, 92, 34, 34), top: "solid" }, ...SNAPSHOT_CIRCLES],
  },
];
