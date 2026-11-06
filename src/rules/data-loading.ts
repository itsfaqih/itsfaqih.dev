import type { BoardRow, Lesson, Tldr } from "./lesson";

/** A quiz row on the timeline board: when it happens, then what happens. */
export type TimedRow = Extract<BoardRow, { text: string }> & { at: string };

const at = (time: string, text: string): TimedRow => ({ depth: 0, at: time, text });

export const isTimed = (row: BoardRow): row is TimedRow => "at" in row;

export const money = (value: number) => `$${value.toLocaleString("en-US")}`;

export type Bar = {
  label: string;
  from: number;
  to: number;
  kind: "code" | "render" | "req" | "defer";
};
export type Waterfall = { bars: Bar[]; paint: number };

export const AXIS = 1000;
export const SWEEP = 1600;

export const LATE: Waterfall = {
  bars: [
    { label: "app.js", from: 0, to: 300, kind: "code" },
    { label: "render orders", from: 300, to: 330, kind: "render" },
    { label: "GET /orders", from: 330, to: 820, kind: "req" },
  ],
  paint: 840,
};

export const EARLY: Waterfall = {
  bars: [
    { label: "app.js", from: 0, to: 300, kind: "code" },
    { label: "GET /orders", from: 0, to: 500, kind: "req" },
    { label: "render orders", from: 500, to: 520, kind: "render" },
    { label: "GET /reviews", from: 0, to: 880, kind: "defer" },
  ],
  paint: 520,
};

/** The quiz's request: how long it takes, and how far it can slide along the axis. */
export const SLIDE = { request: 400, render: 20, code: 250, max: 500, from: 280 } as const;

/** When the rows show for a request that starts at `start`: once both the code and the data are in. */
export const rowsAt = (start: number) => Math.max(start + SLIDE.request, SLIDE.code) + SLIDE.render;

/** Which of the quiz's answers a start time is. */
export const slideChoice = (start: number) =>
  start === 0 ? "nav" : start < SLIDE.code ? "early" : "late";

export const REVENUE = [48210, 49875, 47930, 51402];

export const MAIL = [
  ["Rina", "Invoice #2041 is paid"],
  ["Deploy bot", "main is green again"],
  ["Sam", "Notes from Tuesday"],
  ["Ops", "Disk at 81% on db-2"],
  ["Maya", "Can we move standup?"],
] as const;

/** The three messages on top once `top` messages have come in. */
export const inboxRows = (top: number) =>
  [0, 1, 2].map((offset) => MAIL[(top + offset) % MAIL.length] ?? MAIL[0]);

export const SPIN_DELAY = 200;

export const TEAM = [
  ["Ana", "Design"],
  ["Budi", "Engineering"],
  ["Citra", "Product"],
] as const;

export const RESPONSE = '{ "id": 1, "name": "Alice" }';

type Profile = { id: number; name: string; city: string };
export type Outcome = { ok: true; user: Profile } | { ok: false; error: string };

const describe = (cause: unknown) =>
  cause instanceof Error ? `${cause.name}: ${cause.message}` : "Error: unknown";

/** The demo really runs the code it shows, so the crash it prints is the engine's own. */
export function trustJson(body: string): Outcome {
  try {
    const user: Profile = JSON.parse(body);
    return { ok: true, user: { ...user, city: user.city.toUpperCase() } };
  } catch (cause) {
    return { ok: false, error: describe(cause) };
  }
}

type ProfileResponse = { id: number; name: string; city?: string };

const parseProfile = (response: ProfileResponse): Profile => ({
  ...response,
  city: response.city ?? "Unknown",
});

export function parseJson(body: string): Outcome {
  const user = parseProfile(JSON.parse(body));
  return { ok: true, user: { ...user, city: user.city.toUpperCase() } };
}

export type Payment = { label: string; amount: number };

export const SPENT: Payment = { label: "Laptop", amount: -1830 };
export const HISTORY: Payment[] = [
  { label: "Salary", amount: 2400 },
  { label: "Groceries", amount: -62 },
  { label: "Coffee", amount: -4 },
];

export const LESSONS: Lesson[] = [
  {
    title: "Start fetching early",
    bad: { label: "Fetch on render", costs: ["data at 840ms", "1 waterfall"] },
    good: { label: "Fetch on navigation", costs: ["data at 520ms", "0 waterfalls"] },
    levels: [
      {
        name: "Twelve invoices",
        answer: "nav",
        choices: [
          {
            id: "nav",
            label: "Starts as you navigate",
            note: "It starts with the navigation and runs while the code loads. The rows show at 420ms, as soon as they can.",
          },
          {
            id: "early",
            label: "Starts before the code loads",
            note: "Closer, but nothing makes it wait. Start it as you navigate, at 0ms, and the rows show at 420ms.",
          },
          {
            id: "late",
            label: "Starts once the code loads",
            note: "It waits for the page's code, which it doesn't need. Every millisecond it waits delays the rows.",
          },
        ],
      },
    ],
  },
  {
    title: "Keep stale data on screen",
    bad: { label: "Blank", costs: ["blank 900ms"] },
    good: { label: "Keep it, then swap", costs: ["0ms blank", "1 quiet update"] },
    levels: [
      {
        name: "Back to the tab",
        answer: "stay",
        choices: [
          {
            id: "blank",
            label: "Prices replaced by a full spinner",
            note: "Prices you could have read vanish for 600ms, then come back a little different.",
          },
          {
            id: "stay",
            label: "Prices kept, with a small spinner beside them",
            note: "Keep them readable. Fresh numbers swap in place when they land.",
          },
          {
            id: "keep",
            label: "Prices kept until the next page load",
            note: "The fresh prices arrive and nobody sees them. The cache never revalidates.",
          },
        ],
      },
    ],
  },
  {
    title: "Avoid skeleton flickers",
    bad: { label: "At once", costs: ["flashes 80ms"] },
    good: { label: "Wait 200ms", costs: ["0 flashes"] },
    levels: [
      {
        name: "As you type",
        piece: "spinner",
        answer: "delay",
        rows: [
          at("0ms", "You type a letter in search"),
          {
            depth: 1,
            slot: {
              id: "now",
              label: "show it at once",
              note: "Most suggestions land at 60ms, so the spinner flashes on almost every keystroke.",
            },
          },
          at("60ms", "Most suggestions land"),
          {
            depth: 1,
            slot: {
              id: "delay",
              label: "show it at 200ms, if still waiting",
              note: "Wait 200ms. Quick suggestions never show it. Slow ones get it when the wait is real.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "late",
              label: "show it at 1s, if still waiting",
              note: "A slow search sits for a full second with no sign it heard the keystroke.",
            },
          },
          at("1500ms", "A slow search lands"),
        ],
      },
    ],
  },
  {
    title: "Errors where the data was",
    bad: { label: "A toast", costs: ["0 retries", "gone in 3s"] },
    good: { label: "Show it inline, with Retry", costs: ["1 tap to recover", "logged"] },
    levels: [
      {
        name: "One card fails",
        answer: "inline",
        choices: [
          {
            id: "page",
            label: "An error page instead of the dashboard",
            note: "One bad card throws away four good ones, and nothing retries in place.",
          },
          {
            id: "inline",
            label: "Inside the revenue card",
            note: "Put it where the chart would be. The other four stay, and one tap retries. Log it too.",
          },
          {
            id: "toast",
            label: "A toast that says Something went wrong",
            note: "It fades in 3s, doesn't say which card, and the revenue card stays empty.",
          },
        ],
      },
    ],
  },
  {
    title: "Parse at the boundary",
    bad: { label: "Trust it", costs: ["1 crash", "blank card"] },
    good: { label: "Parse it", costs: ["0 crashes", "1 fallback"] },
    levels: [
      {
        name: "A missing field",
        piece: "check the shape",
        answer: "fetch",
        rows: [
          at("0ms", "The order arrives from the server"),
          {
            depth: 1,
            slot: {
              id: "fetch",
              label: "as soon as it arrives",
              note: "Check it here. A missing coupon gets its fallback once, and everything after can trust the data.",
            },
          },
          at("40ms", "The checkout page renders"),
          {
            depth: 1,
            slot: {
              id: "page",
              label: "in the checkout page",
              note: "The data got this far unchecked, and every other screen that loads an order skips the check.",
            },
          },
          at("42ms", "The receipt reads the coupon"),
          {
            depth: 1,
            slot: {
              id: "avatar",
              label: "in the receipt, as a fallback",
              note: "The fallback hides the gap two screens from where it came in, and every other reader still trusts it.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Persist what can't mislead",
    bad: { label: "Persist all", costs: ["$1,830 off", "no date"] },
    good: { label: "Persist history only", costs: ["balance always live", "history dated"] },
    levels: [
      {
        name: "Offline on day 3",
        answer: "orders",
        choices: [
          {
            id: "stock",
            label: "Desk lamp, 3 in stock",
            note: "They sold out on day 2. You'd order a lamp nobody can ship.",
          },
          {
            id: "orders",
            label: "Your past orders, updated 2 days ago",
            note: "Persist them with the date. Past orders don't change.",
          },
          {
            id: "price",
            label: "Desk lamp sale price, $48",
            note: "The sale ended on day 2. A two-day-old price shows a total checkout won't charge.",
          },
        ],
      },
    ],
  },
];

export const TLDR = [
  ["SEO or first paint matters", "Render it on the server. Behind a login, the browser is fine"],
  ["Data a page needs", "Start it on navigation, batch it, stream the rest"],
  ["Refetching data you have", "Keep it on screen with a small spinner"],
  ["A reply that may be quick", "Show loading UI only after 200ms"],
  ["A request that fails", "Show the error in place, with Retry. Log it"],
  ["Updates within a second", "Push them over a live connection. At 30s or slower, poll"],
  ["Anything from an API", "Parse it where it arrives"],
] as const satisfies Tldr;
