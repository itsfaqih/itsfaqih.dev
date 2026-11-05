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
        name: "Pay, before a card",
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
  ["Hovering a disabled button", "Keep its colour and drop still"],
  ["Picking a variant", "Fill one per screen, tint the secondary, make Cancel text"],
  ["An icon beside the label", "Take 4px off the icon's side"],
] as const satisfies Tldr;
