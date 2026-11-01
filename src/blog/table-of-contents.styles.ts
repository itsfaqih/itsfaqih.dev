import * as stylex from "@stylexjs/stylex";
import { motion, palette } from "../theme.stylex";

const HOVER = "@media (hover: hover) and (pointer: fine)";

const styles = stylex.create({
  host: {
    display: "contents",
  },
  title: {
    marginBottom: "1rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
  },
  list: {
    fontSize: { default: "1rem", "@media (min-width: 64rem)": "0.875rem" },
    lineHeight: { default: 1.5, "@media (min-width: 64rem)": "1.25rem" },
  },
  // While any link is hovered, the other entries dim.
  item: {
    // -webkit-box with no -webkit-line-clamp, so it clamps nothing.
    display: "-webkit-box",
    overflow: "hidden",
    opacity: {
      default: null,
      ":hover": { default: null, [HOVER]: 1 },
      [stylex.when.ancestor(":has(a:hover)")]: {
        default: null,
        ":not(:hover)": { default: null, [HOVER]: 0.5 },
      },
    },
    transitionProperty: "opacity",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      [stylex.when.ancestor(":has(a:hover)")]: { default: null, [HOVER]: motion["--t-fast"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      [stylex.when.ancestor(":has(a:hover)")]: { default: null, [HOVER]: motion["--fast"] },
    },
  },
  link: {
    display: "block",
    paddingBlock: { default: "0.75rem", "@media (min-width: 64rem)": "0.375rem" },
    transitionProperty: "color, font-weight",
  },
  active: {
    fontWeight: 500,
    transitionDuration: motion["--t-fast"],
    transitionTimingFunction: motion["--fast"],
  },
  idle: {
    color: {
      default: palette["--muted-foreground"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
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
  // The active entry turns 500: a hidden copy holds that width, so the bolder text never rewraps.
  label: {
    display: "grid",
  },
  layer: {
    gridArea: "1 / 1",
  },
  ghost: {
    visibility: "hidden",
    fontWeight: 500,
  },
});

/** The classes table-of-contents.astro renders and table-of-contents.client.ts swaps as the active entry moves. */
export const toc = {
  host: stylex.attrs(styles.host).class ?? "",
  title: stylex.attrs(styles.title).class ?? "",
  list: stylex.attrs(styles.list, stylex.defaultMarker()).class ?? "",
  item: stylex.attrs(styles.item).class ?? "",
  link: (active: boolean) => stylex.attrs(styles.link, active ? styles.active : styles.idle).class ?? "",
  label: stylex.attrs(styles.label).class ?? "",
  layer: stylex.attrs(styles.layer).class ?? "",
  ghost: stylex.attrs(styles.layer, styles.ghost).class ?? "",
};
