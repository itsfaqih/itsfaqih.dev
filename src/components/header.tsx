import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { ListIcon, MagnifyingGlassIcon, MoonIcon, SunIcon, XIcon } from "@phosphor-icons/react";
import { SHOW_PROJECTS } from "../data/home";
import { useTheme } from "../hooks/use-theme";
import { cursors, fonts, motion, palette } from "../theme.stylex";
import { button } from "./button";
import { loadIn } from "./load-in";
import { arcade } from "./arcade";

let activityHost: HTMLElement | null = null;
let activityCount = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Stable, so a Header re-render doesn't detach the host and remount the page's portal.
function hostActivity(node: HTMLDivElement | null) {
  activityHost = node;
  emit();
  return () => {
    activityHost = null;
    emit();
  };
}

export function IslandActivity({ children }: { children: ReactNode }) {
  const host = useSyncExternalStore(
    subscribe,
    () => activityHost,
    () => null,
  );
  useEffect(() => {
    activityCount += 1;
    emit();
    return () => {
      activityCount -= 1;
      emit();
    };
  }, []);
  return host ? createPortal(children, host) : null;
}

type SegProps = {
  on: boolean;
  compact?: "idle" | "live" | "always";
  style?: stylex.StyleXStyles;
  rowStyle?: stylex.StyleXStyles;
  children: ReactNode;
};

function Seg({ on, compact, style, rowStyle, children }: SegProps) {
  return (
    <div
      {...stylex.props(loadIn.islandPart, styles.seg, on && styles.segOn, style)}
      data-compact={compact}
      inert={!on}
    >
      <div {...stylex.props(styles.clip)}>
        <div className={`row ${stylex.props(styles.row, on && styles.rowOn, rowStyle).className}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { toggleTheme } = useTheme();
  const openCommandPalette = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
    );
  };

  const islandRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const live = useSyncExternalStore(
    subscribe,
    () => activityCount > 0,
    () => false,
  );

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const from = scrollY;
    const onScroll = () => {
      if (Math.abs(scrollY - from) > 24) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onPress = (event: PointerEvent) => {
      if (event.target instanceof Node && !islandRef.current?.contains(event.target))
        setOpen(false);
    };
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPress);
    return () => {
      removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPress);
    };
  }, [open]);

  const compact = scrolled && !open;
  const full = !compact;

  return (
    <div
      className={`arc arc-bar ${stylex.props(arcade.root, styles.bar).className}`}
      data-scrolled={scrolled ? "" : undefined}
      data-mode={compact ? "compact" : "full"}
      data-open={open || undefined}
    >
      <header
        ref={islandRef}
        className={`island ${stylex.props(styles.island).className}`}
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest("a")) setOpen(false);
        }}
      >
        <Seg
          on={full || !live}
          compact="idle"
          style={open && styles.homeFolded}
          rowStyle={open && styles.homeFoldedRow}
        >
          <Link
            to="/"
            aria-label="Faqih Muntashir, home"
            {...stylex.props(styles.brand, styles.ring)}
          >
            FAQIH
          </Link>
        </Seg>
        <Seg on={compact && live} compact="live">
          <div ref={hostActivity} />
        </Seg>
        <Seg on={full}>
          <nav aria-label="Main" {...stylex.props(styles.nav)}>
            <Link
              to="/rule-of-thumb"
              activeProps={{ "aria-current": "page" }}
              {...stylex.props(styles.navLink, styles.ring)}
            >
              Rule of Thumb
            </Link>
            <Link
              to="/"
              hash="work"
              activeOptions={{ includeHash: true }}
              {...stylex.props(styles.navLink, styles.ring, styles.wideOnly)}
            >
              Experience
            </Link>
            {SHOW_PROJECTS && (
              <Link
                to="/"
                hash="projects"
                activeOptions={{ includeHash: true }}
                {...stylex.props(styles.navLink, styles.ring, styles.wideOnly)}
              >
                Projects
              </Link>
            )}
          </nav>
        </Seg>
        <Seg on compact="always" style={styles.toolsSeg}>
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Search the site"
            {...stylex.props(styles.find, styles.ring)}
          >
            <MagnifyingGlassIcon size={16} weight="bold" />
            <kbd {...stylex.props(styles.findKey, styles.wideOnly)}>⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={(event) => {
              const box = event.currentTarget.getBoundingClientRect();
              toggleTheme({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
            }}
            aria-label="Switch theme"
            {...stylex.props(styles.find, styles.ring, styles.iconButton)}
          >
            <SunIcon size={16} weight="bold" {...stylex.props(styles.glyph, styles.sunInLight)} />
            <MoonIcon size={16} weight="bold" {...stylex.props(styles.glyph, styles.moonInDark)} />
          </button>
        </Seg>
        <Seg on={full} style={styles.connectSeg} rowStyle={styles.connectRow}>
          <Link
            to="/"
            hash="contact"
            {...stylex.props(button.base, button.go, button.sm, styles.connect)}
          >
            Connect
          </Link>
        </Seg>
        <Seg on={scrolled} compact="always">
          <button
            ref={toggleRef}
            type="button"
            className={`find menu ${stylex.props(styles.find, styles.ring, styles.iconButton, styles.menu).className}`}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <ListIcon
              size={16}
              weight="bold"
              {...stylex.props(styles.glyph, open && styles.turnedRight)}
            />
            <XIcon
              size={16}
              weight="bold"
              {...stylex.props(styles.glyph, !open && styles.turnedLeft)}
            />
          </button>
        </Seg>
      </header>
    </div>
  );
}

const REDUCE = "@media (prefers-reduced-motion: reduce)";
const TABLET = "@media (max-width: 960px)";
const PHONE = "@media (max-width: 640px)";
const NARROW = "@media (max-width: 480px)";
const TINY = "@media (max-width: 380px)";
const DARK = ":is(.dark *)";
const LIGHT = ":is(.light *)";
// The root script adds .js, and .no-intro once the home intro has handed off (or never plays).
const READY = ":is(.js.no-intro *)";
const WAITING = ":is(.js:not(.no-intro) *)";

// A sampled spring (damping 0.72), about 4% past and back.
const SPRING =
  "linear(0, 0.034, 0.12, 0.234, 0.359, 0.484, 0.601, 0.705, 0.793, 0.865, 0.922, 0.965, 0.996, 1.017, 1.03, 1.036, 1.038, 1.037, 1.034, 1.03, 1.025, 1.02, 1.016, 1.012, 1.008, 1.005, 1.003, 1.001, 1, 0.999, 0.999, 0.999, 0.999)";
const FOLD = "560ms";

// The island drops in on the page's first frame, a touch small, and settles on the spring.
const islandIn = stylex.keyframes({
  from: { opacity: 0, scale: 0.82 },
});

const ROW_IN = `opacity 240ms ${motion["--out"]} 40ms, filter 260ms ${motion["--out"]} 40ms`;
const ROW_OUT = "opacity 120ms ease, filter 120ms ease";

// A black capsule that floats over every page. At the top it holds the whole nav; once the page
// scrolls it folds to the brand, or to the live activity a page lends it (IslandActivity), beside
// search and the theme switch, and a menu button unfolds it again. Each part folds its own column
// from 1fr to 0fr on one spring, so the capsule resizes around whatever it holds while the parts
// blur out quickly and resolve in a beat later. The capsule is black over the light theme and white
// over the dark one, so it is always the one shape that stands apart from the page.
const styles = stylex.create({
  // A clear strip at the top of every page that only centres the island; presses pass through it
  // everywhere but the island itself.
  bar: {
    position: "fixed",
    inset: "12px 0 auto",
    zIndex: 50,
    display: "flex",
    justifyContent: "center",
    padding: "0 12px",
    pointerEvents: "none",
  },
  island: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: "48px",
    maxWidth: "100%",
    padding: { default: "0 10px", [NARROW]: "0 6px" },
    borderRadius: "999px",
    font: `500 13px ${fonts["--display"]}`,
    pointerEvents: "auto",
    backgroundColor: { default: "#0a0a0c", [DARK]: "#fff" },
    boxShadow: {
      default: "inset 0 0 0 1px rgb(255 255 255 / 0.08), 0 10px 28px -12px rgb(0 0 0 / 0.55)",
      [DARK]: "inset 0 0 0 1px rgb(0 0 0 / 0.06), 0 10px 28px -12px rgb(0 0 0 / 0.7)",
    },
    // The island's own ground, so everything inside reads light on black (dark on white).
    "--text": { default: "#fff", [DARK]: "#0a0a0c" },
    "--dim": { default: "rgb(255 255 255 / 0.66)", [DARK]: "rgb(10 10 12 / 0.68)" },
    "--mute": { default: "rgb(255 255 255 / 0.46)", [DARK]: "rgb(10 10 12 / 0.5)" },
    "--hair": { default: "rgb(255 255 255 / 0.18)", [DARK]: "rgb(10 10 12 / 0.16)" },
    "--panel-2": { default: "rgb(255 255 255 / 0.1)", [DARK]: "rgb(10 10 12 / 0.07)" },
    "--focus": {
      default: palette["--go"],
      [DARK]: `color-mix(in oklab, ${palette["--go"]} 45%, #000)`,
    },
    color: palette["--text"],
    opacity: { default: null, [WAITING]: 0 },
    animationName: { default: null, [READY]: islandIn },
    animationDuration: { default: null, [READY]: FOLD },
    animationTimingFunction: { default: null, [READY]: SPRING },
    animationFillMode: { default: null, [READY]: "backwards" },
  },
  seg: {
    display: "grid",
    gridTemplateColumns: "0fr",
    transition: { default: `grid-template-columns ${FOLD} ${SPRING}`, [REDUCE]: "none" },
  },
  segOn: {
    gridTemplateColumns: "1fr",
  },
  // Clips sideways only, so the button's press and the focus ring keep their height.
  clip: {
    minWidth: 0,
    overflowX: "clip",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    width: "max-content",
    padding: { default: "0 4px", [PHONE]: "0 2px", [NARROW]: 0 },
    opacity: 0,
    filter: { default: "blur(4px)", [REDUCE]: "none" },
    transition: ROW_OUT,
  },
  rowOn: {
    opacity: 1,
    filter: "none",
    transition: ROW_IN,
  },
  // Narrow phones: the open menu has no room for the brand as well as the close button.
  homeFolded: {
    gridTemplateColumns: { default: "1fr", [NARROW]: "0fr" },
  },
  homeFoldedRow: {
    opacity: { default: 1, [NARROW]: 0 },
    filter: { default: "none", [NARROW]: { default: "blur(4px)", [REDUCE]: "none" } },
    visibility: { default: null, [NARROW]: "hidden" },
    transition: { default: ROW_IN, [NARROW]: `${ROW_OUT}, visibility 0s 120ms` },
  },
  wideOnly: {
    display: { default: null, [TABLET]: "none" },
  },
  // Unlike the folding segments, the tools sit in a flex row.
  toolsSeg: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
  },
  // Narrow phones: the hero's contact button sits right below, so the island drops its copy.
  connectSeg: {
    display: { default: "grid", [TINY]: "none" },
  },
  connectRow: {
    paddingLeft: { default: "8px", [NARROW]: "4px" },
  },
  connect: {
    flex: "none",
    height: "32px",
    paddingInline: "12px",
    whiteSpace: "nowrap",
    borderRadius: "999px",
  },
  ring: {
    outline: { default: null, ":focus-visible": `2px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-visible": "-2px" },
  },
  brand: {
    userSelect: "none",
    padding: { default: "0 8px 0 12px", [PHONE]: "0 6px 0 10px", [NARROW]: "0 4px 0 10px" },
    fontWeight: 900,
    color: palette["--text"],
  },
  nav: {
    display: "flex",
    gap: "2px",
  },
  navLink: {
    userSelect: "none",
    whiteSpace: "nowrap",
    padding: { default: "8px 12px", [TABLET]: "8px" },
    borderRadius: "999px",
    backgroundColor: {
      default: null,
      ":hover": { default: null, "@media (hover: hover)": palette["--panel-2"] },
      ":is([aria-current='page'])": palette["--panel-2"],
    },
    color: {
      default: palette["--dim"],
      ":hover": { default: null, "@media (hover: hover)": palette["--text"] },
      ":is([aria-current='page'])": palette["--text"],
    },
    transition: "background-color 120ms ease, color 120ms ease",
  },
  find: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
    // The compact island holds the activity beside search, theme and menu; on narrow phones these
    // keep it inside the screen.
    padding: { default: "8px 12px", [TABLET]: "8px", [NARROW]: "8px 6px" },
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "999px",
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, "@media (hover: hover)": palette["--panel-2"] },
    },
    // `background: none` minifies to a 0 0 position at rest, and the hover's background shorthand
    // resets it to 0% 0%. StyleX would minify a literal 0% 0% back to 0 0, so hover sets initial.
    backgroundPosition: {
      default: "0 0",
      ":hover": { default: null, "@media (hover: hover)": "initial" },
    },
    color: {
      default: palette["--dim"],
      ":hover": { default: null, "@media (hover: hover)": palette["--text"] },
    },
    font: "inherit",
    cursor: cursors["--cursor-point"],
    transition: "background-color 120ms ease, color 120ms ease",
  },
  findKey: {
    padding: "1px 6px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "6px",
    font: `500 11px ${fonts["--display"]}`,
  },
  // Both icons share one cell; the outgoing one turns away as the incoming one turns in.
  iconButton: {
    display: "inline-grid",
    placeItems: "center",
  },
  menu: {
    width: "36px",
    height: "36px",
    padding: { default: 0, [NARROW]: "8px 6px" },
  },
  glyph: {
    gridArea: "1 / 1",
    transition: `opacity 200ms ${motion["--out"]}, transform 200ms ${motion["--out"]}`,
  },
  sunInLight: {
    opacity: { default: null, [LIGHT]: 0 },
    transform: { default: null, [LIGHT]: "rotate(90deg) scale(0.6)" },
  },
  moonInDark: {
    opacity: { default: null, [DARK]: 0 },
    transform: { default: null, [DARK]: "rotate(-90deg) scale(0.6)" },
  },
  turnedRight: {
    opacity: 0,
    transform: "rotate(90deg) scale(0.6)",
  },
  turnedLeft: {
    opacity: 0,
    transform: "rotate(-90deg) scale(0.6)",
  },
});
