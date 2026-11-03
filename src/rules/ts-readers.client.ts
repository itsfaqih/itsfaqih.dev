import { reducedMotion } from "../hooks/media-query";
import {
  dayOf,
  hourAngle,
  minuteAngle,
  offBy,
  timeOf,
  type Reading,
  type Wall,
} from "./handling-timestamps";
import { tsView } from "./handling-timestamps.view";
import { OUT, TABBED } from "./rule-landing.css";
import { onceOnScreen } from "./rule-motion";

function swing(root: Element, from: Wall[], to: Wall[], duration: number, step: number) {
  return [...root.querySelectorAll<HTMLElement>(".ts-reader")].flatMap((card, index) => {
    const start = from[index];
    const end = to[index];
    const hour = card.querySelector<HTMLElement>(".ts-hour");
    const minute = card.querySelector<HTMLElement>(".ts-min");
    if (start === undefined || end === undefined || !hour || !minute || start === end) return [];
    const timing: KeyframeAnimationOptions = {
      duration,
      delay: index * step,
      easing: OUT,
      fill: "backwards",
    };
    const h = hourAngle(end);
    const m = minuteAngle(end);
    const turn = (end - start) / 60_000 / 2;
    const minuteTurn = ((((m - minuteAngle(start)) % 360) + 540) % 360) - 180;
    return [
      hour.animate(
        [{ transform: `rotate(${h - turn}deg)` }, { transform: `rotate(${h}deg)` }],
        timing,
      ),
      minute.animate(
        [{ transform: `rotate(${m - minuteTurn}deg)` }, { transform: `rotate(${m}deg)` }],
        timing,
      ),
    ];
  });
}

const comment = () => document.createComment("");

function shouldOf(off: string, truth: string) {
  const should = document.createElement("span");
  should.className = tsView.should;
  const sr = document.createElement("span");
  sr.className = tsView.srOnly;
  sr.append(off, comment(), ", ");
  should.append(sr, "should be", comment(), " ", comment(), truth);
  return should;
}

const setText = (element: Element, text: string) => {
  if (element.textContent !== text) element.textContent = text;
};

/** Redraws one reader card (ts-readers.astro) for `reading`, keeping its nodes as React did. */
function paint(card: Element, reading: Reading) {
  const off = offBy(reading);
  const clock = card.firstElementChild!;
  const read = card.lastElementChild!;
  let ghost = clock.firstElementChild!.classList.contains("ts-min")
    ? null
    : clock.firstElementChild;
  if (off && !ghost) {
    ghost = document.createElement("i");
    ghost.className = tsView.ghost;
    clock.prepend(ghost);
  } else if (!off && ghost) {
    ghost.remove();
    ghost = null;
  }
  ghost?.setAttribute("style", `--a:${hourAngle(reading.truth)}deg`);
  const minute = clock.querySelector(".ts-min")!;
  const hour = clock.querySelector(".ts-hour")!;
  minute.setAttribute("style", `--a:${minuteAngle(reading.shown)}deg`);
  hour.setAttribute("style", `--a:${hourAngle(reading.shown)}deg`);
  hour.className = tsView.hour(off !== null);

  const time = read.children[1]!;
  const should = read.children[3];
  time.className = tsView.time(off !== null);
  setText(time, timeOf(reading.shown));
  setText(read.children[2]!, dayOf(reading.shown));
  if (!off) {
    should?.remove();
    return;
  }
  if (!should) {
    read.append(shouldOf(off, timeOf(reading.truth)));
    return;
  }
  should.firstChild!.firstChild!.nodeValue = off;
  should.lastChild!.nodeValue = timeOf(reading.truth);
}

/**
 * Two readers' clocks (ts-readers.astro). Below the fold they swing from UTC to each reader's time
 * as they come on screen; a demo that changes the time calls `show`, and the hands swing there.
 */
export class TsReaders extends HTMLElement {
  #stop?: () => void;
  #shown: Wall[] = [];

  connectedCallback() {
    const root = this.firstElementChild!;
    const shown = this.dataset.times!.split(",").map(Number);
    const utc = Number(this.dataset.utc);
    this.#shown = shown;
    // React's phone branch looked for `.demo` and `.pane` ancestors that no page renders, so on a
    // phone the clocks never swing in; that stays as shipped.
    if (reducedMotion() || matchMedia(TABBED).matches) return;
    if (root.getBoundingClientRect().top < innerHeight * 0.7) return;
    const held = swing(
      root,
      shown.map(() => utc),
      shown,
      720,
      120,
    );
    for (const animation of held) animation.pause();
    let timer = 0;
    const stop = onceOnScreen(root, () => {
      timer = window.setTimeout(() => {
        for (const animation of held) animation.play();
      }, 240);
    });
    this.#stop = () => {
      stop();
      clearTimeout(timer);
      for (const animation of held) animation.cancel();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }

  show(readings: Reading[]) {
    const root = this.firstElementChild!;
    readings.forEach((reading, index) => paint(root.children[index]!, reading));
    const before = this.#shown;
    this.#shown = readings.map((reading) => reading.shown);
    if (reducedMotion() || before.join() === this.#shown.join()) return;
    for (const animation of root.getAnimations({ subtree: true })) animation.cancel();
    swing(root, before, this.#shown, 280, 0);
  }
}

customElements.define("ts-readers", TsReaders);
