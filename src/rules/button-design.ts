import type { Lesson, Tldr } from "./lesson";

export const LESSONS: Lesson[] = [
  {
    title: "Give every state a look",
    bad: {
      label: "One look",
      costs: ["1 look for 4 states", "0px focus ring"],
    },
    good: {
      label: "Four looks",
      costs: ["4 looks", "3px focus ring", "150ms"],
    },
    levels: [
      {
        name: "Where am I?",
        answer: "focus",
        choices: [
          {
            id: "hover",
            label: "Send, changes on hover",
            note: "Hover needs a mouse. Mia never hovers, so she still can't tell where she is.",
          },
          {
            id: "press",
            label: "Send, changes on press",
            note: "Press comes after she has found the button. She needs to see where she is before she presses Enter.",
          },
          {
            id: "focus",
            label: "Send, changes on focus",
            note: "Focus is where the keyboard is. Give it a look, and every Tab lands somewhere she can see.",
          },
        ],
      },
    ],
  },
  {
    title: "Keep a disabled button still on hover",
    bad: {
      label: "Lights up",
      costs: ["lights on hover", "dips on press"],
    },
    good: {
      label: "Stays still",
      costs: ["0 changes on hover", "0 changes on press"],
    },
    levels: [
      {
        name: "Nothing to undo",
        answer: "still",
        choices: [
          {
            id: "hand",
            label: "Lights up, hand cursor",
            note: "Everything looks pressable. She clicks, and nothing happens.",
          },
          {
            id: "mixed",
            label: "Lights up, no-entry cursor",
            note: "The colour looks clickable while the cursor shows it isn't. People trust the colour and click anyway.",
          },
          {
            id: "still",
            label: "Stays put, no-entry cursor",
            note: "Nothing moves on hover, and the cursor shows it's off, so nobody clicks it.",
          },
        ],
      },
    ],
  },
  {
    title: "Fill one button per screen",
    bad: {
      label: "All filled",
      costs: ["3 filled", "red Publish"],
    },
    good: {
      label: "Fill, tint, text",
      costs: ["1 filled", "1 next step"],
    },
    levels: [
      {
        name: "The one next step",
        answer: "brand",
        choices: [
          {
            id: "tint",
            label: "Checkout tinted",
            note: "Checkout now weighs the same as Edit cart, so nothing says which one finishes the order.",
          },
          {
            id: "red",
            label: "Checkout filled red",
            note: "Red reads as danger. People pause on the one button you want them to press.",
          },
          {
            id: "brand",
            label: "Checkout filled in the brand colour",
            note: "Fill one button in the brand colour to mark the step that finishes the job.",
          },
        ],
      },
    ],
  },
  {
    title: "Optical alignment over mathematical alignment",
    bad: {
      label: "Even padding",
      costs: ["16 | 16px", "icon side looks wider"],
    },
    good: {
      label: "Optical padding",
      costs: ["12 | 16px", "looks even"],
    },
    levels: [
      {
        name: "Less padding",
        answer: "open",
        choices: [
          {
            id: "download",
            label: "Download, 12 left and 16 right",
            note: "Already trimmed on the icon's side.",
          },
          {
            id: "open",
            label: "Open, 16 left and 16 right",
            note: "Its icon is on the right, and that side still has the full 16px.",
          },
          {
            id: "next",
            label: "Next, 16 left and 12 right",
            note: "Already trimmed on the icon's side.",
          },
        ],
      },
    ],
  },
  {
    title: "Give an icon button less padding than a text button",
    bad: {
      label: "Text padding",
      costs: ["16px every side", "48px, taller than Reply"],
    },
    good: {
      label: "From the height",
      costs: ["11px every side", "38px, as tall as Reply"],
    },
    levels: [
      {
        name: "Play beside Subtitles",
        answer: "fit",
        choices: [
          {
            id: "tall",
            label: "16px on every side",
            note: "16px is Subtitles' side padding, room for a label. Play comes out 48px tall beside a 38px Subtitles, so the bar stops lining up.",
          },
          {
            id: "fit",
            label: "11px on every side",
            note: "(38px height - 16px icon) / 2 is 11px, so Play is a 38px square, as tall as Subtitles.",
          },
          {
            id: "short",
            label: "8px on every side",
            note: "Play shrinks to 32px, 6px shorter than Subtitles and a smaller target.",
          },
        ],
      },
    ],
  },
];

export const TLDR = [
  ["Any button", "Give hover, press and focus a look, in 100 to 200ms"],
  ["Hovering a disabled button", "Keep its colour and drop still"],
  ["Picking a variant", "Fill one per screen, tint the secondary, make Cancel text"],
  ["An icon beside the label", "Take 4px off the icon's side"],
  ["A button with only an icon", "Pad (height - icon) / 2, not the text's 16px"],
] as const satisfies Tldr;
