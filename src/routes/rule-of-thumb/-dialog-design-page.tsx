import { SpeakerHighIcon, XIcon } from "@phosphor-icons/react";
import {
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { type Lesson, type Level, RuleLanding } from "./-components/rule-landing";
import "./dialog-design.css";

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- The small window every demo opens its dialog in ----------

/** Focus inside one demo window. Its stops are the elements marked `data-stop`, in DOM order and
 * skipping inert ones, which is the order Tab walks them in. The ring sits on `at`. */
function useWindowFocus() {
  const ref = useRef<HTMLDivElement>(null);
  const atRef = useRef<string | null>(null);
  const pending = useRef(false);
  // A fresh object each move, so moving to the same stop still renders and focuses it.
  const [focus, setFocus] = useState<{ at: string | null }>({ at: null });

  // Real focus waits for the commit: a dialog that has just opened is inert until then.
  useLayoutEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    if (focus.at) find(focus.at)?.focus({ preventScroll: true });
  });

  function find(stop: string) {
    return ref.current?.querySelector<HTMLElement>(`[data-stop="${stop}"]`) ?? null;
  }

  /** Moves the ring, and real focus with it when the reader did the moving. */
  function move(stop: string | null, real: boolean) {
    atRef.current = stop;
    pending.current = real;
    setFocus({ at: stop });
  }

  /** The stop Tab would reach next. With `within`, Tab wraps inside it. */
  function next(within: HTMLElement | null, back: boolean) {
    const stops = [...(ref.current?.querySelectorAll<HTMLElement>("[data-stop]") ?? [])].filter(
      (element) => !element.closest("[inert]") && (!within || within.contains(element)),
    );
    if (stops.length === 0) return null;
    const now = stops.findIndex((element) => element.dataset.stop === atRef.current);
    const to =
      now === -1
        ? back
          ? stops.length - 1
          : 0
        : (now + (back ? -1 : 1) + stops.length) % stops.length;
    return stops[to]?.dataset.stop ?? null;
  }

  function onFocus(event: FocusEvent<HTMLDivElement>) {
    const stop =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLElement>("[data-stop]")?.dataset.stop
        : undefined;
    if (!stop || stop === atRef.current) return;
    atRef.current = stop;
    setFocus({ at: stop });
  }

  function stop(name: string) {
    return { "data-stop": name, "data-at": focus.at === name || undefined };
  }

  return { ref, at: focus.at, find, move, next, onFocus, stop };
}

type WindowFocus = ReturnType<typeof useWindowFocus>;

type ScreenProps = {
  focus: WindowFocus;
  open: boolean;
  page: ReactNode;
  children: ReactNode;
  onScrim?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
};

/** A page, a scrim and its dialogs, all inside the pane. Nothing here covers or locks the real
 * page. */
function Screen({ focus, open, page, children, onScrim, onKeyDown }: ScreenProps) {
  return (
    <div
      ref={focus.ref}
      className="dd-screen"
      data-open={open || undefined}
      onFocus={focus.onFocus}
      onKeyDown={onKeyDown}
    >
      {page}
      <div className="dd-scrim" aria-hidden="true" onClick={onScrim} />
      {children}
    </div>
  );
}

type DialogProps = {
  open: boolean;
  title: string;
  body?: ReactNode;
  children: ReactNode;
  close?: ReactNode;
  /** A plain div with no role and no name, the way lesson 6's wrong side ships. */
  bare?: boolean;
  /** Open under a second dialog that has taken over. */
  held?: boolean;
  top?: boolean;
  ref?: Ref<HTMLDivElement>;
};

/** Labelled by its title and described by its body. No aria-modal: inside a pane it would tell a
 * screen reader the real page is gone. */
function Dialog({ open, title, body, children, close, bare, held, top, ref }: DialogProps) {
  const id = useId();
  return (
    <div
      ref={ref}
      className={top ? "dd-dialog dd-top" : "dd-dialog"}
      role={bare ? undefined : "dialog"}
      aria-labelledby={bare ? undefined : `${id}t`}
      aria-describedby={bare || !body ? undefined : `${id}d`}
      data-open={open || undefined}
      inert={!open || held}
    >
      <div className="dd-head">
        <p id={`${id}t`} className="dd-title">
          {title}
        </p>
        {close}
      </div>
      {body && (
        <p id={`${id}d`} className="dd-body">
          {body}
        </p>
      )}
      {children}
    </div>
  );
}

type CloseProps = { focus: WindowFocus; onClose: () => void };

function CloseX({ focus, onClose }: CloseProps) {
  return (
    <button
      type="button"
      className="dd-x"
      aria-label="Close"
      {...focus.stop("x")}
      onClick={onClose}
    >
      <XIcon weight="bold" aria-hidden="true" />
    </button>
  );
}

/** A key under the window that does what the real key does, for readers without a keyboard. It
 * keeps focus where it was, so Enter and Tab act on the window, not on the key. */
function Key({ children, onPress }: { children: ReactNode; onPress: () => void }) {
  return (
    <button
      type="button"
      className="dd-key"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onPress}
    >
      {children}
    </button>
  );
}

type StageProps = {
  stageRef?: RefObject<HTMLDivElement | null>;
  keys: ReactNode;
  read: ReactNode;
  tone?: "no" | "yes";
  children: ReactNode;
};

function Stage({ stageRef, keys, read, tone, children }: StageProps) {
  return (
    <div ref={stageRef} className="dd-stage">
      {children}
      <div className="dd-bar">
        <span className="dd-keys">{keys}</span>
        <span className="dd-read" data-tone={tone} aria-live="polite">
          {read}
        </span>
      </div>
    </div>
  );
}

// ---------- Lesson 1: focus stays inside (the signature) ----------

const PROFILE_STOPS = new Map([
  ["trigger", "Edit profile"],
  ["pay", "Pay now"],
  ["help", "Help"],
  ["name", "Name"],
  ["cancel", "Cancel"],
  ["save", "Save"],
]);
const IN_PROFILE = ["name", "cancel", "save"];
const WALK_START = 500;
const WALK_STEP = 600;
// Seven presses: the left lap ends back on the page, the right one is still inside.
const WALK_PRESSES = 7;

function FocusDemo({ sealed }: { sealed: boolean }) {
  const focus = useWindowFocus();
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const [open, setOpen] = useState(false);

  function show(real: boolean) {
    setOpen(true);
    // The careless dialog leaves focus on the button that opened it, behind the scrim.
    focus.move(sealed ? "name" : "trigger", real);
  }

  function hide() {
    setOpen(false);
    // The careless one never moves focus. If it was in the dialog, it falls to <body>.
    const stays = focus.at !== null && !IN_PROFILE.includes(focus.at) ? focus.at : null;
    focus.move(sealed ? "trigger" : stays, true);
  }

  function tab(real: boolean, back = false) {
    focus.move(focus.next(sealed && open ? dialogRef.current : null, back), real);
  }

  // The signature: once on screen, both dialogs open and Tab presses itself.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reducedMotion()) return;
    const timers: number[] = [];
    const later = (at: number, step: () => void) =>
      timers.push(
        window.setTimeout(() => {
          if (!touched.current) step();
        }, at),
      );
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        later(WALK_START, () => show(false));
        for (let press = 1; press <= WALK_PRESSES; press++) {
          later(WALK_START + press * WALK_STEP, () => tab(false));
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(stage);
    return () => {
      observer.disconnect();
      for (const timer of timers) clearTimeout(timer);
    };
    // Runs once: show and tab only touch refs and state setters.
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!open) return;
    if (event.key === "Escape") hide();
    if (event.key === "Tab" && sealed) {
      event.preventDefault();
      tab(true, event.shiftKey);
    }
  }

  const behind = open && focus.at !== null && !IN_PROFILE.includes(focus.at);
  const where = (focus.at && PROFILE_STOPS.get(focus.at)) ?? "<body>";

  return (
    <div
      onPointerDownCapture={() => (touched.current = true)}
      onKeyDownCapture={() => (touched.current = true)}
    >
      <Stage
        stageRef={stageRef}
        keys={
          <>
            <Key onPress={() => tab(true)}>Tab</Key>
            <Key onPress={() => open && hide()}>Esc</Key>
          </>
        }
        read={
          <>
            Focus: {where}
            {behind && ", behind"}
          </>
        }
        tone={behind || (open && !focus.at) ? "no" : undefined}
      >
        <Screen
          focus={focus}
          open={open}
          onKeyDown={onKeyDown}
          page={
            <div className="dd-page dd-checkout" inert={sealed && open}>
              <div className="dd-nav">
                <span className="dd-logo" />
                <button type="button" className="dd-link" {...focus.stop("help")}>
                  Help
                </button>
              </div>
              <div className="dd-card">
                <div className="dd-line">
                  <b>Order #2041</b>
                  <span>$86.00</span>
                </div>
                <span className="dd-ghost" style={{ "--w": "70%" }} />
                <span className="dd-ghost" style={{ "--w": "48%" }} />
              </div>
              <div className="dd-row">
                <button
                  type="button"
                  className="dd-btn soft"
                  {...focus.stop("trigger")}
                  onClick={() => show(true)}
                >
                  Edit profile
                </button>
                <button type="button" className="dd-btn" {...focus.stop("pay")}>
                  Pay now
                </button>
              </div>
            </div>
          }
        >
          <Dialog ref={dialogRef} open={open} title="Edit profile">
            <label className="dd-field">
              <span>Name</span>
              <span className="dd-in">
                <input defaultValue="Ada Lovelace" {...focus.stop("name")} />
              </span>
            </label>
            <div className="dd-acts">
              <button
                type="button"
                className="dd-btn text"
                {...focus.stop("cancel")}
                onClick={hide}
              >
                Cancel
              </button>
              <button type="button" className="dd-btn" {...focus.stop("save")} onClick={hide}>
                Save
              </button>
            </div>
          </Dialog>
        </Screen>
      </Stage>
    </div>
  );
}

// ---------- Lesson 2: Escape closes it ----------

function EscapeDemo({ sealed }: { sealed: boolean }) {
  const focus = useWindowFocus();
  const [open, setOpen] = useState(false);
  const [said, setSaid] = useState("Open What's new, then press Esc");
  const [ignored, setIgnored] = useState(0);

  function show() {
    setOpen(true);
    focus.move("ok", true);
  }

  function close(how: string) {
    setOpen(false);
    setSaid(`Closed by ${how}`);
    focus.move("trigger", true);
  }

  function refuse(what: string) {
    setIgnored((count) => count + 1);
    setSaid(`${what} ignored, ${ignored + 1}×`);
  }

  function escape() {
    if (!open) return;
    if (sealed) close("Esc");
    else refuse("Esc");
  }

  return (
    <Stage
      keys={<Key onPress={escape}>Esc</Key>}
      read={said}
      tone={ignored > 0 && open ? "no" : undefined}
    >
      <Screen
        focus={focus}
        open={open}
        onKeyDown={(event) => event.key === "Escape" && escape()}
        onScrim={() => (sealed ? close("a click outside") : refuse("Click outside"))}
        page={
          <div className="dd-page" inert={open}>
            <div className="dd-nav">
              <span className="dd-logo" />
              <button type="button" className="dd-pill" {...focus.stop("trigger")} onClick={show}>
                What's new
              </button>
            </div>
            {[72, 54, 64, 46].map((width) => (
              <div key={width} className="dd-mail">
                <span className="dd-dot" />
                <span className="dd-ghost" style={{ "--w": `${width}%` }} />
              </div>
            ))}
          </div>
        }
      >
        <Dialog
          open={open}
          title="What's new in 2.4"
          body="Threads fold up, and search now finds attachments."
          close={<CloseX focus={focus} onClose={() => close("×")} />}
        >
          <div className="dd-acts">
            <button
              type="button"
              className="dd-btn"
              {...focus.stop("ok")}
              onClick={() => close("Got it")}
            >
              Got it
            </button>
          </div>
        </Dialog>
      </Screen>
    </Stage>
  );
}

// ---------- Lesson 3: focus lands on the safe answer ----------

type ConfirmPhase = "idle" | "open" | "deleted";

function ConfirmDemo({ sealed }: { sealed: boolean }) {
  const focus = useWindowFocus();
  const [phase, setPhase] = useState<ConfirmPhase>("idle");
  const open = phase === "open";

  function go(next: ConfirmPhase, stop: string) {
    setPhase(next);
    focus.move(stop, true);
  }

  const read =
    phase === "deleted"
      ? "Enter deleted 214 files"
      : open && focus.at
        ? `Enter presses ${focus.at === "delete" ? "Delete" : focus.at === "cancel" ? "Cancel" : "Delete project"}`
        : "Open Delete project, then press Enter";

  return (
    <Stage
      keys={<Key onPress={() => focus.at && focus.find(focus.at)?.click()}>Enter</Key>}
      read={read}
      tone={phase === "deleted" || focus.at === "delete" ? "no" : open ? "yes" : undefined}
    >
      <Screen
        focus={focus}
        open={open}
        onKeyDown={(event) => event.key === "Escape" && open && go("idle", "trigger")}
        page={
          <div className="dd-page" inert={open}>
            <div className="dd-nav">
              <span className="dd-logo" />
              <span className="dd-ghost" style={{ "--w": "30%" }} />
            </div>
            <div className="dd-card dd-project" data-gone={phase === "deleted" || undefined}>
              {phase === "deleted" ? (
                <>
                  <span className="dd-proj-copy">
                    <b>Moonbase deleted</b>
                    <small>214 files gone</small>
                  </span>
                  <button
                    type="button"
                    className="dd-btn soft"
                    {...focus.stop("reset")}
                    onClick={() => go("idle", "trigger")}
                  >
                    Restore
                  </button>
                </>
              ) : (
                <>
                  <span className="dd-proj-copy">
                    <b>Moonbase</b>
                    <small>214 files · edited 2h ago</small>
                  </span>
                  <button
                    type="button"
                    className="dd-btn red tint"
                    {...focus.stop("trigger")}
                    onClick={() => go("open", sealed ? "cancel" : "delete")}
                  >
                    Delete project
                  </button>
                </>
              )}
            </div>
            <span className="dd-ghost" style={{ "--w": "62%" }} />
            <span className="dd-ghost" style={{ "--w": "48%" }} />
          </div>
        }
      >
        <Dialog
          open={open}
          title="Delete Moonbase?"
          body="Its 214 files go too. This can't be undone."
        >
          <div className="dd-acts">
            <button
              type="button"
              className="dd-btn text"
              {...focus.stop("cancel")}
              onClick={() => go("idle", "trigger")}
            >
              Cancel
            </button>
            <button
              type="button"
              className="dd-btn red"
              {...focus.stop("delete")}
              onClick={() => go("deleted", "reset")}
            >
              Delete
            </button>
          </div>
        </Dialog>
      </Screen>
    </Stage>
  );
}

// ---------- Lesson 4: a typed draft survives a stray click ----------

const DRAFT = "Checkout fails on Safari 17 when a coupon is set";

type DraftPhase = "closed" | "open" | "confirm";

function DraftDemo({ sealed }: { sealed: boolean }) {
  const focus = useWindowFocus();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<DraftPhase>("closed");
  const [draft, setDraft] = useState(DRAFT);
  const [said, setSaid] = useState(`Draft: ${DRAFT.length} chars`);
  const dirty = draft.trim() !== "";

  function show() {
    setPhase("open");
    focus.move("title", true);
    setSaid(dirty ? `Draft: ${draft.length} chars` : "Draft: empty");
  }

  function drop(how: string) {
    setPhase("closed");
    focus.move("trigger", true);
    setSaid(dirty ? `${how}: ${draft.length} chars gone` : `Closed by ${how}`);
    setDraft("");
  }

  function leave(how: string) {
    if (!sealed || !dirty) return drop(how);
    setPhase("confirm");
    focus.move("keep", true);
    setSaid("Asked first");
  }

  function strayClick() {
    if (!sealed || !dirty) return drop("A click outside");
    setSaid("Click outside: still open");
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (reducedMotion()) {
      dialog.animate(
        [{ boxShadow: "0 0 0 2px var(--no)" }, { boxShadow: "0 0 0 2px transparent" }],
        {
          duration: 480,
          easing: "ease-out",
        },
      );
      return;
    }
    dialog.animate(
      [
        { transform: "none" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(-4px)" },
        { transform: "translateX(4px)" },
        { transform: "none" },
      ],
      { duration: 320, easing: "cubic-bezier(0.83, 0, 0.17, 1)" },
    );
  }

  function keepEditing() {
    setPhase("open");
    focus.move("title", true);
    setSaid(`Draft: ${draft.length} chars`);
  }

  function escape() {
    if (phase === "open") leave("Esc");
    else if (phase === "confirm") keepEditing();
  }

  return (
    <Stage
      keys={
        <>
          <Key onPress={escape}>Esc</Key>
          <Key
            onPress={() => {
              setDraft(DRAFT);
              setSaid(`Draft: ${DRAFT.length} chars`);
            }}
          >
            Retype
          </Key>
        </>
      }
      read={said}
      tone={
        said.endsWith("gone")
          ? "no"
          : said.startsWith("Asked") || said.endsWith("open")
            ? "yes"
            : undefined
      }
    >
      <Screen
        focus={focus}
        open={phase !== "closed"}
        onKeyDown={(event) => event.key === "Escape" && escape()}
        onScrim={() => phase === "open" && strayClick()}
        page={
          <div className="dd-page" inert={phase !== "closed"}>
            <div className="dd-nav">
              <span className="dd-logo" />
              <button
                type="button"
                className="dd-btn soft"
                {...focus.stop("trigger")}
                onClick={show}
              >
                New issue
              </button>
            </div>
            {[66, 52, 74].map((width) => (
              <div key={width} className="dd-mail">
                <span className="dd-tag" />
                <span className="dd-ghost" style={{ "--w": `${width}%` }} />
              </div>
            ))}
          </div>
        }
      >
        <Dialog
          ref={dialogRef}
          open={phase !== "closed"}
          held={phase === "confirm"}
          title="New issue"
          close={<CloseX focus={focus} onClose={() => leave("×")} />}
        >
          <label className="dd-field">
            <span>Title</span>
            <span className="dd-in">
              <input
                value={draft}
                placeholder="What broke?"
                onChange={(event) => setDraft(event.target.value)}
                {...focus.stop("title")}
              />
            </span>
          </label>
          <div className="dd-acts">
            <button
              type="button"
              className="dd-btn"
              {...focus.stop("create")}
              onClick={() => {
                setPhase("closed");
                focus.move("trigger", true);
                setSaid("Issue created");
                setDraft(DRAFT);
              }}
            >
              Create
            </button>
          </div>
        </Dialog>
        {sealed && (
          <>
            <div
              className="dd-scrim dd-top"
              data-on={phase === "confirm" || undefined}
              aria-hidden="true"
            />
            <Dialog
              top
              open={phase === "confirm"}
              title="Discard this draft?"
              body={`You'll lose ${draft.length} characters.`}
            >
              <div className="dd-acts">
                <button
                  type="button"
                  className="dd-btn text"
                  {...focus.stop("keep")}
                  onClick={keepEditing}
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  className="dd-btn red"
                  {...focus.stop("discard")}
                  onClick={() => drop("Discarded")}
                >
                  Discard
                </button>
              </div>
            </Dialog>
          </>
        )}
      </Screen>
    </Stage>
  );
}

// ---------- Lesson 5: the page behind holds still ----------

function ScrollDemo({ sealed }: { sealed: boolean }) {
  const focus = useWindowFocus();
  const pageRef = useRef<HTMLDivElement>(null);
  const base = useRef(0);
  const [open, setOpen] = useState(false);
  const [moved, setMoved] = useState(0);
  const locked = sealed && open;

  function show() {
    base.current = pageRef.current?.scrollTop ?? 0;
    setMoved(0);
    setOpen(true);
    focus.move("copy", true);
  }

  function hide() {
    setOpen(false);
    focus.move("trigger", true);
  }

  function nudge(by: number) {
    const page = pageRef.current;
    if (!page || locked) return;
    page.scrollTop += by;
    if (open) setMoved(Math.abs(Math.round(page.scrollTop - base.current)));
  }

  // On a real page the wheel over a scrim still reaches the body. Locked, it goes nowhere.
  useEffect(() => {
    const screen = focus.ref.current;
    if (!screen || !open) return;
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      if (!sealed) nudge(event.deltaY);
    }
    screen.addEventListener("wheel", onWheel, { passive: false });
    return () => screen.removeEventListener("wheel", onWheel);
  }, [open, sealed, focus.ref]);

  return (
    <Stage
      keys={<Key onPress={() => nudge(60)}>Scroll</Key>}
      read={open ? `Page moved ${moved}px` : "Open Share, then scroll"}
      tone={open ? (moved > 0 ? "no" : "yes") : undefined}
    >
      <Screen
        focus={focus}
        open={open}
        onKeyDown={(event) => event.key === "Escape" && open && hide()}
        page={
          <div
            ref={pageRef}
            className="dd-page dd-article"
            data-locked={locked || undefined}
            inert={open}
          >
            <div className="dd-line">
              <b>Why we moved to Postgres</b>
              <button
                type="button"
                className="dd-btn soft"
                {...focus.stop("trigger")}
                onClick={show}
              >
                Share
              </button>
            </div>
            {[0, 1, 2, 3, 4, 5].map((block) => (
              <div key={block} className="dd-para">
                {block % 3 === 1 && <span className="dd-figure" />}
                {[96, 88, 92, 60].map((width) => (
                  <span
                    key={width}
                    className="dd-ghost"
                    style={{ "--w": `${width - (block % 3) * 4}%` }}
                  />
                ))}
              </div>
            ))}
          </div>
        }
      >
        <Dialog open={open} title="Share this post" close={<CloseX focus={focus} onClose={hide} />}>
          <div className="dd-share">
            <span className="dd-url">itsfaqih.dev/p/42</span>
            <button type="button" className="dd-btn" {...focus.stop("copy")} onClick={hide}>
              Copy link
            </button>
          </div>
        </Dialog>
      </Screen>
    </Stage>
  );
}

// ---------- Lesson 6: a screen reader hears what opened ----------

/** What a screen reader says as focus enters, built from the same attributes it reads. */
function announce(dialog: HTMLElement, target: HTMLElement) {
  const textOf = (ids: string | null) =>
    (ids ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
  const parts: string[] = [];
  const role = dialog.getAttribute("role");
  if (role) parts.push(`${textOf(dialog.getAttribute("aria-labelledby"))}, ${role}.`);
  const description = textOf(dialog.getAttribute("aria-describedby"));
  if (description) parts.push(description);
  parts.push(
    target instanceof HTMLInputElement
      ? `${target.labels?.[0]?.firstElementChild?.textContent ?? ""}, edit text, ${target.value}`
      : `${target.textContent ?? ""}, button`,
  );
  return parts.join(" ");
}

function NameDemo({ sealed }: { sealed: boolean }) {
  const focus = useWindowFocus();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [speech, setSpeech] = useState("");

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const target = focus.at ? focus.find(focus.at) : null;
    setSpeech(open && dialog && target && dialog.contains(target) ? announce(dialog, target) : "");
    // focus.find only reads the window's DOM.
  }, [open, focus.at]);

  function show() {
    setOpen(true);
    focus.move("name", true);
  }

  function hide() {
    setOpen(false);
    focus.move("trigger", true);
  }

  return (
    <Stage
      keys={
        <Key onPress={() => focus.move(focus.next(open ? dialogRef.current : null, false), true)}>
          Tab
        </Key>
      }
      read={
        speech ? (
          <span className="dd-speech">
            <SpeakerHighIcon weight="bold" aria-hidden="true" />“{speech}”
          </span>
        ) : (
          "Open Rename to hear it"
        )
      }
      tone={speech ? (sealed ? "yes" : "no") : undefined}
    >
      <Screen
        focus={focus}
        open={open}
        onKeyDown={(event) => event.key === "Escape" && open && hide()}
        page={
          <div className="dd-page" inert={open}>
            <div className="dd-nav">
              <span className="dd-logo" />
              <span className="dd-ghost" style={{ "--w": "34%" }} />
            </div>
            <div className="dd-card dd-project">
              <span className="dd-proj-copy">
                <b>report.pdf</b>
                <small>2.4 MB · shared</small>
              </span>
              <button
                type="button"
                className="dd-btn soft"
                {...focus.stop("trigger")}
                onClick={show}
              >
                Rename
              </button>
            </div>
            <span className="dd-ghost" style={{ "--w": "58%" }} />
          </div>
        }
      >
        <Dialog
          ref={dialogRef}
          bare={!sealed}
          open={open}
          title="Rename file"
          body="Pick a name your team will find."
        >
          <label className="dd-field">
            <span>Name</span>
            <span className="dd-in">
              <input defaultValue="report.pdf" {...focus.stop("name")} />
            </span>
          </label>
          <div className="dd-acts">
            <button type="button" className="dd-btn text" {...focus.stop("cancel")} onClick={hide}>
              Cancel
            </button>
            <button type="button" className="dd-btn" {...focus.stop("save")} onClick={hide}>
              Save
            </button>
          </div>
        </Dialog>
      </Screen>
    </Stage>
  );
}

// ---------- The lessons ----------

const LESSONS: Lesson[] = [
  {
    title: "Keep focus inside",
    body: (
      <>
        When a dialog opens, focus moves into it. <kbd>Tab</kbd> goes round its controls and never
        reaches the page behind, which is inert. When it closes, focus goes back to the button that
        opened it. Press Tab in both.
      </>
    ),
    bad: {
      label: "Focus wanders",
      costs: ["starts behind", "Tab leaves it", "lost on close"],
      view: <FocusDemo sealed={false} />,
    },
    good: {
      label: "Focus held",
      costs: ["starts in Name", "Tab stays in", "back on close"],
      view: <FocusDemo sealed />,
    },
  },
  {
    title: "Let Escape close it",
    body: (
      <>
        <kbd>Esc</kbd> is how keyboard users leave, so it closes every dialog, every time. An info
        dialog has nothing to lose, so a click outside closes it too.
      </>
    ),
    bad: {
      label: "Esc ignored",
      costs: ["Esc ignored", "2 ways out"],
      view: <EscapeDemo sealed={false} />,
    },
    good: {
      label: "Esc closes",
      costs: ["Esc closes", "4 ways out"],
      view: <EscapeDemo sealed />,
    },
  },
  {
    title: "Focus the safe answer",
    body: (
      <>
        A form focuses its first field, so people can type at once. A confirm that destroys
        something focuses Cancel, so a stray <kbd>Enter</kbd> backs out. Open both and press Enter.
      </>
    ),
    extra: (
      <p className="tip">
        Focus the destructive button only where speed matters more and the action can be undone.
      </p>
    ),
    bad: {
      label: "Delete first",
      costs: ["Enter deletes", "214 files"],
      view: <ConfirmDemo sealed={false} />,
    },
    good: {
      label: "Cancel first",
      costs: ["Enter cancels", "0 files lost"],
      view: <ConfirmDemo sealed />,
    },
  },
  {
    title: "Ask before you drop a draft",
    body: (
      <>
        A click outside is often a slip. Once a form has input, the backdrop stops closing it. The
        dialog shakes instead, and <kbd>Esc</kbd> or × asks before it throws the draft away. Click
        the dim area in both.
      </>
    ),
    bad: {
      label: "Click drops it",
      costs: ["1 stray click", `${DRAFT.length} chars gone`],
      view: <DraftDemo sealed={false} />,
    },
    good: {
      label: "Asks first",
      costs: ["0 chars lost", "asks first"],
      view: <DraftDemo sealed />,
    },
  },
  {
    title: "Lock the page behind",
    body: (
      <>
        While the dialog is up, the page under it stays still. Set <code>overflow: hidden</code> on
        the body, and keep the scrollbar's room with <code>scrollbar-gutter: stable</code> so
        nothing shifts. Open Share, then scroll.
      </>
    ),
    bad: {
      label: "Page scrolls",
      costs: ["page moves", "place lost"],
      view: <ScrollDemo sealed={false} />,
    },
    good: {
      label: "Page locked",
      costs: ["0px moved", "0px shift"],
      view: <ScrollDemo sealed />,
    },
  },
  {
    title: "Give it a name",
    body: (
      <>
        A screen reader needs to hear that a dialog opened and what it's called. Give it{" "}
        <code>role="dialog"</code>, and point <code>aria-labelledby</code> at the title and{" "}
        <code>aria-describedby</code> at the text. On a real page add <code>aria-modal="true"</code>
        , or use <code>&lt;dialog&gt;</code> with <code>showModal()</code>.
      </>
    ),
    bad: {
      label: "A plain div",
      costs: ["no role", "no name"],
      view: <NameDemo sealed={false} />,
    },
    good: {
      label: "A named dialog",
      costs: ["role=dialog", "named", "described"],
      view: <NameDemo sealed />,
    },
  },
];

const CHEAT_SHEET = [
  ["It opens", "Focus the first field, or Cancel if it destroys something"],
  ["While it's open", "Tab goes round inside. The page behind is inert and still"],
  ["Escape", "Closes it, every time"],
  ["A click outside", "Closes an info dialog. A form with input shakes or asks"],
  ["It closes", "Focus goes back to the button that opened it"],
  ["The markup", 'role="dialog", aria-modal, labelled by its title'],
  ["On a phone", "A bottom sheet that swipes down to close"],
] as const;

// ---------- The quiz levels ----------

const LEVELS: Level[] = [
  {
    name: "Delete forever",
    prompt: (
      <>
        <b>Delete Moonbase?</b> removes 214 files for good. When it opens, where does focus land?
      </>
    ),
    piece: "autoFocus",
    answer: "cancel",
    rows: [
      { depth: 0, text: "<ProjectRow> Moonbase", kind: "comp" },
      {
        depth: 1,
        slot: {
          id: "trigger",
          label: "<button> Delete project",
          note: "Focus stays behind the scrim. Tab walks the page, and Enter opens the dialog again.",
          cost: ["focus behind", "Enter reopens"],
        },
      },
      { depth: 0, text: "<AlertDialog>", kind: "comp" },
      { depth: 1, text: "Delete Moonbase?" },
      {
        depth: 1,
        slot: {
          id: "cancel",
          label: "<button> Cancel",
          note: "The safe answer. A stray Enter backs out, and deleting takes a deliberate move.",
          cost: ["Enter cancels", "0 files lost"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "delete",
          label: "<button> Delete",
          note: "One Enter deletes 214 files before anyone has read the title.",
          cost: ["Enter deletes", "214 files"],
        },
      },
    ],
  },
  {
    name: "Add a contact",
    prompt: (
      <>
        <b>Add contact</b> has a Name field and an Email field. When it opens, where does focus
        land?
      </>
    ),
    piece: "autoFocus",
    answer: "name",
    rows: [
      { depth: 0, text: "<Dialog> Add contact", kind: "comp" },
      {
        depth: 1,
        slot: {
          id: "close",
          label: "<button> ×",
          note: "Typing goes nowhere, and one Enter closes the form they came to fill.",
          cost: ["1 extra Tab", "Enter closes"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "name",
          label: "<input> Name",
          note: "They start typing at once. No click, no Tab.",
          cost: ["0 clicks"],
        },
      },
      { depth: 1, text: "<input> Email" },
      {
        depth: 1,
        slot: {
          id: "save",
          label: "<button> Save",
          note: "Enter saves an empty contact, and they Shift+Tab back up to start.",
          cost: ["empty save", "2 Tabs back"],
        },
      },
    ],
  },
  {
    name: "A click outside",
    prompt: (
      <>Three dialogs, three screens. Which one closes when you click the dim page around it?</>
    ),
    piece: "close()",
    answer: "news",
    rows: [
      { depth: 0, text: "click on the scrim", kind: "comp" },
      {
        depth: 1,
        slot: {
          id: "issue",
          label: "New issue, title typed in",
          note: `One stray click throws away the ${DRAFT.length} characters they typed.`,
          cost: [`${DRAFT.length} chars lost`],
        },
      },
      {
        depth: 1,
        slot: {
          id: "news",
          label: "What's new, nothing to fill in",
          note: "Nothing to lose, so a click outside just closes it.",
          cost: ["0 lost", "1 click out"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "profile",
          label: "Edit profile, nothing changed yet",
          note: "It's a form, one keystroke from holding input. Let Esc and Cancel close it.",
          cost: ["a form", "risky by default"],
        },
      },
    ],
  },
  {
    name: "It closed",
    prompt: (
      <>
        You opened <b>Edit profile</b> from its button halfway down a settings page, then pressed
        Save. Where does focus go?
      </>
    ),
    piece: "focus()",
    answer: "trigger",
    rows: [
      {
        depth: 0,
        slot: {
          id: "body",
          label: "<body>",
          note: "Focus starts over at the top. A keyboard user tabs past 12 links to get back.",
          cost: ["12 Tabs back"],
        },
      },
      { depth: 1, text: "<nav> 12 links", kind: "more" },
      { depth: 1, text: "<SettingsPage>", kind: "comp" },
      {
        depth: 2,
        slot: {
          id: "trigger",
          label: "<button> Edit profile",
          note: "They land where they left, and one Tab carries on down the page.",
          cost: ["0 Tabs back"],
        },
      },
      {
        depth: 2,
        slot: {
          id: "next",
          label: "<button> Change password",
          note: "Close, but it's a control they didn't pick. A screen reader announces it out of nowhere.",
          cost: ["1 stop off", "lost place"],
        },
      },
    ],
  },
  {
    name: "Hold the page",
    prompt: (
      <>
        <b>Share</b> opens over a long article. Where does <code>overflow: hidden</code> go so the
        article stays put?
      </>
    ),
    piece: "overflow: hidden",
    answer: "body",
    rows: [
      {
        depth: 0,
        slot: {
          id: "body",
          label: "<body>",
          note: "The page stops while the dialog is up. Add scrollbar-gutter: stable so it doesn't shift.",
          cost: ["0px moved", "0px shift"],
        },
      },
      { depth: 1, text: "<article> 3,000 words", kind: "more" },
      {
        depth: 1,
        slot: {
          id: "scrim",
          label: ".scrim, the dim layer",
          note: "The scrim never scrolled. The article under it still does.",
          cost: ["page still moves"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "panel",
          label: ".dialog, the panel",
          note: "A long dialog gets cut off, and the article behind it still scrolls.",
          cost: ["clips the dialog", "page still moves"],
        },
      },
    ],
  },
];

export function DialogDesign() {
  return (
    <RuleLanding
      className="dialog-design"
      lead={
        <>
          Six dialogs, each built the leaky way and the sealed way, side by side and live. Open
          them, press Tab, press Escape. Then a mini quiz where you put each piece where it belongs.
        </>
      }
      learn={{
        title: "Hold focus, let go cleanly",
        intro: (
          <>
            A dialog takes over the screen, so it owes people a way through and a way out. Each
            example builds the same dialog twice: on the left the way it often ships, on the right
            the way the rule builds it. Each one opens in its own small window, so use the keys.
          </>
        ),
      }}
      lessons={LESSONS}
      tldr={CHEAT_SHEET}
      quiz={{
        intro: (
          <>
            Five dialogs, five screens. Drag each piece to where it belongs, or tap it and then tap
            a spot. A wrong spot tells you what it would cost.
          </>
        ),
        levels: LEVELS,
        board: "screen",
      }}
      take="build dialogs the same way"
    />
  );
}
