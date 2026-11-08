import { fonts, palette } from "../theme.vars.css";
import { style, keyframes } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
const STACKED = "(max-width: 960px)";

const blink = keyframes({
  "50%": { opacity: 0 },
});

/**
 * The type a page opens with, shared by the home hero, the Rule of Thumb index and each rule's
 * title screen: `tag` is the eyebrow with its blinking dot, `title` the headline, `hl` a word set
 * on its hue (--c), `lead` the paragraph under it, and `acts` its row of buttons. Each page
 * composes its own sizes and spacing after these.
 */
export const heroType = {
  tag: style({
    "@layer": {
      [under1]: {
        display: "inline-flex",
        gap: "8px",
        alignItems: "center",
        font: `500 12px ${fonts["--display"]}`,
        color: palette["--go-ink"],
        marginBottom: "18px",
        selectors: {
          "&::before": {
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
      },
    },
  }),
  title: style({
    "@layer": {
      [under1]: {
        font: `900 52px/1.02 ${fonts["--display"]}`,
        letterSpacing: "-0.04em",
        color: palette["--text"],
        marginTop: 0,
        marginInline: 0,
        marginBottom: "22px",
        "@media": {
          [STACKED]: {
            fontSize: "36px",
          },
        },
      },
    },
  }),
  hl: style({
    "@layer": {
      [under1]: {
        color: "var(--on-c)",
        backgroundColor: "var(--c)",
        paddingBlock: 0,
        paddingInline: "0.12em",
        borderRadius: "0.12em",
        boxDecorationBreak: "clone",
      },
    },
  }),
  lead: style({
    "@layer": {
      [under1]: {
        fontSize: "18px",
        maxWidth: "31em",
        marginTop: 0,
        marginInline: 0,
        marginBottom: "30px",
      },
    },
  }),
  acts: style({
    "@layer": {
      [under1]: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
      },
    },
  }),
};
