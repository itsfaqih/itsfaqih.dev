import { style } from "@vanilla-extract/css";
import { under1 } from "../layers.css";
import { palette } from "../theme.vars.css";
const PHONE = "(max-width: 639px)";

export const styles = {
  container: style({
    // On phones the text sits on a white sheet that fades out at the top and bottom.
    "@layer": {
      [under1]: {
        marginInline: "auto",
        paddingInline: "1.5rem",
        paddingTop: "96px",
        paddingBottom: "5rem",
        "@media": {
          [PHONE]: {
            position: "relative",
            isolation: "isolate",
            paddingTop: 0,
            selectors: {
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                zIndex: -1,
                pointerEvents: "none",
                backgroundColor: palette["--panel"],
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 1%, black 85%, transparent 100%)",
                opacity: 0.9,
              },
              "&:is(.dark *)::before": {
                backgroundColor: "transparent",
              },
            },
          },
        },
      },
    },
  }),
};

export const maxWidths = {
  "2xl": style({
    maxWidth: "42rem",
  }),
  "3xl": style({
    maxWidth: "48rem",
  }),
  "4xl": style({
    maxWidth: "56rem",
  }),
};
