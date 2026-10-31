import * as stylex from "@stylexjs/stylex";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { SLIDES } from "../../../data/home";
import { useMediaQuery } from "../../../hooks/use-media-query";
import { cursors, fonts, motion, palette } from "../../../theme.stylex";
import { heroType } from "../hero-type";
import { HeroPrints, SCENE_LEAD_MS, SLIDE_MS } from "./hero-prints";
import { button, buttonVariant } from "../../../components/button";
import { veil } from "../section";
import { loadIn } from "../../../components/load-in";

// The home hero: the headline cycles through what I build, and the bench beside it shows each in
// print. The slides advance on a timer once the intro hands off; the pips jump, the button pauses.
export function Hero({ introDone }: { introDone: boolean }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [slide, setSlide] = useState({ index: 0, run: 0, lead: 0 });
  const [pausedByUser, setPausedByUser] = useState<boolean | null>(null);

  const runRef = useRef(0);
  const remainingRef = useRef(SLIDE_MS);

  const userPaused = pausedByUser ?? reduced;
  const current = SLIDES[slide.index]!;

  const go = (index: number) => {
    runRef.current += 1;
    const lead = reduced ? 0 : SCENE_LEAD_MS;
    remainingRef.current = SLIDE_MS + lead;
    setSlide({ index, run: runRef.current, lead });
  };

  useEffect(() => {
    const requested = Number(new URLSearchParams(location.search).get("slide"));
    if (requested > 0 && requested < SLIDES.length) go(requested);
  }, []);

  const advance = useEffectEvent(() => go((slide.index + 1) % SLIDES.length));
  useEffect(() => {
    if (!introDone || userPaused) return;
    const run = slide.run;
    const armedAt = performance.now();
    const timer = setTimeout(advance, remainingRef.current);
    return () => {
      clearTimeout(timer);
      if (runRef.current === run) remainingRef.current -= performance.now() - armedAt;
    };
  }, [introDone, userPaused, slide.run]);

  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(veil.soft)}>
        <div {...stylex.props(loadIn.veil, veil.dense, heroType.tag)} data-cut>
          <span {...stylex.props(loadIn.piece, loadIn.words)} data-cut>
            Full-stack engineer · Indonesia
          </span>
        </div>
        <h1 data-cut {...stylex.props(loadIn.piece, heroType.title, styles.title)}>
          <span {...stylex.props(styles.line)}>I build</span>
          <span {...stylex.props(styles.phrases)}>
            {SLIDES.map((item, index) => {
              const on = index === slide.index;
              return (
                <span
                  key={item.tab}
                  {...stylex.props(
                    styles.phrase,
                    on && styles.phraseOn,
                    on && introDone && slide.run > 0 && styles.slash,
                  )}
                  style={{ "--c": item.color }}
                  aria-hidden={on ? undefined : true}
                >
                  <span {...stylex.props(styles.line, styles.nowrap)}>{item.phrase}</span>
                  <span {...stylex.props(styles.line)}>
                    <span {...stylex.props(heroType.hl)}>{item.highlight}</span>.
                  </span>
                </span>
              );
            })}
          </span>
        </h1>
        <p {...stylex.props(loadIn.piece, heroType.lead)} data-cut>
          I'm Faqih, a full-stack engineer with 5+ years on web products: frontends, backends, and
          lately the agent tooling around them. Right now I'm building healthcare software at{" "}
          <a
            {...stylex.props(styles.leadLink)}
            href="https://evidence.care"
            target="_blank"
            rel="noopener noreferrer"
          >
            EvidenceCare
          </a>
          .
        </p>
        <div {...stylex.props(heroType.acts)}>
          <a
            {...stylex.props(loadIn.piece, button.base, buttonVariant["primary-brand"], styles.go)}
            href="#contact"
            data-cut
            style={{ "--c": current.color }}
          >
            Connect with me
          </a>
          <a {...stylex.props(loadIn.piece, styles.cue)} href="#rules" data-cut>
            <span {...stylex.props(styles.mouse)} aria-hidden="true">
              <span {...stylex.props(styles.wheel)} />
            </span>
            Scroll down
          </a>
        </div>
      </div>

      <div {...stylex.props(loadIn.piece, styles.bench)} data-cut style={{ "--c": current.color }}>
        <HeroPrints
          index={slide.index}
          restartKey={slide.run}
          playing={introDone}
          held={userPaused}
        />
        <div {...stylex.props(styles.controls)}>
          <div {...stylex.props(styles.pips)} role="group" aria-label="What I build">
            {SLIDES.map((item, index) => {
              const on = index === slide.index;
              return (
                <button
                  key={item.tab}
                  type="button"
                  {...stylex.props(styles.pip, stylex.defaultMarker())}
                  aria-label={item.tab}
                  aria-pressed={on}
                  style={{
                    "--c": item.color,
                    "--ms": `${SLIDE_MS + (on ? slide.lead : 0)}ms`,
                  }}
                  onClick={() => go(index)}
                >
                  <i
                    key={on ? slide.run : "idle"}
                    {...stylex.props(
                      styles.bar,
                      on && styles.barOn,
                      on && userPaused && styles.barHeld,
                    )}
                  />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            {...stylex.props(styles.pause)}
            aria-label={userPaused ? "Play" : "Pause"}
            onClick={() => setPausedByUser(!userPaused)}
          >
            <span aria-hidden="true" {...stylex.props(styles.glyph, !userPaused && styles.glyphOff)}>
              ▶
            </span>
            <span aria-hidden="true" {...stylex.props(styles.glyph, userPaused && styles.glyphOff)}>
              ❚❚
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

const STACKED = "@media (max-width: 960px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const FOCUS_RING = `3px solid ${palette["--focus"]}`;
// The leaving phrase stays visible until its fade ends.
const PHRASE_OUT = "160ms";

const slash = stylex.keyframes({
  "0%": { clipPath: "polygon(0 0,0 0,-20% 100%,-20% 100%)", transform: "translate(-16px)" },
  to: { clipPath: "polygon(0 0,120% 0,100% 100%,-20% 100%)" },
});
const scrollWheel = stylex.keyframes({
  "0%": {
    opacity: 0,
    animationTimingFunction: "cubic-bezier(.19,1,.22,1)",
    transform: "translateY(-3px)",
  },
  "15%": {
    opacity: 1,
    animationTimingFunction: "cubic-bezier(.645,.045,.355,1)",
    transform: "none",
  },
  "60%, to": { opacity: 0, transform: "translateY(10px)" },
});
const prog = stylex.keyframes({ to: { transform: "scaleX(1)" } });

const styles = stylex.create({
  root: {
    display: "grid",
    gridTemplateColumns: { default: "1fr 1.05fr", [STACKED]: "1fr" },
    gap: { default: "48px", [STACKED]: "28px" },
    alignItems: "center",
    paddingTop: { default: "38px", [STACKED]: "24px" },
    paddingInline: 0,
    paddingBottom: "80px",
  },
  // Three lines: "I build" / the phrase / the highlight. The phrase line never wraps, so the size
  // follows the column to fit the longest one, "agentic setups that" at 12.2em: two columns share
  // (100vw - 112px) at 1 : 1.05 up to the 1200px wrap; one column is 100vw - 36px.
  title: {
    fontSize: {
      default: "clamp(28px, 3.9vw - 5px, 43px)",
      [STACKED]: "clamp(26px, 8vw - 4px, 44px)",
    },
  },
  line: {
    display: "block",
  },
  nowrap: {
    whiteSpace: "nowrap",
  },
  // Every phrase sits in the same grid cell, so the headline keeps the height of the longest one.
  phrases: {
    display: "grid",
  },
  phrase: {
    gridArea: "1 / 1",
    opacity: 0,
    visibility: "hidden",
    transitionProperty: "opacity, visibility",
    transitionDuration: `${PHRASE_OUT}, 0s`,
    transitionTimingFunction: "ease, ease",
    transitionDelay: `0s, ${PHRASE_OUT}`,
    transitionBehavior: "normal, normal",
  },
  phraseOn: {
    opacity: 1,
    visibility: "visible",
    transitionProperty: "opacity",
    transitionDuration: "120ms",
    transitionTimingFunction: "ease",
    transitionDelay: "0s",
    transitionBehavior: "normal",
  },
  // Later phrases slash in; the first arrives with the headline's glitch.
  slash: {
    animationName: slash,
    animationDuration: "520ms",
    animationTimingFunction: motion["--cut"],
  },
  leadLink: {
    color: palette["--text"],
    textDecorationLine: "underline",
    textDecorationColor: {
      default: palette["--hair"],
      ":hover": { default: null, [HOVER]: palette["--go-ink"] },
      ":active": palette["--go-ink"],
    },
    textUnderlineOffset: "4px",
    transitionProperty: "text-decoration-color",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-fast"] },
      ":active": motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--fast"] },
      ":active": motion["--fast"],
    },
  },
  // The button wears the slide's hue. The hue eases slower than a hover would, so hover moves to a
  // brightness filter on its own quick timing.
  go: {
    "--key": "color-mix(in oklab, var(--c) 70%, #000)",
    backgroundColor: "var(--c)",
    filter: { default: null, ":hover": { default: null, [HOVER]: "brightness(1.08)" } },
    transitionProperty: "transform, background-color, box-shadow, filter",
    transitionDuration: "150ms, 280ms, 280ms, 120ms",
    transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94), ease, ease, ease",
    transitionDelay: "0s, 0s, 0s, 0s",
    transitionBehavior: "normal, normal, normal, normal",
  },
  // A mouse whose wheel rolls down, rests, and rolls again, on the button row at button height.
  // The loop rides on the wheel, since [data-cut] owns the link's animation.
  cue: {
    userSelect: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    height: "48px",
    marginLeft: "12px",
    paddingBlock: 0,
    paddingInline: "6px",
    borderRadius: "12px",
    font: `700 14px ${fonts["--display"]}`,
    color: {
      default: palette["--dim"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
    textDecorationLine: "none",
    cursor: cursors["--cursor-point"],
    transitionProperty: "color",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-fast"] },
      ":active": motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--fast"] },
      ":active": motion["--fast"],
    },
    outline: { default: null, ":focus-visible": FOCUS_RING },
    outlineOffset: { default: null, ":focus-visible": "3px" },
  },
  mouse: {
    position: "relative",
    flex: "none",
    width: "22px",
    height: "34px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "currentcolor",
    borderRadius: "11px",
  },
  wheel: {
    position: "absolute",
    top: "6px",
    left: "50%",
    width: "4px",
    height: "7px",
    marginLeft: "-2px",
    borderRadius: "2px",
    backgroundColor: palette["--go-ink"],
    animationName: { default: scrollWheel, [REDUCE]: "none" },
    animationDuration: "1.8s",
    animationIterationCount: "infinite",
  },
  bench: {
    display: "grid",
    gap: "12px",
    justifyItems: "center",
  },
  // Above the tilted card, whose art may swing out past its edges.
  controls: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  pips: {
    display: "flex",
    gap: "2px",
  },
  pip: {
    display: "grid",
    alignItems: "center",
    width: "36px",
    height: "32px",
    paddingBlock: 0,
    paddingInline: "4px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    backgroundColor: "transparent",
    backgroundImage: "none",
    backgroundPosition: "0 0",
    cursor: cursors["--cursor-point"],
    outline: { default: null, ":focus-visible": FOCUS_RING },
    outlineOffset: { default: null, ":focus-visible": "3px" },
  },
  bar: {
    display: "block",
    height: "4px",
    borderRadius: "2px",
    backgroundColor: {
      default: palette["--hair"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: palette["--mute"] },
    },
    overflow: "hidden",
    transitionProperty: "background-color",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: motion["--fast"] },
    },
  },
  // The current slide's bar fills over its run; --ms is the run's length.
  barOn: {
    backgroundColor: `color-mix(in oklab, var(--c) 30%, ${palette["--hair"]})`,
    "::after": {
      content: '""',
      display: "block",
      height: "100%",
      backgroundColor: "var(--c)",
      transform: "scaleX(0)",
      transformOrigin: "left",
      animationName: prog,
      animationDuration: "var(--ms)",
      animationTimingFunction: "linear",
      animationFillMode: "forwards",
    },
  },
  barHeld: {
    "::after": {
      animationPlayState: "paused !important",
    },
  },
  pause: {
    width: "30px",
    height: "28px",
    display: "grid",
    placeItems: "center",
    font: `500 10px ${fonts["--display"]}`,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    backgroundColor: palette["--panel-2"],
    color: palette["--text"],
    borderRadius: "999px",
    cursor: cursors["--cursor-point"],
    flex: "none",
    outline: { default: null, ":focus-visible": FOCUS_RING },
    outlineOffset: { default: null, ":focus-visible": "3px" },
  },
  // Play and pause share one cell and cross-fade: the arriving glyph on the fast tier, the leaving
  // one on its quicker exit, so the slot never resizes.
  glyph: {
    gridArea: "1 / 1",
    transitionProperty: "opacity, transform, filter",
    transitionDuration: motion["--t-fast"],
    transitionTimingFunction: "ease-out",
  },
  glyphOff: {
    opacity: 0,
    transform: { default: "scale(0.6)", [REDUCE]: "none" },
    filter: "blur(4px)",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: "ease-in",
  },
});
