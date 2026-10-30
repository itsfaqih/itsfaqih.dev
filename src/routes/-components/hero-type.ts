import * as stylex from "@stylexjs/stylex";
import { fonts, palette } from "../../theme.stylex";

const STACKED = "@media (max-width: 960px)";

const blink = stylex.keyframes({ "50%": { opacity: 0 } });

/**
 * The type a page opens with, shared by the home hero, the Rule of Thumb index and each rule's
 * title screen: `tag` is the eyebrow with its blinking dot, `title` the headline, `hl` a word set
 * on its hue (--c), `lead` the paragraph under it, and `acts` its row of buttons. Each page
 * composes its own sizes and spacing after these.
 */
export const heroType = stylex.create({
  tag: {
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
    font: `500 12px ${fonts["--display"]}`,
    color: palette["--go-ink"],
    marginBottom: "18px",
    "::before": {
      content: '""',
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: palette["--ts-deep"],
      boxShadow: `0 0 10px ${palette["--ts-deep"]}`,
      animationName: blink,
      animationDuration: "1.2s",
      animationTimingFunction: "steps(2)",
      animationIterationCount: "infinite",
    },
  },
  title: {
    font: `900 52px/1.02 ${fonts["--display"]}`,
    fontSize: { default: null, [STACKED]: "36px" },
    letterSpacing: "-0.04em",
    color: palette["--text"],
    marginTop: 0,
    marginInline: 0,
    marginBottom: "22px",
  },
  hl: {
    color: "var(--on-c)",
    backgroundColor: "var(--c)",
    paddingBlock: 0,
    paddingInline: "0.12em",
    borderRadius: "0.12em",
    boxDecorationBreak: "clone",
  },
  lead: {
    fontSize: "18px",
    maxWidth: "31em",
    marginTop: 0,
    marginInline: 0,
    marginBottom: "30px",
  },
  acts: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
});
