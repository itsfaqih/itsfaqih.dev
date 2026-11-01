import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  suffixes: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  // Not the padding shorthand, which StyleX emits at class specificity, below the kit's code padding.
  suffix: {
    paddingBlock: "4px",
    paddingInline: "8px",
    fontSize: "13px",
    color: "var(--c-ink)",
  },
});
