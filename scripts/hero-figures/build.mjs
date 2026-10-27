// Builds the five hero bench figures with the Anatomy kit (kit/LICENSE, MIT).
// Run: vp node scripts/hero-figures/build.mjs
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../../src/routes/-components/hero-figures.generated.ts");

const WIDTH = 600;
const HEIGHT = 440;
const PLATE = { x: -128, y: -64, w: 256, d: 128, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

// One camera for every figure, so the bench never moves when the machine on it changes.
const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [-98, 0, 126],
    [-118, -50, 96],
    [60, -20, 104],
  ],
  WIDTH,
  HEIGHT,
  { pad: 6, azimuth: 40 },
);

const at = (point) => k.iso(point, P);
// Every solid gets a paint, read in iso.css: the moving part in the slide hue ("hero"),
// work pieces and dial faces in white, pins and feet in dark plastic, and the machine body
// in "body". The plate and lamp lenses name theirs.
const tintOf = ({ tint, lit, tone }) =>
  tint ?? (lit ? "hero" : tone === "hi" ? "white" : tone === "lo" ? "dark" : "body");
const S = (paths, style = {}) => k.solidSvg(paths, { ...style, tint: tintOf(style) });
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const part = (name, body, extra = "") => `<g data-part="${name}"${extra}>${body}</g>`;
const byDepth = (points) =>
  [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// ---------------------------------------------------------------------------
// Shared parts
// ---------------------------------------------------------------------------

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", tint: "plate" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const strip = { x: -112, y: PLATE.y + PLATE.d - 15, w: 230, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none", tint: "plate-2" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  return out.join("");
}

// A lamp the runtime switches with data-lit. Pass lamps glow green instead of the slide hue.
function lamp(name, x, y, z, radius, pass = false) {
  const body =
    S(k.cylinder(x, y, radius + 1.2, z, 1, P, 24), { tone: "lo" }) +
    S(k.cylinder(x, y, radius, z + 1, 1.6, P, 24, 0.3), { tone: "mid", crease: "none", tint: "glass" });
  return part(name, body, ` class="lamp${pass ? " pass" : ""}"`);
}

function lampBar(prefix, xs, y, pass) {
  const plan = { x: xs[0] - 9, y: y - 7, w: xs[xs.length - 1] - xs[0] + 18, d: 14, r: 2.5 };
  const out = [S(k.slabOf(plan, 0, 4, P, 4, 0.6), { tone: "mid" })];
  out.push(D([at([plan.x + 3.5, y, 4]), at([plan.x + plan.w - 3.5, y, 4])], { size: 0.45 }));
  xs.forEach((x, index) => out.push(lamp(`${prefix}-${index}`, x, y, 4, 3.4, pass(index))));
  return out.join("");
}

// Magnetic base, post, clamp and arm: the stand both test rigs hang their instrument from.
const MAG = { x: -112, y: -20, w: 44, d: 40, r: 3 };
const MAG_H = 24;
const POST = [-98, 0];
const POST_TOP = 122;
const CLAMP_Z = 100;

function stand(reach) {
  const out = [];
  out.push(S(k.slabOf(MAG, 0, 11, P, 6, 0.8), { tone: "mid" }));
  out.push(S(k.slabOf(k.insetPlan(MAG, 0.8), 11, MAG_H - 11, P, 6, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(MAG, 3), MAG_H, P), { tone: "faint" }));
  out.push(D([at([MAG.x + 5, MAG.y + 5, MAG_H]), at([MAG.x + 5, MAG.y + MAG.d - 5, MAG_H]), at([MAG.x + MAG.w - 5, MAG.y + 5, MAG_H])], { size: 0.45 }));
  const knob = [MAG.x + 32, MAG.y + 28];
  out.push(S(k.cylinder(knob[0], knob[1], 6, MAG_H, 4, P, 32), { tone: "mid" }));
  out.push(L(k.knurl(knob[0], knob[1], 6, MAG_H, MAG_H + 4, 36, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([knob[0], knob[1]], [knob[0] + 6, knob[1]], MAG_H + 4, P), { tone: "hi" }));
  out.push(S(k.cylinder(POST[0], POST[1], 5, MAG_H, 4, P, 28), { tone: "mid" }));
  const clamp = { x: POST[0] - 7, y: POST[1] - 7, w: 14, d: 14, r: 2.5 };
  out.push(S(k.cylinder(POST[0], POST[1], 3.2, MAG_H + 4, CLAMP_Z - 4 - MAG_H - 4, P, 28), { tone: "mid", crease: "none" }));
  out.push(L([60, 80].map((z) => k.sideArc(POST[0], POST[1], 3.2, z, P, 16)).join(""), { tone: "faint" }));
  out.push(S(k.slabOf(clamp, CLAMP_Z - 4, 12, P, 4, 0.6), { tone: "mid" }));
  out.push(S(k.cylinder(POST[0], POST[1], 3.2, CLAMP_Z + 8, POST_TOP - CLAMP_Z - 8, P, 28), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(POST[0], POST[1], 3.8, POST_TOP, 2, P, 28), { tone: "mid" }));
  const arm = { x: POST[0] + 7, y: -3, w: reach - POST[0] - 7, d: 6, r: 2 };
  out.push(S(k.slabOf(arm, CLAMP_Z, 4, P, 4, 0.5), { tone: "mid" }));
  out.push(D([at([arm.x + 4, 0, CLAMP_Z + 4]), at([arm.x + arm.w - 5, 0, CLAMP_Z + 4])], { size: 0.45 }));
  const thumb = [clamp.x + 7, clamp.y + clamp.d + 3];
  out.push(S(k.slabOf({ x: thumb[0] - 1.4, y: clamp.y + clamp.d, w: 2.8, d: 3, r: 0.8 }, CLAMP_Z + 1, 4, P, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(thumb[0], thumb[1] + 1.4, 2.6, CLAMP_Z, 6, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(thumb[0], thumb[1] + 1.4, 2.6, CLAMP_Z, CLAMP_Z + 6, 18, P), { tone: "lo" }));
  return out.join("");
}

function rails(from, to, ys) {
  const out = [];
  for (const y of ys) {
    out.push(S(k.slabOf({ x: from, y, w: to - from, d: 5, r: 1 }, 0, 3, P, 3, 0.4), { tone: "mid" }));
    out.push(D([from + 6, to - 6].map((x) => at([x, y + 2.5, 3])), { size: 0.4 }));
  }
  const span = ys[ys.length - 1] - ys[0] + 13;
  for (const x of [from - 5, to]) {
    out.push(S(k.slabOf({ x, y: ys[0] - 4, w: 5, d: span, r: 1.2 }, 0, 7, P, 3, 0.5), { tone: "mid" }));
  }
  return out.join("");
}

// A dial face on top of a cylinder. The runtime draws the needle from `needle`.
function dialFace([x, y], radius, z, height, ticks, every) {
  const top = z + height;
  const out = [];
  out.push(S(k.cylinder(x, y, radius, z, height, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, radius, top - 3.4, top, 84, P, 0.3), { tone: "lo" }));
  out.push(L(k.sideArc(x, y, radius, top - 3.4, P, 40), { tone: "faint" }));
  out.push(L(k.ring(x, y, radius - 2.2, top, P, 64), { tone: "lo" }));
  const marks = k.radialTicks(x, y, radius - 3, ticks, every, top, [1.3, 2.8], P);
  out.push(L(marks.minor, { tone: "lo" }), L(marks.major, { tone: "mid" }));
  out.push(L(k.ring(x, y, 1.6, top, P, 16), { tone: "mid" }));
  return out.join("");
}

// Drawn at rest for the first paint; the runtime redraws it from the same centre and radius.
const needleSvg = (name, [x, y], z, radius) =>
  `<path data-part="${name}" class="iso-line" data-tone="lit" data-free="start" d="${k.lineOnTop([x, y + 3.4], [x, y - radius], z, P)}" style="stroke-width:1.2"/>`;

const screen = (point) => at(point).map((value) => Math.round(value * 1000) / 1000);
const axes = {
  x: k.axisVector(P, [1, 0, 0]),
  y: k.axisVector(P, [0, 1, 0]),
  z: k.axisVector(P, [0, 0, 1]),
};

// ---------------------------------------------------------------------------
// 1. Interfaces that behave: a probe presses a key and five lamps show its states
// ---------------------------------------------------------------------------

function interfaces() {
  const KEY = [52, 0];
  const housing = { x: KEY[0] - 28, y: KEY[1] - 28, w: 56, d: 56, r: 7 };
  const cap = { x: KEY[0] - 21, y: KEY[1] - 21, w: 42, d: 42, r: 7 };
  const CAP_Z = 13;
  const CAP_H = 11;
  const out = [stand(KEY[0] + 6)];
  out.push(S(k.slabOf(housing, 0, CAP_Z, P, 8, 1.2), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(housing, 3.2), CAP_Z, P), { tone: "lo" }));
  out.push(D(k.corners(housing, 4.4).map(([x, y]) => at([x, y, CAP_Z])), { size: 0.45 }));
  out.push(S(k.cylinder(KEY[0], KEY[1], 5, CAP_Z, 3, P, 24), { tone: "lo" }));
  const capBody = [
    S(k.slabOf(cap, CAP_Z + 1, CAP_H - 1, P, 8, 1.4), { tone: "hi", crease: "lo", lit: true }),
    L(k.planOutline(k.insetPlan(cap, 4.5), CAP_Z + CAP_H, P), { tone: "lo" }),
    k.faceTextSvg(k.topMatrix([KEY[0] + 3.4, KEY[1]], CAP_Z + CAP_H, P, "y"), "SAVE", { size: 7, tone: "hi", anchor: "middle" }),
  ];
  out.push(part("cap", capBody.join("")));
  const tipZ = CAP_Z + CAP_H;
  const probe = [
    S(k.cylinder(KEY[0], KEY[1], 1.6, 3, 80, P, 16), { tone: "hi", crease: "none" }),
    S(k.cylinder(KEY[0], KEY[1], 5.2, 0, 3, P, 28, 0.6), { tone: "hi", crease: "lo" }),
  ];
  out.push(part("probe", probe.join(""), ` transform="${k.translateAlong(P, [0, 0, tipZ + 22])}"`));
  out.push(S(k.cylinder(KEY[0], KEY[1], 3.2, 66, CLAMP_Z - 66, P, 24), { tone: "mid" }));
  out.push(L(k.sideArc(KEY[0], KEY[1], 3.2, 74, P, 12), { tone: "lo" }));
  out.push(S(k.slabOf({ x: KEY[0] - 6, y: -6, w: 12, d: 12, r: 2 }, CLAMP_Z - 2, 8, P, 3, 0.5), { tone: "mid" }));
  out.push(k.wireSvg(at([KEY[0] - 20, 28, 4]), at([-20, 44, 4]), { via: [at([-6, 36, 0])], tone: "lo" }));
  out.push(lampBar("state", [-80, -66, -52, -38, -24], 46, (index) => index === 4));
  return {
    id: "interfaces",
    label:
      "A key test rig. A probe on a stand lowers onto a key labelled Save, presses it, and lets go, while five lamps in front light up in turn for idle, hover, press, pending and done.",
    body: out.join(""),
    rig: { tipZ, capZ: 0 },
  };
}

// ---------------------------------------------------------------------------
// 2. Agentic setups that work: a change rides a belt through a tool, three checks and review
// ---------------------------------------------------------------------------

function agents() {
  const BELT = { x: -120, y: -16, w: 236, d: 32, r: 3 };
  const BELT_Z = 10;
  const PUCK_R = 8;
  const STAMP_X = -48;
  const GATE_X = 22;
  const GANTRY_Z = 60;
  const out = [];
  out.push(S(k.slabOf(BELT, 0, BELT_Z - 2, P, 4, 0.8), { tone: "mid" }));
  out.push(S(k.slabOf({ x: BELT.x + 3, y: -13, w: BELT.w - 6, d: 26, r: 12 }, BELT_Z - 2, 2, P, 10), { tone: "mid", crease: "none" }));
  out.push(L(k.lineOnTop([BELT.x + 14, -6], [BELT.x + BELT.w - 14, -6], BELT_Z, P), { tone: "lo", flow: true }));
  out.push(L(k.lineOnTop([BELT.x + 14, 6], [BELT.x + BELT.w - 14, 6], BELT_Z, P), { tone: "lo", flow: true }));
  out.push(D([BELT.x + 6, BELT.x + BELT.w - 6].flatMap((x) => [at([x, BELT.y + 3, BELT_Z - 2]), at([x, BELT.y + BELT.d - 3, BELT_Z - 2])]), { size: 0.45 }));

  const post = (x, y) => S(k.slabOf({ x: x - 4, y, w: 8, d: 6, r: 1.2 }, 0, GANTRY_Z, P, 3, 0.5), { tone: "mid" });
  const bar = (x) => S(k.slabOf({ x: x - 6, y: -29, w: 12, d: 58, r: 2 }, GANTRY_Z, 8, P, 4, 0.6), { tone: "mid" });

  out.push(post(STAMP_X, -28), post(GATE_X, -28));
  // Review flag stands behind the belt end.
  const FLAG_X = 98;
  out.push(S(k.cylinder(FLAG_X, -30, 4, 0, 3, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(FLAG_X, -30, 1.4, 3, 54, P, 14), { tone: "mid", crease: "none" }));
  const flag = S(k.slabOf({ x: FLAG_X + 1.6, y: -30.6, w: 16, d: 1.2, r: 0.4 }, 0, 10, P, 1), { tone: "hi", crease: "none", lit: true });
  out.push(part("flag", flag, ` transform="${k.translateAlong(P, [0, 0, 12])}"`));

  const puck = [
    S(k.cylinder(0, 0, PUCK_R, BELT_Z, 6, P, 32, 0.6), { tone: "hi", crease: "lo", lit: true }),
    part("mark", L(k.ring(0, 0, 4, BELT_Z + 6, P, 24) + k.lineOnTop([-2.4, 0], [2.4, 0], BELT_Z + 6, P), { tone: "hi" }), ` opacity="0"`),
  ];
  out.push(part("puck", puck.join(""), ` transform="${k.translateAlong(P, [-100, 0, 0])}"`));

  const head = [
    S(k.cylinder(STAMP_X, 0, 2, 30, GANTRY_Z - 30, P, 16), { tone: "mid", crease: "none" }),
    S(k.slabOf({ x: STAMP_X - 8, y: -8, w: 16, d: 16, r: 2.5 }, 22, 8, P, 4, 0.6), { tone: "hi", crease: "lo" }),
  ];
  out.push(part("stamp", head.join("")));
  out.push(S(k.slabOf({ x: GATE_X - 5, y: -20, w: 10, d: 40, r: 1.5 }, GANTRY_Z - 4, 4, P, 3, 0.4), { tone: "mid" }));
  out.push(post(STAMP_X, 22), post(GATE_X, 22));
  out.push(bar(STAMP_X), bar(GATE_X));
  [-15, 0, 15].forEach((y, index) => out.push(lamp(`check-${index}`, GATE_X, y, GANTRY_Z + 8, 3.2, true)));
  return {
    id: "agents",
    label:
      "A conveyor belt. A puck standing for a code change rides past a tool that stamps it, stops under a gate where three check lamps turn green one by one, and ends at a review flag that rises.",
    body: out.join(""),
    rig: { stampX: STAMP_X, gateX: GATE_X },
  };
}

// ---------------------------------------------------------------------------
// 3. Dev tools that save hours: a press stamps blanks while a gauge counts the hours saved
// ---------------------------------------------------------------------------

function devTools() {
  const PRESS_X = 12;
  const DIE_Z = 18;
  const STACK_Z = 12;
  const BLANK = { x: -11, y: -11, w: 22, d: 22, r: 2 };
  const HOPPER_X = -82;
  const OUTPUT_X = 82;
  const out = [];
  const pedestal = (x) => {
    const plan = { x: x - 15, y: -15, w: 30, d: 30, r: 3 };
    return S(k.slabOf(plan, 0, STACK_Z, P, 4, 0.8), { tone: "mid" }) + D(k.corners(plan, 3.5).map(([px, py]) => at([px, py, STACK_Z])), { size: 0.4 });
  };
  const blank = (x, z, tone = "mid") => S(k.slabOf({ ...BLANK, x: x + BLANK.x }, z, 2, P, 3, 0.4), { tone });
  out.push(pedestal(HOPPER_X));
  for (let index = 0; index < 4; index++) out.push(part(`in-${index}`, blank(HOPPER_X, STACK_Z + index * 2)));
  for (const [x, y] of [[-15, -15], [15, -15]]) out.push(S(k.cylinder(HOPPER_X + x, y, 1.2, STACK_Z, 16, P, 10), { tone: "lo", crease: "none" }));
  out.push(pedestal(OUTPUT_X));
  for (let index = 0; index < 3; index++) {
    const stamped = blank(OUTPUT_X, STACK_Z + index * 2, "hi") + L(k.ring(OUTPUT_X, 0, 4, STACK_Z + index * 2 + 2, P, 20), { tone: "mid" });
    out.push(part(`out-${index}`, stamped, ` opacity="0"`));
  }

  const base = { x: PRESS_X - 22, y: -26, w: 44, d: 52, r: 3 };
  out.push(S(k.slabOf(base, 0, 14, P, 4, 1), { tone: "mid" }));
  out.push(S(k.slabOf({ x: PRESS_X - 15, y: -15, w: 30, d: 30, r: 2 }, 14, DIE_Z - 14, P, 3, 0.6), { tone: "mid" }));
  out.push(L(k.planOutline({ x: PRESS_X - 11, y: -11, w: 22, d: 22, r: 2 }, DIE_Z, P, 3), { tone: "faint" }));
  out.push(S(k.slabOf({ x: PRESS_X - 20, y: -28, w: 40, d: 10, r: 2 }, 14, 74, P, 3, 0.8), { tone: "mid" }));

  const moving = blank(0, 0, "hi") + part("stamp-mark", L(k.ring(0, 0, 4, 2, P, 20), { tone: "mid" }), ` opacity="0"`);
  out.push(part("blank", moving, ` opacity="0"`));
  const ram = [
    S(k.cylinder(PRESS_X, 0, 5, 44, 44, P, 24), { tone: "mid", crease: "none" }),
    S(k.cylinder(PRESS_X, 0, 9, 36, 8, P, 32, 0.6), { tone: "hi", crease: "lo", lit: true }),
  ];
  out.push(part("ram", ram.join("")));
  out.push(S(k.slabOf({ x: PRESS_X - 20, y: -28, w: 40, d: 40, r: 3 }, 88, 12, P, 4, 1), { tone: "mid" }));
  out.push(D(k.corners({ x: PRESS_X - 20, y: -28, w: 40, d: 40 }, 4).map(([x, y]) => at([x, y, 100])), { size: 0.45 }));

  const GAUGE = [-36, 44];
  out.push(S(k.cylinder(GAUGE[0], GAUGE[1], 16, 0, 4, P, 48, 0.6), { tone: "mid" }));
  out.push(dialFace(GAUGE, 14, 4, 6, 12, 3));
  out.push(needleSvg("needle", GAUGE, 10.2, 10));
  out.push(k.wireSvg(at([GAUGE[0] + 14, GAUGE[1] - 8, 4]), at([PRESS_X - 10, 26, 6]), { via: [at([PRESS_X - 18, 34, 0])], tone: "lo" }));
  return {
    id: "devtools",
    label:
      "A small press. Blank plates slide from a hopper onto the die, the ram stamps each one, finished plates stack on the right, and a gauge in front steps forward one hour per part.",
    body: out.join(""),
    rig: {
      hopperX: HOPPER_X,
      outputX: OUTPUT_X,
      pressX: PRESS_X,
      dieZ: DIE_Z,
      stackZ: STACK_Z,
      needle: { center: screen([GAUGE[0], GAUGE[1], 10.2]), radius: 10 },
    },
  };
}

// ---------------------------------------------------------------------------
// 4. APIs that stay fast: one batched trip from the records rack to the counter
// ---------------------------------------------------------------------------

function apis() {
  const RACK = { x: -122, y: -52, w: 36, d: 84 };
  const SHELVES = [16, 44, 72];
  const RECORD = { w: 12, d: 8, r: 1 };
  const CART_FROM = -56;
  const CART_TO = 64;
  const out = [];
  out.push(rails(-82, 92, [-12, 7]));

  const records = (cx, cy, z, tone) => {
    const list = [];
    for (const row of [-10, 0, 10])
      for (const col of [-7, 7]) list.push([cx + col, cy + row]);
    return byDepth(list)
      .map(([x, y]) => {
        const plan = { x: x - RECORD.w / 2, y: y - RECORD.d / 2, ...RECORD };
        return S(k.slabOf(plan, z, 6, P, 2, 0.4), { tone, crease: "lo" }) + L(k.lineOnTop([plan.x + 2.5, y], [plan.x + plan.w - 2.5, y], z + 6, P), { tone: "faint" });
      })
      .join("");
  };

  const cart = [
    `<path class="iso-halo" d="${k.haloOf({ x: -16, y: -16, w: 32, d: 32, r: 3 }, 3, 0.1, P)}"/>`,
    S(k.slabOf({ x: -19, y: -17, w: 38, d: 34, r: 3 }, 3, 7, P, 4, 0.6), { tone: "hi", crease: "lo", lit: true }),
    L(k.planOutline({ x: -16, y: -14, w: 32, d: 28, r: 2 }, 10, P, 3), { tone: "lo" }),
    L([-11, 11].map((x) => k.sideRing([x, 17, 5], 2.6, "y", P, 18)).join(""), { tone: "mid" }),
    D([-11, 11].map((x) => at([x, 17, 5])), { size: 0.45, tone: "hi" }),
  ];
  out.push(part("cart", cart.join(""), ` transform="${k.translateAlong(P, [CART_FROM, 0, 0])}"`));

  out.push(S(k.slabOf({ x: RACK.x, y: RACK.y, w: 5, d: RACK.d, r: 1 }, 0, 96, P, 2, 0.6), { tone: "mid" }));
  out.push(S(k.slabOf({ x: RACK.x, y: RACK.y, w: RACK.w, d: 5, r: 1 }, 0, 96, P, 2, 0.6), { tone: "mid" }));
  const shelf = (z) => S(k.slabOf({ ...RACK, r: 2 }, z - 3, 3, P, 3, 0.5), { tone: "mid" });
  const RACK_C = [RACK.x + RACK.w / 2 + 2, RACK.y + RACK.d / 2 + 2];
  out.push(shelf(SHELVES[0]), records(RACK_C[0], RACK_C[1], SHELVES[0], "mid"));
  out.push(shelf(SHELVES[1]));
  // The runtime moves the batch to the high slot once it leaves the shelf, so it paints over the counter.
  out.push(`<g data-slot="batch-low">${part("batch", records(0, 0, 0, "hi"), ` transform="${k.translateAlong(P, [RACK_C[0], RACK_C[1], SHELVES[1]])}"`)}</g>`);
  out.push(shelf(SHELVES[2]), records(RACK_C[0], RACK_C[1], SHELVES[2], "mid"));
  out.push(S(k.slabOf({ x: RACK.x, y: RACK.y, w: RACK.w, d: RACK.d, r: 2 }, 96, 4, P, 3, 0.6), { tone: "mid" }));

  const COUNTER = { x: 96, y: -24, w: 26, d: 48, r: 3 };
  out.push(S(k.slabOf(COUNTER, 0, 16, P, 4, 1), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(COUNTER, 3), 16, P), { tone: "lo" }));
  out.push(lamp("served", COUNTER.x + 13, COUNTER.y + COUNTER.d - 7, 16, 3, true));
  out.push(`<g data-slot="batch-high"></g>`);
  return {
    id: "apis",
    label:
      "A records rack and a counter joined by rails. A cart loads six records from the rack in one go, makes a single trip to the counter, unloads them all, and a lamp on the counter turns green.",
    body: out.join(""),
    rig: {
      cartFrom: CART_FROM,
      cartTo: CART_TO,
      rack: [RACK_C[0], RACK_C[1], SHELVES[1]],
      counter: [COUNTER.x + 13, COUNTER.y + 18, 16],
    },
  };
}

// ---------------------------------------------------------------------------
// 5. Reliable tests: a dial gauge measures the same block five times and reads the same mark
// ---------------------------------------------------------------------------

function tests() {
  const DIAL = [58, 0];
  const DIAL_R = 20;
  const DIAL_Z = 82;
  const DIAL_TOP = DIAL_Z + 10;
  const CARRIAGE = { x: -28, y: -24, w: 56, d: 48, r: 3 };
  const CARRIAGE_Z = 3;
  const CARRIAGE_TOP = 8;
  const BLOCK = { x: -24, y: -12, w: 15.6, d: 24, r: 1 };
  const BLOCK_H = 14;
  const out = [rails(6, 120, [-20, 15]), stand(DIAL[0] - DIAL_R + 2)];

  const carriage = [
    `<path class="iso-halo" d="${k.haloOf(k.insetPlan(CARRIAGE, 3), CARRIAGE_Z, 0.1, P)}"/>`,
    S(k.slabOf(CARRIAGE, CARRIAGE_Z, CARRIAGE_TOP - CARRIAGE_Z, P, 5, 0.6), { tone: "mid" }),
    D([-22, -8, 8, 22].map((x) => at([x, CARRIAGE.y + CARRIAGE.d - 2.6, CARRIAGE_TOP])), { size: 0.4, tone: "lo" }),
    L(k.lineOnTop([CARRIAGE.x, -15.5], [CARRIAGE.x + CARRIAGE.w, -15.5], CARRIAGE_TOP, P), { tone: "faint" }),
    L(k.lineOnTop([CARRIAGE.x, 15.5], [CARRIAGE.x + CARRIAGE.w, 15.5], CARRIAGE_TOP, P), { tone: "faint" }),
    S(k.slabOf(BLOCK, CARRIAGE_TOP, BLOCK_H, P, 3, 0.5), { tone: "hi", crease: "lo" }),
    L(k.planOutline(k.insetPlan(BLOCK, 2), CARRIAGE_TOP + BLOCK_H, P, 3), { tone: "faint" }),
  ];
  const HANDLE = [CARRIAGE.x + CARRIAGE.w - 8, CARRIAGE.y + CARRIAGE.d + 3];
  carriage.push(S(k.slabOf({ x: HANDLE[0] - 2, y: CARRIAGE.y + CARRIAGE.d - 1, w: 4, d: 4, r: 1 }, CARRIAGE_Z + 1, 3, P, 2), { tone: "mid", crease: "none" }));
  carriage.push(S(k.cylinder(HANDLE[0], HANDLE[1] + 1, 3, CARRIAGE_Z, 5, P, 20), { tone: "mid" }));
  carriage.push(L(k.knurl(HANDLE[0], HANDLE[1] + 1, 3, CARRIAGE_Z, CARRIAGE_Z + 5, 18, P), { tone: "lo" }));
  const MEASURE = DIAL[0] - (BLOCK.x + BLOCK.w / 2);
  const AWAY = 38;
  out.push(part("carriage", carriage.join(""), ` transform="${k.translateAlong(P, [AWAY, 0, 0])}"`));

  const plunger = [
    S(k.cylinder(DIAL[0], DIAL[1], 2.6, 0, 2.4, P, 20), { tone: "hi", lit: true }),
    S(k.cylinder(DIAL[0], DIAL[1], 1.4, 2.4, 50, P, 16), { tone: "hi", crease: "none", lit: true }),
  ];
  out.push(part("plunger", plunger.join(""), ` transform="${k.translateAlong(P, [0, 0, CARRIAGE_TOP])}"`));
  const [x, y] = DIAL;
  out.push(S(k.cylinder(x, y, 2.9, 54, DIAL_Z - 54, P, 20), { tone: "mid" }));
  out.push(L(k.sideArc(x, y, 2.9, 60, P, 12), { tone: "lo" }));
  out.push(S(k.slabOf({ x: x - DIAL_R - 6, y: -4, w: 8, d: 8, r: 1.5 }, DIAL_Z + 2, CLAMP_Z - DIAL_Z - 2, P, 3, 0.4), { tone: "mid" }));
  out.push(dialFace(DIAL, DIAL_R, DIAL_Z, 10, 50, 5));
  // The mark every pass should land on.
  const PER_TURN = 28;
  const markAngle = (BLOCK_H / PER_TURN) * Math.PI * 2;
  const mark = (r) => [x + Math.sin(markAngle) * r, y - Math.cos(markAngle) * r];
  out.push(L(k.lineOnTop(mark(DIAL_R - 2.4), mark(DIAL_R - 7), DIAL_TOP, P), { tone: "hi" }));
  out.push(S(k.slabOf({ x: x + DIAL_R - 1, y: -2.4, w: 5, d: 4.8, r: 1.2 }, DIAL_Z + 2, 5, P, 3), { tone: "mid" }));
  out.push(needleSvg("needle", DIAL, DIAL_TOP + 0.2, DIAL_R - 4));
  out.push(lampBar("pass", [-98, -84, -70, -56, -42], 44, () => true));
  return {
    id: "tests",
    label:
      "A dial indicator over a sliding carriage. The carriage brings the same gauge block under the plunger five times, the needle lands on the same mark every time, and a tally of five lamps turns green, one per pass.",
    body: out.join(""),
    rig: {
      away: AWAY,
      measure: MEASURE,
      carriageTop: CARRIAGE_TOP,
      blockH: BLOCK_H,
      // Carriage positions where the block's leading edge passes under the plunger tip.
      riseFrom: DIAL[0] - 2.6 - (BLOCK.x + BLOCK.w),
      riseTo: DIAL[0] + 2.6 - (BLOCK.x + BLOCK.w),
      perTurn: PER_TURN,
      needle: { center: screen([x, y, DIAL_TOP + 0.2]), radius: DIAL_R - 4 },
    },
  };
}

const figures = [interfaces(), agents(), devTools(), apis(), tests()];

const source = `// Generated by scripts/hero-figures/build.mjs with the Anatomy kit (MIT). Do not edit.
/* eslint-disable */

// Screen offset, in viewBox units, of one world unit along each axis.
export const BENCH_AXES = ${JSON.stringify(axes)} as const;

export const BENCH_VIEWBOX = "0 0 ${WIDTH} ${HEIGHT}";

// The plate stays put; only the machine on it changes.
export const BENCH_PLATE = ${JSON.stringify(plate())};

export const BENCH_FIGURES = ${JSON.stringify(figures, null, 2)} as const;
`;
writeFileSync(OUT, source);
console.log("wrote", OUT, `${Math.round(source.length / 1024)} KB`);
