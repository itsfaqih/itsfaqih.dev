import * as stylex from "@stylexjs/stylex";
import { palette } from "../theme.stylex";

const HOVER = "@media (hover: hover) and (pointer: fine)";

const styles = stylex.create({
  html: {
    scrollBehavior: "smooth",
    // Anchored sections land below the fixed header bar.
    scrollPaddingTop: "calc(88px + env(safe-area-inset-top, 0px))",
    overflowX: "clip !important",
  },
  body: {
    position: "relative",
    minHeight: "100svh",
    // Room for the fixed header bar.
    paddingTop: "calc(72px + env(safe-area-inset-top, 0px))",
    // viewport-fit=cover lays the page under a landscape notch; the background still bleeds there.
    paddingLeft: "env(safe-area-inset-left, 0px)",
    paddingRight: "env(safe-area-inset-right, 0px)",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    color: palette["--text"],
    backgroundColor: palette["--bg"],
    overflowX: "clip !important",
    // Diffs resolves its system theme from the rendered body colour scheme.
    colorScheme: { default: "light", ":is(.dark *)": "dark" },
  },
  main: {
    position: "relative",
    zIndex: 10,
  },
  notFound: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60svh",
  },
  notFoundTitle: {
    marginBottom: "1rem",
    fontSize: "1.5rem",
    lineHeight: "2rem",
    fontWeight: 700,
  },
  homeLink: {
    color: {
      default: palette["--muted-foreground"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
    textDecorationLine: "underline",
    textDecorationColor: palette["--border"],
    textUnderlineOffset: "4px",
  },
});

/** The page shell's classes, for the layout and the 404 page, which StyleX cannot compile in .astro. */
export const site = {
  html: stylex.props(styles.html).className,
  body: stylex.props(styles.body).className,
  main: stylex.props(styles.main).className,
  notFound: stylex.props(styles.notFound).className,
  notFoundTitle: stylex.props(styles.notFoundTitle).className,
  homeLink: stylex.props(styles.homeLink).className,
};
