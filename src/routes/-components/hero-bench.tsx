import { useEffect, useRef } from "react";
import {
  BENCH_AXES,
  BENCH_FIGURES,
  BENCH_PLATE,
  BENCH_VIEWBOX,
} from "./hero-figures.generated";

type World = readonly [number, number, number];
type Screen = readonly [number, number];

const TAU = Math.PI * 2;

// Screen offset of a world-space move, from the camera's unit axes.
function offsetOf([x, y, z]: World): Screen {
  const { x: ax, y: ay, z: az } = BENCH_AXES;
  return [x * ax[0] + y * ay[0] + z * az[0], x * ax[1] + y * ay[1] + z * az[1]];
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const inOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
const out = (p: number) => 1 - (1 - p) ** 3;
const back = (p: number) => 1 + 2.2 * (p - 1) ** 3 + 1.2 * (p - 1) ** 2;
const smooth = (p: number) => p * p * (3 - 2 * p);
const lerp = (from: number, to: number, p: number) => from + (to - from) * p;

// Progress through [from, to] seconds, eased.
function span(t: number, from: number, to: number, ease = inOut) {
  return ease(clamp01((t - from) / (to - from)));
}

// The parts of one figure, found once and moved by name.
class Rig {
  private parts = new Map<string, Element>();

  constructor(private root: Element) {}

  part(name: string) {
    let found = this.parts.get(name);
    if (!found) {
      found = this.root.querySelector(`[data-part="${name}"]`) ?? undefined;
      if (found) this.parts.set(name, found);
    }
    return found;
  }

  move(name: string, by: World) {
    const [x, y] = offsetOf(by);
    this.part(name)?.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
  }

  light(name: string, on: boolean) {
    this.part(name)?.querySelector(".iso-solid:last-of-type")?.toggleAttribute("data-lit", on);
  }

  show(name: string, on: boolean) {
    this.part(name)?.setAttribute("opacity", on ? "1" : "0");
  }

  // A needle on a dial face: the world radius and turn, drawn from the dial's screen centre.
  needle(name: string, center: Screen, radius: number, turn: number) {
    const angle = turn * TAU;
    const at = (length: number) => {
      const [x, y] = offsetOf([Math.sin(angle) * length, -Math.cos(angle) * length, 0]);
      return `${(center[0] + x).toFixed(1)} ${(center[1] + y).toFixed(1)}`;
    };
    this.part(name)?.setAttribute("d", `M${at(-3.4)}L${at(radius)}`);
  }

  // Move a part into another slot so it paints over what it now sits on.
  slot(name: string, slotName: string) {
    const node = this.part(name);
    const target = this.root.querySelector(`[data-slot="${slotName}"]`);
    if (node && target && node.parentNode !== target) target.append(node);
  }
}

type Figure = (typeof BENCH_FIGURES)[number];
type Pose = { end: number; at: (rig: Rig, t: number) => void };

function interfacesPose(): Pose {
  const STATES = 5;
  return {
    end: 6.6,
    at(rig, t) {
      // Probe height above the key top: idle, hover, press, release, rest.
      let h = 22;
      h = lerp(h, 8, span(t, 1, 1.5, out));
      h = lerp(h, -5, span(t, 2.4, 2.58));
      h = lerp(h, 10, span(t, 2.95, 3.35, out));
      h = lerp(h, 22, span(t, 5.4, 6.4));
      rig.move("probe", [0, 0, 24 + h]);
      // The key springs back with a little overshoot.
      const travel = Math.min(0, h);
      const release = t > 2.95 ? back(clamp01((t - 2.95) / 0.32)) : 0;
      rig.move("cap", [0, 0, t > 2.95 ? -5 + 5 * release : travel]);
      const state = t < 1.2 ? 0 : t < 2.45 ? 1 : t < 3 ? 2 : t < 5 ? 3 : 4;
      for (let index = 0; index < STATES; index++) {
        const blink = index === 3 && Math.floor((t - 3) * 4) % 2 === 1;
        rig.light(`state-${index}`, index === state && !blink);
      }
    },
  };
}

function agentsPose(figure: Extract<Figure, { id: "agents" }>): Pose {
  const { stampX, gateX } = figure.rig;
  return {
    end: 5.8,
    at(rig, t) {
      let x = -100;
      x = lerp(x, stampX, span(t, 0.2, 1));
      x = lerp(x, gateX, span(t, 1.7, 2.5));
      x = lerp(x, 92, span(t, 3.9, 4.8));
      rig.move("puck", [x, 0, 0]);
      const stamp = span(t, 1.08, 1.22, out) - span(t, 1.24, 1.5);
      rig.move("stamp", [0, 0, -6 * stamp]);
      rig.show("mark", t > 1.2);
      [2.8, 3.2, 3.6].forEach((when, index) => rig.light(`check-${index}`, t > when));
      rig.move("flag", [0, 0, lerp(12, 40, span(t, 4.9, 5.6, out))]);
    },
  };
}

function devToolsPose(figure: Extract<Figure, { id: "devtools" }>): Pose {
  const { hopperX, outputX, pressX, dieZ, stackZ, needle } = figure.rig;
  const CYCLE = 2.1;
  const PARTS = 3;
  const IN_STACK = 4;
  return {
    end: 0.25 + CYCLE * (PARTS - 1) + 1.8,
    at(rig, t) {
      const cycle = Math.min(PARTS - 1, Math.max(-1, Math.floor((t - 0.25) / CYCLE)));
      const local = t - 0.25 - cycle * CYCLE;
      for (let index = 0; index < IN_STACK; index++) rig.show(`in-${index}`, index < IN_STACK - cycle - 1);
      for (let index = 0; index < PARTS; index++) {
        rig.show(`out-${index}`, index < cycle || (index === cycle && local > 1.7));
      }
      let hours = Math.max(0, cycle);
      if (cycle >= 0) {
        const fromZ = stackZ + (IN_STACK - cycle - 1) * 2;
        const toZ = stackZ + cycle * 2;
        const there = span(local, 0, 0.6);
        const away = span(local, 1.05, 1.65);
        const x = lerp(lerp(hopperX, pressX, there), outputX, away);
        const z =
          lerp(lerp(fromZ, dieZ, there), toZ, away) +
          6 * Math.sin(Math.PI * there) +
          6 * Math.sin(Math.PI * away);
        rig.move("blank", [x, 0, z]);
        rig.show("blank", local < 1.7);
        rig.show("stamp-mark", local > 0.78);
        const ram = span(local, 0.62, 0.78, (p) => p * p) - span(local, 0.8, 1.05, out);
        rig.move("ram", [0, 0, -16 * ram]);
        hours += back(clamp01((local - 0.78) / 0.35));
      } else {
        rig.show("blank", false);
        rig.move("ram", [0, 0, 0]);
      }
      rig.needle("needle", needle.center, needle.radius, hours / 12);
    },
  };
}

function apisPose(figure: Extract<Figure, { id: "apis" }>): Pose {
  const { cartFrom, cartTo, rack, counter } = figure.rig;
  const CART_TOP = 10;
  return {
    end: 5.6,
    at(rig, t) {
      const cartX = lerp(lerp(cartFrom, cartTo, span(t, 1.3, 3)), cartFrom, span(t, 4.1, 5.4));
      rig.move("cart", [cartX, 0, 0]);
      const load = span(t, 0.3, 1.1);
      const unload = span(t, 3.1, 3.8);
      const onCart: World = [cartX, 0, CART_TOP];
      const x = lerp(lerp(rack[0], onCart[0], load), counter[0], unload);
      const y = lerp(lerp(rack[1], onCart[1], load), counter[1], unload);
      const z =
        lerp(lerp(rack[2], onCart[2], load), counter[2], unload) +
        10 * Math.sin(Math.PI * load) +
        8 * Math.sin(Math.PI * unload);
      rig.move("batch", [x, y, z]);
      rig.slot("batch", t > 0.7 ? "batch-high" : "batch-low");
      rig.light("served", t > 3.85);
    },
  };
}

function testsPose(figure: Extract<Figure, { id: "tests" }>): Pose {
  const { away, measure, carriageTop, blockH, riseFrom, riseTo, perTurn, needle } = figure.rig;
  const PASS = 1.3;
  const PASSES = 5;
  const START = 0.3;
  return {
    end: START + PASS * (PASSES - 1) + 0.8,
    at(rig, t) {
      const pass = Math.min(PASSES - 1, Math.max(0, Math.floor((t - START) / PASS)));
      const local = t - START - pass * PASS;
      const last = pass === PASSES - 1;
      const x = lerp(lerp(away, measure, span(local, 0, 0.45)), away, last ? 0 : span(local, 0.75, 1.2));
      rig.move("carriage", [x, 0, 0]);
      const lift = blockH * smooth(clamp01((x - riseFrom) / (riseTo - riseFrom)));
      rig.move("plunger", [0, 0, carriageTop + lift]);
      rig.needle("needle", needle.center, needle.radius, lift / perTurn);
      for (let index = 0; index < PASSES; index++) {
        rig.light(`pass-${index}`, t > START + index * PASS + 0.5);
      }
    },
  };
}

function poseOf(figure: Figure): Pose {
  switch (figure.id) {
    case "interfaces":
      return interfacesPose();
    case "agents":
      return agentsPose(figure);
    case "devtools":
      return devToolsPose(figure);
    case "apis":
      return apisPose(figure);
    case "tests":
      return testsPose(figure);
  }
}

const POSES = BENCH_FIGURES.map(poseOf);

// The bench under the headline: one plate, one machine per slide. Each machine runs its
// loop once while its slide is up, holds its last frame, and stands still under reduced motion.
export function HeroBench({
  index,
  playing,
  reduced,
}: {
  index: number;
  playing: boolean;
  reduced: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const clockRef = useRef({ index: -1, t: 0 });

  useEffect(() => {
    const svg = svgRef.current;
    const root = svg?.querySelector(`[data-fig="${BENCH_FIGURES[index]!.id}"]`);
    if (!svg || !root) return;
    const rig = new Rig(root);
    const pose = POSES[index]!;
    const clock = clockRef.current;
    if (clock.index !== index) {
      clock.index = index;
      clock.t = 0;
    }
    if (reduced) {
      pose.at(rig, pose.end);
      return;
    }
    pose.at(rig, clock.t);
    if (!playing || clock.t >= pose.end) return;

    let frame = 0;
    let last = 0;
    let visible = true;
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0;
      last = now;
      clock.t = Math.min(pose.end, clock.t + dt);
      pose.at(rig, clock.t);
      frame = visible && clock.t < pose.end ? requestAnimationFrame(tick) : 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible && !frame && clock.t < pose.end) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    });
    observer.observe(svg);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [index, playing, reduced]);

  return (
    <svg
      ref={svgRef}
      className="iso-svg bench-svg"
      viewBox={BENCH_VIEWBOX}
      role="img"
      aria-label={BENCH_FIGURES[index]!.label}
    >
      <g dangerouslySetInnerHTML={{ __html: BENCH_PLATE }} />
      {BENCH_FIGURES.map((figure, at) => (
        <g
          key={figure.id}
          className={at === index ? "bench-fig on" : "bench-fig"}
          data-fig={figure.id}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: figure.body }}
        />
      ))}
    </svg>
  );
}
