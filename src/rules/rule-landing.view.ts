import { marker } from "../when";
import { cx } from "../cx";
import { shell, glyphSwap, text, hintKit, lessonKit, quizKit, island } from "./rule-landing.css";
export const SNAP = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export type SideKey = "bad" | "good";
export type Tone = "plain" | "wrap" | "chip" | "prompt" | "take";

/** How inline code reads where the kit puts it: a chip in lesson copy, a tint in a quiz prompt. */
export const codeTone = (tone: Tone) => [
  tone !== "plain" && text.wrap,
  tone === "chip" && text.chip,
  tone === "prompt" && text.tint,
  tone === "take" && text.bright,
];

export const landingView = {
  label: cx(island.label, marker),
  glyph: (shown: boolean) => cx(glyphSwap.glyph, shown ? glyphSwap.shown : glyphSwap.hidden),
};

export const lessonView = {
  article: `lesson ${cx(lessonKit.lesson, shell.rev, marker)}`,
  flipKey: (key: SideKey, on: boolean) => cx(lessonKit.flipKey, on && lessonKit[key]),
  pane: (on: boolean) => cx(lessonKit.well, lessonKit.pane, !on && lessonKit.behind, marker),
  hintSvg: (gone: boolean) => cx(hintKit.svg, gone && hintKit.gone),
  hintInk: hintKit.ink,
  hintHalo: (onPanel: boolean, gone: boolean) =>
    cx(hintKit.halo, onPanel && hintKit.haloOnPanel, gone && hintKit.gone),
  hintReveal: (drawn: boolean) => cx(hintKit.reveal, drawn && hintKit.drawn),
  hintLabel: (tilt: "up" | "down" | "level", onPanel: boolean, gone: boolean) =>
    cx(hintKit.label, hintKit[tilt], onPanel && hintKit.onPanel, gone && hintKit.gone),
};

type SlotState = {
  lead: boolean;
  open: boolean;
  near: boolean;
  missed: boolean;
  cleared: boolean;
  seated: boolean;
};

type ChoiceState = Pick<SlotState, "missed" | "cleared" | "seated">;

export const quizView = {
  slot: ({ lead, open, near, missed, cleared, seated }: SlotState) =>
    cx(
      quizKit.slot,
      lead ? quizKit.slotAfterLead : null,
      open && quizKit.slotOpen,
      near && quizKit.slotNear,
      missed && (open ? quizKit.slotMissOpen : quizKit.slotMiss),
      cleared && !seated && quizKit.slotOff,
      seated && quizKit.slotSeat,
      marker,
    ),
  piece: (picked: boolean, dragging: boolean) =>
    cx(quizKit.piece, picked && quizKit.picked, dragging && quizKit.dragging),
  say: (cleared: boolean, said: boolean) =>
    cx(quizKit.say, cleared ? quizKit.sayYes : said && quizKit.sayNo),
  said: (said: boolean) => cx(quizKit.said, said && quizKit.saidToned),
  star: (on: boolean) => cx(quizKit.star, on && quizKit.starOn),
  choice: (look: "card" | "spot", { missed, cleared, seated }: ChoiceState) =>
    cx(
      look === "card" ? quizKit.choice : quizKit.spot,
      !cleared && (look === "card" ? quizKit.choiceLive : quizKit.spotLive),
      missed && quizKit.choiceMiss,
      cleared && !seated && quizKit.choiceOff,
      seated && quizKit.choiceSeat,
      marker,
    ),
};
