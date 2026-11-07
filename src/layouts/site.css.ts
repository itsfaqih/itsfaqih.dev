import { palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { HOVER } from "../browser/media-query";

/** The room the fixed header bar takes at the top of the page, in px. */
export const HEADER_HEIGHT = 72;

export const site = {
  html: style({
    scrollBehavior: "smooth",
    // Anchored sections land below the fixed header bar.
    scrollPaddingTop: "calc(88px + env(safe-area-inset-top, 0px))",
    // SAFETY: the value is valid CSS, and the property type has no member with a priority.
    overflowX: "clip !important" as "clip",
  }),
  body: style({
    position: "relative",
    minHeight: "100svh",
    paddingTop: `calc(${HEADER_HEIGHT}px + env(safe-area-inset-top, 0px))`,
    // viewport-fit=cover lays the page under a landscape notch; the background still bleeds there.
    paddingLeft: "env(safe-area-inset-left, 0px)",
    paddingRight: "env(safe-area-inset-right, 0px)",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    color: palette["--text"],
    backgroundColor: palette["--bg"],
    // SAFETY: the value is valid CSS, and the property type has no member with a priority.
    overflowX: "clip !important" as "clip",
    // Diffs resolves its system theme from the rendered body colour scheme.
    colorScheme: "light",
    selectors: {
      "&:is(.dark *)": {
        colorScheme: "dark",
      },
    },
  }),
  main: style({
    position: "relative",
    zIndex: 10,
  }),
  notFound: style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60svh",
  }),
  notFoundTitle: style({
    marginBottom: "1rem",
    fontSize: "1.5rem",
    lineHeight: "2rem",
    fontWeight: 700,
  }),
  homeLink: style({
    color: palette["--muted-foreground"],
    textDecorationLine: "underline",
    textDecorationColor: palette["--border"],
    textUnderlineOffset: "4px",
    selectors: {
      "&:active": {
        color: palette["--text"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            color: palette["--text"],
          },
        },
      },
    },
  }),
};
