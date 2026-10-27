import { type CSSProperties, type ReactNode, useEffect, useId, useRef } from "react";

/* Hero prints: one Riso-style primitive scene per slide (redesign/hero-variants, DIRECTION.md).
   Every shape is printed in two inks: a misregistered halftone in the slide's hue, then a
   top ink. Scenes loop on --T, which each slide sets so its loops fill the slide. */

type Top = "i" | "h" | "o";

// One primitive in two inks: the hue halftone nudged off register, then the top ink.
function Ink({ p, top = "i", children }: { p: string; top?: Top; children: ReactNode }) {
  return (
    <>
      <g transform="translate(5 4)" fill={`url(#${p}ht)`} className="mis">
        {children}
      </g>
      {top === "i" && <g className="i">{children}</g>}
      {top === "h" && <g className="h mis">{children}</g>}
      {top === "o" && (
        <g className="is" strokeWidth={3}>
          {children}
        </g>
      )}
    </>
  );
}

function Paper({ p }: { p: string }) {
  return (
    <>
      <defs>
        <pattern
          id={`${p}ht`}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(18)"
        >
          <circle className="dot" cx="2.5" cy="2.5" r="1.75" />
        </pattern>
        <pattern id={`${p}gr`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path className="grid" d="M16 0 H0 V16" />
        </pattern>
      </defs>
      <rect width="320" height="200" fill={`url(#${p}gr)`} />
    </>
  );
}

// Registration mark: the printer's proof that two inks line up.
function Reg({ x, y, className }: { x: number; y: number; className: string }) {
  return (
    <g className={className}>
      <circle className="hs" strokeWidth={1.8} cx={x} cy={y} r={8} />
      <path
        className="hs"
        strokeWidth={1.8}
        d={`M${x - 14} ${y} H${x + 14} M${x} ${y - 14} V${y + 14}`}
      />
    </g>
  );
}

const vars = (v: Record<string, string | number>): CSSProperties =>
  Object.fromEntries(Object.entries(v).map(([k, value]) => [`--${k}`, value]));

const pct = (n: number) => `${+n.toFixed(2)}%`;

// The long way round: a meander from the start ring to the target square.
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
    return `${pct((walked / total) * 92)} { opacity: 1; transform: translate(${x}px, ${y}px); }`;
  });
  return `@keyframes hp-ghost { ${stops.join(" ")} 97%, 100% { opacity: 0; transform: translate(280px, 40px); } }`;
}

/* The queue runs ten beats a loop. Slots sit at QX[1..4], the worker at QX[5]. Each job
   steps one slot per beat and enters the worker on its fifth. The hue job is rejected on
   beat 4, rides the retry arc back to slot 1, and passes on beat 9. */
const QX = [-20, 54, 96, 138, 180, 262];
const STEP = 4.5; // a step takes 45% of a 10%-long beat
const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const INOUT = "cubic-bezier(0.65, 0, 0.35, 1)";
const INK_JOBS = [1, 2, 3, 4, 6, 7, 8, 9];
const INK_OUT_BEATS = [0, 1, 2, 3, 5, 6, 7, 8];
// The retry arc, from the worker back over the queue to slot 1 (cy is 124).
const ARC = [
  [262, 124],
  [230, 40],
  [90, 40],
  [54, 124],
] as const;

function arcPoint(t: number) {
  const u = 1 - t;
  const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  const at = (i: 0 | 1) => ARC.reduce((sum, pt, k) => sum + pt[i] * w[k]!, 0);
  return { x: at(0), y: at(1) };
}

// A job's steps from QX[from] on, for a job that leaves the door on beat b. Step j starts
// on beat b + j and carries the job from QX[j] to QX[j + 1]; the last goes into the worker.
function steps(b: number, from: number) {
  const stops: string[] = [];
  for (let j = from; j < 5; j++) {
    const at = (b + j) * 10;
    const into = j === 4 ? " scale(0.55)" : "";
    stops.push(
      `${pct(at)} { opacity: 1; transform: translateX(${QX[j]}px); animation-timing-function: ${j === 4 ? INOUT : OUT}; }`,
    );
    stops.push(`${pct(at + STEP)} { opacity: 1; transform: translateX(${QX[j + 1]}px)${into}; }`);
  }
  return stops;
}

function queueKeyframes() {
  const door = `0% { opacity: 0; transform: translateX(${QX[0]}px); animation-timing-function: ${OUT}; }`;
  const gone = (at: number) =>
    `${pct(at)}, 100% { opacity: 0; transform: translateX(${QX[5]}px) scale(0.55); }`;
  // The hue job's way back: along the arc to slot 1, growing back to full size as it leaves.
  const arc: string[] = [];
  const n = 16;
  for (let k = 1; k < n; k++) {
    const s = k / n;
    const t = s < 0.5 ? 4 * s * s * s : 1 - (-2 * s + 2) ** 3 / 2;
    const { x, y } = arcPoint(t);
    const scale = Math.min(1, 0.55 + s * 1.35);
    arc.push(
      `${pct(45 + 9.5 * s)} { opacity: 1; transform: translate(${x.toFixed(1)}px, ${(y - 124).toFixed(1)}px) scale(${scale.toFixed(2)}); }`,
    );
  }
  const ink = [door, ...steps(0, 0).slice(1), gone(48)];
  const hue = [
    door,
    ...steps(0, 0).slice(1),
    ...arc,
    `54.5% { opacity: 1; transform: translateX(${QX[1]}px); }`,
    ...steps(5, 1),
    gone(97),
  ];
  // A square leaves the worker on each beat that passed a job.
  const out = INK_OUT_BEATS.flatMap((b) => [
    `${pct(b * 10 + 4.4)} { opacity: 0; transform: none; animation-timing-function: ${OUT}; }`,
    `${pct(b * 10 + 5.2)} { opacity: 1; }`,
    `${pct(b * 10 + 10)} { opacity: 0; transform: translateX(34px); }`,
  ]);
  return [
    `@keyframes hp-job { ${ink.join(" ")} }`,
    `@keyframes hp-retry { ${hue.join(" ")} }`,
    `@keyframes hp-out { 0% { opacity: 0; } ${out.join(" ")} 100% { opacity: 0; } }`,
  ].join("\n");
}

const KEYFRAMES = [meanderKeyframes(), queueKeyframes()].join("\n");

type Scene = { label: string; body: (p: string) => ReactNode };

const QUARTERS = [
  ["M160 100 V30 A70 70 0 0 1 230 100 Z", "70px", "-56px", "40deg", "i"],
  ["M160 100 H230 A70 70 0 0 1 160 170 Z", "84px", "48px", "-30deg", "h"],
  ["M160 100 V170 A70 70 0 0 1 90 100 Z", "-72px", "52px", "50deg", "i"],
  ["M160 100 H90 A70 70 0 0 1 160 30 Z", "-84px", "-50px", "-40deg", "h"],
] as const;

const SCENES: Scene[] = [
  {
    // Feel right: four tumbling primitives settle into one balanced composition.
    label: "Four tumbling shapes settle into one balanced composition",
    body: (p) => (
      <>
        <g className="settle" style={vars({ i: 0, dx: "-70px", dy: "-46px", r: "-38deg" })}>
          <Ink p={p}>
            <rect x="96" y="56" width="84" height="84" />
          </Ink>
        </g>
        <g className="settle" style={vars({ i: 1, dx: "-40px", dy: "44px", r: "16deg" })}>
          <Ink p={p}>
            <rect x="64" y="150" width="200" height="16" />
          </Ink>
        </g>
        <g className="settle" style={vars({ i: 2, dx: "64px", dy: "-90px", r: "70deg" })}>
          <Ink p={p} top="o">
            <path d="M226 150 L266 150 L246 112 Z" />
          </Ink>
        </g>
        <g className="settle" style={vars({ i: 3, dx: "80px", dy: "58px" })}>
          <Ink p={p} top="h">
            <circle cx="212" cy="68" r="34" />
          </Ink>
        </g>
      </>
    ),
  },
  {
    // Finish the job: four quarters arrive one at a time and close into a whole disc.
    label: "Four quarters arrive one at a time and close into a whole circle",
    body: (p) => (
      <>
        {QUARTERS.map(([d, dx, dy, r, top], i) => (
          <g key={d} className="settle" style={vars({ i, gap: "240ms", dx, dy, r })}>
            <Ink p={p} top={top}>
              <path d={d} />
            </Ink>
          </g>
        ))}
        <path
          className="is ring"
          pathLength={1}
          strokeWidth={3}
          d="M160 14 A86 86 0 1 1 159.99 14"
        />
      </>
    ),
  },
  {
    // Save hours: the ghost walks the long way; the ink takes the straight line.
    label: "A ball takes the straight line while its ghost walks the long way round",
    body: (p) => (
      <>
        <path className="is ghost" d={`M${MEANDER.map((pt) => pt.join(" ")).join(" L")}`} />
        <Ink p={p} top="h">
          <polygon points="37.8,155.5 277.8,35.5 282.2,44.5 42.2,164.5" />
        </Ink>
        <Ink p={p} top="o">
          <circle cx="40" cy="160" r="14" />
        </Ink>
        <Ink p={p} top="o">
          <rect x="264" y="24" width="32" height="32" />
        </Ink>
        <rect className="h mis cut-hit" x="268" y="28" width="24" height="24" />
        <g className="vb cut-ghost">
          <circle className="is" strokeWidth={1.6} strokeDasharray="3 3" r="10" />
        </g>
        <g className="vb cut-ball">
          <Ink p={p}>
            <circle r="10" />
          </Ink>
        </g>
      </>
    ),
  },
  {
    // Run reliably: jobs step through the queue; one fails, loops back, and passes on retry.
    label: "Jobs step through a queue; one fails, loops back, and passes on retry",
    body: (p) => (
      <>
        {QX.slice(1, 5).map((x) => (
          <rect key={x} className="is ghost" x={x - 14} y="110" width="28" height="28" />
        ))}
        <path className="is ghost" d="M200 124 H226 M220 118 L226 124 L220 130" />
        <path
          className="hs ghost"
          d="M241 91.9 C197.5 48.9 113.4 50.8 71.1 97.4 M72.1 88.8 L71.1 97.4 L79.5 95.6"
        />
        <Ink p={p} top="o">
          <rect x="230" y="92" width="64" height="64" />
        </Ink>
        <rect className="h mis q-work" x="246" y="108" width="32" height="32" />
        <rect className="i q-out" x="298" y="119" width="10" height="10" />
        <rect className="h q-out-retry" x="298" y="119" width="10" height="10" />
        {INK_JOBS.map((b, k) => (
          <g
            key={b}
            className="q-job"
            style={vars({ b, x: `${[-40, -40, -40, -40, -40, 180, 138, 96][k]}px` })}
          >
            <Ink p={p}>
              <circle cx="0" cy="124" r="11" />
            </Ink>
          </g>
        ))}
        <g className="q-retry">
          <Ink p={p} top="h">
            <circle cx="0" cy="124" r="11" />
          </Ink>
        </g>
        <path
          className="is q-x"
          strokeWidth={3.5}
          strokeLinecap="round"
          d="M252 114 L272 134 M272 114 L252 134"
        />
        <path className="is" strokeWidth={3} d="M16 165.5 H304" />
      </>
    ),
  },
  {
    // Can trust: the scan finds the shape that slipped from the snapshot, and it snaps back.
    label: "Two snapshots side by side; a scan catches the shape that slipped and it snaps back",
    body: (p) => {
      const comp = (x0: number, slip: boolean) => {
        const square = (
          <Ink p={p}>
            <rect x={x0 + 62} y="92" width="34" height="34" />
          </Ink>
        );
        return (
          <>
            <Ink p={p} top="h">
              <circle cx={x0 + 40} cy="74" r="18" />
            </Ink>
            {slip ? <g className="snap-slip">{square}</g> : square}
            <Ink p={p}>
              <rect x={x0 + 16} y="146" width="92" height="8" />
            </Ink>
          </>
        );
      };
      return (
        <>
          <rect className="is ghost" x="20" y="34" width="124" height="132" />
          <rect className="is ghost" x="176" y="34" width="124" height="132" />
          {comp(20, false)}
          {comp(176, true)}
          <path className="is" strokeWidth={3} d="M152 94 H168 M152 104 H168" />
          <path
            className="hs snap-neq"
            strokeWidth={3}
            strokeLinecap="round"
            d="M165 86 L155 112"
          />
          <rect className="h snap-scan" x="20" y="26" width="3" height="148" />
          <Reg x={267} y={95} className="snap-reg" />
        </>
      );
    },
  },
];

// Tilt in degrees: the card turns a little to the left, and the cursor turns it further.
const REST = { x: 4, y: -6 };
const REACH = { x: 6, y: 10 };
const restTransform = `rotateX(${REST.x}deg) rotateY(${REST.y}deg)`;

// Turn the card toward the cursor, closing 12% of the gap each frame.
function useTiltToCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const clamp = (value: number) => Math.min(1, Math.max(-1, value));
    const target = { ...REST };
    const now = { ...REST };
    let frame = 0;

    const tick = () => {
      now.x += (target.x - now.x) * 0.12;
      now.y += (target.y - now.y) * 0.12;
      node.style.transform = `rotateX(${now.x.toFixed(2)}deg) rotateY(${now.y.toFixed(2)}deg)`;
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
      // Measured on the flat stage, not the turning card, so the edges never slip.
      const box = (node.parentElement ?? node).getBoundingClientRect();
      const dx = clamp((event.clientX - (box.left + box.width / 2)) / (innerWidth / 2));
      const dy = clamp((event.clientY - (box.top + box.height / 2)) / (innerHeight / 2));
      aim(REST.x - dy * REACH.x, REST.y + dx * REACH.y);
    };
    const onLeave = () => aim(REST.x, REST.y);

    addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return ref;
}

export function HeroPrints({
  index,
  run,
  playing,
  ms,
  loops,
}: {
  index: number;
  /** Bumps when a slide restarts, so its scene plays from the top. */
  run: number;
  /** Play the scene. Otherwise it holds its first frame. */
  playing: boolean;
  /** The slide's length. */
  ms: number;
  /** Whole loops of the scene that fill the slide. */
  loops: number;
}) {
  const p = useId().replace(/[^a-zA-Z0-9]/g, "");
  const cardRef = useTiltToCursor();
  const scene = SCENES[index]!;
  return (
    <div className="hp" data-play={playing ? "" : undefined}>
      <style>{KEYFRAMES}</style>
      <div className="hp-stage">
        <div ref={cardRef} className="hp-card" style={{ transform: restTransform }}>
          <div className="hp-drop" />
          <div className="hp-paper" />
          <svg
            key={`${index}-${run}`}
            viewBox="0 0 320 200"
            role="img"
            aria-label={scene.label}
            style={{ "--T": `${ms / loops}ms` }}
          >
            <Paper p={p} />
            {scene.body(p)}
          </svg>
        </div>
      </div>
    </div>
  );
}
