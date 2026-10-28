import {
  ArrowRightIcon,
  CheckIcon,
  CircleNotchIcon,
  GearSixIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { type Lesson, type Level, reducedMotion, RuleLanding } from "./-components/rule-landing";
import "./button-design.css";

// ---------- Lesson 1: every state gets a look ----------

const STATES = ["idle", "hover", "press", "focus"] as const;

function StatesDemo({ careful }: { careful: boolean }) {
  return (
    <div className={careful ? "bd-stage" : "bd-stage bd-flat"}>
      <button type="button" className="bd-key">
        Save changes
      </button>
      <div className="bd-specimens" aria-hidden="true">
        {STATES.map((state) => (
          <span key={state}>
            <span className="bd-key sm" data-force={state}>
              Save
            </span>
            <small>{state}</small>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------- Lesson 2: the width holds while it works ----------

type Phase = "idle" | "pending" | "done";
type Save = { phase: Phase; sent: number };

const SAVE_MS = 1200;
const DONE_MS = 1400;

const LABELS: readonly { phase: Phase; text: string }[] = [
  { phase: "idle", text: "Save" },
  { phase: "pending", text: "Saving…" },
  { phase: "done", text: "Saved" },
];

/** The careful button stacks its three labels in one cell and refuses clicks until it's idle
 * again. The careless one shows only the current label, so its width follows the text, and every
 * click sends again. */
function SaveDemo({ careful }: { careful: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [save, setSave] = useState<Save>({ phase: "idle", sent: 0 });
  const [pressing, setPressing] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const busy = careful && save.phase !== "idle";

  useEffect(() => {
    if (save.phase === "idle") return;
    const id = setTimeout(
      () => setSave((now) => ({ ...now, phase: now.phase === "pending" ? "done" : "idle" })),
      save.phase === "pending" ? SAVE_MS : DONE_MS,
    );
    return () => clearTimeout(id);
  }, [save]);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    const observer = new ResizeObserver(() => setWidth(Math.round(button.offsetWidth)));
    observer.observe(button);
    return () => observer.disconnect();
  }, []);

  function press() {
    setSave((now) =>
      careful && now.phase !== "idle"
        ? now
        : { phase: "pending", sent: now.phase === "pending" ? now.sent + 1 : 1 },
    );
  }

  // The signature: once on screen, each button presses itself and walks through its states.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reducedMotion()) return;
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        timers.push(
          window.setTimeout(() => setPressing(true), 500),
          window.setTimeout(() => {
            setPressing(false);
            setSave((now) => (now.sent === 0 ? { phase: "pending", sent: 1 } : now));
          }, 660),
        );
      },
      { threshold: 0.6 },
    );
    observer.observe(stage);
    return () => {
      observer.disconnect();
      for (const timer of timers) clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={stageRef} className="bd-stage bd-save-stage">
      <div className="bd-measure">
        <button
          ref={buttonRef}
          type="button"
          className="bd-key bd-save"
          data-phase={save.phase}
          data-jumpy={careful ? undefined : ""}
          data-force={pressing ? "press" : undefined}
          aria-disabled={busy || undefined}
          onClick={press}
        >
          {LABELS.map(({ phase, text }) => (
            <span
              key={phase}
              className="bd-lbl"
              data-on={save.phase === phase || undefined}
              aria-hidden={save.phase !== phase || undefined}
            >
              {phase === "pending" && <CircleNotchIcon weight="bold" className="bd-spin" />}
              {phase === "done" && <CheckIcon weight="bold" />}
              {text}
            </span>
          ))}
        </button>
        <span className="bd-ruler" aria-hidden="true">
          <b>{width ?? "–"} px</b>
        </span>
      </div>
      <span className="bd-note">
        {save.sent === 1 ? "1 request sent" : `${save.sent} requests sent`}
      </span>
    </div>
  );
}

// ---------- Lesson 3: a disabled button says why ----------

function DisabledDemo({ careful }: { careful: boolean }) {
  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(false);
  // A tap gives no hover, so pressing the blocked button opens the tip for touch readers.
  const [nudged, setNudged] = useState(false);
  const tipId = useId();
  const ready = title.trim() !== "";

  useEffect(() => {
    if (!published) return;
    const id = setTimeout(() => setPublished(false), 1400);
    return () => clearTimeout(id);
  }, [published]);

  useEffect(() => {
    if (!nudged) return;
    const id = setTimeout(() => setNudged(false), 1600);
    return () => clearTimeout(id);
  }, [nudged]);

  const label = published ? (
    <>
      <CheckIcon weight="bold" />
      Published
    </>
  ) : (
    "Publish"
  );

  return (
    <div className="bd-stage bd-form">
      <label className="bd-field">
        <span>Title</span>
        <input
          value={title}
          placeholder="Untitled post"
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      {careful ? (
        <span className="bd-tip" data-open={(nudged && !ready) || undefined}>
          <button
            type="button"
            className="bd-key"
            aria-disabled={!ready || undefined}
            aria-describedby={ready ? undefined : tipId}
            onClick={() => (ready ? setPublished(true) : setNudged(true))}
          >
            {label}
          </button>
          {!ready && (
            <span role="tooltip" id={tipId}>
              Add a title first
            </span>
          )}
        </span>
      ) : (
        <button
          type="button"
          className="bd-key bd-faded"
          disabled={!ready}
          onClick={() => setPublished(true)}
        >
          {label}
        </button>
      )}
    </div>
  );
}

// ---------- Lesson 4: one filled button per screen ----------

function HierarchyDemo({ careful }: { careful: boolean }) {
  return (
    <div className="bd-stage bd-squint-me">
      <div className="bd-card">
        <span className="bd-card-title">Spring launch notes</span>
        <span className="bd-card-sub">Draft · 1,240 words</span>
        <div className="bd-row">
          <button type="button" className={careful ? "bd-key sm text" : "bd-key sm plain"}>
            Cancel
          </button>
          <button type="button" className={careful ? "bd-key sm tint" : "bd-key sm"}>
            Save draft
          </button>
          <button type="button" className={careful ? "bd-key sm" : "bd-key sm red"}>
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

/** A switch in a lesson's copy that changes how that lesson's panes are drawn (see the CSS). */
function LessonToggle({ label, name }: { label: string; name: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      className="btn soft sm bd-toggle"
      data-toggle={name}
      aria-pressed={on}
      onClick={() => setOn((value) => !value)}
    >
      <span className="bd-dot" aria-hidden="true" />
      {label}
    </button>
  );
}

// ---------- Lesson 5: a destructive action has a guard ----------

type Step = "idle" | "confirm" | "deleted";

function DeleteDemo({ careful }: { careful: boolean }) {
  const [step, setStep] = useState<Step>("idle");
  const moved = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function go(next: Step) {
    moved.current = true;
    setStep(next);
  }

  // Focus follows the step: Cancel is the safe answer in the confirm, and after a reset the
  // trigger comes back where it was.
  useEffect(() => {
    if (!moved.current) return;
    rootRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [step]);

  return (
    <div ref={rootRef} className="bd-stage bd-danger">
      <div className="bd-project" data-step={step}>
        {step === "deleted" ? (
          <>
            <span className="bd-project-copy">
              <b>Moonbase is gone</b>
              <small>214 files deleted</small>
            </span>
            <button
              type="button"
              className="bd-key sm text"
              data-autofocus
              onClick={() => go("idle")}
            >
              Reset demo
            </button>
          </>
        ) : step === "confirm" ? (
          <>
            <span className="bd-project-copy">
              <b>Delete Moonbase?</b>
              <small>Its 214 files go too. This can't be undone.</small>
            </span>
            <span className="bd-row">
              <button
                type="button"
                className="bd-key sm text"
                data-autofocus
                onClick={() => go("idle")}
              >
                Cancel
              </button>
              <button type="button" className="bd-key sm red" onClick={() => go("deleted")}>
                Delete project
              </button>
            </span>
          </>
        ) : (
          <>
            <span className="bd-project-copy">
              <b>Moonbase</b>
              <small>214 files · edited 2h ago</small>
            </span>
            <button
              type="button"
              className={careful ? "bd-key sm red tint" : "bd-key sm red"}
              data-autofocus
              onClick={() => go(careful ? "confirm" : "deleted")}
            >
              Delete project
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Lesson 6: optical padding for icons ----------

function IconsDemo({ careful }: { careful: boolean }) {
  const tipId = useId();
  return (
    <div className={careful ? "bd-stage bd-icons" : "bd-stage bd-icons bd-even"}>
      <button type="button" className="bd-key sm tint" data-pad="lead">
        <PlusIcon weight="bold" aria-hidden="true" />
        New project
      </button>
      <button type="button" className="bd-key sm" data-pad="trail">
        Continue
        <ArrowRightIcon weight="bold" aria-hidden="true" />
      </button>
      {careful ? (
        <span className="bd-tip">
          <button
            type="button"
            className="bd-key sm plain bd-square"
            aria-label="Settings"
            aria-describedby={tipId}
          >
            <GearSixIcon weight="bold" aria-hidden="true" />
          </button>
          <span role="tooltip" id={tipId}>
            Settings
          </span>
        </span>
      ) : (
        <button type="button" className="bd-key sm plain bd-wide" aria-label="Settings">
          <GearSixIcon weight="bold" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ---------- The lessons ----------

const LESSONS: Lesson[] = [
  {
    title: "Give every state a look",
    body: (
      <>
        Hover, press and keyboard focus each need their own look. Without them a click feels like it
        missed, and a keyboard user can't see where they are. Hover both, press both, then{" "}
        <kbd>Tab</kbd> to them.
      </>
    ),
    bad: {
      label: "One look",
      costs: ["1 look for 4 states", "0px focus ring"],
      view: <StatesDemo careful={false} />,
    },
    good: {
      label: "Four looks",
      costs: ["4 looks", "3px focus ring", "150ms"],
      view: <StatesDemo careful />,
    },
  },
  {
    title: "Hold the width while it works",
    body: (
      <>
        Pending gets a state too. Stop taking clicks the moment it's pressed, say what it's doing,
        then say it worked. Stack the labels in one cell so the button keeps its size, and press the
        left one a few times.
      </>
    ),
    bad: {
      label: "Swaps the label",
      costs: ["width jumps 53px", "a request per click"],
      view: <SaveDemo careful={false} />,
    },
    good: {
      label: "Stacks the labels",
      costs: ["width holds", "1 request", "cursor: wait"],
      view: <SaveDemo careful />,
    },
  },
  {
    title: "Say why it's off",
    body: (
      <>
        A disabled button that only fades leaves people guessing. Show the no-entry cursor, keep the
        label readable, and put the reason in a tooltip. Type a title and both come on.
      </>
    ),
    bad: {
      label: "Just faded",
      costs: ["0 reasons", "1.6:1 contrast", "hand cursor"],
      view: <DisabledDemo careful={false} />,
    },
    good: {
      label: "Says why",
      costs: ["1 reason", "6.4:1 contrast", "cursor: not-allowed"],
      view: <DisabledDemo careful />,
    },
  },
  {
    title: "One filled button per screen",
    body: (
      <>
        Weight tells people where to go next. Fill the main action in the brand colour, tint the
        supporting one, and leave Cancel as text. Keep red for actions that destroy something.
      </>
    ),
    extra: <LessonToggle label="Squint" name="squint" />,
    bad: {
      label: "All filled",
      costs: ["3 filled", "red Publish"],
      view: <HierarchyDemo careful={false} />,
    },
    good: {
      label: "Filled, tinted, text",
      costs: ["1 filled", "1 next step"],
      view: <HierarchyDemo careful />,
    },
  },
  {
    title: "Guard the destructive action",
    body: (
      <>
        Delete should never be one stray click. Tint the trigger red, then confirm with a filled red
        button that names what goes. Focus lands on Cancel, the safe answer.
      </>
    ),
    bad: {
      label: "One click",
      costs: ["1 click", "0 warnings"],
      view: <DeleteDemo careful={false} />,
    },
    good: {
      label: "Confirm that names it",
      costs: ["2 clicks", "names 214 files"],
      view: <DeleteDemo careful />,
    },
  },
  {
    title: "Pad the icon side less",
    body: (
      <>
        An icon carries white space inside its own box, so equal padding looks lopsided. Take 4px
        off the icon's side and centre it on the text. An icon with no label is square, and needs an{" "}
        <code>aria-label</code> and a tooltip.
      </>
    ),
    extra: <LessonToggle label="Show padding" name="pads" />,
    bad: {
      label: "Even padding",
      costs: ["16 | 16px", "icon 4px up", "no tooltip"],
      view: <IconsDemo careful={false} />,
    },
    good: {
      label: "Optical padding",
      costs: ["12 | 16px", "centred", "38 × 38"],
      view: <IconsDemo careful />,
    },
  },
];

const CHEAT_SHEET = [
  ["Any button", "A look for hover, press and focus, in 100 to 200ms"],
  ["Waiting on a request", "Stop clicks, keep the width, say Saving… then Saved"],
  ["Not available yet", "cursor: not-allowed and a tooltip that says why"],
  ["Picking a variant", "One filled per screen, tinted to support, text to skip"],
  ["It deletes something", "Red, behind a confirm that names what goes"],
  ["An icon beside the label", "4px less padding on the icon's side"],
  ["An icon with no label", "Square, with an aria-label and a tooltip"],
] as const;

// ---------- The quiz levels ----------

const LEVELS: Level[] = [
  {
    name: "The one next step",
    prompt: (
      <>
        A cart has three actions. <b>Continue shopping</b> is text and <b>Edit cart</b> is tinted.
        How should <b>Checkout</b> look?
      </>
    ),
    piece: "Checkout",
    answer: "brand",
    rows: [
      { depth: 0, text: "<CartFooter>", kind: "comp" },
      { depth: 1, text: "Continue shopping", tag: "text" },
      { depth: 1, text: "Edit cart", tag: "tinted" },
      {
        depth: 1,
        slot: {
          id: "tint",
          label: "+ tinted, like Edit cart",
          note: "Checkout now weighs the same as Edit cart, so nothing says which one finishes the order.",
          cost: ["2 equal buttons", "0 filled"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "red",
          label: "+ filled red",
          note: "Red reads as danger. People pause on the one button you want them to press.",
          cost: ["red = delete"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "brand",
          label: "+ filled, brand colour",
          note: "One filled button in the brand colour marks the step that finishes the job.",
          cost: ["1 filled", "1 next step"],
        },
      },
    ],
  },
  {
    name: "Remove a teammate",
    prompt: (
      <>
        Each member row on the team page can remove that person's access. You can invite them back
        later. Which button goes in the row?
      </>
    ),
    piece: "Remove access",
    answer: "tint",
    rows: [
      { depth: 0, text: "<MemberRow>", kind: "comp" },
      { depth: 1, text: "Dana Whitfield", tag: "editor" },
      {
        depth: 1,
        slot: {
          id: "filled",
          label: "+ filled red, then a confirm",
          note: "Filled red is for the one heavy delete, like Delete project. On every row it shouts over the whole page.",
          cost: ["red on 12 rows"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "grey",
          label: "+ grey text, one click",
          note: "It looks like Cancel. One stray click locks Dana out, and nothing warned you.",
          cost: ["1 click", "0 warnings"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "tint",
          label: "+ tinted red, then a confirm",
          note: "A moderate warning for an action you can undo: tinted red, and a confirm that names Dana.",
          cost: ["2 clicks", "names who"],
        },
      },
    ],
  },
  {
    name: "While it saves",
    prompt: (
      <>
        Saving takes 1.2 seconds, and impatient people click again at 300ms. When should the button
        stop taking clicks and say <b>Saving…</b>?
      </>
    ),
    piece: "disabled · Saving…",
    answer: "now",
    rows: [
      { depth: 0, text: "0 ms", tag: "click" },
      {
        depth: 1,
        slot: {
          id: "now",
          label: "+ right at the click",
          note: "The click lands and the button says so at once. The second click does nothing.",
          cost: ["1 request", "0ms silent"],
        },
      },
      { depth: 0, text: "300 ms", tag: "second click" },
      {
        depth: 1,
        slot: {
          id: "late",
          label: "+ at 400 ms",
          note: "For 400ms it looks idle, so the click at 300ms sends the form twice.",
          cost: ["2 requests", "400ms silent"],
        },
      },
      { depth: 0, text: "1200 ms", tag: "response" },
      {
        depth: 1,
        slot: {
          id: "after",
          label: "+ after the response",
          note: "The whole wait looks like nothing happened, then it jumps straight to Saved.",
          cost: ["2 requests", "1.2s silent"],
        },
      },
    ],
  },
  {
    name: "Less padding",
    prompt: (
      <>
        <code>pl-2 pr-3</code> puts 8px on the left and 12px on the right. Which button in the
        toolbar gets it?
      </>
    ),
    piece: "pl-2 pr-3",
    answer: "lead",
    rows: [
      { depth: 0, text: "<Toolbar>", kind: "comp" },
      {
        depth: 1,
        slot: {
          id: "trail",
          label: "Continue →",
          note: "Its icon is on the right. Trimming the left squeezes the text and leaves the arrow side loose.",
          cost: ["tight on the wrong side"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "lead",
          label: "＋ New project",
          note: "The icon leads, so its side gets less. Its own white space makes up the rest.",
          cost: ["8 | 12px", "looks even"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "only",
          label: "⚙ (icon only)",
          note: "An icon-only button is square, with the same padding on every side.",
          cost: ["not square"],
        },
      },
    ],
  },
  {
    name: "Can't be pressed",
    prompt: (
      <>
        Publish has three moments. Which one gets <code>cursor: not-allowed</code>?
      </>
    ),
    piece: "cursor: not-allowed",
    answer: "off",
    rows: [
      { depth: 0, text: "<PublishButton>", kind: "comp" },
      {
        depth: 1,
        slot: {
          id: "idle",
          label: "+ idle, title filled in",
          note: "It can be pressed, so it keeps the default arrow. The hand is for links.",
          cost: ["says no", "means yes"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "busy",
          label: "+ saving, aria-busy",
          note: "Saving is busy, not refused. cursor: wait says it's working.",
          cost: ["reads as refused"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "off",
          label: "+ disabled, no title yet",
          note: "The no-entry sign as you arrive, and a tooltip that says to add a title first.",
          cost: ["1 reason shown"],
        },
      },
    ],
  },
];

export function ButtonDesign() {
  return (
    <RuleLanding
      className="button-design"
      lead={
        <>
          Six buttons, each built the quick way and the careful way, side by side and live. Hover
          them, press them, tab to them. Then a mini quiz where you put each piece where it belongs.
        </>
      }
      learn={{
        title: "Every press gets an answer",
        intro: (
          <>
            A button promises that something will happen, and its states keep that promise. Each
            example builds the same button twice: on the left the way it often ships, on the right
            the way the rule builds it. They're real, so press them.
          </>
        ),
      }}
      lessons={LESSONS}
      tldr={CHEAT_SHEET}
      quiz={{
        intro: (
          <>
            Five buttons, five layouts. Drag each piece to where it belongs, or tap it and then tap
            a spot. A wrong spot tells you what it would cost.
          </>
        ),
        levels: LEVELS,
        board: "layout",
      }}
      take="build buttons the same way"
    />
  );
}
