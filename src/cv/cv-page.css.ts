import { cursors, fonts, motion, palette } from "../theme.vars.css";
import { style } from "@vanilla-extract/css";
import { REDUCE } from "../browser/media-query";
const PHONE = "(max-width: 639px)";
const PRINT = "print";

// The switch's mode, which the page's script sets on <cv-page>. Its rules nest inside the media
// queries they share a property with, because a style's media queries come after its selectors.
const ATS = ":is([data-ats] *)";
const PLAIN = "Arial, Helvetica, sans-serif";
const INK = "#000";

export const styles = {
  // The custom element stands in for the block the root would be.
  root: style({
    display: "block",
    paddingTop: "20px",
    paddingBottom: "80px",
    selectors: {
      // The ATS version previews plain paper, which the scanlines (arcade.scan) would stripe.
      "&:is([data-ats])::after": {
        display: "none",
      },
    },
    "@media": {
      [PRINT]: {
        paddingTop: "10mm",
        paddingBottom: "10mm",
        paddingInline: "10mm",
        boxDecorationBreak: "clone",
        selectors: {
          "&:is([data-ats])": {
            paddingTop: 0,
            paddingBottom: 0,
            paddingInline: 0,
          },
        },
      },
    },
  }),
  // The root holds the page's margin on paper, so the design's ground reaches the paper's edge.
  column: style({
    "@media": {
      [PRINT]: {
        paddingInline: 0,
      },
    },
  }),
  // Paper has nothing to press.
  bar: style({
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px 20px",
    maxWidth: "860px",
    marginInline: "auto",
    marginBottom: "16px",
    "@media": {
      [PRINT]: {
        display: "none",
      },
    },
  }),
  // Without the page's script the switch couldn't do anything.
  switch: style({
    display: "none",
    alignItems: "center",
    gap: "10px",
    font: `700 14px ${fonts["--display"]}`,
    color: palette["--text"],
    cursor: cursors["--cursor-point"],
    userSelect: "none",
    selectors: {
      "&:is(.js *)": {
        display: "inline-flex",
      },
    },
  }),
  track: style({
    appearance: "none",
    flexShrink: 0,
    position: "relative",
    width: "44px",
    height: "26px",
    margin: 0,
    borderRadius: "999px",
    backgroundColor: palette["--soft-key"],
    cursor: "inherit",
    transitionProperty: "background-color",
    transitionDuration: motion["--t-moderate"],
    transitionTimingFunction: motion["--moderate"],
    selectors: {
      "&::before": {
        content: '""',
        position: "absolute",
        top: "3px",
        left: "3px",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        backgroundColor: "#fff",
        boxShadow: "0 1px 2px rgb(0 0 0 / 0.3)",
        transitionProperty: "transform",
        transitionDuration: motion["--t-moderate"],
        transitionTimingFunction: motion["--moderate"],
      },
      "&:focus-visible": {
        outlineWidth: "3px",
        outlineStyle: "solid",
        outlineColor: palette["--focus"],
        outlineOffset: "3px",
      },
      "&:checked": {
        backgroundColor: palette["--go"],
      },
      "&:checked::before": {
        transform: "translateX(18px)",
      },
    },
    "@media": {
      [REDUCE]: {
        selectors: {
          "&::before": {
            transitionProperty: "none",
          },
        },
      },
    },
  }),
  // On paper each page gets its own whole card rather than a slice of one.
  sheet: style({
    maxWidth: "860px",
    marginInline: "auto",
    padding: "48px",
    borderRadius: "28px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    backgroundColor: palette["--panel"],
    boxShadow: palette["--raise"],
    selectors: {
      [`&${ATS}`]: {
        backgroundColor: "#fff",
        color: INK,
        font: `400 14px/1.45 ${PLAIN}`,
      },
    },
    "@media": {
      [PRINT]: {
        maxWidth: "none",
        marginInline: 0,
        padding: "32px",
        boxDecorationBreak: "clone",
        borderRadius: "20px",
        borderWidth: "1px",
        boxShadow: "none",
        selectors: {
          [`&${ATS}`]: {
            padding: 0,
            borderRadius: 0,
            borderWidth: 0,
          },
        },
      },
    },
  }),
  designOnly: style({
    display: "inline",
    selectors: {
      [`&${ATS}`]: {
        display: "none",
      },
    },
  }),
  atsOnly: style({
    display: "none",
    selectors: {
      [`&${ATS}`]: {
        display: "inline",
      },
    },
  }),
  head: style({
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "start",
    gap: "20px",
  }),
  name: style({
    margin: 0,
    font: `900 34px/1.05 ${fonts["--display"]}`,
    letterSpacing: "-0.03em",
    color: palette["--text"],
    selectors: {
      [`&${ATS}`]: {
        font: `700 26px/1.2 ${PLAIN}`,
        letterSpacing: "normal",
        color: INK,
      },
    },
    "@media": {
      [PHONE]: {
        selectors: {
          "&&": {
            font: `900 26px/1.1 ${fonts["--display"]}`,
          },
          [`&${ATS}`]: {
            font: `700 22px/1.2 ${PLAIN}`,
          },
        },
      },
    },
  }),
  role: style({
    margin: "8px 0 0",
    font: `700 15px ${fonts["--display"]}`,
    color: palette["--text"],
    selectors: {
      [`&${ATS}`]: {
        font: `700 15px ${PLAIN}`,
        color: INK,
      },
    },
  }),
  line: style({
    margin: "8px 0 0",
    fontSize: "15px",
    selectors: {
      [`&${ATS}`]: {
        fontSize: "14px",
      },
    },
  }),
  section: style({
    marginTop: "36px",
    "@media": {
      [PRINT]: {
        marginTop: "24px",
        selectors: {
          [`&${ATS}`]: {
            marginTop: "18px",
          },
        },
      },
    },
  }),
  heading: style({
    margin: "0 0 14px",
    paddingBottom: "8px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
    font: `800 18px ${fonts["--display"]}`,
    letterSpacing: "-0.01em",
    color: palette["--text"],
    breakAfter: "avoid",
    selectors: {
      [`&${ATS}`]: {
        paddingBottom: "4px",
        borderBottomColor: INK,
        font: `700 16px ${PLAIN}`,
        letterSpacing: "normal",
        color: INK,
      },
    },
  }),
  entry: style({
    marginTop: "20px",
    selectors: {
      [`&${ATS}`]: {
        marginTop: "14px",
      },
    },
  }),
  entryTitle: style({
    margin: "0 0 6px",
    breakInside: "avoid",
    font: `700 15px/1.4 ${fonts["--display"]}`,
    color: palette["--text"],
    breakAfter: "avoid",
    selectors: {
      [`&${ATS}`]: {
        font: `700 14px/1.4 ${PLAIN}`,
        color: INK,
      },
    },
  }),
  text: style({
    margin: "0 0 10px",
  }),
  label: style({
    fontWeight: 600,
    color: palette["--text"],
    selectors: {
      [`&${ATS}`]: {
        color: INK,
      },
    },
  }),
  list: style({
    margin: 0,
    paddingLeft: "20px",
    // A typed bullet stays in the PDF's text, where a parser sees the list; a disc is only drawn.
    listStyleType: "disc",
    selectors: {
      [`&${ATS}`]: {
        listStyleType: '"\\2022  "',
      },
    },
  }),
  point: style({
    marginBottom: "6px",
    breakInside: "avoid",
    selectors: {
      [`&${ATS}`]: {
        marginBottom: "4px",
      },
    },
  }),
  link: style({
    color: palette["--text"],
    textDecorationLine: "underline",
    textUnderlineOffset: "3px",
    overflowWrap: "anywhere",
    selectors: {
      [`&${ATS}`]: {
        color: INK,
        textDecorationLine: "none",
      },
    },
  }),
};
