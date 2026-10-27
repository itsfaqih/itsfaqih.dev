import { useEffect, useEffectEvent, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { Guideline } from "../../data/guidelines";
import { useMediaQuery } from "../../hooks/use-media-query";
import { colorOf, RULE_OPEN, ruleNumber, RuleThumb } from "./rule-art";

// The home page's Rule of Thumb deck: cards fanned in 3D around the one in focus. Its whole state is
// one number, the index at the centre, so a drag can rest between cards and a release springs on
// from wherever the cards are. CSS turns each card's offset from that number into its pose.

/** Card widths a drag travels per card, the same spacing the spread uses (see .spread-slot). */
const STEP = 0.68;
/** Past either end, the deck follows the pointer at this fraction of the overshoot. */
const RUBBER = 0.35;
const STIFFNESS = 140;
const DAMPING = 2 * Math.sqrt(STIFFNESS) * 0.82;
/** A release projects this far ahead along its velocity before picking the nearest card. */
const PROJECT_S = 0.12;
/** A drag this long always moves at least one card, however slowly it was let go. */
const FLICK_PX = 30;
const DRAG_START_PX = 6;
const HIDDEN_AT = 2.95;
const WHEEL_SETTLE_MS = 120;

type Grab = { x: number; position: number; unit: number; samples: { x: number; t: number }[]; dragging: boolean };

export function RuleSpread({ rules }: { rules: Guideline[] }) {
  const last = rules.length - 1;
  const [initial] = useState(() => Math.floor(last / 2));
  const [active, setActive] = useState(initial);
  const [opening, setOpening] = useState<string | null>(null);
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
      // Three steps out the card has faded away; hidden, it stops catching clicks and focus.
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
    <div className="spread" style={{ "--c": colorOf(rule.label) }}>
      <div
        ref={stageRef}
        className="spread-stage"
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
            className="spread-slot"
            style={{
              "--d": index - initial,
              "--ad": Math.abs(index - initial),
              zIndex: 10 - Math.abs(index - initial),
            }}
          >
            <Link
              to={item.href}
              className="spread-card"
              data-cut
              data-opening={opening === item.id ? "" : undefined}
              draggable={false}
              aria-current={index === active ? "true" : undefined}
              style={{ "--c": colorOf(item.label) }}
              viewTransition={reduced ? undefined : { types: [RULE_OPEN] }}
              onClick={() => setOpening(item.id)}
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) goTo(index);
              }}
            >
              <span className="n">
                <span>No.{ruleNumber(item)}</span>
                <span>{item.interactive ? "▶ DEMO" : "ARTICLE"}</span>
              </span>
              <RuleThumb rule={item} play={index === active} />
              <span className="t">{item.title}</span>
              <span className="s">{item.description}</span>
              <span className="f">
                <span>{item.label}</span>
                <span aria-hidden="true">↗</span>
              </span>
            </Link>
          </div>
        ))}
      </div>
      <div className="spread-nav" data-cut>
        <span className="sr-only" aria-live="polite">
          {rule.title}
        </span>
        <button type="button" aria-label="Previous rule" disabled={active === 0} onClick={() => goTo(active - 1)}>
          ←
        </button>
        <span>
          <SlideNumber value={active + 1} /> / {String(rules.length).padStart(2, "0")}
        </span>
        <button type="button" aria-label="Next rule" disabled={active === last} onClick={() => goTo(active + 1)}>
          →
        </button>
      </div>
    </div>
  );
}

/** A two-digit count whose digits slide in the direction it moved: up when it grows. */
function SlideNumber({ value }: { value: number }) {
  const [shown, setShown] = useState({ value, previous: value });
  if (shown.value !== value) setShown({ value, previous: shown.value });
  const pad = (number: number) => String(number).padStart(2, "0");
  return (
    <span className="slide-num" data-dir={shown.value < shown.previous ? "down" : "up"}>
      {shown.previous !== shown.value && (
        <span key={`${shown.previous}-${shown.value}`} className="was" aria-hidden="true">
          {pad(shown.previous)}
        </span>
      )}
      <span key={shown.value}>{pad(shown.value)}</span>
    </span>
  );
}
