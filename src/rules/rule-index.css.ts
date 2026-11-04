import { style } from "@vanilla-extract/css";
export const styles = {
  // The custom element stands in for the block the root used to be.
  root: style({
    display: "block",
  }),
  head: style({
    paddingTop: "48px",
    paddingBottom: "32px",
  }),
  title: style({
    marginBottom: "14px",
  }),
  lede: style({
    maxWidth: "34em",
    fontSize: "18px",
  }),
  body: style({
    paddingBottom: "96px",
  }),
};
