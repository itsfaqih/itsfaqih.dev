import { watchScrollbar } from "./scrollbar";
import { HOVER } from "../browser/media-query";

const REVEAL_PX = 24;
const MIN_THUMB_PX = 32;
// The bar keeps clear of the box's rounded ends.
const INSET_PX = 6;

/**
 * The page scrollbar's bar for a scrolling box: one thumb in the hue of what sits mid-box, no track,
 * shown while the box scrolls or the pointer is within reach of its right edge. The track, with
 * `boxScrollbar.track` and `marker` and the thumb as its only child, sits as a sibling of the box,
 * inside a positioned wrapper that matches the box's own size. Returns the stop.
 */
export function watchBoxScrollbar(box: HTMLElement, track: HTMLElement) {
  const thumb = track.firstElementChild;
  if (!(thumb instanceof HTMLElement)) return () => {};
  if (!matchMedia(HOVER).matches) return () => {};

  const bar = watchScrollbar(track, thumb, {
    target: box,
    top: () => box.scrollTop,
    height: () => box.clientHeight,
    scrollHeight: () => box.scrollHeight,
    jump: (top) => (box.scrollTop = top),
    near: (e) => {
      const rect = box.getBoundingClientRect();
      return (
        e.clientX <= rect.right &&
        e.clientX >= rect.right - REVEAL_PX &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
    },
    hue: () => {
      const rect = box.getBoundingClientRect();
      const middle = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      const host = box.contains(middle) ? middle?.closest<HTMLElement>("[style*='--c']") : null;
      return host ? getComputedStyle(host).getPropertyValue("--c").trim() : "";
    },
    inset: INSET_PX,
    minThumb: MIN_THUMB_PX,
  });

  // The box resizes as levels fit, and its content changes as the query filters it.
  const resize = new ResizeObserver(bar.schedule);
  resize.observe(box);
  const mutation = new MutationObserver(bar.schedule);
  mutation.observe(box, { childList: true, subtree: true });
  return () => {
    resize.disconnect();
    mutation.disconnect();
    bar.stop();
  };
}
