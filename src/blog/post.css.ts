import { motion, palette } from "../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { when } from "../when";
import { EASE, SLIDE } from "./toc-drawer.view";
const HOVER = "(hover: hover) and (pointer: fine)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const OPEN = ":is([data-state=open])";
const CLOSED = ":is([data-state=closed])";

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});
const fadeOut = keyframes({
  to: { opacity: 0 },
});
const slideFromBottom = keyframes({
  from: { transform: "translate3d(0, 100%, 0)" },
  to: { transform: "translate3d(0, 0, 0)" },
});
const slideToBottom = keyframes({
  to: { transform: "translate3d(0, 100%, 0)" },
});

// The tags the posts render. Values follow Tailwind Typography's prose-zinc.
export const proseStyles = {
  p: style({
    marginTop: "1.25em",
    marginBottom: "1.25em",
    color: palette["--muted-foreground"],
    selectors: {
      "&:is(h2 + *)": {
        marginTop: 0,
      },
      "&:first-child": {
        marginTop: 0,
      },
      "&:last-child": {
        marginBottom: 0,
      },
    },
  }),
  h2: style({
    marginTop: "2em",
    marginBottom: "1em",
    scrollMarginTop: "6rem",
    fontSize: "1.5em",
    lineHeight: "calc(32 / 24)",
    fontWeight: 700,
    color: palette["--text"],
  }),
};

export const styles = {
  page: style({
    position: "relative",
    minHeight: "100svh",
  }),
  shell: style({
    position: "relative",
    maxWidth: "72rem",
    marginInline: "auto",
    paddingInline: "1.5rem",
    paddingTop: "2rem",
    paddingBottom: "3rem",
  }),
  layout: style({
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    alignItems: "flex-start",
    gap: "3rem",
    "@media": {
      "(min-width: 64rem)": {
        gridTemplateColumns: "1fr 250px",
      },
    },
  }),
  backLink: style({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    color: palette["--muted-foreground"],
    transitionProperty: "color, scale",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:active": {
        scale: "95% 95%",
        transitionDuration: motion["--t-moderate"],
        transitionTimingFunction: motion["--moderate"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            color: palette["--text"],
            transitionDuration: motion["--t-moderate"],
            transitionTimingFunction: motion["--moderate"],
          },
        },
      },
    },
  }),
  backLinkTop: style({
    marginBottom: "2rem",
  }),
  backArrow: style({
    transitionProperty: "translate",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
    "@media": {
      [HOVER]: {
        selectors: {
          [`&${when.ancestor(":hover")}`]: {
            translate: "-0.25rem 0",
            transitionDuration: motion["--t-moderate"],
            transitionTimingFunction: motion["--moderate"],
          },
        },
      },
    },
  }),
  header: style({
    marginBottom: "2rem",
  }),
  meta: style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  }),
  metaItem: style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  }),
  muted: style({
    color: palette["--muted-foreground"],
  }),
  small: style({
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  }),
  title: style({
    marginBottom: "1rem",
    fontSize: "1.875rem",
    lineHeight: 1.25,
    fontWeight: 700,
    "@media": {
      "(min-width: 40rem)": {
        fontSize: "2.25rem",
      },
    },
  }),
  summary: style({
    fontSize: "1.125rem",
    lineHeight: 1.625,
    color: palette["--muted-foreground"],
  }),
  rule: style({
    height: 1,
    marginBottom: "2rem",
    backgroundColor: palette["--border"],
  }),
  body: style({
    lineHeight: 1.75,
    color: "oklch(87.1% .006 286.286)",
  }),
  footer: style({
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderColor: palette["--border"],
  }),
  footerRow: style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  }),
  tocRail: style({
    display: "none",
    position: "sticky",
    top: "3rem",
    "@media": {
      "(min-width: 64rem)": {
        display: "block",
      },
    },
  }),
  drawerHost: style({
    display: "contents",
  }),
  // Focus lands on one only when Tab runs off either end of the open drawer; the client sends it
  // back around, as a modal would.
  guard: style({
    position: "fixed",
    width: 1,
    height: 0,
    overflow: "hidden",
  }),
  tocButton: style({
    position: "fixed",
    right: "calc(1.5rem + env(safe-area-inset-right, 0px))",
    bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
    zIndex: 50,
    padding: "1rem",
    borderRadius: "2147483647px",
    color: palette["--bg"],
    backgroundColor: palette["--text"],
    transitionProperty: "scale",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:active": {
        // Repeated under the media query, which would otherwise let hovering outrank pressing.
        scale: "95% 95%",
        transitionDuration: motion["--t-moderate"],
        transitionTimingFunction: motion["--moderate"],
      },
    },
    "@media": {
      "(min-width: 64rem)": {
        display: "none",
      },
      [HOVER]: {
        selectors: {
          "&:hover": {
            scale: "105% 105%",
            transitionDuration: motion["--t-moderate"],
            transitionTimingFunction: motion["--moderate"],
          },
        },
      },
      [`${HOVER} and (not (${REDUCE}))`]: {
        selectors: {
          "&:active": {
            scale: "95% 95%",
          },
        },
      },
    },
  }),
  overlay: style({
    position: "fixed",
    inset: 0,
    zIndex: 50,
    backgroundColor: "rgb(0 0 0 / 0.4)",
    animationDuration: SLIDE,
    animationTimingFunction: EASE,
    selectors: {
      [`&&${CLOSED}`]: {
        animationName: fadeOut,
      },
      [`&${CLOSED}`]: {
        animationFillMode: "forwards",
      },
      [`&${OPEN}`]: {
        animationName: fadeIn,
      },
    },
  }),
  // The drawer, over the native dialog's own box.
  drawer: style({
    // Fills the gap below the drawer while a drag pulls it past its resting place.
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
    willChange: "transform",
    transitionProperty: "transform",
    transitionDuration: SLIDE,
    transitionTimingFunction: EASE,
    animationDuration: SLIDE,
    animationTimingFunction: EASE,
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
    selectors: {
      "&::after": {
        content: '""',
        position: "absolute",
        top: "100%",
        right: 0,
        left: 0,
        height: "200%",
        backgroundColor: "inherit",
      },
      [`&&${CLOSED}`]: {
        animationName: slideToBottom,
      },
      [`&${CLOSED}`]: {
        animationFillMode: "forwards",
      },
      [`&${OPEN}`]: {
        animationName: slideFromBottom,
      },
    },
    "@media": {
      [HOVER]: {
        userSelect: "none",
      },
      // Reduced motion fades the drawer in and out where it rests instead of sliding it.
      [REDUCE]: {
        selectors: {
          [`&&${CLOSED}`]: {
            animationName: fadeOut,
          },
          [`&${OPEN}`]: {
            animationName: fadeIn,
          },
        },
      },
    },
  }),
  drawerPanel: style({
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
  }),
  handle: style({
    flexShrink: 0,
    width: "3rem",
    height: "0.375rem",
    marginInline: "auto",
    marginBottom: "1.5rem",
    borderRadius: "2147483647px",
    backgroundColor: palette["--border"],
  }),
  drawerBody: style({
    display: "flex",
    flex: "1",
    flexDirection: "column",
    width: "100%",
    maxWidth: "28rem",
    minHeight: 0,
    marginInline: "auto",
  }),
  drawerTitle: style({
    flexShrink: 0,
    marginBottom: "1rem",
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    fontWeight: 700,
  }),
  drawerScroll: style({
    flex: "1",
    overflowY: "auto",
    overscrollBehavior: "contain",
  }),
};
