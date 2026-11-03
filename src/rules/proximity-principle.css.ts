import { style } from "@vanilla-extract/css";
export const styles = {
  suffixes: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  }),
  suffix: style({
    paddingBlock: "4px",
    paddingInline: "8px",
    fontSize: "13px",
    color: "var(--c-ink)",
  }),
};
