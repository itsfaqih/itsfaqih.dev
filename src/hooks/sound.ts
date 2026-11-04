import { whenIdle } from "./idle";

export type Cue =
  | "tap"
  | "move"
  | "open"
  | "close"
  | "enter"
  | "back"
  | "on"
  | "off"
  | "success"
  | "error";

/** Each cue's clip is public/sounds/<cue>.mp3, written by scripts/sounds.ts. */
const CUES: Record<Cue, { gain: number }> = {
  tap: { gain: 0.3 },
  move: { gain: 0.15 },
  open: { gain: 0.35 },
  close: { gain: 0.35 },
  enter: { gain: 0.35 },
  back: { gain: 0.35 },
  on: { gain: 0.4 },
  off: { gain: 0.4 },
  success: { gain: 0.3 },
  error: { gain: 0.25 },
};
// Sweeping the pointer across a grid would otherwise fire a click per tile.
const MOVE_GAP_MS = 40;
// Past this a cue still decoding is dropped: a late sound reads as lag.
const LATE_MS = 150;
const SOUND_CHANGE_EVENT = "sound-change";
const CONTROL = "a[href], button, summary, [role=option], [role=button], label";

const isCue = (name: string): name is Cue => Object.hasOwn(CUES, name);
const CUE_NAMES = Object.keys(CUES).filter(isCue);

// Stands in for localStorage when the browser refuses it.
let unsaved: string | null = null;

export function soundOn() {
  try {
    return localStorage.getItem("sound") !== "off";
  } catch {
    return unsaved !== "off";
  }
}

let context: AudioContext | undefined;
const bytes = new Map<Cue, Promise<ArrayBuffer | undefined>>();
const decoding = new Map<Cue, Promise<AudioBuffer | undefined>>();
const decoded = new Map<Cue, AudioBuffer>();
let lastMoveAt = -Infinity;

// A clip that fails to load stays silent until the next page load.
function fetchClips() {
  for (const cue of CUE_NAMES) {
    if (bytes.has(cue)) continue;
    const clip = fetch(`/sounds/${cue}.mp3`)
      .then((response) => (response.ok ? response.arrayBuffer() : undefined))
      .catch(() => undefined);
    bytes.set(cue, clip);
  }
}

function decode(context: AudioContext, cue: Cue) {
  fetchClips();
  let pending = decoding.get(cue);
  if (pending) return pending;
  pending = bytes
    .get(cue)!
    .then((loaded) => loaded && context.decodeAudioData(loaded))
    .then(
      (buffer) => {
        if (buffer) decoded.set(cue, buffer);
        return buffer;
      },
      () => undefined,
    );
  decoding.set(cue, pending);
  return pending;
}

function start(context: AudioContext, cue: Cue, buffer: AudioBuffer) {
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  gain.gain.value = CUES[cue].gain;
  source.connect(gain).connect(context.destination);
  source.start();
}

/** Plays `cue`, unless sound is off or the page has had no user gesture yet. */
export function play(cue: Cue) {
  // An AudioContext made before a gesture is refused, and Chromium logs a warning for it.
  if (!soundOn() || navigator.userActivation?.hasBeenActive === false) return;
  const calledAt = performance.now();
  if (cue === "move") {
    if (calledAt - lastMoveAt < MOVE_GAP_MS) return;
    lastMoveAt = calledAt;
  }
  if (!context) {
    context = new AudioContext();
    for (const each of CUE_NAMES) void decode(context, each);
  }
  const ctx = context;
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  const buffer = decoded.get(cue);
  if (buffer) start(ctx, cue, buffer);
  else
    void decode(ctx, cue).then((ready) => {
      if (ready && performance.now() - calledAt <= LATE_MS) start(ctx, cue, ready);
    });
}

/** Saves and applies the other setting. Turning off plays `off` first; turning on plays `on`. */
export function toggleSound() {
  const next = soundOn() ? "off" : "on";
  if (next === "off") play("off");
  unsaved = next;
  try {
    localStorage.setItem("sound", next);
  } catch {}
  dispatchEvent(new Event(SOUND_CHANGE_EVENT));
  if (next === "on") {
    fetchClips();
    play("on");
  }
}

/** Calls `onChange` whenever the setting may have changed, here or in another tab. Returns the unsubscribe. */
export function watchSound(onChange: () => void) {
  addEventListener("storage", onChange);
  addEventListener(SOUND_CHANGE_EVENT, onChange);
  return () => {
    removeEventListener("storage", onChange);
    removeEventListener(SOUND_CHANGE_EVENT, onChange);
  };
}

/**
 * Taps on every press of a link or button. The nearest `data-sound` on or above the control names
 * another cue, or `none` where a component plays its own.
 */
export function voiceControls() {
  if (soundOn()) whenIdle(fetchClips);
  const voice = (event: Event) => {
    if (!event.isTrusted || !(event.target instanceof Element)) return;
    const control = event.target.closest(CONTROL);
    if (!control || control.matches(":disabled, [aria-disabled=true]")) return;
    const cue = control.closest<HTMLElement>("[data-sound]")?.dataset.sound ?? "tap";
    if (isCue(cue)) play(cue);
  };
  // A mouse or pen sounds on the press, which also lands before a link navigates away. Touch and
  // keyboard sound on the click, since a touch press may turn out to be a scroll.
  const PRESSED = ["mouse", "pen"];
  let pressedBy = "";
  document.addEventListener(
    "pointerdown",
    (event) => {
      pressedBy = event.pointerType;
      if (PRESSED.includes(pressedBy) && event.button === 0) voice(event);
    },
    { capture: true },
  );
  document.addEventListener(
    "click",
    (event) => {
      // Some browsers still fire a plain MouseEvent click. A keyboard's click has no detail.
      const by =
        event instanceof PointerEvent && event.pointerType
          ? event.pointerType
          : event.detail > 0
            ? pressedBy
            : "";
      if (!PRESSED.includes(by)) voice(event);
    },
    { capture: true },
  );
}
