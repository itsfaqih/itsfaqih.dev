import React from "react";
import type {
  ScrambleTextProps,
  ScrambleTextSegment,
} from "../-types/home-types";

function getScrambleInlineSegments(
  finalText: string,
  renderedText: string,
): ScrambleTextSegment[] | null {
  const finalSegments = finalText.split(/(\s+)/);
  const renderedSegments = renderedText.split(/(\s+)/);
  if (finalSegments.length !== renderedSegments.length) {
    return null;
  }

  return finalSegments.map(
    (segment, index): ScrambleTextSegment => ({
      final: segment,
      rendered: renderedSegments[index] ?? segment,
      isWhitespace: /\s+/.test(segment),
    }),
  );
}

function ScrambleInlineText({
  finalText,
  renderedText,
}: ScrambleTextProps): React.JSX.Element {
  const inlineSegments = React.useMemo(
    () => getScrambleInlineSegments(finalText, renderedText),
    [finalText, renderedText],
  );

  if (!inlineSegments) {
    return <span>{renderedText}</span>;
  }

  return (
    <span className="scramble-lock-text scramble-lock-text-inline">
      {inlineSegments.map((segment, index) => (
        <React.Fragment key={`${index}-${segment.final}`}>
          {segment.isWhitespace ? (
            segment.final
          ) : (
            <span className="scramble-lock-inline-word">
              <span className="scramble-lock-text-base">{segment.final}</span>
              <span className="scramble-lock-text-overlay" aria-hidden="true">
                {segment.rendered}
              </span>
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

function ScrambleBlockText({
  finalText,
  renderedText,
}: ScrambleTextProps): React.JSX.Element {
  return (
    <span className="scramble-lock-text scramble-lock-text-block">
      <span className="scramble-lock-text-track">
        <span className="scramble-lock-text-base">{finalText}</span>
        <span className="scramble-lock-text-overlay" aria-hidden="true">
          {renderedText}
        </span>
      </span>
    </span>
  );
}

function ScrambleMarqueeText({
  finalText,
  renderedText,
}: ScrambleTextProps): React.JSX.Element {
  const wrapperRef = React.useRef<HTMLSpanElement | null>(null);
  const trackRef = React.useRef<HTMLSpanElement | null>(null);
  const [marqueeDistancePx, setMarqueeDistancePx] = React.useState(0);

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) {
      setMarqueeDistancePx(0);
      return;
    }

    const measure = () => {
      const distance = Math.max(0, track.scrollWidth - wrapper.clientWidth);
      setMarqueeDistancePx(distance > 8 ? distance : 0);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    observer.observe(track);

    return () => observer.disconnect();
  }, [finalText, renderedText]);

  const marqueeDurationSec = Math.max(4.5, marqueeDistancePx / 30 + 1.8);

  return (
    <span
      ref={wrapperRef}
      className={`scramble-lock-text scramble-lock-text-block scramble-lock-text-block-nowrap scramble-lock-text-edge-bleed ${marqueeDistancePx > 0 ? "scramble-lock-text-marquee" : ""}`}
      style={
        marqueeDistancePx > 0
          ? ({
              "--scramble-marquee-distance": `-${marqueeDistancePx}px`,
              "--scramble-marquee-duration": `${marqueeDurationSec}s`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <span ref={trackRef} className="scramble-lock-text-track">
        <span className="scramble-lock-text-base">{finalText}</span>
        <span className="scramble-lock-text-overlay" aria-hidden="true">
          {renderedText}
        </span>
      </span>
    </span>
  );
}

export const ScrambleText = {
  Inline: ScrambleInlineText,
  Block: ScrambleBlockText,
  Marquee: ScrambleMarqueeText,
} as const;
