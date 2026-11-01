import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { SLIDES } from "../../data/home";
import { cursors, fonts, motion, palette } from "../../theme.stylex";

const SKIP_GRACE_MS = 1200;

// The home intro: the name slams in, cuts flash through what I build, then the shutters split.
// It plays once per session; the html script in __root.tsx sets .no-intro whenever it shouldn't.
// The effect drives it with classes on the root: .play starts the run, .out ends it.
export function Intro({ onDone }: { onDone: (introDone: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const element = ref.current;
    const html = document.documentElement;
    if (!element || html.classList.contains("no-intro")) {
      setGone(true);
      onDone(true);
      return;
    }

    const openedAt = performance.now();
    let removeTimer = 0;
    const finish = () => {
      if (element.classList.contains("out")) return;
      element.classList.add("out");
      html.classList.add("no-intro");
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {}
      onDone(true);
      removeTimer = window.setTimeout(() => setGone(true), 700);
    };
    const skip = () => {
      if (performance.now() - openedAt > SKIP_GRACE_MS) finish();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["Escape", "Enter", " "].includes(event.key)) skip();
    };
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target === element) finish();
    };

    element.addEventListener("animationend", onAnimationEnd);
    element.addEventListener("click", skip);
    addEventListener("keydown", onKeyDown);
    element.classList.add("play");
    return () => {
      element.removeEventListener("animationend", onAnimationEnd);
      element.removeEventListener("click", skip);
      removeEventListener("keydown", onKeyDown);
      clearTimeout(removeTimer);
    };
  }, [onDone]);

  if (gone) return null;

  return (
    <div ref={ref} {...stylex.props(styles.root, stylex.defaultMarker())} aria-hidden="true">
      <div {...stylex.props(styles.shutter, styles.top)} />
      <div {...stylex.props(styles.shutter, styles.bottom)} />
      <div {...stylex.props(styles.stage)}>
        <div {...stylex.props(styles.name)}>FAQIH MUNTASHIR</div>
        <div {...stylex.props(styles.slot)}>
          {SLIDES.slice(0, 4).map(({ tab, color }, index, words) => (
            <span
              key={tab}
              {...stylex.props(styles.cut, index === words.length - 1 && styles.lastCut)}
              style={{ "--i": index, "--c": color }}
            >
              {tab.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// The root's own animation only times the run: its animationend ends the intro.
const hold = stylex.keyframes({ to: { opacity: 1 } });
const slam = stylex.keyframes({
  "0%": { opacity: 0, filter: "blur(8px)", transform: "scale(1.8)" },
  to: { opacity: 1, filter: "none", transform: "none" },
});
const cutIn = stylex.keyframes({
  "0%": { opacity: 1, transform: "translate(-50%,-50%)scale(1.5)skew(-10deg)" },
  to: { opacity: 1, transform: "translate(-50%,-50%)" },
});

const styles = stylex.create({
  root: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    cursor: cursors["--cursor-point"],
    display: { default: "grid", ":is(.no-intro *)": "none" },
    placeItems: "center",
    animationName: { default: null, ":is(.play)": hold },
    animationDuration: { default: null, ":is(.play)": "2000ms" },
    animationTimingFunction: { default: null, ":is(.play)": "linear" },
    animationFillMode: { default: null, ":is(.play)": "forwards" },
  },
  shutter: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#07070a",
    transitionProperty: "transform",
    transitionDuration: "560ms",
    transitionTimingFunction: motion["--cut"],
  },
  top: {
    top: 0,
    borderBottomWidth: "3px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--go"],
    transform: { default: null, [stylex.when.ancestor(":is(.out)")]: "translateY(-101%)" },
  },
  bottom: {
    bottom: 0,
    borderTopWidth: "3px",
    borderTopStyle: "solid",
    borderTopColor: palette["--go"],
    transform: { default: null, [stylex.when.ancestor(":is(.out)")]: "translateY(101%)" },
  },
  stage: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    opacity: { default: null, [stylex.when.ancestor(":is(.out)")]: 0 },
    transitionProperty: "opacity",
    transitionDuration: "120ms",
    transitionTimingFunction: "ease",
  },
  name: {
    font: `900 clamp(36px, 7vw, 84px)/1 ${fonts["--display"]}`,
    color: palette["--text"],
    opacity: 0,
    letterSpacing: "-0.03em",
    animationName: { default: null, [stylex.when.ancestor(":is(.play)")]: slam },
    animationDuration: { default: null, [stylex.when.ancestor(":is(.play)")]: "260ms" },
    animationTimingFunction: {
      default: null,
      [stylex.when.ancestor(":is(.play)")]: motion["--out"],
    },
    animationDelay: { default: null, [stylex.when.ancestor(":is(.play)")]: "150ms" },
    animationFillMode: { default: null, [stylex.when.ancestor(":is(.play)")]: "forwards" },
  },
  slot: {
    position: "relative",
    height: "clamp(56px, 9vw, 110px)",
    marginTop: "18px",
  },
  // Each cut flashes in for a beat, one after another; --i is its place in the run.
  cut: {
    position: "absolute",
    left: "50%",
    top: "50%",
    font: `900 clamp(40px, 8vw, 100px)/1 ${fonts["--display"]}`,
    whiteSpace: "nowrap",
    opacity: 0,
    color: "var(--c)",
    transform: "translate(-50%, -50%)",
    animationName: { default: null, [stylex.when.ancestor(":is(.play)")]: cutIn },
    animationDuration: { default: null, [stylex.when.ancestor(":is(.play)")]: "240ms" },
    animationTimingFunction: {
      default: null,
      [stylex.when.ancestor(":is(.play)")]: motion["--out"],
    },
    animationDelay: {
      default: null,
      [stylex.when.ancestor(":is(.play)")]: "calc(650ms + var(--i) * 260ms)",
    },
  },
  // The last cut holds, longer, until the shutters split.
  lastCut: {
    animationDuration: { default: null, [stylex.when.ancestor(":is(.play)")]: "420ms" },
    animationFillMode: { default: null, [stylex.when.ancestor(":is(.play)")]: "forwards" },
  },
});
