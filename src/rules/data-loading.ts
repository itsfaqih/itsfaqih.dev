import type { Lesson, Tldr } from "./lesson";

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

/** What the orders page shows, and when: its frame, its rows, and their streamed reviews. */
export type Screen = { shell: number; rows: number; reviews?: number };

const ends = (bars: Bar[], kind: Bar["kind"]) => bars.find((bar) => bar.kind === kind)?.to;

/** The screen a waterfall draws, read off its bars so the two never disagree. */
export const screenOf = ({ bars, paint }: Waterfall): Screen => ({
  shell: ends(bars, "render") ?? paint,
  rows: paint,
  reviews: ends(bars, "defer"),
});

export const ORDERS = [
  { item: "#1042 Notebook", total: "$12", stars: "4.8" },
  { item: "#1038 Pens", total: "$6", stars: "4.5" },
  { item: "#1031 Desk mat", total: "$24", stars: "4.9" },
] as const;

/** The quiz's request: how long it takes, and how far it can slide along the axis. */
export const SLIDE = { request: 400, render: 20, code: 250, max: 500, from: 280 } as const;

/** When the rows show for a request that starts at `start`: once both the code and the data are in. */
export const rowsAt = (start: number) => Math.max(start + SLIDE.request, SLIDE.code) + SLIDE.render;

/** Which of the quiz's answers a start time is. */
export const slideChoice = (start: number) =>
  start === 0 ? "nav" : start < SLIDE.code ? "early" : "late";

/** What quiz 2's slider says for a start: its zone's label, and whether the rows could show sooner. */
export const slideSays = (label: string, start: number) =>
  `${label}, rows show ${rowsAt(start) === rowsAt(0) ? "as soon as they can" : "later than they could"}`;

/** How fast quiz 4's search replies. */
export type Load = "fast" | "slow";
/** What quiz 4's preview shows under the search box: nothing yet, the skeleton, or the suggestions. */
export type Shown = "typed" | "skeleton" | "data";

/**
 * Quiz 4's track, from the keystroke at 0 to 1: where each load's reply lands, the point past which
 * a skeleton counts as late, and where the skeleton marker starts.
 */
export const SKELETON = { lands: { fast: 0.05, slow: 0.8 }, late: 0.5, from: 0 } as const;

const ZONES = [
  [SKELETON.lands.fast, "early"],
  [SKELETON.late, "wait"],
  [Infinity, "late"],
] as const;

/** Which of quiz 4's answers a skeleton set to show at `at` is. */
export const skeletonChoice = (at: number) => ZONES.find(([until]) => at < until)![1];

/** What the preview shows at `t` for a load whose skeleton is set to show at `at`. */
export const shownAt = (load: Load, at: number, t: number): Shown =>
  t >= SKELETON.lands[load] ? "data" : t >= at ? "skeleton" : "typed";

const span = (length: number) => (length < SKELETON.late ? "a moment" : "a while");

/** What a load showed before its reply, in words: the preview's line when motion is reduced. */
export function skeletonSays(load: Load, at: number) {
  const blank = Math.min(at, SKELETON.lands[load]);
  const skeleton = SKELETON.lands[load] - blank;
  if (skeleton === 0) return `No skeleton. Blank for ${span(blank)} until the reply.`;
  const flash = skeleton <= SKELETON.lands.fast;
  if (blank === 0) return flash ? "Skeleton flashed for a moment." : "Skeleton until the reply.";
  return `Blank for ${span(blank)}, then ${flash ? "the skeleton flashed for a moment" : "a skeleton until the reply"}.`;
}

/** Where a page renders: on the server, or in the browser after its code loads. */
export type RenderAt = "server" | "browser";

export const LAMP = { path: "/lamp", title: "Desk lamp", price: "$48", stock: "In stock" } as const;

/**
 * How /lamp loads when it renders in each place: the HTML its first response carries, what the
 * status says at each step until the product paints, and what a crawler reading that HTML finds.
 */
export const RENDERS: Record<
  RenderAt,
  {
    html: string[];
    steps: (readonly [at: number, status: string])[];
    paint: number;
    painted: string;
    crawler: string;
  }
> = {
  browser: {
    html: ['<div id="root"></div>', '<script src="/app.js"></script>'],
    steps: [
      [0, "Requesting /lamp"],
      [400, "Loading app.js"],
      [900, "Fetching /api/lamp"],
    ],
    paint: 1400,
    painted: "Painted after 3 requests",
    crawler: "A crawler reading this HTML finds no title and no price.",
  },
  server: {
    html: [
      `<h1>${LAMP.title}</h1>`,
      `<p>${LAMP.price} · ${LAMP.stock}</p>`,
      '<script src="/app.js"></script>',
    ],
    steps: [[0, "Requesting /lamp"]],
    paint: 400,
    painted: "Painted from the first response",
    crawler: `A crawler reading this HTML finds ${LAMP.title} at ${LAMP.price}.`,
  },
};

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

/**
 * What the debounce demo types into search, key by key: when each key lands, how long the server
 * takes to answer the query it makes, so the replies land out of order, and what that query finds.
 */
export const TYPING = [
  { key: "l", at: 0, reply: 500, matches: ["Laptop stand", "Lunch box"] },
  { key: "a", at: 120, reply: 1100, matches: ["Laptop stand", "Ladder"] },
  { key: "m", at: 600, reply: 300, matches: ["Lamb rug", "Laminator"] },
  { key: "p", at: 720, reply: 300, matches: ["Desk lamp", "Floor lamp"] },
] as const;
export const QUERY = TYPING.map(({ key }) => key).join("");

export const DEBOUNCE = 300;

/** What became of a search request: still out, canceled, shown last, or shown and then replaced. */
export type Fate = "flight" | "canceled" | "shown" | "replaced";
export type Search = {
  q: string;
  sent: number;
  lands: number;
  matches: readonly string[];
  fate: Exclude<Fate, "flight">;
};

/** Debouncing's two halves: wait for a pause in the typing before sending, and cancel the request still out. */
export type Fix = { pause: boolean; cancel: boolean };

/** The search boxes the demo and quiz 5 draw: as typed, with either half of debouncing, or both. */
export const FIXES = {
  none: { pause: false, cancel: false },
  pause: { pause: true, cancel: false },
  cancel: { pause: false, cancel: true },
  both: { pause: true, cancel: true },
} as const satisfies Record<string, Fix>;

/**
 * The requests the demo's search box sends as it types, and their fates. Without `pause` each letter
 * sends one; with it a request waits for a pause in the typing. With `cancel` sending a request
 * cancels any still in flight. Of the requests that land, the last to land shows.
 */
export function searches({ pause, cancel }: Fix): Search[] {
  const sent = TYPING.flatMap(({ at, reply, matches }, i) => {
    const next = TYPING[i + 1]?.at ?? Infinity;
    const q = QUERY.slice(0, i + 1);
    if (!pause) return [{ q, sent: at, reply, matches }];
    return next - at > DEBOUNCE ? [{ q, sent: at + DEBOUNCE, reply, matches }] : [];
  });
  const timed = sent.map(({ reply, ...s }, i) => {
    const lands = s.sent + reply;
    const after = sent[i + 1]?.sent ?? Infinity;
    return { ...s, lands, canceled: cancel && after < lands };
  });
  const last = timed.filter((s) => !s.canceled).sort((a, b) => b.lands - a.lands)[0];
  return timed.map(({ canceled, ...s }) => ({
    ...s,
    fate: canceled ? "canceled" : s.q === last?.q ? "shown" : "replaced",
  }));
}

/** What the request log says of a request with this fate. */
export const fateSays = (fate: Fate, q: string) =>
  fate === "flight" ? "in flight" : fate === "shown" && q !== QUERY ? "shown, stale" : fate;

/** The request whose results show once every request has landed. */
export const shownSearch = (fix: Fix) => searches(fix).find((s) => s.fate === "shown");

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
    title: "Render public pages on the server",
    bad: { label: "Render in the browser", costs: ["blank first frame", "nothing to index"] },
    good: {
      label: "Render on the server",
      costs: ["painted first frame", "title and price indexed"],
    },
    levels: [
      {
        name: "Three pages",
        answer: "product",
        choices: [
          {
            id: "settings",
            label: "Account settings, after sign in",
            note: "No crawler gets past the login, and the person already has the app open. The browser is fine.",
          },
          {
            id: "product",
            label: "A public product page",
            note: "Search has to read its name and price, and a shopper from a search result wants them in the first frame. Render it on the server.",
          },
          {
            id: "admin",
            label: "A staff dashboard, after sign in",
            note: "Only staff open it, and never from a search. Render it in the browser if that's simpler.",
          },
        ],
      },
    ],
  },
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
            note: "It starts with the navigation and runs while the code loads. The rows show as soon as they can.",
          },
          {
            id: "early",
            label: "Starts before the code loads",
            note: "Closer, but nothing makes it wait. Start it as you navigate and the rows show sooner.",
          },
          {
            id: "late",
            label: "Starts once the code loads",
            note: "It waits for the page's code, which it doesn't need, and the rows wait with it.",
          },
        ],
      },
    ],
  },
  {
    title: "Keep stale data on screen",
    bad: { label: "Blank", costs: ["blank for a second"] },
    good: { label: "Keep it, then swap", costs: ["never blank", "1 quiet update"] },
    levels: [
      {
        name: "Back to the tab",
        answer: "stay",
        choices: [
          {
            id: "blank",
            label: "Prices replaced by a full spinner",
            note: "Prices you could have read vanish for a few seconds, then come back a little different.",
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
        answer: "wait",
        choices: [
          {
            id: "early",
            label: "Before the fast reply lands",
            note: "The skeleton shows before a fast reply lands, so it flashes on almost every keystroke. Wait a moment first.",
          },
          {
            id: "wait",
            label: "Soon after the fast reply lands",
            note: "The fast reply beats the skeleton, so nothing flashes. A slow reply still gets a skeleton while it loads.",
          },
          {
            id: "late",
            label: "Late, long after the fast reply",
            note: "A slow search sits blank for most of its wait, with no sign it's loading. Show the skeleton sooner.",
          },
        ],
      },
    ],
  },
  {
    title: "Debounce search input",
    bad: { label: "Every keystroke", costs: ["4 requests", "stale results win"] },
    good: { label: "Wait 300ms", costs: ["2 sent, 1 canceled", "right results"] },
    levels: [
      {
        name: "Typing lamp",
        answer: "both",
        choices: [
          {
            id: "pause",
            label: "Wait for a pause before sending",
            note: "It sends 2 requests now, but la's slow reply still lands last and shows.",
          },
          {
            id: "cancel",
            label: "Cancel the request still out",
            note: "The results are right now, but it still sends a request on every letter.",
          },
          {
            id: "both",
            label: "Wait for a pause, and cancel the one still out",
            note: "It sends la after the pause, cancels it when lamp goes, and shows lamp's results.",
          },
        ],
      },
    ],
  },
  {
    title: "Errors where the data was",
    bad: { label: "A toast", costs: ["0 retries", "gone in seconds"] },
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
            note: "It fades in a few seconds, doesn't say which card, and the revenue card stays empty.",
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
        answer: "fetch",
        choices: [
          {
            id: "fetch",
            label: "loadOrder(), where it arrives",
            note: "Check it here. A missing coupon gets its fallback once, and everything after can trust the data.",
          },
          {
            id: "page",
            label: "<CheckoutPage>",
            note: "The data got this far unchecked, and every other screen that loads an order skips the check.",
          },
          {
            id: "receipt",
            label: "<Receipt>, where it crashed",
            note: "It crashed here, but the bad data came in two steps earlier. Patch it here and order history crashes next.",
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
  ["Search as you type", "Send it 300ms after the last key. Cancel the old one"],
  ["A request that fails", "Show the error in place, with Retry. Log it"],
  ["Updates within a second", "Push them over a live connection. At 30s or slower, poll"],
  ["Anything from an API", "Parse it where it arrives"],
] as const satisfies Tldr;
