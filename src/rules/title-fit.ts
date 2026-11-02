import { openSync } from "fontkit";
import { TITLE_MARK_INSET, TITLE_TRACKING } from "./rule-landing.styles";

// The static cut of the weight shell.title is set at. fontkit can't vary the woff2 the page loads.
const font = openSync("scripts/og/fonts/unbounded-900.ttf");
// A word exactly as wide as its column would break on a rounding error.
const SLACK = 0.005;

/** The width of a title's widest word in em. The last word sits in the mark, which pads it. */
export function titleWordEm(title: string) {
  if (!("layout" in font)) throw new Error("Expected a single font, not a collection");
  const words = title.split(" ").map((word) => {
    const { advanceWidth } = font.layout(word);
    return advanceWidth / font.unitsPerEm + word.length * TITLE_TRACKING;
  });
  words[words.length - 1]! += TITLE_MARK_INSET * 2;
  return (Math.max(...words) + SLACK).toFixed(3);
}
