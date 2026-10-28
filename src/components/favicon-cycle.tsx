import { useEffect } from "react";
import { reducedMotion } from "../hooks/use-media-query";

const HUES = [
  ["#0a9cd4", "#4dd4ff"],
  ["#e0389f", "#ff6ad5"],
  ["#e38a00", "#ffb02e"],
  ["#2aa816", "#7dff6a"],
  ["#7650ee", "#9d7bff"],
] as const;
const STEP_MS = 2000;

const F = "M6 4H24V10H12V14H20V20H12V28H6Z";

function faviconSvg([light, dark]: readonly [string, string]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><style>.t{fill:#f5f5f8}.i{fill:#111117}.h{fill:${light}}.m{mix-blend-mode:multiply}@media (prefers-color-scheme:dark){.t{fill:#0e0e13}.i{fill:#f4f4f8}.h{fill:${dark}}.m{mix-blend-mode:screen}}</style><defs><pattern id="ht" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><circle class="h" cx="1.2" cy="1.2" r="0.85"/></pattern></defs><rect class="t" width="32" height="32" rx="7"/><g transform="translate(2.5 2)" fill="url(#ht)" class="m"><path d="${F}"/></g><path class="i" d="${F}"/><circle class="h" cx="24" cy="25" r="3"/></svg>`;
}

/** Steps the tab icon through the topic hues. Chrome and Safari only paint an SVG favicon's first
    frame, so the colour changes by swapping the link's href; under reduced motion it stays blue. */
export function FaviconCycle() {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]');
    if (!link || reducedMotion()) return;

    const fallback = link.href;
    const frames = HUES.map((hue) => `data:image/svg+xml,${encodeURIComponent(faviconSvg(hue))}`);
    let step = 0;
    const timer = window.setInterval(() => {
      step = (step + 1) % frames.length;
      link.href = frames[step]!;
    }, STEP_MS);

    return () => {
      window.clearInterval(timer);
      link.href = fallback;
    };
  }, []);

  return null;
}
