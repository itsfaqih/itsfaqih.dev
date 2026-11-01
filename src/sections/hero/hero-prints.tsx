import * as stylex from "@stylexjs/stylex";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  blend,
  circle,
  collapsed,
  dot,
  moved,
  type Outline,
  polygon,
  rect,
  sector,
  toPath,
  traced,
} from "./hero-morph";
import { reducedMotion } from "../../hooks/media-query";
import { palette } from "../../theme.stylex";

type TopInk = "solid" | "hue" | "outline";

function Ink({ p, top = "solid", children }: { p: string; top?: TopInk; children: ReactNode }) {
  return (
    <>
      <g
        transform="translate(5 4)"
        fill={`url(#${p}ht)`}
        {...stylex.props(styles.part, styles.screen)}
      >
        {children}
      </g>
      {top === "solid" && <g {...draw(styles.ink)}>{children}</g>}
      {top === "hue" && <g {...draw(styles.hue, styles.screen)}>{children}</g>}
      {top === "outline" && (
        <g {...draw(styles.inkLine)} strokeWidth={3}>
          {children}
        </g>
      )}
    </>
  );
}

function Paper({ p }: { p: string }) {
  return (
    <defs {...draw()}>
      <pattern
        {...draw()}
        id={`${p}ht`}
        width="5"
        height="5"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(18)"
      >
        <circle {...draw(styles.hue)} cx="2.5" cy="2.5" r="1.75" />
      </pattern>
    </defs>
  );
}

function RegistrationMark({ x, y, style }: { x: number; y: number; style: stylex.StyleXStyles }) {
  return (
    <g {...draw(style)}>
      <circle {...draw(styles.hueLine)} strokeWidth={1.8} cx={x} cy={y} r={8} />
      <path
        {...draw(styles.hueLine)}
        strokeWidth={1.8}
        d={`M${x - 14} ${y} H${x + 14} M${x} ${y - 14} V${y + 14}`}
      />
    </g>
  );
}

const vars = (v: Record<string, string | number>): CSSProperties =>
  Object.fromEntries(Object.entries(v).map(([k, value]) => [`--${k}`, value]));

const pct = (n: number) => `${+n.toFixed(2)}%`;
const SCENE_MS = 3200;
const SCENE_REST_MS = 1000;
export const SLIDE_MS = SCENE_MS + SCENE_REST_MS;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const MEANDER = [
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

const QUEUE_Y = 124;
const SLOT_X = [54, 96, 138, 180] as const;
const SLOT_GAP = SLOT_X[1] - SLOT_X[0];
const WORKER_X = 262;
const ABSORBED_SCALE = 0.55;
const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const INOUT = "cubic-bezier(0.65, 0, 0.35, 1)";
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
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

const JOBS: { top: TopInk; stops: JobStop[] }[] = [
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

const KEYFRAMES = [meanderKeyframes(), queueKeyframes()].join("\n");

type Scene = { label: string; body: (p: string) => ReactNode };

type Piece = { outline: Outline; top: TopInk; dx: number; dy: number; r?: number };

const TUMBLE: Piece[] = [
  { outline: rect(96, 56, 84, 84), top: "solid", dx: -70, dy: -46, r: -38 },
  { outline: rect(64, 150, 200, 16), top: "solid", dx: -40, dy: 44, r: 16 },
  { outline: polygon([226, 150], [266, 150], [246, 112]), top: "outline", dx: 64, dy: -90, r: 70 },
  { outline: circle(212, 68, 34), top: "hue", dx: 80, dy: 58 },
];

const QUARTERS: Piece[] = [
  { outline: sector(160, 100, 70, -90, 0), top: "solid", dx: 70, dy: -56, r: 40 },
  { outline: sector(160, 100, 70, 0, 90), top: "hue", dx: 84, dy: 48, r: -30 },
  { outline: sector(160, 100, 70, 90, 180), top: "solid", dx: -72, dy: 52, r: 50 },
  { outline: sector(160, 100, 70, 180, 270), top: "hue", dx: -84, dy: -50, r: -40 },
];

const QUARTER_TOKENS = [0, 2, 3, 1];

const settleVars = ({ dx, dy, r = 0 }: Piece, i: number, span: number, step: number) =>
  vars({ i, dx: `${dx}px`, dy: `${dy}px`, r: `${r}deg`, span, step });

function Float({ at = 0, ms = 1600, children }: { at?: number; ms?: number; children: ReactNode }) {
  return (
    <g {...draw(styles.float)} style={vars({ "float-at": `${at}ms`, "float-ms": `${ms}ms` })}>
      {children}
    </g>
  );
}

const settledAt = (i: number, span: number, step: number) => (span + step * i) * SCENE_MS;
const TUMBLE_FLOAT_MS = [1500, 1800, 1600, 1700];
const DEV_TOOLS_HIT_AT = 0.3 * SCENE_MS;

const SCENES: Scene[] = [
  {
    label: "Four tumbling shapes settle into one balanced composition",
    body: (p) => (
      <>
        {TUMBLE.map((piece, i) => (
          <Float key={i} at={settledAt(i, 0.5, 1 / 6)} ms={TUMBLE_FLOAT_MS[i]}>
            <g {...draw(styles.settle)} style={settleVars(piece, i, 0.5, 1 / 6)}>
              <Ink p={p} top={piece.top}>
                <path {...draw(styles.token)} data-token={i} d={toPath(piece.outline)} />
              </Ink>
            </g>
          </Float>
        ))}
      </>
    ),
  },
  {
    label: "Four quarters arrive one at a time and close into a whole circle",
    body: (p) => (
      <Float at={settledAt(0, 0.3, 0.18)}>
        {QUARTERS.map((piece, i) => (
          <g key={i} {...draw(styles.settle)} style={settleVars(piece, i, 0.3, 0.18)}>
            <Ink p={p} top={piece.top}>
              <path
                {...draw(styles.token)}
                data-token={QUARTER_TOKENS.indexOf(i)}
                d={toPath(piece.outline)}
              />
            </Ink>
          </g>
        ))}
        <path
          {...draw(styles.inkLine, styles.ring)}
          pathLength={1}
          strokeWidth={3}
          d="M160 14 A86 86 0 1 1 159.99 14"
        />
      </Float>
    ),
  },
  {
    label: "A ball takes the straight line while its ghost walks the long way round",
    body: (p) => (
      <>
        <path
          {...draw(styles.inkLine, styles.ghost)}
          d={`M${MEANDER.map((pt) => pt.join(" ")).join(" L")}`}
        />
        <Float at={DEV_TOOLS_HIT_AT}>
          <Ink p={p} top="hue">
            <polygon
              {...draw(styles.token)}
              data-token={1}
              points="37.8,155.5 277.8,35.5 282.2,44.5 42.2,164.5"
            />
          </Ink>
          <Ink p={p} top="outline">
            <circle {...draw(styles.token)} data-token={3} cx="40" cy="160" r="14" />
          </Ink>
          <Ink p={p} top="outline">
            <rect {...draw(styles.token)} data-token={2} x="264" y="24" width="32" height="32" />
          </Ink>
          <rect
            {...draw(styles.hue, styles.screen, styles.cutHit)}
            x="268"
            y="28"
            width="24"
            height="24"
          />
        </Float>
        <g {...draw(styles.viewBox, styles.cutGhost)}>
          <circle {...draw(styles.inkLine)} strokeWidth={1.6} strokeDasharray="3 3" r="10" />
        </g>
        <Float at={DEV_TOOLS_HIT_AT}>
          <g {...draw(styles.viewBox, styles.cutBall)}>
            <Ink p={p}>
              <circle {...draw(styles.token)} data-token={0} r="10" />
            </Ink>
          </g>
        </Float>
      </>
    ),
  },
  {
    label: "A worker drains a queue of jobs; one fails, goes back in line, and passes on retry",
    body: (p) => (
      <g {...draw()} style={{ "--scene-duration": `${BACKENDS_MS}ms` }}>
        {SLOT_X.map((x) => (
          <rect
            key={x}
            {...draw(styles.inkLine, styles.ghost)}
            x={x - 14}
            y="110"
            width="28"
            height="28"
          />
        ))}
        <path
          {...draw(styles.inkLine, styles.ghost)}
          d="M200 124 H226 M220 118 L226 124 L220 130"
        />
        <path
          {...draw(styles.hueLine, styles.ghost)}
          d="M241 91.9 C197.5 48.9 113.4 50.8 71.1 97.4 M72.1 88.8 L71.1 97.4 L79.5 95.6"
        />
        <Float>
          <Ink p={p} top="outline">
            <rect {...draw(styles.token)} data-token={2} x="230" y="92" width="64" height="64" />
          </Ink>
          <rect
            {...draw(styles.hue, styles.screen, styles.queueWork, styles.token)}
            data-token={3}
            x="246"
            y="108"
            width="32"
            height="32"
          />
          <rect {...draw(styles.ink, styles.queueOut)} x="298" y="119" width="10" height="10" />
          <rect
            {...draw(styles.hue, styles.queueOutRetry)}
            x="298"
            y="119"
            width="10"
            height="10"
          />
        </Float>
        {JOBS.map((job, k) => (
          <g key={k} {...draw(styles.queueJob)} style={{ animationName: `hp-job-${k}` }}>
            <Ink p={p} top={job.top}>
              <circle
                {...draw(k < 2 && styles.token)}
                data-token={k < 2 ? k : undefined}
                cx="0"
                cy={QUEUE_Y}
                r="11"
              />
            </Ink>
          </g>
        ))}
        <Float>
          <path
            {...draw(styles.inkLine, styles.queueReject)}
            strokeWidth={3.5}
            strokeLinecap="round"
            d="M252 114 L272 134 M272 114 L252 134"
          />
        </Float>
        <path {...draw(styles.inkLine)} strokeWidth={3} d="M16 165.5 H304" />
      </g>
    ),
  },
  {
    label:
      "Two snapshots side by side; a scan catches the shape that slipped and it snaps into place",
    body: (p) => {
      const comp = (x0: number, slip: boolean) => {
        const square = (
          <Ink p={p}>
            <rect
              {...draw(styles.token)}
              data-token={slip ? 1 : 0}
              x={x0 + 62}
              y="92"
              width="34"
              height="34"
            />
          </Ink>
        );
        return (
          <Float>
            <Ink p={p} top="hue">
              <circle
                {...draw(styles.token)}
                data-token={slip ? 3 : 2}
                cx={x0 + 40}
                cy="74"
                r="18"
              />
            </Ink>
            {slip ? <g {...draw(styles.snapSlip)}>{square}</g> : square}
            <Ink p={p}>
              <rect {...draw()} x={x0 + 16} y="146" width="92" height="8" />
            </Ink>
            {slip && <RegistrationMark x={267} y={95} style={styles.snapMark} />}
          </Float>
        );
      };
      return (
        <>
          <rect {...draw(styles.inkLine, styles.ghost)} x="20" y="34" width="124" height="132" />
          <rect {...draw(styles.inkLine, styles.ghost)} x="176" y="34" width="124" height="132" />
          {comp(20, false)}
          {comp(176, true)}
          <path {...draw(styles.inkLine)} strokeWidth={3} d="M152 94 H168 M152 104 H168" />
          <path
            {...draw(styles.hueLine, styles.snapNeq)}
            strokeWidth={3}
            strokeLinecap="round"
            d="M165 86 L155 112"
          />
          <rect {...draw(styles.hue, styles.snapScan)} x="20" y="26" width="3" height="148" />
        </>
      );
    },
  },
];

type Token = { outline: Outline; top: TopInk };
type SceneTokens = { enter: Token[]; exit: Token[] };

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

const SCENE_TOKENS: SceneTokens[] = [
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

const TOKEN_COUNT = 4;
const TOPS: TopInk[] = ["solid", "hue", "outline"];
const MORPH_MS = 1100;
const FADE_MS = 180;
const TOKEN_STAGGER_MS = 60;
export const SCENE_LEAD_MS = MORPH_MS - FADE_MS;
const LANDING_T = 0.845;
const landing = (u: number) => easeInOut(u * LANDING_T) / easeInOut(LANDING_T);

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

type Layer = { index: number; run: number };
type Stage = { layers: Layer[]; phase: "still" | "leaving" | "entering" };
type Drawn = { outline: Outline; inks: number[] };

const inksOf = (top: TopInk) => TOPS.map((ink) => (ink === top ? 1 : 0));
const drawnOf = (tokens: Token[]): Drawn[] =>
  tokens.map(({ outline, top }) => ({ outline, inks: inksOf(top) }));
function isShown(drawing: Element, scene: Element) {
  let opacity = 1;
  for (let at: Element | null = drawing; at && at !== scene; at = at.parentElement) {
    opacity *= Number(getComputedStyle(at).opacity);
  }
  return opacity > 0.05;
}

function drawnIn(scene: SVGGElement | undefined, tokens: Token[]): Drawn[] {
  return tokens.map(({ outline, top }, k) => {
    const drawing =
      scene && [...scene.querySelectorAll<SVGGeometryElement>(`[data-token="${k}"]`)].at(-1);
    const toScene = scene?.getCTM();
    const toScreen = drawing?.getCTM();
    if (!drawing || !toScene || !toScreen) return { outline, inks: inksOf(top) };
    const matrix = DOMMatrix.fromMatrix(toScene).inverse().multiply(DOMMatrix.fromMatrix(toScreen));
    const drawn = traced(drawing, matrix);
    return { outline: isShown(drawing, scene) ? drawn : collapsed(drawn), inks: inksOf(top) };
  });
}
const fadeOf = (layer: SVGGElement | undefined) =>
  Number(layer?.style.getPropertyValue("--fade") || 1);
const setFade = (layer: SVGGElement, fade: number) =>
  layer.style.setProperty("--fade", String(fade));

function useSceneMorph(index: number, run: number) {
  const [stage, setStage] = useState<Stage>({ layers: [{ index, run }], phase: "still" });
  const currentStage = useEffectEvent(() => stage);
  const layerRefs = useRef(new Map<string, SVGGElement>());
  const morphRef = useRef<SVGGElement>(null);
  const drawnRef = useRef<Drawn[]>([]);
  const paintRef = useRef(() => {});

  useLayoutEffect(() => paintRef.current(), [stage]);

  useEffect(() => {
    const { layers, phase } = currentStage();
    const scene = layers.at(-1)!;
    if (scene.index === index && scene.run === run) return;
    const next = { index, run };
    const nextKey = layerKey(next);
    if (reducedMotion()) {
      setStage({ layers: [next], phase: "still" });
      return;
    }

    const leaving = layers.map((layer) => ({
      layer,
      from: fadeOf(layerRefs.current.get(layerKey(layer))),
    }));
    const from =
      phase === "leaving"
        ? drawnRef.current
        : drawnIn(layerRefs.current.get(layerKey(scene)), SCENE_TOKENS[scene.index]!.exit);
    const to = drawnOf(SCENE_TOKENS[index]!.enter);

    const startedAt = performance.now();
    let mounted = false;
    let frame = 0;
    const paint = (elapsed: number) => {
      const fadeOut = 1 - clamp01(elapsed / FADE_MS);
      const layer = morphRef.current;
      if (layer) {
        drawnRef.current = from.map((start, k) => {
          const t = landing(
            clamp01((elapsed - k * TOKEN_STAGGER_MS) / (SCENE_LEAD_MS - k * TOKEN_STAGGER_MS)),
          );
          return {
            outline: blend(start.outline, to[k]!.outline, t),
            inks: start.inks.map((ink, i) => ink + (to[k]!.inks[i]! - ink) * t),
          };
        });
        layer.querySelectorAll<SVGGElement>(":scope > g").forEach((group, k) => {
          const { outline, inks } = drawnRef.current[k]!;
          const d = toPath(outline);
          group.querySelectorAll("path").forEach((path) => {
            path.setAttribute("d", d);
            const ink = TOPS.findIndex((top) => top === path.dataset.top);
            if (ink >= 0) path.style.opacity = String(inks[ink]);
          });
        });
      }
      for (const { layer: leavingLayer, from: start } of leaving) {
        const element = layerRefs.current.get(layerKey(leavingLayer));
        if (element) setFade(element, start * fadeOut);
      }
      const entering = layerRefs.current.get(nextKey);
      if (entering && mounted) setFade(entering, clamp01((elapsed - SCENE_LEAD_MS) / FADE_MS));
    };
    const tick = (now: number) => {
      const elapsed = now - startedAt;
      paint(elapsed);
      if (!mounted && elapsed >= SCENE_LEAD_MS) {
        mounted = true;
        setStage({ layers: [next], phase: "entering" });
      }
      if (elapsed < MORPH_MS) {
        frame = requestAnimationFrame(tick);
        return;
      }
      paintRef.current = () => {};
      layerRefs.current.get(nextKey)?.style.removeProperty("--fade");
      setStage({ layers: [next], phase: "still" });
    };
    paintRef.current = () => paint(performance.now() - startedAt);
    setStage({ layers, phase: "leaving" });
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [index, run]);

  const refFor = (layer: Layer) => (element: SVGGElement | null) => {
    if (element) layerRefs.current.set(layerKey(layer), element);
    else layerRefs.current.delete(layerKey(layer));
  };
  return { stage, refFor, morphRef };
}

const layerKey = ({ index, run }: Layer) => `${index}-${run}`;

function MorphTokens({ p }: { p: string }) {
  return (
    <>
      {Array.from({ length: TOKEN_COUNT }, (_, k) => (
        <g key={k} {...draw()}>
          <path
            transform="translate(5 4)"
            fill={`url(#${p}ht)`}
            {...stylex.props(styles.part, styles.screen)}
          />
          {TOPS.map((top) => (
            <path
              key={top}
              data-top={top}
              {...draw(
                ...(top === "solid"
                  ? [styles.ink]
                  : top === "hue"
                    ? [styles.hue, styles.screen]
                    : [styles.inkLine]),
              )}
              strokeWidth={top === "outline" ? 3 : undefined}
            />
          ))}
        </g>
      ))}
    </>
  );
}

const REST_DEG = { x: 4, y: -6 };
const REACH_DEG = { x: 6, y: 10 };
const EASE_PER_FRAME = 0.12;
const restTransform = `rotateX(${REST_DEG.x}deg) rotateY(${REST_DEG.y}deg)`;

function useTiltToCursor() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card || reducedMotion()) return;
    const clamp = (value: number) => Math.min(1, Math.max(-1, value));
    const target = { ...REST_DEG };
    const now = { ...REST_DEG };
    let frame = 0;

    const tick = () => {
      now.x += (target.x - now.x) * EASE_PER_FRAME;
      now.y += (target.y - now.y) * EASE_PER_FRAME;
      card.style.transform = `rotateX(${now.x.toFixed(2)}deg) rotateY(${now.y.toFixed(2)}deg)`;
      const settled = Math.abs(target.x - now.x) < 0.01 && Math.abs(target.y - now.y) < 0.01;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const aim = (x: number, y: number) => {
      target.x = x;
      target.y = y;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = stage.getBoundingClientRect();
      const dx = clamp((event.clientX - (box.left + box.width / 2)) / (innerWidth / 2));
      const dy = clamp((event.clientY - (box.top + box.height / 2)) / (innerHeight / 2));
      aim(REST_DEG.x - dy * REACH_DEG.x, REST_DEG.y + dx * REACH_DEG.y);
    };
    const onLeave = () => aim(REST_DEG.x, REST_DEG.y);

    addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return { stageRef, cardRef };
}

export function HeroPrints({
  index,
  restartKey,
  playing,
  held,
}: {
  index: number;
  restartKey: number;
  playing: boolean;
  held: boolean;
}) {
  const p = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { stageRef, cardRef } = useTiltToCursor();
  const { stage, refFor, morphRef } = useSceneMorph(index, restartKey);
  return (
    <div
      {...stylex.props(styles.root, stylex.defaultMarker())}
      data-paused={playing && !held ? undefined : ""}
    >
      {/* The backends scene's keyframes are worked out from its geometry here, so they ship as a sheet. */}
      <style>{KEYFRAMES}</style>
      <div ref={stageRef} {...stylex.props(styles.stage)}>
        <div ref={cardRef} {...stylex.props(styles.card)} style={{ transform: restTransform }}>
          <svg
            {...stylex.props(styles.svg)}
            viewBox="0 0 320 200"
            role="img"
            aria-label={SCENES[index]!.label}
            style={{ "--scene-duration": `${SCENE_MS}ms` }}
          >
            <Paper p={p} />
            {stage.layers.map((layer) => (
              <g
                key={layerKey(layer)}
                ref={refFor(layer)}
                {...draw(styles.layer, stylex.defaultMarker())}
                data-leaving={stage.phase === "leaving" ? "" : undefined}
              >
                {SCENES[layer.index]!.body(p)}
              </g>
            ))}
            {stage.phase === "leaving" && (
              <g ref={morphRef} {...draw()}>
                <MorphTokens p={p} />
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

// Every shape and group the prints draw: it holds still while the hero is paused or its layer is
// on the way out, and turns about its own box. The halftone copies carry a transform attribute
// instead, so they take the hold alone.
const draw = (...more: (stylex.StyleXStyles | false)[]) =>
  stylex.props(styles.part, styles.box, ...more);

const SCENE = "var(--scene-duration)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const still = (name: string | null) => ({ default: name, [REDUCE]: "none !important" });

const settle = stylex.keyframes({
  "0%": { transform: "translate(var(--dx), var(--dy)) rotate(var(--r,0deg))" },
});
const ring = stylex.keyframes({
  "0%, 64%": { strokeDashoffset: "1px", animationTimingFunction: "var(--inout)" },
  to: { strokeDashoffset: "0" },
});
const ball = stylex.keyframes({
  "0%": { opacity: 0, animationTimingFunction: "var(--inout)", transform: "translate(40px,160px)" },
  "4%": { opacity: 1 },
  "24%, to": { opacity: 1, transform: "translate(280px,40px)" },
});
const hit = stylex.keyframes({
  "0%, 22%": { opacity: 0, animationTimingFunction: "var(--spring)", transform: "scale(.2)" },
  "30%, to": { opacity: 1, transform: "none" },
});
const float = stylex.keyframes({ to: { transform: "translateY(-2px)" } });
const slip = stylex.keyframes({
  "0%, 56%": {
    animationTimingFunction: "var(--spring)",
    transform: "translate(12px,-14px)rotate(16deg)",
  },
  "70%, to": { transform: "none" },
});
const scan = stylex.keyframes({
  "0%": { opacity: 0, animationTimingFunction: "linear", transform: "none" },
  "2%": { opacity: 1 },
  "40%": { opacity: 1, transform: "translate(280px)" },
  "42%, to": { opacity: 0, transform: "translate(280px)" },
});
const notEqual = stylex.keyframes({
  "0%, 62%": { opacity: 1 },
  "68%, to": { opacity: 0 },
});
const mark = stylex.keyframes({
  "0%, 38%": {
    opacity: 0,
    animationTimingFunction: "var(--spring)",
    transform: "scale(.3)rotate(-45deg)",
  },
  "46%, 58%": { opacity: 1, transform: "none" },
  "66%, to": { opacity: 0, transform: "none" },
});

const styles = stylex.create({
  // --hue is registered in arcade.css, so a new slide's colour eases in.
  root: {
    width: "100%",
    maxWidth: "560px",
    "--spring": SPRING,
    "--inout": INOUT,
    "--hue": "var(--c)",
    transitionProperty: "--hue",
    transitionDuration: "600ms",
    transitionTimingFunction: "var(--inout)",
  },
  stage: {
    perspective: "900px",
    padding: "12px 8px 20px",
  },
  card: {
    position: "relative",
    aspectRatio: "16 / 10",
    transformStyle: "preserve-3d",
  },
  svg: {
    position: "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
    overflow: "visible",
  },
  part: {
    animationPlayState: {
      default: null,
      [stylex.when.ancestor(":is([data-paused], [data-leaving])")]: "paused !important",
    },
  },
  box: {
    transformBox: "fill-box",
    transformOrigin: "center",
  },
  viewBox: {
    transformBox: "view-box",
    transformOrigin: "0 0",
  },
  hue: { fill: "var(--hue)" },
  ink: { fill: palette["--text"] },
  hueLine: { stroke: "var(--hue)", fill: "none" },
  inkLine: { stroke: palette["--text"], fill: "none" },
  // Ink in the hue lightens the dark page like a screen print, and darkens the light one.
  screen: { mixBlendMode: { default: "screen", ":is(.light *)": "multiply" } },
  ghost: {
    strokeDasharray: "3 4",
    strokeWidth: "1.4",
    opacity: 0.65,
  },
  // The prints' fades: a layer fades all its ink by --fade, and the shapes the morph picks up stay
  // whole, hidden while the morph carries them.
  layer: {
    fillOpacity: "var(--fade, 1)",
    strokeOpacity: "var(--fade, 1)",
  },
  token: {
    fillOpacity: 1,
    strokeOpacity: 1,
    visibility: { default: null, [stylex.when.ancestor("[data-leaving]")]: "hidden" },
  },
  // Each piece flies in from its own --dx, --dy and --r, one --step after another.
  settle: {
    animationName: still(settle),
    animationDuration: `calc(${SCENE} * var(--span))`,
    animationTimingFunction: "var(--spring)",
    animationDelay: `calc(${SCENE} * var(--step) * var(--i))`,
    animationFillMode: "both",
  },
  ring: {
    strokeDasharray: "1",
    animationName: still(ring),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  cutBall: {
    transform: "translate(280px, 40px)",
    animationName: still(ball),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  cutHit: {
    animationName: still(hit),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  cutGhost: {
    transform: "translate(280px, 40px)",
    animationName: still("hp-ghost"),
    animationDuration: SCENE,
    animationTimingFunction: "linear",
    animationFillMode: "both",
  },
  // Each job names its own keyframes inline.
  queueJob: {
    opacity: 0,
    animationName: still(null),
    animationDuration: SCENE,
    animationTimingFunction: "linear",
    animationFillMode: "both",
  },
  queueWork: {
    transform: "scale(0.72)",
    animationName: still("hp-work"),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  queueOut: {
    opacity: 0,
    animationName: still("hp-out"),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  queueOutRetry: {
    opacity: 0,
    animationName: still("hp-out-retry"),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  queueReject: {
    opacity: 0,
    animationName: still("hp-x"),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  float: {
    animationName: still(float),
    animationDuration: "var(--float-ms)",
    animationTimingFunction: "var(--inout)",
    animationDelay: "var(--float-at)",
    animationIterationCount: "infinite",
    animationDirection: "alternate",
    animationFillMode: "both",
  },
  snapSlip: {
    animationName: still(slip),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  snapScan: {
    opacity: 0,
    animationName: still(scan),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  snapNeq: {
    opacity: 0,
    animationName: still(notEqual),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
  snapMark: {
    opacity: 0,
    animationName: still(mark),
    animationDuration: SCENE,
    animationFillMode: "both",
  },
});
