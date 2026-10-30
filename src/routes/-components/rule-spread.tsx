import * as stylex from "@stylexjs/stylex";
import { useEffect, useEffectEvent, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { colorOf, ruleNumber } from "../../data/guidelines";
import type { PublishedGuideline } from "../../data/guidelines";
import { useMediaQuery } from "../../hooks/use-media-query";
import { RuleThumb, useRuleOpen } from "./rule-art";
import { cursors, fonts, motion, palette } from "../../theme.stylex";
import { veil } from "./section";
import { loadIn } from "../../components/load-in";
import { arcade } from "../../components/arcade";

const STEP = 0.68;
const RUBBER = 0.35;
const STIFFNESS = 140;
const DAMPING = 2 * Math.sqrt(STIFFNESS) * 0.82;
const PROJECT_S = 0.12;
const FLICK_PX = 30;
const DRAG_START_PX = 6;
const HIDDEN_AT = 2.95;
const WHEEL_SETTLE_MS = 120;

type Grab = { x: number; position: number; unit: number; samples: { x: number; t: number }[]; dragging: boolean };

export function RuleSpread({ rules }: { rules: PublishedGuideline[] }) {
  const last = rules.length - 1;
  const [initial] = useState(() => Math.floor(last / 2));
  const [active, setActive] = useState(initial);
  const { linkProps: openRule } = useRuleOpen();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const stageRef = useRef<HTMLDivElement>(null);
  const slots = useRef<HTMLDivElement[]>([]);
  const deck = useRef({ position: initial, velocity: 0, target: initial, frame: 0, wheelTimer: 0, justDragged: false });
  const grab = useRef<Grab | null>(null);
  const clamp = (index: number) => Math.max(0, Math.min(last, index));

  const paint = () => {
    const { position } = deck.current;
    slots.current.forEach((slot, index) => {
      const offset = index - position;
      slot.style.setProperty("--d", offset.toFixed(4));
      slot.style.setProperty("--ad", Math.abs(offset).toFixed(4));
      slot.style.zIndex = String(10 - Math.round(Math.abs(offset)));
      slot.style.visibility = Math.abs(offset) > HIDDEN_AT ? "hidden" : "";
    });
    setActive(clamp(Math.round(position)));
  };

  const settle = () => {
    const state = deck.current;
    cancelAnimationFrame(state.frame);
    if (reduced) {
      state.position = state.target;
      state.velocity = 0;
      paint();
      return;
    }
    let then = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - then) / 1000);
      then = now;
      state.velocity += ((state.target - state.position) * STIFFNESS - state.velocity * DAMPING) * dt;
      state.position += state.velocity * dt;
      const atRest = Math.abs(state.target - state.position) < 0.001 && Math.abs(state.velocity) < 0.01;
      if (atRest) {
        state.position = state.target;
        state.velocity = 0;
      }
      paint();
      if (!atRest) state.frame = requestAnimationFrame(tick);
    };
    state.frame = requestAnimationFrame(tick);
  };

  const goTo = (index: number) => {
    deck.current.target = clamp(index);
    settle();
  };

  const cardUnit = () => (slots.current[0]?.offsetWidth ?? 300) * STEP;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    cancelAnimationFrame(deck.current.frame);
    deck.current.justDragged = false;
    const t = performance.now();
    grab.current = {
      x: event.clientX,
      position: deck.current.position,
      unit: cardUnit(),
      samples: [{ x: event.clientX, t }],
      dragging: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = grab.current;
    if (!current) return;
    const dx = event.clientX - current.x;
    if (!current.dragging) {
      if (Math.abs(dx) < DRAG_START_PX) return;
      current.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "";
    }
    let position = current.position - dx / current.unit;
    if (position < 0) position *= RUBBER;
    if (position > last) position = last + (position - last) * RUBBER;
    deck.current.position = position;
    const t = performance.now();
    current.samples = [...current.samples.filter((sample) => t - sample.t < 100), { x: event.clientX, t }];
    paint();
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = grab.current;
    grab.current = null;
    if (!current) return;
    if (!current.dragging) {
      settle();
      return;
    }
    delete event.currentTarget.dataset.dragging;
    const first = current.samples[0]!;
    const seconds = Math.max(0.016, (performance.now() - first.t) / 1000);
    const velocity = -((event.clientX - first.x) / seconds) / current.unit;
    const state = deck.current;
    const from = clamp(Math.round(current.position));
    const dx = event.clientX - current.x;
    let target = clamp(Math.round(state.position + velocity * PROJECT_S));
    if (target === from && Math.abs(dx) > FLICK_PX) target = clamp(from - Math.sign(dx));
    state.velocity = velocity;
    state.justDragged = true;
    goTo(target);
  };

  const onWheel = useEffectEvent((event: WheelEvent) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    const state = deck.current;
    cancelAnimationFrame(state.frame);
    state.velocity = 0;
    const moved = state.position + event.deltaX / cardUnit();
    state.position = Math.max(-RUBBER, Math.min(last + RUBBER, moved));
    paint();
    clearTimeout(state.wheelTimer);
    state.wheelTimer = window.setTimeout(() => goTo(Math.round(state.position)), WHEEL_SETTLE_MS);
  });

  // React's onWheel is passive, and stopping the page from scrolling sideways needs preventDefault.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const state = deck.current;
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      clearTimeout(state.wheelTimer);
      cancelAnimationFrame(state.frame);
    };
  }, []);

  const rule = rules[active]!;
  return (
    <div {...stylex.props(styles.spread)} style={{ "--c": colorOf(rule.label) }}>
      <div
        ref={stageRef}
        {...stylex.props(styles.stage)}
        role="group"
        aria-roledescription="carousel"
        aria-label="Rules. Drag, scroll sideways, or use the left and right arrow keys."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(event) => {
          if (!deck.current.justDragged) return;
          deck.current.justDragged = false;
          event.preventDefault();
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          const move = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
          if (move === undefined) return;
          event.preventDefault();
          goTo(deck.current.target + move);
        }}
      >
        {rules.map((item, index) => (
          <div
            key={item.id}
            ref={(slot) => {
              if (slot) slots.current[index] = slot;
            }}
            {...stylex.props(styles.slot)}
            style={{
              "--d": index - initial,
              "--ad": Math.abs(index - initial),
              zIndex: 10 - Math.abs(index - initial),
            }}
          >
            <Link
              to={item.href}
              {...stylex.props(loadIn.piece, styles.card)}
              data-cut
              draggable={false}
              aria-current={index === active ? "true" : undefined}
              style={{ "--c": colorOf(item.label) }}
              {...openRule(item)}
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) goTo(index);
              }}
            >
              <span {...stylex.props(styles.plate)}>
                <span>No.{ruleNumber(item)}</span>
                <span>{item.interactive ? "▶ DEMO" : "ARTICLE"}</span>
              </span>
              <RuleThumb rule={item} play={index === active} style={styles.thumb} />
              {/* .t names the title for the rule-open view transition in arcade.css. */}
              <span className={`t ${stylex.props(styles.title).className}`}>{item.title}</span>
              <span {...stylex.props(styles.summary)}>{item.description}</span>
              <span {...stylex.props(styles.plate, styles.foot)}>
                <span>{item.label}</span>
                <span {...stylex.props(styles.arrow)} aria-hidden="true">
                  ↗
                </span>
              </span>
            </Link>
          </div>
        ))}
      </div>
      <div {...stylex.props(styles.nav)}>
        <span {...stylex.props(arcade.srOnly)} aria-live="polite">
          {rule.title}
        </span>
        <button
          type="button"
          {...stylex.props(loadIn.piece, styles.step)}
          data-cut
          aria-label="Previous rule"
          disabled={active === 0}
          onClick={() => goTo(active - 1)}
        >
          ←
        </button>
        <span {...stylex.props(loadIn.veil, veil.dense)} data-cut>
          <span {...stylex.props(loadIn.piece, loadIn.words)} data-cut>
            <SlideNumber value={active + 1} /> / {pad(rules.length)}
          </span>
        </span>
        <button
          type="button"
          {...stylex.props(loadIn.piece, styles.step)}
          data-cut
          aria-label="Next rule"
          disabled={active === last}
          onClick={() => goTo(active + 1)}
        >
          →
        </button>
      </div>
    </div>
  );
}

const pad = (number: number) => String(number).padStart(2, "0");

function SlideNumber({ value }: { value: number }) {
  const [shown, setShown] = useState({ value, previous: value });
  if (shown.value !== value) setShown({ value, previous: shown.value });
  return (
    <span {...stylex.props(number.root)} data-dir={shown.value < shown.previous ? "down" : "up"}>
      {shown.previous !== shown.value && (
        <span
          key={`${shown.previous}-${shown.value}`}
          {...stylex.props(number.digits, number.was)}
          aria-hidden="true"
        >
          {pad(shown.previous)}
        </span>
      )}
      <span key={shown.value} {...stylex.props(number.digits, shown.previous !== shown.value && number.now)}>
        {pad(shown.value)}
      </span>
    </span>
  );
}

const STACKED = "@media (max-width: 960px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
// A press or hover counts only while the deck is not being dragged.
const STILL = ":not([data-dragging] *)";
const INK = `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`;

/*
 * The cards share one grid cell and take their pose from --d, the card's offset from the centre,
 * and --ad, its distance. Per step from the centre a card moves 68% of its width sideways, 10px
 * down and 92px back, turns 13deg toward the centre, tilts 2.5deg, and fades 20%, gone by the
 * third step. The glow behind the deck takes the centred card's hue.
 */
const styles = stylex.create({
  // --glow is registered in arcade.css, so it can ease between hues.
  spread: {
    "--glow": "var(--c)",
    transitionProperty: "--glow",
    transitionDuration: "600ms",
    transitionTimingFunction: "ease",
  },
  stage: {
    position: "relative",
    display: "grid",
    justifyItems: "center",
    paddingTop: "20px",
    paddingInline: 0,
    paddingBottom: "48px",
    // Out to the screen edge, so the neighbours peek in from it instead of stopping at the gutter.
    marginInline: { default: null, [STACKED]: "-18px" },
    perspective: "1400px",
    overflowX: "clip",
    touchAction: "pan-y",
    cursor: { default: cursors["--cursor-grab"], ":is([data-dragging])": cursors["--cursor-grabbing"] },
    userSelect: "none",
    "::before": {
      content: '""',
      position: "absolute",
      inset: "0 8%",
      backgroundImage: "radial-gradient(closest-side, color-mix(in srgb, var(--glow) 18%, transparent), transparent)",
      pointerEvents: "none",
    },
  },
  slot: {
    gridArea: "1 / 1",
    display: "grid",
    width: "min(300px, 66vw)",
    transform:
      "translateX(calc(var(--d) * 68%)) translateY(calc(var(--ad) * 10px)) translateZ(calc(var(--ad) * -92px)) rotateY(calc(var(--d) * -13deg)) rotateZ(calc(var(--d) * 2.5deg))",
  },
  // A [data-cut] piece: its states key on pseudo-classes, so its class list never changes and the
  // cut-in's .in survives a re-render.
  card: {
    "--key": `color-mix(in oklab, var(--c) ${palette["--key-mix"]}, #000)`,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingTop: "14px",
    paddingInline: "14px",
    paddingBottom: "16px",
    borderRadius: "22px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "var(--c)",
    boxShadow: {
      default: `${palette["--raise"]}, 0 6px 0 var(--key)`,
      [`:active${STILL}`]: `${palette["--raise"]}, 0 3px 0 var(--key)`,
    },
    translate: { default: null, [`:active${STILL}`]: "0 3px" },
    color: palette["--text"],
    textDecoration: "none",
    WebkitUserDrag: "none",
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "4px" },
    transitionProperty: "translate, box-shadow",
    transitionDuration: "100ms, 100ms",
    transitionTimingFunction: "ease, ease",
    transitionDelay: "0s, 0s",
    transitionBehavior: "normal, normal",
    // Cards fade into the page under a cover of its colour rather than going see-through, so a
    // card behind never shows through the one in front. With reduced motion the deck jumps to the
    // chosen card, and only the fade eases.
    "::after": {
      content: '""',
      position: "absolute",
      inset: "-3px -3px -9px",
      borderRadius: "24px",
      backgroundColor: palette["--bg"],
      opacity: "clamp(0, var(--ad) * 0.2 + max(0, var(--ad) - 2) * 0.4, 1)",
      pointerEvents: "none",
      transitionProperty: { default: null, [REDUCE]: "opacity" },
      transitionDuration: { default: null, [REDUCE]: "200ms" },
      transitionTimingFunction: { default: null, [REDUCE]: "ease" },
    },
  },
  plate: {
    display: "flex",
    justifyContent: "space-between",
    paddingBlock: 0,
    paddingInline: "2px",
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: INK,
  },
  foot: {
    marginTop: "auto",
    fontWeight: 500,
    color: palette["--mute"],
  },
  arrow: {
    fontSize: "15px",
    lineHeight: "11px",
    color: INK,
    translate: {
      default: null,
      "@media (hover: hover)": { default: null, [`:is(:hover > * > *)${STILL}`]: "2px -2px" },
    },
    transitionProperty: "translate",
    transitionDuration: "150ms",
    transitionTimingFunction: motion["--out"],
  },
  thumb: {
    borderRadius: "14px",
  },
  title: {
    paddingBlock: 0,
    paddingInline: "2px",
    fontWeight: 900,
    fontSize: "20px",
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
  },
  // A fixed two-line slot, so every card in the deck keeps one height.
  summary: {
    height: "3em",
    marginTop: "-9px",
    paddingBlock: 0,
    paddingInline: "2px",
    fontSize: "13px",
    lineHeight: 1.5,
    color: palette["--dim"],
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
  },
  nav: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    fontVariantNumeric: "tabular-nums",
    color: palette["--dim"],
  },
  step: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: { default: palette["--hair"], ":hover:not(:disabled)": palette["--hair-hover"] },
    // Disabled at either end, the key goes gray and flat rather than see-through.
    backgroundColor: { default: palette["--panel"], ":disabled": palette["--panel-2"] },
    color: { default: palette["--text"], ":disabled": palette["--mute"] },
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    // The nav's tabular figures are for the count, not the arrows.
    fontVariantNumeric: "normal",
    boxShadow: {
      default: `${palette["--raise"]}, 0 3px 0 ${palette["--drop-ink"]}`,
      ":active:not(:disabled)": `${palette["--raise"]}, 0 1px 0 ${palette["--drop-ink"]}`,
      ":disabled": `0 3px 0 ${palette["--drop-ink"]}`,
    },
    transform: { default: null, ":active:not(:disabled)": "translateY(2px)" },
    cursor: { default: cursors["--cursor-point"], ":disabled": cursors["--cursor-forbid"] },
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "2px" },
    transitionProperty: "transform, box-shadow, border-color, background-color, color",
    transitionDuration: "100ms, 100ms, 120ms, 120ms, 120ms",
    transitionTimingFunction: "ease, ease, ease, ease, ease",
    transitionDelay: "0s, 0s, 0s, 0s, 0s",
    transitionBehavior: "normal, normal, normal, normal, normal",
  },
});

const numIn = stylex.keyframes({
  from: { translate: "0 var(--num-from, 100%)", opacity: 0 },
});

const numOut = stylex.keyframes({
  to: { translate: "0 var(--num-to, -100%)", opacity: 0 },
});

// The count's new digits slide in from the side it moved toward while the old ones leave.
const number = stylex.create({
  root: {
    "--num-from": {
      default: null,
      ':is([data-dir="down"])': "-100%",
      [REDUCE]: { default: null, ':not([data-dir="down"])': "0" },
    },
    "--num-to": {
      default: null,
      ':is([data-dir="down"])': "100%",
      [REDUCE]: { default: null, ':not([data-dir="down"])': "0" },
    },
    display: "inline-grid",
    overflow: "clip",
    verticalAlign: "bottom",
  },
  digits: {
    gridArea: "1 / 1",
  },
  was: {
    animationName: numOut,
    animationDuration: "180ms",
    animationTimingFunction: motion["--out"],
    animationFillMode: "forwards",
  },
  now: {
    animationName: numIn,
    animationDuration: "220ms",
    animationTimingFunction: motion["--out"],
    animationFillMode: "backwards",
  },
});
