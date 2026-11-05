import type { Lesson, Tldr } from "./lesson";

export const LESSONS: Lesson[] = [
  {
    title: "Store the moment in UTC",
    bad: { label: "Local, no offset", costs: ["1 moment, 2 values", "12 h apart"] },
    good: { label: "Store UTC", costs: ["1 moment, 1 value", "0 s apart"] },
    levels: [
      {
        name: "Same second",
        answer: "utc",
        choices: [
          {
            id: "local",
            label: "Yuki 18:00, Lena 10:00, each local clock",
            note: "Same second, two values 8 hours apart. Sort by time and Lena's comment comes first.",
          },
          {
            id: "server",
            label: "Both 17:00, the server's clock in Singapore",
            note: "One value today, but no zone is stored. Move the server and old rows mean another moment.",
          },
          {
            id: "utc",
            label: "Both 09:00 UTC",
            note: "Store UTC. One moment is one value, wherever the writer or the server is.",
          },
        ],
      },
    ],
  },
  {
    title: "Return it with a Z",
    bad: { label: "No Z", costs: ["Rina 7 h early", "Sam 5 h late"] },
    good: { label: "End with Z", costs: ["0 h off"] },
    levels: [
      {
        name: "The response",
        answer: "z",
        choices: [
          {
            id: "bare",
            label: "paidAt 2026-03-04T11:30:00, no zone",
            note: "No zone, so Yuki's browser reads it as 11:30 AM Tokyo time, nine hours early.",
          },
          {
            id: "z",
            label: "paidAt 2026-03-04T11:30:00Z, ending in Z",
            note: "The Z says UTC, so each browser converts it. Yuki sees 8:30 PM and Lena 12:30 PM.",
          },
          {
            id: "text",
            label: "paidAt Mar 4, 11:30 AM, already formatted",
            note: "A formatted string can't be converted again, so everyone sees the server's 11:30 AM.",
          },
        ],
      },
    ],
  },
  {
    title: "Turn it local in the browser",
    bad: { label: "Server time", costs: ["right for 1 of 2", "Rina 12 h off"] },
    good: { label: "Format in browser", costs: ["right for 2 of 2"] },
    levels: [
      {
        name: "Two readers",
        piece: "format the time",
        answer: "browser",
        rows: [
          { depth: 0, text: "Database", kind: "dir" },
          {
            depth: 1,
            slot: {
              id: "sql",
              label: "in the database query",
              note: "The query formats in one zone for everyone, so Yuki and Lena can't both be right.",
            },
          },
          { depth: 0, text: "API", kind: "dir", tag: "runs in Singapore" },
          {
            depth: 1,
            slot: {
              id: "api",
              label: "on the server",
              note: "The server uses Singapore time. Yuki and Lena both get 5:00 PM, and both are wrong.",
            },
          },
          { depth: 0, text: "Each reader's browser", kind: "dir" },
          {
            depth: 1,
            slot: {
              id: "browser",
              label: "when the comment renders",
              note: "Format here. Each browser knows its own zone, so one UTC string becomes 6:00 PM for Yuki and 10:00 AM for Lena.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Send the zone with the input",
    bad: { label: "No zone", costs: ["7 h late for both"] },
    good: { label: "Send UTC or offset", costs: ["0 h off"] },
    levels: [
      {
        name: "9:30 in Berlin",
        piece: "→ UTC",
        answer: "client",
        rows: [
          { depth: 0, text: "Lena's browser", kind: "dir", tag: "UTC+1" },
          { depth: 1, text: '`picked = "2026-03-12T09:30"`' },
          {
            depth: 1,
            slot: {
              id: "client",
              label: "before the request",
              note: "Convert here. Lena's browser knows it's at UTC+1, so it sends 2026-03-12T08:30:00.000Z and the server has nothing to guess.",
            },
          },
          { depth: 0, text: "API", kind: "dir" },
          {
            depth: 1,
            slot: {
              id: "api",
              label: "when the request arrives",
              note: "The string has no zone, so the server reads 09:30 as UTC, an hour late.",
            },
          },
          { depth: 0, text: "Database", kind: "dir" },
          {
            depth: 1,
            slot: {
              id: "db",
              label: "on insert, as Europe/Berlin",
              note: "Right for Lena, but it assumes everyone lives in Berlin. Yuki's meetings land 8 hours off.",
            },
          },
        ],
      },
      {
        name: "One offset",
        piece: "+09:00",
        answer: "body",
        rows: [
          { depth: 0, text: "POST /bookings, from Yuki", kind: "dir" },
          {
            depth: 1,
            lead: '`at: "2026-03-12T18:00:00`',
            slot: {
              id: "body",
              label: '…"',
              note: "Send it with the time, so the server knows the exact moment and stores 09:00 UTC.",
            },
          },
          { depth: 0, text: "Database, bookings", kind: "dir" },
          {
            depth: 1,
            lead: "`at_offset`",
            slot: {
              id: "db",
              label: "new column",
              note: "The column keeps an offset you don't need. Store only the UTC moment.",
            },
          },
          { depth: 0, text: "GET /bookings, to Lena", kind: "dir" },
          {
            depth: 1,
            lead: '`at: "2026-03-12T18:00:00`',
            slot: {
              id: "reply",
              label: '…"',
              note: "Lena gets Yuki's offset, and every writer's zone leaks into replies. Return UTC with a Z.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Filter by the user's day",
    bad: { label: "UTC midnight", costs: ["2 missed", "1 from the next day"] },
    good: { label: "Use her midnight", costs: ["3 of 3", "0 extra"] },
    levels: [
      {
        name: "Whose Mar 4?",
        answer: "yuki",
        choices: [
          {
            id: "utc",
            label: "UTC report, Mar 4 from 00:00 UTC on Mar 4 to 00:00 UTC on Mar 5",
            note: "The UTC day starts at 00:00Z. From 15:00 the day before, the report counts 9 hours of Mar 3.",
          },
          {
            id: "yuki",
            label: "Yuki in Tokyo, Mar 4 from 15:00 UTC on Mar 3 to 15:00 UTC on Mar 4",
            note: "Use it for Yuki. Midnight in Tokyo is 15:00 UTC the day before, so all of Yuki's Mar 4 is in range.",
          },
          {
            id: "lena",
            label: "Lena in Berlin, Mar 4 from 23:00 UTC on Mar 3 to 23:00 UTC on Mar 4",
            note: "Lena's Mar 4 starts at 23:00 UTC on Mar 3. From 15:00, the filter gets 8 hours of Mar 3.",
          },
        ],
      },
    ],
  },
];

export const TLDR = [
  ["Saving a timestamp", "Store UTC, with no offset column"],
  ["Returning one from the API", "Return ISO 8601 ending in Z"],
  ["Showing it to someone", "Format it in their browser"],
  ["Sending a time the user picked", "Convert to UTC, or keep its offset"],
  ["Filtering by a date", "Send the user's day as a UTC range"],
  ["Date math", "Do the math on parsed times, never on the string"],
] as const satisfies Tldr;

/** A board cell written in backticks is code, as in Markdown. */
export function codeCell(value: string) {
  return value.length > 1 && value.startsWith("`") && value.endsWith("`")
    ? value.slice(1, -1)
    : undefined;
}

export type Way = "bad" | "good";
export type Person = { who: string; city: string; tz: string };
export const RINA: Person = { who: "Rina", city: "Jakarta", tz: "Asia/Jakarta" };
export const SAM: Person = { who: "Sam", city: "New York", tz: "America/New_York" };
export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;
export const JAKARTA = 7 * HOUR;

/** A wall-clock time in some zone, held as the UTC instant with the same digits. */
export type Wall = number;

export const MOMENT = Date.parse("2026-01-10T06:00:00.000Z");

const PARTS = new Map<string, Intl.DateTimeFormat>();
export function wallOf(instant: number, tz: string): Wall {
  let format = PARTS.get(tz);
  if (!format) {
    format = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    PARTS.set(tz, format);
  }
  const part = Object.fromEntries(format.formatToParts(instant).map((p) => [p.type, p.value]));
  return Date.UTC(
    Number(part.year),
    Number(part.month) - 1,
    Number(part.day),
    Number(part.hour),
    Number(part.minute),
    Number(part.second),
  );
}

// Formatted by hand: ICU versions disagree on the space before AM, and the server and the
// browser must print the same string.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");
export function timeOf(wall: Wall, seconds = false) {
  const at = new Date(wall);
  const h = at.getUTCHours();
  const s = seconds ? `:${pad(at.getUTCSeconds())}` : "";
  return `${h % 12 || 12}:${pad(at.getUTCMinutes())}${s} ${h < 12 ? "AM" : "PM"}`;
}
export function dayOf(wall: Wall) {
  const at = new Date(wall);
  return `${DAYS[at.getUTCDay()]}, ${MONTHS[at.getUTCMonth()]} ${at.getUTCDate()}`;
}
export const shortDay = (wall: Wall) => {
  const at = new Date(wall);
  return `${MONTHS[at.getUTCMonth()]} ${at.getUTCDate()}`;
};
export const digits = (wall: Wall) => new Date(wall).toISOString().slice(0, 19);
export const utcIso = (instant: number) => new Date(instant).toISOString();
export const hhmm = (wall: Wall) => new Date(wall).toISOString().slice(11, 16);

/** What a reader's clock shows, and what it should show. */
export type Reading = { person: Person; shown: Wall; truth: Wall };

export const readAt = (person: Person, shown: number, truth: number): Reading => ({
  person,
  shown: wallOf(shown, person.tz),
  truth: wallOf(truth, person.tz),
});

export const hourAngle = (wall: Wall) => {
  const at = new Date(wall);
  return ((at.getUTCHours() % 12) * 60 + at.getUTCMinutes()) / 2;
};
export const minuteAngle = (wall: Wall) => new Date(wall).getUTCMinutes() * 6;

export function offBy(reading: Reading) {
  const hours = (reading.shown - reading.truth) / HOUR;
  if (hours === 0) return null;
  return `${Math.abs(hours)} h ${hours < 0 ? "early" : "late"}`;
}

export const RIGHT = [readAt(RINA, MOMENT, MOMENT), readAt(SAM, MOMENT, MOMENT)];
export const NO_Z: Reading[] = [RINA, SAM].map((person) => ({
  person,
  shown: wallOf(MOMENT, "UTC"),
  truth: wallOf(MOMENT, person.tz),
}));
const SERVER_WALL = wallOf(MOMENT, SAM.tz);
export const SERVER_TIME: Reading[] = [RINA, SAM].map((person) => ({
  person,
  shown: SERVER_WALL,
  truth: wallOf(MOMENT, person.tz),
}));
export const serverString = (() => {
  const at = new Date(SERVER_WALL);
  return `${at.getUTCMonth() + 1}/${at.getUTCDate()}/${at.getUTCFullYear()}, ${timeOf(SERVER_WALL, true)}`;
})();

/** One order per writer, both in the same second, as each way stores `created_at`. */
export function ordersOf(way: Way) {
  return [
    { id: 41, by: RINA },
    { id: 42, by: SAM },
  ]
    .map((row) => ({ ...row, at: way === "bad" ? wallOf(MOMENT, row.by.tz) : MOMENT }))
    .sort((a, b) => a.at - b.at || a.id - b.id);
}

const parseWall = (date: string, time: string) => Date.parse(`${date}T${time}:00Z`);

export const REMINDER = { date: "2026-01-01", time: "07:00" };

/** The reminder Rina typed: what each way sends, and how the two readers see it. */
export function reminderOf(way: Way, date: string, time: string) {
  const typed = parseWall(date, time);
  const wall = Number.isNaN(typed) ? parseWall(REMINDER.date, REMINDER.time) : typed;
  const meant = wall - JAKARTA;
  const stored = way === "bad" ? wall : meant;
  return {
    wall,
    meant,
    stored,
    readings: [readAt(RINA, stored, meant), readAt(SAM, stored, meant)],
  };
}

export const FILTER_DATE = "2026-01-10";
const ORDER_TIMES = [-30, 135, 400, 1270, 1640];

export type Fate = "shown" | "missed" | "extra" | "out";
export const FATE: Record<Fate, string> = {
  shown: "shown",
  missed: "missed",
  extra: "wrong day",
  out: "",
};

/** Rina's orders around the day she picked, and which of them each way's range returns. */
export function filterOf(way: Way, date: string) {
  const typed = parseWall(date, "00:00");
  const start = Number.isNaN(typed) ? parseWall(FILTER_DATE, "00:00") : typed;
  const from = way === "bad" ? start : start - JAKARTA;
  const orders = ORDER_TIMES.map((minutes, index) => {
    const wall = start + minutes * 60_000;
    const instant = wall - JAKARTA;
    const inRange = instant >= from && instant < from + DAY;
    const hers = minutes >= 0 && minutes < 24 * 60;
    const fate: Fate = inRange ? (hers ? "shown" : "extra") : hers ? "missed" : "out";
    return { id: 51 + index, wall, instant, fate };
  });
  return { from, orders };
}

/** A piece of a wire line: plain text, or a string literal shown in quotes. */
export type Part = { text: string; quoted?: true };
const t = (text: string): Part => ({ text });
const q = (text: string): Part => ({ text, quoted: true });
export type WireLine = { c: Part[]; hot?: boolean; note?: boolean };

export const ordersLines = (way: Way): WireLine[] => [
  { c: [t("-- Rina and Sam order in the same second")], note: true },
  {
    c: [t(way === "bad" ? "created_at timestamp  -- the writer's clock" : "created_at  -- UTC")],
    hot: true,
  },
];

export const responseLines = (way: Way): WireLine[] => [
  { c: [t("GET /orders/41")] },
  { c: [t("createdAt: "), q(way === "bad" ? digits(MOMENT) : utcIso(MOMENT))], hot: true },
];

export const formatLines = (way: Way): WireLine[] =>
  way === "bad"
    ? [
        { c: [t("// the API, running in New York")], note: true },
        { c: [t("createdAt.toLocaleString()")], hot: true },
        { c: [t("→ "), q(serverString)] },
      ]
    : [
        { c: [t("// in each reader's browser")], note: true },
        { c: [t("new Date(createdAt).toLocaleString()")], hot: true },
        { c: [t("← "), q(utcIso(MOMENT))] },
      ];

export const reminderLines = (way: Way, wall: Wall, meant: number): WireLine[] =>
  way === "bad"
    ? [
        { c: [t("POST /reminders")] },
        { c: [t("at: "), q(digits(wall))], hot: true },
        { c: [t("// no zone, so the server reads it as UTC")], note: true },
      ]
    : [
        { c: [t("POST /reminders")] },
        { c: [t("at: "), q(utcIso(meant))], hot: true },
        { c: [t("// or "), q(`${digits(wall)}+07:00`)], note: true },
      ];

export const filterLines = (way: Way, from: number): WireLine[] => {
  const at = way === "bad" ? digits : utcIso;
  return [
    { c: [t("GET /orders")] },
    { c: [t("from="), t(at(from))], hot: true },
    { c: [t("to="), t(at(from + DAY))], hot: true },
  ];
};
