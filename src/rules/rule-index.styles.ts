import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  // The custom element stands in for the block the root used to be.
  root: {
    display: "block",
  },
  head: {
    paddingTop: "48px",
    paddingBottom: "32px",
  },
  title: {
    marginBottom: "14px",
  },
  lede: {
    maxWidth: "34em",
    fontSize: "18px",
  },
  body: {
    paddingBottom: "96px",
  },
});
