import { style } from "@vanilla-extract/css";
export const styles = {
  suffixes: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  }),
  // Not the padding shorthand, which StyleX emits at class specificity, below the kit's code padding.
  suffix: style({
    paddingBlock: "4px",
    paddingInline: "8px",
    fontSize: "13px",
    color: "var(--c-ink)",
  }),
};
