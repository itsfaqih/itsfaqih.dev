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
            label: "Save, changes on hover",
            note: "Hover needs a mouse. Mia never hovers, so she still can't tell where she is.",
          },
          {
            id: "press",
            label: "Save, changes on press",
            note: "Press comes after she has found the button. She needs to see where she is before she presses Enter.",
          },
          {
            id: "focus",
            label: "Save, changes on focus",
            note: "Focus is where the keyboard is. Give it a look, and every Tab lands somewhere she can see.",
          },
        ],
      },
    ],
  },
  {
    title: "Say why it's off",
    bad: {
      label: "Just faded",
      costs: ["0 reasons", "1.6:1 contrast", "hand cursor"],
    },
    good: {
      label: "Say why",
      costs: ["1 reason", "6.4:1 contrast", "cursor: not-allowed"],
    },
    levels: [
      {
        name: "Can't be pressed",
        answer: "say",
        choices: [
          {
            id: "fade",
            label: "Publish faded to 40%",
            note: "Fading says no, but not why. The form looks done, so they're left guessing.",
          },
          {
            id: "hide",
            label: "Publish hidden",
            note: "They can't find Publish at all, let alone learn the URL is taken.",
          },
          {
            id: "say",
            label: "Publish readable, with a tooltip that says the URL is taken",
            note: "Keep the label readable and say why on hover, so they know to change the URL.",
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
      costs: ["0 changes on hover", "tooltip only"],
    },
    levels: [
      {
        name: "Page 1 of 5",
        answer: "next",
        choices: [
          {
            id: "prev",
            label: "Previous, disabled",
            note: "There's no page before 1. Lighting it up invites a click that does nothing.",
          },
          {
            id: "current",
            label: "1, the current page",
            note: "They're already on page 1, so a click there goes nowhere either.",
          },
          {
            id: "next",
            label: "Next",
            note: "Next can act, so it lights up. The disabled one stays still, and the difference shows which works.",
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
    title: "Guard the destructive action",
    bad: {
      label: "One click",
      costs: ["1 click", "0 warnings"],
    },
    good: {
      label: "Guard it",
      costs: ["3 guards", "0 stray deletes"],
    },
    levels: [
      {
        name: "Worth a confirm",
        answer: "delete",
        choices: [
          {
            id: "rename",
            label: "Rename",
            note: "A rename loses nothing, and you can rename it back. A confirm only slows people down.",
          },
          {
            id: "archive",
            label: "Archive",
            note: "Archive comes back in one click. Offer Undo after, rather than asking first.",
          },
          {
            id: "delete",
            label: "Delete",
            note: "Nothing brings these back. Ask first, name what goes, and land focus on Cancel.",
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
        answer: "lead",
        choices: [
          {
            id: "text",
            label: "Save, text only",
            note: "With no icon, there's no hidden white space. Even padding already looks even.",
          },
          {
            id: "lead",
            label: "New project, with a plus icon",
            note: "Trim the icon's side. The icon's own white space makes up the rest.",
          },
          {
            id: "only",
            label: "Search, icon only",
            note: "There's no text to balance against. Make it a square instead.",
          },
        ],
      },
    ],
  },
];

export const TLDR = [
  ["Any button", "Give hover, press and focus a look, in 100 to 200ms"],
  ["Not available yet", "Show the no-entry cursor and a tooltip that says why"],
  ["Hovering a disabled button", "Keep its colour and drop still"],
  ["Picking a variant", "Fill one per screen, tint the secondary, make Cancel text"],
  ["It deletes something", "Make it red, then confirm by name, hold, or offer Undo"],
  ["An icon beside the label", "Take 4px off the icon's side"],
] as const satisfies Tldr;
