import type { Lesson, Tldr } from "./lesson";

export const DRAFT = "Checkout fails on Safari 17 when a coupon is set";

export const LESSONS: Lesson[] = [
  {
    title: "Keep focus inside",
    bad: {
      label: "Focus wanders",
      costs: ["starts behind", "Tab leaves it", "lost on close"],
    },
    good: {
      label: "Hold focus",
      costs: ["starts in Name", "Tab stays in", "back on close"],
    },
    levels: [
      {
        name: "It closed",
        piece: "focus",
        answer: "trigger",
        rows: [
          {
            depth: 0,
            slot: {
              id: "body",
              label: "Top of the page",
              note: "Focus starts over at the top. A keyboard user tabs past 12 links to get back.",
            },
          },
          { depth: 1, text: "Nav, 12 links", kind: "more" },
          { depth: 1, text: "Settings page", kind: "comp" },
          {
            depth: 2,
            slot: {
              id: "trigger",
              label: "Edit profile button",
              note: "Return focus here, where they left off. One Tab continues down the page.",
            },
          },
          {
            depth: 2,
            slot: {
              id: "next",
              label: "Change password button",
              note: "Close, but they never picked it, so a screen reader announces it without warning.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Let Escape close it",
    bad: {
      label: "Esc ignored",
      costs: ["Esc ignored", "2 ways out"],
    },
    good: {
      label: "Close on Esc",
      costs: ["Esc closes", "4 ways out"],
    },
    levels: [
      {
        name: "A click outside",
        piece: "close",
        answer: "news",
        rows: [
          { depth: 0, text: "click on the scrim", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "issue",
              label: "New issue, title typed in",
              note: `One stray click throws away the ${DRAFT.length} characters they typed.`,
            },
          },
          {
            depth: 1,
            slot: {
              id: "news",
              label: "What's new, nothing to fill in",
              note: "Close it on a click outside, since there is nothing to lose.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "profile",
              label: "Edit profile, nothing changed yet",
              note: "Let Esc and Cancel close it, since it's a form one keystroke from holding input.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Focus the safe answer",
    bad: {
      label: "Delete first",
      costs: ["Enter deletes", "214 files"],
    },
    good: {
      label: "Focus Cancel",
      costs: ["Enter cancels", "0 files lost"],
    },
    levels: [
      {
        name: "Delete forever",
        piece: "first focus",
        answer: "cancel",
        rows: [
          { depth: 0, text: "Moonbase project row", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "trigger",
              label: "Delete project, on the page behind",
              note: "Focus stays behind the dim layer. Tab moves through the page, and Enter reopens the dialog.",
            },
          },
          { depth: 0, text: "Confirm dialog", kind: "comp" },
          { depth: 1, text: "Delete Moonbase?" },
          {
            depth: 1,
            slot: {
              id: "cancel",
              label: "Cancel",
              note: "Focus the safe answer. A stray Enter backs out, and deleting takes a deliberate move.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "delete",
              label: "Delete",
              note: "One Enter deletes 214 files before anyone has read the title.",
            },
          },
        ],
      },
      {
        name: "Add a contact",
        piece: "first focus",
        answer: "name",
        rows: [
          { depth: 0, text: "Add contact dialog", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "close",
              label: "× Close",
              note: "Typing goes nowhere, and one Enter closes the form they came to fill.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "name",
              label: "Name field",
              note: "Focus the first field so they start typing at once, with no click or Tab.",
            },
          },
          { depth: 1, text: "Email field" },
          {
            depth: 1,
            slot: {
              id: "save",
              label: "Save",
              note: "Enter saves an empty contact, and they Shift+Tab back up to start.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Ask before you drop a draft",
    bad: {
      label: "Click drops it",
      costs: ["1 stray click", `${DRAFT.length} chars gone`],
    },
    good: {
      label: "Ask first",
      costs: ["0 chars lost", "asks first"],
    },
    levels: [
      {
        name: "A slip",
        piece: "shake",
        answer: "issue",
        rows: [
          { depth: 0, text: "click on the scrim", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "news",
              label: "What's new, nothing to fill in",
              note: "Nothing typed, nothing lost. Shaking it blocks a safe way out.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "issue",
              label: "New issue, title typed in",
              note: `Shake it and keep the ${DRAFT.length} characters. Esc or × asks before it drops them.`,
            },
          },
          {
            depth: 1,
            slot: {
              id: "preview",
              label: "Image preview, nothing to fill in",
              note: "It holds no input, so a click outside should just close it.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Lock the page behind",
    bad: {
      label: "Page scrolls",
      costs: ["page moves", "place lost"],
    },
    good: {
      label: "Lock the page",
      costs: ["0px moved", "0px shift"],
    },
    levels: [
      {
        name: "Hold the page",
        piece: "scroll lock",
        answer: "body",
        rows: [
          {
            depth: 0,
            slot: {
              id: "body",
              label: "The page",
              note: "Lock the page while the dialog is open, and keep room for its scrollbar so nothing shifts.",
            },
          },
          { depth: 1, text: "The article, 3,000 words", kind: "more" },
          {
            depth: 1,
            slot: {
              id: "scrim",
              label: "The dim layer",
              note: "The dim layer never scrolled. The article under it still does.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "panel",
              label: "The dialog panel",
              note: "A long dialog gets cut off, and the article behind it still scrolls.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Give it a name",
    bad: {
      label: "A plain box",
      costs: ["no role", "no name"],
    },
    good: {
      label: "Name the dialog",
      costs: ["a dialog", "named", "described"],
    },
    levels: [
      {
        name: "Read aloud",
        piece: "the dialog",
        answer: "named",
        rows: [
          { depth: 0, text: "screen reader, as it opens", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "plain",
              label: "+ a plain box",
              note: "Focus moves, but nothing says a dialog opened or what it asks.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "role",
              label: "+ marked as a dialog",
              note: "They hear dialog, but not which one or what it asks.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "named",
              label: "+ a dialog with a name and a description",
              note: "They hear Delete Moonbase?, dialog, then that 214 files go for good. That's enough to answer.",
            },
          },
        ],
      },
    ],
  },
];

export const TLDR = [
  ["It opens", "Focus the first field, or Cancel if it destroys something"],
  ["While it's open", "Cycle Tab inside. Keep the page behind inert and still"],
  ["Escape", "Close it, every time"],
  ["A click outside", "Close an info dialog. Shake or ask on a form with input"],
  ["It closes", "Return focus to the button that opened it"],
  ["For screen readers", "Mark it as a modal dialog. Name it by its title"],
  ["On a phone", "Use a bottom sheet that swipes down to close"],
] as const satisfies Tldr;
