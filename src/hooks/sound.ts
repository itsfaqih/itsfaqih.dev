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
  | "error"
  | "lift"
  | "place"
  | "flicker"
  | "dive"
  | "rise"
  | "turn"
  | "fold";

/**
 * Each cue's clip is public/sounds/<cue>.mp3, written by scripts/sounds.ts. A cue with a `gap`
 * drops a repeat that comes sooner than that many milliseconds after the last one. `late` is how
 * long a cue still loading may wait to start, in place of LATE_MS.
 */
const CUES: Record<Cue, { gain: number; gap?: number; late?: number }> = {
  tap: { gain: 0.3 },
  // Sweeping the pointer across a grid would otherwise fire a click per tile.
  move: { gain: 0.15, gap: 40 },
  open: { gain: 0.35 },
  close: { gain: 0.35 },
  enter: { gain: 0.35 },
  back: { gain: 0.35 },
  // Turning sound back on loads its clip from cold, and it's the one cue someone waits to hear.
  on: { gain: 0.4, late: 400 },
  off: { gain: 0.4 },
  success: { gain: 0.3 },
  error: { gain: 0.25 },
  lift: { gain: 0.35 },
  place: { gain: 0.2 },
  flicker: { gain: 0.12 },
  // The page it lands on loads the clip while the dive runs, and 620ms of zoom covers a later start.
  dive: { gain: 0.3, late: 250 },
  // The dive run backwards, as leaving a rule zooms back out onto its tile on the index.
  rise: { gain: 0.3, late: 250 },
  // Opening a job in the work history turns to its page, about as long as the glide; closing the
  // open one is a quicker flick.
  turn: { gain: 0.4 },
  fold: { gain: 0.3 },
};
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
const lastPlayedAt = new Map<Cue, number>();

// A clip that fails to load stays silent until the next page load.
function fetchClip(cue: Cue) {
  let clip = bytes.get(cue);
  if (!clip) {
    clip = fetch(`/sounds/${cue}.mp3`)
      .then((response) => (response.ok ? response.arrayBuffer() : undefined))
      .catch(() => undefined);
    bytes.set(cue, clip);
  }
  return clip;
}

function fetchClips() {
  for (const cue of CUE_NAMES) void fetchClip(cue);
}

// Fetches only `cue`'s clip if it hasn't come yet: one asked for before the idle fetch, as on a
// page a dive lands on, would otherwise queue behind all the others.
function decode(context: AudioContext, cue: Cue) {
  let pending = decoding.get(cue);
  if (pending) return pending;
  pending = fetchClip(cue)
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
  const { gap } = CUES[cue];
  if (gap !== undefined) {
    if (calledAt - (lastPlayedAt.get(cue) ?? -Infinity) < gap) return;
    lastPlayedAt.set(cue, calledAt);
  }
  if (!context) {
    context = new AudioContext();
    // The rest wait, or decoding them all at once makes this first cue miss LATE_MS.
    const made = context;
    void decode(made, cue).then(() => CUE_NAMES.forEach((each) => void decode(made, each)));
  }
  const ctx = context;
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  const buffer = decoded.get(cue);
  if (buffer) start(ctx, cue, buffer);
  else {
    // Timed from here, not the call: the browser's first AudioContext can take ~170ms to make
    // while its audio service starts, and that once-a-session wait shouldn't drop the sound.
    const askedAt = performance.now();
    void decode(ctx, cue).then((ready) => {
      if (ready && performance.now() - askedAt <= (CUES[cue].late ?? LATE_MS)) start(ctx, cue, ready);
    });
  }
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
    play("on");
    fetchClips();
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
