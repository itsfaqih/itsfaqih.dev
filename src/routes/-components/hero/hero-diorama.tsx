import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

// The hero's dioramas: one small 3D scene per headline, built from CSS boxes standing on the
// Rule of Thumb thumbnail screen. Bit, a keycap with a face, hops onto the key each headline
// is about and presses it. See DIRECTION.md beside this file.
//
// Scenes are authored in milliseconds against their slide's length and compiled to one
// keyframe track per moving part, so a scene plays once over its slide. Every part's resting
// style is its last frame: a finished run, a scene that has not started and reduced motion
// all show the same picture.

// The plate is designed on a 560 × 350 grid; one unit is --u (see hero-diorama.css).
const u = (n: number) => `calc(${n} * var(--u))`;

const MOVE = "cubic-bezier(0.645, 0.045, 0.355, 1)";
const RISE = "cubic-bezier(0.23, 1, 0.32, 1)";
// A hop falls back under gravity, so its second half accelerates.
const FALL = "cubic-bezier(0.5, 0, 0.75, 0)";
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const HOP_MS = 420;
const RELEASE_MS = 260;
const PRESS_MS = 15;
const RISE_MS = 420;

type Stop = { t: number; v: string; ease?: string };
type Pose = { x: number; y: number; z: number };
type Hop = { atMs: number; to: Pose; press?: number; low?: boolean };

const lift = (z: number) => `transform: translateZ(${u(z)})`;
const place = (x: number, y: number) => `transform: translate(${u(x)}, ${u(y)})`;

// One scene's keyframe tracks, timed in ms and written as fractions of the slide.
class Tracks {
  readonly css: string[] = [];

  constructor(
    private readonly id: string,
    private readonly slideMs: number,
  ) {}

  f(ms: number) {
    return Math.min(1, ms / this.slideMs);
  }

  add(name: string, stops: Stop[]) {
    const full = `dio-${this.id}-${name}`;
    let last = -1;
    const frames = [...stops]
      .sort((a, b) => a.t - b.t)
      .map((stop) => {
        // Two stops on one percentage would collapse into one; nudge the later one.
        const t = Math.min(1, Math.max(stop.t, last + 0.0001));
        last = t;
        const ease = stop.ease ? `;animation-timing-function:${stop.ease}` : "";
        return `${(t * 100).toFixed(3)}%{${stop.v}${ease}}`;
      });
    this.css.push(`@keyframes ${full}{${frames.join("")}}`);
    return full;
  }

  // A key that drops in 15ms when struck and springs back past rest.
  press(name: string, atMs: number[], depth: number) {
    const stops: Stop[] = [{ t: 0, v: lift(0) }];
    for (const ms of atMs) {
      stops.push(
        { t: this.f(ms - PRESS_MS), v: lift(0) },
        { t: this.f(ms), v: lift(-depth), ease: SPRING },
        { t: this.f(ms + RELEASE_MS), v: lift(0) },
      );
    }
    stops.push({ t: 1, v: lift(0) });
    return this.add(name, stops);
  }

  // A block that waits under the plate and pops up through it.
  rise(name: string, atMs: number, height: number) {
    return this.add(name, [
      { t: 0, v: lift(-height - 4) },
      { t: this.f(atMs), v: lift(-height - 4), ease: SPRING },
      { t: this.f(atMs + RISE_MS), v: lift(0) },
      { t: 1, v: lift(0) },
    ]);
  }

  // A block that drops through the plate and stays under it.
  sink(name: string, atMs: number, depth: number) {
    return this.add(name, [
      { t: 0, v: lift(0) },
      { t: this.f(atMs), v: lift(0), ease: MOVE },
      { t: this.f(atMs + 300), v: lift(-depth) },
      { t: 1, v: lift(-depth) },
    ]);
  }

  slide(name: string, atMs: number, ms: number, dx: number) {
    return this.add(name, [
      { t: 0, v: place(0, 0) },
      { t: this.f(atMs), v: place(0, 0), ease: MOVE },
      { t: this.f(atMs + ms), v: place(dx, 0) },
      { t: 1, v: place(dx, 0) },
    ]);
  }

  // Beat styles for parts that appear at a moment, or show only between two.
  at(ms: number): CSSProperties {
    return { "--at": this.f(ms) };
  }

  between(from: number, to: number): CSSProperties {
    return { "--at": this.f(from), "--to": this.f(to) };
  }
}

// A moving part: a full-plate layer that carries its children along a keyframe track.
// `rest` is the track's last frame, shown whenever the track is not playing.
function Move({
  track,
  rest = "none",
  origin,
  children,
}: {
  track: string;
  rest?: string;
  origin?: string;
  children: ReactNode;
}) {
  const style: CSSProperties = { "--anim": track, "--rest": rest };
  if (origin) style.transformOrigin = origin;
  return (
    <div className="mv" style={style}>
      {children}
    </div>
  );
}

type Tone = "plain" | "hue" | "ink" | "glass";

// A block: a top face and three visible skirts, standing on the plate at height z.
function Box({
  x,
  y,
  w,
  h,
  d,
  z = 0,
  tone = "plain",
  className,
  front,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  d: number;
  z?: number;
  tone?: Tone;
  className?: string;
  front?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      className={["box", tone, className].filter(Boolean).join(" ")}
      style={{ "--x": x, "--y": y, "--w": w, "--h": h, "--d": d, "--z": z }}
    >
      <i className="sk s">{front}</i>
      <i className="sk e" />
      <i className="sk w" />
      <div className="top">{children}</div>
    </div>
  );
}

// Text or marks laid flat on the plate or on a top face, at a unit position.
function Flat({
  x,
  y,
  className,
  style,
  children,
}: {
  x: number;
  y: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <span className={className ? `flat ${className}` : "flat"} style={{ ...style, left: u(x), top: u(y) }}>
      {children}
    </span>
  );
}

// Words that resolve one after another, 60ms apart.
function stream(t: Tracks, text: string, fromMs: number) {
  return text.split(" ").map((word, index) => (
    <span key={index} className="word in" style={t.at(fromMs + index * 60)}>
      {`${word} `}
    </span>
  ));
}

// Bit: a 30-unit keycap with two slit eyes, in the slide's hue. It hops along a path and
// pushes down whatever it lands on by `press`. Built eagerly, so its tracks land in the
// scene's keyframes.
function bit(t: Tracks, start: Pose, hops: Hop[]) {
  const xy: Stop[] = [{ t: 0, v: place(start.x, start.y) }];
  const z: Stop[] = [{ t: 0, v: lift(start.z) }];
  let from = start;
  for (const hop of hops) {
    const { to, atMs } = hop;
    const peak = Math.max(from.z, to.z) + (hop.low ? 12 : 36);
    const land = atMs + HOP_MS;
    const press = hop.press ?? 0;
    xy.push({ t: t.f(atMs), v: place(from.x, from.y), ease: MOVE }, { t: t.f(land), v: place(to.x, to.y) });
    z.push(
      { t: t.f(atMs), v: lift(from.z), ease: RISE },
      { t: t.f(atMs + HOP_MS / 2), v: lift(peak), ease: FALL },
      {
        t: t.f(land),
        v: `transform: translateZ(${u(to.z - press)}) scale3d(1.12, 1.12, 0.72)`,
        ease: SPRING,
      },
      { t: t.f(land + RELEASE_MS), v: lift(to.z) },
    );
    from = to;
  }
  xy.push({ t: 1, v: place(from.x, from.y) });
  z.push({ t: 1, v: lift(from.z) });
  return (
    <Move track={t.add("bit-xy", xy)} rest={`translate(${u(from.x)}, ${u(from.y)})`}>
      <i className="bit-shadow" />
      <Move track={t.add("bit-z", z)} rest={`translateZ(${u(from.z)})`} origin={`${u(15)} ${u(15)}`}>
        <Box x={0} y={0} w={30} h={30} d={30} tone="hue" className="bit">
          <i className="eye l" />
          <i className="eye r" />
        </Box>
      </Move>
    </Move>
  );
}

// The beat chip from the rule thumbnails: one label per beat, the last one at rest.
function chip(t: Tracks, beats: [string, number][]) {
  return (
    <span className="chip">
      {beats.map(([label, ms], index) => {
        const next = beats[index + 1]?.[1];
        return next === undefined ? (
          <b key={label} className="in" style={t.at(ms)}>
            {label}
          </b>
        ) : (
          <b key={label} className="win" style={t.between(ms, next)}>
            {label}
          </b>
        );
      })}
    </span>
  );
}

type Scene = { label: string; body: ReactNode };

// Interfaces that behave: flip a toggle, press Save, get a toast.
function interfaces(t: Tracks): Scene {
  const flipMs = 1500;
  const saveHop = 2600;
  const saveLand = saveHop + HOP_MS;
  const toastMs = saveLand + 300;
  return {
    label: "A settings panel. A little key character flips the dark mode toggle, presses Save, and a Saved toast pops up.",
    body: (
      <>
        <Box x={40} y={64} w={316} h={232} d={6}>
          <Flat x={18} y={14} className="dim">
            settings
          </Flat>
          <Flat x={18} y={48} className="lg">
            Dark mode
          </Flat>
          <Flat x={18} y={72} className="dim">
            Follows your system
          </Flat>
          <Flat x={18} y={110} className="lg">
            Digest
          </Flat>
          <Flat x={18} y={134} className="dim">
            Weekly, Mondays
          </Flat>
        </Box>
        <Box x={268} y={104} w={64} h={32} d={4} z={6} className="track">
          <i className="lit in" style={t.at(flipMs + 120)} />
        </Box>
        <Move track={t.slide("knob", flipMs, 260, 32)} rest={`translate(${u(32)}, 0)`}>
          <Box x={271} y={107} w={26} h={26} d={10} z={6} className="knob" />
        </Move>
        <Move track={t.press("save", [saveLand], 6)}>
          <Box x={196} y={220} w={136} h={48} d={14} z={6} tone="hue">
            <span className="key">Save</span>
          </Box>
        </Move>
        <Move track={t.rise("toast", toastMs, 12)}>
          <Box x={376} y={234} w={152} h={56} d={12}>
            <Flat x={14} y={12} className="lg">
              <b className="ink">✓</b> Saved
            </Flat>
            <Flat x={14} y={34} className="dim">
              just now
            </Flat>
          </Box>
        </Move>
        {bit(t, { x: 440, y: 128, z: 0 }, [
          { atMs: 700, to: { x: 269, y: 105, z: 16 } },
          { atMs: flipMs - 160, to: { x: 301, y: 105, z: 16 }, low: true },
          { atMs: saveHop, to: { x: 249, y: 229, z: 20 }, press: 6 },
          { atMs: toastMs + 500, to: { x: 340, y: 300, z: 0 } },
        ])}
        {chip(t, [
          ["TOGGLE", 0],
          ["SAVE", saveHop],
          ["SAVED", toastMs],
        ])}
      </>
    ),
  };
}

// Agentic setups that work: the agent reads, edits and tests, then a PR is ready.
function agents(t: Tracks): Scene {
  const hops = [900, 2200, 3500];
  const lands = hops.map((ms) => ms + HOP_MS);
  const prMs = 4900;
  const files = ["cart.spec.ts", "cart.ts", "vp test"];
  const log = [
    { verb: "read", what: "cart.spec.ts" },
    { verb: "edit", what: "cart.ts +4 −2" },
    { verb: "run", what: "vp test · 48 passed" },
  ];
  const status = ["reading…", "editing…", "testing…"];
  return {
    label: "An agent at work. A little key character hops across three files as the agent reads, edits and tests, then a pull request card rises.",
    body: (
      <>
        <Box x={32} y={64} w={258} h={254} d={6} tone="ink">
          <Flat x={18} y={14} className="dim">
            agent
          </Flat>
          <Flat x={18} y={40} className="ink">
            {stream(t, "› fix the flaky checkout test", 200)}
          </Flat>
          {log.map((line, index) => (
            <Flat key={line.verb} x={18} y={80 + index * 26}>
              <span className="dim word in" style={t.at(lands[index]!)}>
                {`${line.verb} `}
              </span>
              {stream(t, line.what, lands[index]! + 120)}
            </Flat>
          ))}
          {status.map((text, index) => (
            <Flat key={text} x={18} y={218} className="dim win swap" style={t.between(hops[index]!, hops[index + 1] ?? prMs)}>
              {text}
            </Flat>
          ))}
          <Flat x={18} y={218} className="ink in swap" style={t.at(prMs)}>
            ✓ ready for review
          </Flat>
        </Box>
        {files.map((file, index) => (
          <Move key={file} track={t.press(`file-${index}`, [lands[index]!], 4)}>
            <Box x={318} y={68 + index * 64} w={164} h={48} d={10}>
              <i className="lit in" style={t.at(lands[index]!)} />
              <Flat x={14} y={16}>
                {file}
              </Flat>
              <Flat x={142} y={16} className="ink in" style={t.at(lands[index]!)}>
                ✓
              </Flat>
            </Box>
          </Move>
        ))}
        <Move track={t.rise("pr", prMs, 12)}>
          <Box x={318} y={264} w={196} h={54} d={12} tone="hue">
            <Flat x={14} y={10} className="key-l">
              PR #128
            </Flat>
            <Flat x={14} y={32}>
              ready to merge
            </Flat>
          </Box>
        </Move>
        {bit(t, { x: 498, y: 130, z: 0 }, [
          ...hops.map((atMs, index) => ({
            atMs,
            to: { x: 385, y: 77 + index * 64, z: 10 },
            press: 4,
          })),
          { atMs: 5500, to: { x: 401, y: 276, z: 12 }, press: 5 },
          { atMs: 6200, to: { x: 520, y: 232, z: 0 } },
        ])}
        {chip(t, [
          ["READ", 0],
          ["EDIT", hops[1]!],
          ["TEST", hops[2]!],
          ["SHIP", prMs],
        ])}
      </>
    ),
  };
}

// Dev tools that save hours: five chores by hand collapse into one release command.
function devTools(t: Tracks): Scene {
  const hopMs = 1500;
  const pressMs = hopMs + HOP_MS;
  const savedMs = pressMs + 700;
  // Bottom to top: the bottom slab stays and becomes the release.
  const chores = ["deploy", "tag", "build", "changelog", "bump version"];
  return {
    label: "Five release chores done by hand, 4 hours 10 minutes, stacked as a tower. A little key character presses vp run release, the tower collapses into one 6 minute release, and 4 hours 4 minutes are saved.",
    body: (
      <>
        {chores.map((chore, index) => {
          const top = index === chores.length - 1;
          const box = (
            <Box
              x={48}
              y={128}
              w={200}
              h={112}
              d={12}
              z={index * 12}
              front={<span className="front">{chore}</span>}
            >
              {index === 0 && (
                <>
                  <i className="lit in" style={t.at(pressMs + 300)} />
                  <Flat x={16} y={14} className="ink">
                    release ✓
                  </Flat>
                  <Flat x={16} y={38} className="big">
                    6m
                  </Flat>
                </>
              )}
              {top && (
                <>
                  <Flat x={16} y={14} className="dim">
                    by hand
                  </Flat>
                  <Flat x={16} y={38} className="big">
                    4h 10m
                  </Flat>
                </>
              )}
            </Box>
          );
          if (index === 0) return <div key={chore}>{box}</div>;
          // The top slab goes first, 40ms apart down the tower.
          const sinkAt = pressMs + 60 + (chores.length - 1 - index) * 40;
          const depth = index * 12 + 16;
          return (
            <Move key={chore} track={t.sink(`slab-${index}`, sinkAt, depth)} rest={`translateZ(${u(-depth)})`}>
              {box}
            </Move>
          );
        })}
        <Move track={t.press("key", [pressMs], 6)}>
          <Box x={296} y={220} w={208} h={52} d={14} tone="hue">
            <span className="key mono">$ vp run release</span>
          </Box>
        </Move>
        <Move track={t.rise("saved", savedMs, 10)}>
          <Box x={296} y={112} w={208} h={64} d={10}>
            <Flat x={16} y={10} className="big ink">
              4h 04m
            </Flat>
            <Flat x={16} y={40} className="dim">
              saved every release
            </Flat>
          </Box>
        </Move>
        {bit(t, { x: 360, y: 70, z: 0 }, [
          { atMs: hopMs, to: { x: 385, y: 231, z: 14 }, press: 6 },
          { atMs: savedMs + 600, to: { x: 182, y: 175, z: 12 } },
        ])}
        {chip(t, [
          ["BY HAND", 0],
          ["RUN", hopMs],
          ["SAVED", savedMs],
        ])}
      </>
    ),
  };
}

// APIs that stay fast: three round trips, each a bar far under the budget ceiling.
function apis(t: Tracks): Scene {
  // Bar height per millisecond of latency.
  const PER_MS = 0.4;
  const trips = [
    { goMs: 400, ms: 38, x: 196 },
    { goMs: 1800, ms: 44, x: 262 },
    { goMs: 3200, ms: 41, x: 328 },
  ];
  const home: Pose = { x: 156, y: 89, z: 0 };
  const far: Pose = { x: 374, y: 89, z: 0 };
  const backs = trips.map((trip) => trip.goMs + 600 + HOP_MS);
  const readoutMs = backs[2]! + 500;
  return {
    label: "Three API round trips. A little key character runs between client and api, and each trip raises a latency bar of about 40 milliseconds, far under a 200 millisecond budget. p95 is 42 milliseconds.",
    body: (
      <>
        <Flat x={148} y={98} className="groove" />
        <Move track={t.press("client", backs, 3)}>
          <Box x={36} y={72} w={112} h={64} d={16}>
            <Flat x={14} y={12} className="lg">
              client
            </Flat>
            <Flat x={14} y={36} className="dim">
              GET /cart
            </Flat>
          </Box>
        </Move>
        <Move track={t.press("api", trips.map((trip) => trip.goMs + HOP_MS), 3)}>
          <Box x={412} y={72} w={112} h={64} d={16}>
            <Flat x={14} y={12} className="lg">
              api
            </Flat>
            <Flat x={14} y={36} className="dim">
              200 OK
            </Flat>
          </Box>
        </Move>
        <Flat x={176} y={292} className="axis" />
        <Flat x={176} y={302} className="dim">
          latency, last 3 requests
        </Flat>
        {trips.map((trip, index) => (
          <Move key={trip.x} track={t.rise(`bar-${index}`, backs[index]!, trip.ms * PER_MS)}>
            <Box x={trip.x} y={244} w={44} h={44} d={trip.ms * PER_MS} tone="hue">
              <span className="key mono">{trip.ms}</span>
            </Box>
          </Move>
        ))}
        <Box x={180} y={200} w={208} h={92} d={200 * PER_MS} tone="glass">
          <Flat x={8} y={6} className="ink">
            200ms budget
          </Flat>
        </Box>
        <Flat x={420} y={236} className="big ink in" style={t.at(readoutMs)}>
          42ms
        </Flat>
        <Flat x={420} y={266} className="dim in" style={t.at(readoutMs)}>
          p95, under budget
        </Flat>
        {bit(
          t,
          home,
          trips.flatMap((trip) => [
            { atMs: trip.goMs, to: far, low: true },
            { atMs: trip.goMs + 600, to: home, low: true },
          ]),
        )}
        {chip(t, [
          ["REQUEST", 0],
          ["200 OK", backs[0]!],
          ["P95 42MS", readoutMs],
        ])}
      </>
    ),
  };
}

// Tests that never flake: five reruns, every test passes every time.
function tests(t: Tracks): Scene {
  const names = ["cart", "auth", "pay", "tax", "ship", "promo", "login", "search", "stock", "email", "refund", "rates"];
  const presses = [900, 1960, 3020, 4080, 5140];
  const badgeMs = presses[4]! + 700;
  const wave = (index: number) => presses.map((ms) => ms + 60 + index * 30);
  return {
    label: "Twelve tests on a grid. A little key character presses rerun five times, and every test passes every time. 0 flaky.",
    body: (
      <>
        <Flat x={44} y={60} className="ink">
          $ vp test --repeat 5
        </Flat>
        {names.map((name, index) => (
          <Move key={name} track={t.press(`cap-${index}`, wave(index), 4)}>
            <Box x={44 + (index % 4) * 62} y={96 + Math.floor(index / 4) * 60} w={54} h={44} d={10}>
              <i className="lit in" style={t.at(wave(index)[0]!)} />
              <Flat x={7} y={8} className="sm">
                {name}
              </Flat>
              <Flat x={7} y={24} className="sm ink in" style={t.at(wave(index)[0]!)}>
                ✓ pass
              </Flat>
            </Box>
          </Move>
        ))}
        <Move track={t.press("rerun", presses, 6)}>
          <Box x={318} y={150} w={196} h={56} d={14} tone="hue">
            <span className="key">Rerun</span>
          </Box>
        </Move>
        {presses.map((ms, index) => {
          const next = presses[index + 1];
          const text = `run ${index + 1}/5 · 12 passed`;
          return next === undefined ? (
            <Flat key={ms} x={318} y={222} className="ink in swap" style={t.at(ms)}>
              {text}
            </Flat>
          ) : (
            <Flat key={ms} x={318} y={222} className="ink win swap" style={t.between(ms, next)}>
              {text}
            </Flat>
          );
        })}
        <Move track={t.rise("badge", badgeMs, 12)}>
          <Box x={318} y={252} w={196} h={60} d={12}>
            <Flat x={16} y={8} className="big ink">
              0 flaky
            </Flat>
            <Flat x={16} y={38} className="dim">
              60 of 60 passed
            </Flat>
          </Box>
        </Move>
        {bit(
          t,
          { x: 470, y: 92, z: 0 },
          [
            ...presses.map((ms, index) => ({
              atMs: ms - HOP_MS,
              to: { x: 401, y: 163, z: 14 },
              press: 6,
              low: index > 0,
            })),
            { atMs: badgeMs + 300, to: { x: 476, y: 106, z: 0 } },
          ],
        )}
        {chip(t, [
          ["RUN", 0],
          ["RERUN", presses[1]! - HOP_MS],
          ["STABLE", badgeMs],
        ])}
      </>
    ),
  };
}

const SCENES = [
  { id: "ui", build: interfaces },
  { id: "ag", build: agents },
  { id: "dt", build: devTools },
  { id: "ap", build: apis },
  { id: "ts", build: tests },
];

// Builds a scene and the keyframes its parts registered while it was built.
function useScene(index: number, slideMs: number) {
  return useMemo(() => {
    const { id, build } = SCENES[index]!;
    const tracks = new Tracks(id, slideMs);
    const scene = build(tracks);
    return { ...scene, css: tracks.css.join("\n") };
  }, [index, slideMs]);
}

// Tilt in degrees: the plate leans back like a desk, and the cursor turns it.
const REST = { x: 34, y: -10 };
const REACH = { x: 9, y: 14 };
const restTransform = `rotateX(${REST.x}deg) rotateY(${REST.y}deg)`;

// Turn the plate toward the cursor, closing 12% of the gap each frame.
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
      // Measured on the flat view, not the tilting plate, so the edges never slip.
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

export function HeroDiorama({
  index,
  run,
  playing,
  ms,
}: {
  index: number;
  /** Bumps when a slide restarts, so its scene plays from the top. */
  run: number;
  /** Act the scene out. Otherwise it holds its last frame. */
  playing: boolean;
  /** The slide's length; the scene is timed to fill it. */
  ms: number;
}) {
  const scene = useScene(index, ms);
  const plateRef = useTiltToCursor();
  return (
    <div className="dio" data-play={playing ? "" : undefined} style={{ "--dur": `${ms}ms` }}>
      <style>{scene.css}</style>
      <div className="dio-view">
        <div ref={plateRef} className="dio-plate" style={{ transform: restTransform }} role="img" aria-label={scene.label}>
          <Box x={0} y={0} w={560} h={350} d={14} z={-14} className="plate" />
          <div key={`${index}-${run}`} className="dio-scene" aria-hidden="true">
            {scene.body}
          </div>
        </div>
      </div>
    </div>
  );
}
