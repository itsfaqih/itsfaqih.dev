import * as stylex from "@stylexjs/stylex";
import { motion, palette } from "../theme.stylex";

const HOVER = "@media (hover: hover) and (pointer: fine)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";

export const styles = stylex.create({
  page: {
    position: "relative",
    minHeight: "100svh",
  },
  container: {
    position: "relative",
  },
  intro: {
    marginBottom: "2rem",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  labelIcon: {
    padding: "0.625rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: palette["--border"],
    borderRadius: "0.75rem",
    backgroundColor: palette["--card"],
  },
  labelText: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
  },
  title: {
    marginBottom: "0.75rem",
    fontSize: { default: "1.875rem", "@media (min-width: 40rem)": "2.25rem" },
    lineHeight: { default: "2.25rem", "@media (min-width: 40rem)": "2.5rem" },
    fontWeight: 700,
  },
  lede: {
    maxWidth: "36rem",
    color: palette["--muted-foreground"],
  },
  empty: {
    padding: "3rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: palette["--border"],
    borderRadius: "1rem",
    textAlign: "center",
  },
  emptyIcon: {
    marginInline: "auto",
    marginBottom: "1rem",
    color: palette["--muted-foreground"],
  },
  emptyText: {
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
  },
  muted: {
    color: palette["--muted-foreground"],
  },
  small: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  post: {
    marginBottom: { default: "1rem", ":last-child": 0 },
  },
  postLink: {
    display: "block",
    scale: { default: null, ":active": { default: 0.99, [REDUCE]: null } },
    transitionProperty: "scale",
    transitionDuration: { default: motion["--t-moderate-exit"], ":active": motion["--t-moderate"] },
    transitionTimingFunction: { default: motion["--exit"], ":active": motion["--moderate"] },
  },
  card: {
    padding: "1.25rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: palette["--border"],
      ":hover": { default: null, [HOVER]: palette["--muted-foreground"] },
    },
    borderRadius: "1rem",
    transitionProperty: "border-color",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--fast"] },
    },
  },
  cardRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
  },
  cardBody: {
    flex: "1",
    minWidth: 0,
  },
  date: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.75rem",
  },
  postTitle: {
    marginBottom: "0.5rem",
    fontSize: { default: "1.125rem", "@media (min-width: 40rem)": "1.25rem" },
    lineHeight: "1.75rem",
    fontWeight: 700,
  },
  summary: {
    // -webkit-box with no -webkit-line-clamp, so it clamps nothing.
    display: "-webkit-box",
    overflow: "hidden",
    lineHeight: 1.625,
    color: palette["--muted-foreground"],
  },
  arrowSlot: {
    flexShrink: 0,
    marginTop: "0.5rem",
  },
  arrowWell: {
    padding: "0.75rem",
    borderRadius: "0.75rem",
    backgroundColor: palette["--card"],
  },
  arrow: {
    color: palette["--muted-foreground"],
    translate: {
      default: null,
      [stylex.when.ancestor(":hover")]: {
        default: null,
        [HOVER]: { default: "0.25rem 0", [REDUCE]: null },
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
  footer: {
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderColor: palette["--border"],
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    color: {
      default: palette["--muted-foreground"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
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
  },
  backArrow: {
    rotate: "180deg",
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
});

export const marker = stylex.defaultMarker();
