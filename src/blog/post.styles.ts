import * as stylex from "@stylexjs/stylex";
import { motion, palette } from "../theme.stylex";

const HOVER = "@media (hover: hover) and (pointer: fine)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const OPEN = ":is([data-state=open])";
const CLOSED = ":is([data-state=closed])";

// Vaul's timing. It plays under reduced motion too, as Vaul did.
export const SLIDE_MS = 500;
const SLIDE = `${SLIDE_MS}ms`;
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
export const SLIDE_TRANSITION = `transform ${SLIDE} ${EASE}`;
export const FADE_TRANSITION = `opacity ${SLIDE} ${EASE}`;

const fadeIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const fadeOut = stylex.keyframes({ to: { opacity: 0 } });
const slideFromBottom = stylex.keyframes({
  from: { transform: "translate3d(0, 100%, 0)" },
  to: { transform: "translate3d(0, 0, 0)" },
});
const slideToBottom = stylex.keyframes({ to: { transform: "translate3d(0, 100%, 0)" } });

// The tags the posts render. Values follow Tailwind Typography's prose-zinc.
const proseStyles = stylex.create({
  p: {
    marginTop: { default: "1.25em", ":first-child": 0, ":is(h2 + *)": 0 },
    marginBottom: { default: "1.25em", ":last-child": 0 },
    color: palette["--muted-foreground"],
  },
  h2: {
    marginTop: "2em",
    marginBottom: "1em",
    scrollMarginTop: "6rem",
    fontSize: "1.5em",
    lineHeight: "calc(32 / 24)",
    fontWeight: 700,
    color: palette["--text"],
  },
});

const styles = stylex.create({
  page: {
    position: "relative",
    minHeight: "100svh",
  },
  shell: {
    position: "relative",
    maxWidth: "72rem",
    marginInline: "auto",
    paddingInline: "1.5rem",
    paddingTop: "2rem",
    paddingBottom: "3rem",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(1, minmax(0, 1fr))",
      "@media (min-width: 64rem)": "1fr 250px",
    },
    alignItems: "flex-start",
    gap: "3rem",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    color: {
      default: palette["--muted-foreground"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
    },
    scale: { default: null, ":active": { default: "95% 95%", [REDUCE]: null } },
    transitionProperty: "color, scale",
    transitionDuration: {
      default: motion["--t-moderate-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-moderate"] },
      ":active": motion["--t-moderate"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--moderate"] },
      ":active": motion["--moderate"],
    },
  },
  backLinkTop: {
    marginBottom: "2rem",
  },
  backArrow: {
    translate: {
      default: null,
      [stylex.when.ancestor(":hover")]: {
        default: null,
        [HOVER]: { default: "-0.25rem 0", [REDUCE]: null },
      },
    },
    transitionProperty: "translate",
    transitionDuration: {
      default: motion["--t-moderate-exit"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: motion["--t-moderate"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: motion["--moderate"] },
    },
  },
  header: {
    marginBottom: "2rem",
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  muted: {
    color: palette["--muted-foreground"],
  },
  small: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  title: {
    marginBottom: "1rem",
    fontSize: { default: "1.875rem", "@media (min-width: 40rem)": "2.25rem" },
    lineHeight: 1.25,
    fontWeight: 700,
  },
  summary: {
    fontSize: "1.125rem",
    lineHeight: 1.625,
    color: palette["--muted-foreground"],
  },
  rule: {
    height: 1,
    marginBottom: "2rem",
    backgroundColor: palette["--border"],
  },
  body: {
    lineHeight: 1.75,
    color: "oklch(87.1% .006 286.286)",
  },
  footer: {
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderColor: palette["--border"],
  },
  footerRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  tocRail: {
    display: { default: "none", "@media (min-width: 64rem)": "block" },
    position: "sticky",
    top: "3rem",
  },
  drawerHost: {
    display: "contents",
  },
  // Focus lands on one only when Tab runs off either end of the open drawer; the client sends it
  // back around, as Radix's focus scope did.
  guard: {
    position: "fixed",
    width: 1,
    height: 0,
    overflow: "hidden",
  },
  tocButton: {
    position: "fixed",
    right: "calc(1.5rem + env(safe-area-inset-right, 0px))",
    bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
    zIndex: 50,
    display: { default: null, "@media (min-width: 64rem)": "none" },
    padding: "1rem",
    borderRadius: "2147483647px",
    color: palette["--bg"],
    backgroundColor: palette["--text"],
    scale: {
      default: null,
      ":hover": { default: null, [HOVER]: { default: "105% 105%", [REDUCE]: null } },
      // Repeated under the media query, which would otherwise let hovering outrank pressing.
      ":active": {
        default: "95% 95%",
        [HOVER]: { default: "95% 95%", [REDUCE]: null },
        [REDUCE]: null,
      },
    },
    transitionProperty: "scale",
    transitionDuration: {
      default: motion["--t-moderate-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-moderate"] },
      ":active": motion["--t-moderate"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--moderate"] },
      ":active": motion["--moderate"],
    },
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    backgroundColor: "rgb(0 0 0 / 0.4)",
    animationName: { default: null, [OPEN]: fadeIn, [CLOSED]: fadeOut },
    animationDuration: SLIDE,
    animationTimingFunction: EASE,
    animationFillMode: { default: null, [CLOSED]: "forwards" },
  },
  // Vaul's drawer, which the native dialog's own box has to give way to.
  drawer: {
    position: "fixed",
    top: "auto",
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    width: "auto",
    maxWidth: "none",
    color: "inherit",
    touchAction: "none",
    userSelect: { default: null, [HOVER]: "none" },
    willChange: "transform",
    transitionProperty: "transform",
    transitionDuration: SLIDE,
    transitionTimingFunction: EASE,
    animationName: { default: null, [OPEN]: slideFromBottom, [CLOSED]: slideToBottom },
    animationDuration: SLIDE,
    animationTimingFunction: EASE,
    animationFillMode: { default: null, [CLOSED]: "forwards" },
    // Fills the gap below the drawer while a drag pulls it past its resting place.
    "::after": {
      content: '""',
      position: "absolute",
      top: "100%",
      right: 0,
      left: 0,
      height: "200%",
      backgroundColor: "inherit",
    },
    display: "flex",
    flexDirection: "column",
    maxHeight: "85dvh",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderColor: palette["--border"],
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    outlineStyle: "none",
    backgroundColor: palette["--bg"],
  },
  drawerPanel: {
    display: "flex",
    flex: "1",
    flexDirection: "column",
    minHeight: 0,
    paddingTop: "1rem",
    paddingInline: "1rem",
    paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: palette["--bg"],
  },
  handle: {
    flexShrink: 0,
    width: "3rem",
    height: "0.375rem",
    marginInline: "auto",
    marginBottom: "1.5rem",
    borderRadius: "2147483647px",
    backgroundColor: palette["--border"],
  },
  drawerBody: {
    display: "flex",
    flex: "1",
    flexDirection: "column",
    width: "100%",
    maxWidth: "28rem",
    minHeight: 0,
    marginInline: "auto",
  },
  drawerTitle: {
    flexShrink: 0,
    marginBottom: "1rem",
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    fontWeight: 700,
  },
  drawerScroll: {
    flex: "1",
    overflowY: "auto",
    overscrollBehavior: "contain",
  },
});

/** The post page's classes, for its .astro frame, which StyleX cannot compile. */
export const post = {
  page: stylex.props(styles.page).className,
  shell: stylex.props(styles.shell).className,
  layout: stylex.props(styles.layout).className,
  backLinkTop: stylex.props(styles.backLink, styles.backLinkTop, stylex.defaultMarker()).className,
  backLink: stylex.props(styles.backLink, stylex.defaultMarker()).className,
  backArrow: stylex.props(styles.backArrow).className,
  header: stylex.props(styles.header).className,
  meta: stylex.props(styles.meta).className,
  metaItem: stylex.props(styles.metaItem, styles.small, styles.muted).className,
  title: stylex.props(styles.title).className,
  summary: stylex.props(styles.summary).className,
  rule: stylex.props(styles.rule).className,
  body: stylex.props(styles.body).className,
  footer: stylex.props(styles.footer).className,
  footerRow: stylex.props(styles.footerRow).className,
  thanks: stylex.props(styles.small, styles.muted).className,
  tocRail: stylex.props(styles.tocRail).className,
};

export const prose = {
  p: stylex.props(proseStyles.p).className,
  h2: stylex.props(proseStyles.h2).className,
};

/** The table-of-contents drawer's classes, for toc-drawer.astro. */
export const drawer = {
  host: stylex.attrs(styles.drawerHost).class ?? "",
  guard: stylex.attrs(styles.guard).class ?? "",
  button: stylex.attrs(styles.tocButton).class ?? "",
  overlay: stylex.attrs(styles.overlay).class ?? "",
  content: stylex.attrs(styles.drawer).class ?? "",
  panel: stylex.attrs(styles.drawerPanel).class ?? "",
  handle: stylex.attrs(styles.handle).class ?? "",
  body: stylex.attrs(styles.drawerBody).class ?? "",
  title: stylex.attrs(styles.drawerTitle).class ?? "",
  scroll: stylex.attrs(styles.drawerScroll).class ?? "",
};
