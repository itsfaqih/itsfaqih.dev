import { motion, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { when } from "../when";
const HOVER = "(hover: hover) and (pointer: fine)";

export const styles = {
  page: style({
    position: "relative",
    minHeight: "100svh",
  }),
  container: style({
    position: "relative",
  }),
  intro: style({
    marginBottom: "2rem",
  }),
  label: style({
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1rem",
  }),
  labelIcon: style({
    padding: "0.625rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: palette["--border"],
    borderRadius: "0.75rem",
    backgroundColor: palette["--card"],
  }),
  labelText: style({
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
  }),
  title: style({
    marginBottom: "0.75rem",
    fontSize: "1.875rem",
    lineHeight: "2.25rem",
    fontWeight: 700,
    "@media": {
      "(min-width: 40rem)": {
        fontSize: "2.25rem",
        lineHeight: "2.5rem",
      },
    },
  }),
  lede: style({
    maxWidth: "36rem",
    color: palette["--muted-foreground"],
  }),
  empty: style({
    padding: "3rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: palette["--border"],
    borderRadius: "1rem",
    textAlign: "center",
  }),
  emptyIcon: style({
    marginInline: "auto",
    marginBottom: "1rem",
    color: palette["--muted-foreground"],
  }),
  emptyText: style({
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
  }),
  muted: style({
    color: palette["--muted-foreground"],
  }),
  small: style({
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  }),
  post: style({
    marginBottom: "1rem",
    selectors: {
      "&:last-child": {
        marginBottom: 0,
      },
    },
  }),
  postLink: style({
    display: "block",
    transitionProperty: "scale",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:active": {
        scale: 0.99,
        transitionDuration: motion["--t-moderate"],
        transitionTimingFunction: motion["--moderate"],
      },
    },
  }),
  card: style({
    padding: "1.25rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: palette["--border"],
    borderRadius: "1rem",
    transitionProperty: "border-color",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            borderColor: palette["--muted-foreground"],
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
      },
    },
  }),
  cardRow: style({
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
  }),
  cardBody: style({
    flex: "1",
    minWidth: 0,
  }),
  date: style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.75rem",
  }),
  postTitle: style({
    marginBottom: "0.5rem",
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    fontWeight: 700,
    "@media": {
      "(min-width: 40rem)": {
        fontSize: "1.25rem",
      },
    },
  }),
  summary: style({
    // -webkit-box with no -webkit-line-clamp, so it clamps nothing.
    display: "-webkit-box",
    overflow: "hidden",
    lineHeight: 1.625,
    color: palette["--muted-foreground"],
  }),
  arrowSlot: style({
    flexShrink: 0,
    marginTop: "0.5rem",
  }),
  arrowWell: style({
    padding: "0.75rem",
    borderRadius: "0.75rem",
    backgroundColor: palette["--card"],
  }),
  arrow: style({
    color: palette["--muted-foreground"],
    transitionProperty: "translate",
    transitionDuration: motion["--t-moderate-exit"],
    transitionTimingFunction: motion["--exit"],
    "@media": {
      [HOVER]: {
        selectors: {
          [`&${when.ancestor(":hover")}`]: {
            translate: "0.25rem 0",
            transitionDuration: motion["--t-moderate"],
            transitionTimingFunction: motion["--moderate"],
          },
        },
      },
    },
  }),
  footer: style({
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderColor: palette["--border"],
  }),
  backLink: style({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    color: palette["--muted-foreground"],
    transitionProperty: "color",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: motion["--exit"],
    selectors: {
      "&:active": {
        color: palette["--text"],
        transitionDuration: motion["--t-fast"],
        transitionTimingFunction: motion["--fast"],
      },
    },
    "@media": {
      [HOVER]: {
        selectors: {
          "&:hover": {
            color: palette["--text"],
            transitionDuration: motion["--t-fast"],
            transitionTimingFunction: motion["--fast"],
          },
        },
      },
    },
  }),
  backArrow: style({
    rotate: "180deg",
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
};
