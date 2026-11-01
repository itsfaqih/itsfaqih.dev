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
        piece: "a visible change",
        answer: "focus",
        rows: [
          { depth: 0, text: "Save button", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "hover",
              label: "+ on hover",
              note: "Hover needs a mouse. Mia never hovers, so she still can't tell where she is.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "press",
              label: "+ on press",
              note: "Press comes after she has found the button. She needs to see where she is before she presses Enter.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "focus",
              label: "+ on focus",
              note: "Focus is where the keyboard is. Give it a look, and every Tab lands somewhere she can see.",
            },
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
        piece: "disabled Publish",
        answer: "say",
        rows: [
          { depth: 0, text: "Post editor", kind: "comp" },
          { depth: 1, text: "Title", tag: "filled" },
          { depth: 1, text: "URL", tag: "taken" },
          {
            depth: 1,
            slot: {
              id: "fade",
              label: "+ faded to 40%, nothing else",
              note: "Fading says no, but not why. The form looks done, so they're left guessing.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "hide",
              label: "+ hidden until it works",
              note: "They can't find Publish at all, let alone learn the URL is taken.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "say",
              label: "+ readable, tooltip: That URL is taken",
              note: "Keep the label readable and say why on hover, so they know to change the URL.",
            },
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
        piece: "lights up on hover",
        answer: "next",
        rows: [
          { depth: 0, text: "Pager", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "prev",
              label: "+ Previous, disabled",
              note: "There's no page before 1. Lighting it up invites a click that does nothing.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "current",
              label: "+ 1, the current page",
              note: "They're already on page 1, so a click there goes nowhere either.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "next",
              label: "+ Next",
              note: "Next can act, so it lights up. The disabled one stays still, and the difference shows which works.",
            },
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
        piece: "Checkout",
        answer: "brand",
        rows: [
          { depth: 0, text: "Cart footer", kind: "comp" },
          { depth: 1, text: "Continue shopping", tag: "text" },
          { depth: 1, text: "Edit cart", tag: "tinted" },
          {
            depth: 1,
            slot: {
              id: "tint",
              label: "+ tinted, like Edit cart",
              note: "Checkout now weighs the same as Edit cart, so nothing says which one finishes the order.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "red",
              label: "+ filled red",
              note: "Red reads as danger. People pause on the one button you want them to press.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "brand",
              label: "+ filled, brand colour",
              note: "Fill one button in the brand colour to mark the step that finishes the job.",
            },
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
        piece: "Are you sure?",
        answer: "delete",
        rows: [
          { depth: 0, text: "Project page", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "rename",
              label: "+ Rename",
              note: "A rename loses nothing, and you can rename it back. A confirm only slows people down.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "archive",
              label: "+ Archive, undo any time",
              note: "Archive comes back in one click. Offer Undo after, rather than asking first.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "delete",
              label: "+ Delete, 214 files for good",
              note: "Nothing brings these back. Ask first, name what goes, and land focus on Cancel.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Pad the icon side less",
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
        piece: "trim the icon side",
        answer: "lead",
        rows: [
          { depth: 0, text: "Toolbar", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "text",
              label: "Save (text only)",
              note: "With no icon, there's no hidden white space. Even padding already looks even.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "lead",
              label: "＋ New project",
              note: "Trim the icon's side. The icon's own white space makes up the rest.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "only",
              label: "⚙ (icon only)",
              note: "There's no text to balance against. Make it a square instead.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Fix the size of an icon-only button",
    bad: {
      label: "Sized by padding",
      costs: ["44 × 44", "no tooltip"],
    },
    good: {
      label: "Fixed square",
      costs: ["38 × 38", "named + tooltip"],
    },
    levels: [
      {
        name: "Three icons",
        piece: "one size for all",
        answer: "square",
        rows: [
          { depth: 0, text: "Toolbar", kind: "comp" },
          { depth: 1, text: "⚙  ✎  ⋯", tag: "38 · 42 · 46px" },
          {
            depth: 1,
            slot: {
              id: "pad",
              label: "+ less padding on all three",
              note: "They're still sized by each icon, just smaller. They still come out three widths.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "redraw",
              label: "+ icons redrawn to one width",
              note: "It holds until the next icon. The size still depends on what's inside.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "square",
              label: "+ a fixed square, icon centred",
              note: "Fix the box, not the padding. Every icon gets the same square, the next one too.",
            },
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
  ["An icon with no label", "Make it a fixed square with an accessible name and a tooltip"],
] as const satisfies Tldr;
