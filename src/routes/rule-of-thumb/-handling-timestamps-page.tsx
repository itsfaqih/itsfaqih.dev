import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { reducedMotion } from "../../hooks/use-media-query";
import { fonts, palette } from "../../theme.stylex";
import {
  type Lesson,
  type Level,
  onceOnScreen,
  OUT,
  RuleLanding,
  TABBED,
} from "./-components/rule-landing";
import { kit } from "./-components/rule-landing.stylex";

const PHONE = "@media (max-width: 640px)";
const LIGHT = ":is(.light *)";

const styles = stylex.create({
  view: {
    display: "grid",
    gap: "14px",
    alignContent: "start",
  },
  costs: {
    alignContent: "end",
  },
  wire: {
    display: "grid",
    gap: "2px",
    fontSize: { default: "12.5px", [PHONE]: "12px" },
    lineHeight: 1.5,
    fontFamily: fonts["--mono"],
  },
  line: {
    minHeight: "24px",
    paddingBlock: "2px",
    paddingInline: "8px",
    borderRadius: "6px",
    color: palette["--text"],
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  note: {
    color: palette["--mute"],
  },
  hot: {
    backgroundColor: {
      default: null,
      [stylex.when.ancestor('[data-side="bad"]')]: `color-mix(in srgb, ${kit["--no"]} 10%, transparent)`,
      [stylex.when.ancestor('[data-side="good"]')]: "color-mix(in srgb, var(--c) 10%, transparent)",
    },
    boxShadow: {
      default: null,
      [stylex.when.ancestor('[data-side="bad"]')]: `inset 2px 0 0 ${kit["--no"]}`,
      [stylex.when.ancestor('[data-side="good"]')]: "inset 2px 0 0 var(--c)",
    },
  },
  str: {
    display: "inline-block",
    maxWidth: "100%",
    color: {
      default: `color-mix(in oklab, ${palette["--ar"]} ${palette["--ink-mix"]}, #000)`,
      [stylex.when.ancestor("[data-note]")]: "inherit",
    },
  },
  readers: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(auto-fit, minmax(190px, 1fr))",
      [PHONE]: "minmax(0, 1fr)",
    },
    gap: "10px",
  },
  reader: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    rowGap: "4px",
    columnGap: "12px",
    alignItems: "center",
    paddingBlock: "12px",
    paddingInline: "12px",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 2px 0 ${palette["--drop-ink"]}`,
  },
  read: {
    display: "grid",
    minWidth: 0,
  },
  who: {
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
  },
  time: {
    fontWeight: 700,
    fontSize: { default: "20px", [PHONE]: "18px" },
    lineHeight: 1.25,
    fontFamily: fonts["--mono"],
    letterSpacing: "-0.02em",
    color: palette["--text"],
  },
  date: {
    fontSize: "13px",
    color: palette["--dim"],
  },
  should: {
    marginTop: "2px",
    fontSize: "12.5px",
    fontWeight: 600,
    color: kit["--yes-ink"],
  },
  off: {
    color: kit["--no-ink"],
  },
  clock: {
    position: "relative",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: kit["--code-bg"],
    boxShadow: `inset 0 0 0 1.5px ${palette["--hair"]}`,
    "::before": {
      content: '""',
      position: "absolute",
      top: "3px",
      right: "3px",
      bottom: "3px",
      left: "3px",
      borderRadius: "50%",
      backgroundImage: `repeating-conic-gradient(from -3deg, ${palette["--mute"]} 0 6deg, transparent 6deg 90deg)`,
      maskImage: "radial-gradient(circle, transparent 17px, #000 17.5px)",
    },
    "::after": {
      content: '""',
      position: "absolute",
      top: "calc(50% - 3px)",
      right: "calc(50% - 3px)",
      bottom: "calc(50% - 3px)",
      left: "calc(50% - 3px)",
      borderRadius: "50%",
      backgroundColor: palette["--text"],
    },
  },
  hand: {
    position: "absolute",
    bottom: "50%",
    left: "calc(50% - 1.5px)",
    width: "3px",
    height: "13px",
    borderRadius: "2px",
    backgroundColor: palette["--text"],
    transform: "rotate(var(--a))",
    transformOrigin: "50% 100%",
  },
  minuteHand: {
    left: "calc(50% - 1px)",
    width: "2px",
    height: "19px",
    backgroundColor: palette["--dim"],
  },
  hourOff: {
    backgroundColor: kit["--no-ink"],
  },
  ghost: {
    backgroundColor: kit["--yes-ink"],
    opacity: 0.5,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: { default: "12.5px", [PHONE]: "12px" },
    lineHeight: 1.4,
    fontFamily: fonts["--mono"],
  },
  th: {
    paddingBlock: "6px",
    paddingInline: "8px",
    borderBottomWidth: "1.5px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
    textAlign: "left",
  },
  td: {
    paddingBlock: "8px",
    paddingInline: "8px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: `color-mix(in srgb, ${palette["--hair"]} 60%, transparent)`,
    color: palette["--text"],
  },
  at: {
    whiteSpace: "nowrap",
    color: { default: palette["--text"], [stylex.when.ancestor('[data-side="bad"]')]: kit["--no-ink"] },
  },
  sum: {
    fontSize: "14px",
    color: palette["--dim"],
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
  },
  formHead: {
    flexBasis: "100%",
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
  },
  input: {
    minHeight: "38px",
    paddingBlock: 0,
    paddingInline: "10px",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: {
      default: palette["--hair"],
      ":hover": palette["--hair-hover"],
      ":focus-visible": "var(--c-ink)",
    },
    borderRadius: "10px",
    backgroundColor: palette["--panel"],
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    colorScheme: { default: "dark", [LIGHT]: "light" },
    outlineWidth: { default: null, ":focus-visible": "2px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "2px" },
    transition: `border-color ${kit["--t-fb"]} ease`,
  },
  orders: {
    display: "grid",
    gap: "4px",
    paddingBlock: 0,
    paddingInline: 0,
    listStyle: "none",
  },
  order: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    gap: "10px",
    alignItems: "center",
    minHeight: "40px",
    paddingBlock: "4px",
    paddingInline: "10px",
    borderRadius: "8px",
    fontSize: { default: "12.5px", [PHONE]: "12px" },
    lineHeight: 1.3,
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    transition: `opacity ${kit["--t-fb"]} ease, background-color ${kit["--t-fb"]} ease`,
  },
  orderOut: {
    opacity: 0.45,
  },
  orderShown: {
    backgroundColor: "color-mix(in srgb, var(--c) 8%, transparent)",
  },
  orderWrong: {
    backgroundColor: `color-mix(in srgb, ${kit["--no"]} 8%, transparent)`,
    boxShadow: `inset 2px 0 0 ${kit["--no"]}`,
  },
  orderId: {
    color: palette["--mute"],
  },
  when: {
    display: "grid",
  },
  whenMissed: {
    textDecorationLine: "line-through",
    textDecorationColor: `color-mix(in srgb, ${kit["--no"]} 60%, transparent)`,
  },
  utc: {
    fontSize: "11px",
    color: palette["--mute"],
  },
  fate: {
    paddingBlock: "2px",
    paddingInline: "7px",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    whiteSpace: "nowrap",
  },
  fateShown: {
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  },
  fateWrong: {
    backgroundColor: `color-mix(in srgb, ${kit["--no"]} 16%, transparent)`,
    color: kit["--no-ink"],
  },
});

type Person = { who: string; city: string; tz: string };
const RINA: Person = { who: "Rina", city: "Jakarta", tz: "Asia/Jakarta" };
const SAM: Person = { who: "Sam", city: "New York", tz: "America/New_York" };
const HOUR = 3_600_000;
const JAKARTA = 7 * HOUR;

type Wall = number;

const MOMENT = Date.parse("2026-01-10T06:00:00.000Z");

const PARTS = new Map<string, Intl.DateTimeFormat>();
function wallOf(instant: number, tz: string): Wall {
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
function timeOf(wall: Wall, seconds = false) {
  const at = new Date(wall);
  const h = at.getUTCHours();
  const s = seconds ? `:${pad(at.getUTCSeconds())}` : "";
  return `${h % 12 || 12}:${pad(at.getUTCMinutes())}${s} ${h < 12 ? "AM" : "PM"}`;
}
function dayOf(wall: Wall) {
  const at = new Date(wall);
  return `${DAYS[at.getUTCDay()]}, ${MONTHS[at.getUTCMonth()]} ${at.getUTCDate()}`;
}
const shortDay = (wall: Wall) => {
  const at = new Date(wall);
  return `${MONTHS[at.getUTCMonth()]} ${at.getUTCDate()}`;
};
const digits = (wall: Wall) => new Date(wall).toISOString().slice(0, 19);
const utcIso = (instant: number) => new Date(instant).toISOString();
const hhmm = (wall: Wall) => new Date(wall).toISOString().slice(11, 16);

type Reading = { person: Person; shown: Wall; truth: Wall };

const readAt = (person: Person, shown: number, truth: number): Reading => ({
  person,
  shown: wallOf(shown, person.tz),
  truth: wallOf(truth, person.tz),
});

const hourAngle = (wall: Wall) => {
  const at = new Date(wall);
  return ((at.getUTCHours() % 12) * 60 + at.getUTCMinutes()) / 2;
};
const minuteAngle = (wall: Wall) => new Date(wall).getUTCMinutes() * 6;

function offBy(reading: Reading) {
  const hours = (reading.shown - reading.truth) / HOUR;
  if (hours === 0) return null;
  return `${Math.abs(hours)} h ${hours < 0 ? "early" : "late"}`;
}

function swing(root: HTMLElement, from: Wall[], to: Wall[], duration: number, step: number) {
  return [...root.querySelectorAll<HTMLElement>(".ts-reader")].flatMap((card, index) => {
    const start = from[index];
    const end = to[index];
    const hour = card.querySelector<HTMLElement>(".ts-hour");
    const minute = card.querySelector<HTMLElement>(".ts-min");
    if (start === undefined || end === undefined || !hour || !minute || start === end) return [];
    const timing: KeyframeAnimationOptions = {
      duration,
      delay: index * step,
      easing: OUT,
      fill: "backwards",
    };
    const h = hourAngle(end);
    const m = minuteAngle(end);
    const turn = (end - start) / 60_000 / 2;
    const minuteTurn = ((((m - minuteAngle(start)) % 360) + 540) % 360) - 180;
    return [
      hour.animate(
        [{ transform: `rotate(${h - turn}deg)` }, { transform: `rotate(${h}deg)` }],
        timing,
      ),
      minute.animate(
        [{ transform: `rotate(${m - minuteTurn}deg)` }, { transform: `rotate(${m}deg)` }],
        timing,
      ),
    ];
  });
}

function Readers({ readings, utc }: { readings: Reading[]; utc: Wall }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = readings.map((reading) => reading.shown);
  const live = useRef({ shown, utc });
  live.current = { shown, utc };
  const last = useRef(shown);
  const key = shown.join();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || reducedMotion()) return;
    const fromUtc = () => live.current.shown.map(() => live.current.utc);
    const play = () => swing(root, fromUtc(), live.current.shown, 720, 120);

    if (matchMedia(TABBED).matches) {
      const demo = root.closest<HTMLElement>(".demo");
      const side = root.closest<HTMLElement>(".pane")?.dataset.side;
      if (!demo || !side) return;
      const observer = new MutationObserver(() => {
        if (demo.dataset.show === side) play();
      });
      observer.observe(demo, { attributes: true, attributeFilter: ["data-show"] });
      return () => observer.disconnect();
    }

    if (root.getBoundingClientRect().top < innerHeight * 0.7) return;
    const held = play();
    for (const animation of held) animation.pause();
    let timer = 0;
    const stop = onceOnScreen(root, () => {
      timer = window.setTimeout(() => {
        for (const animation of held) animation.play();
      }, 240);
    });
    return () => {
      stop();
      clearTimeout(timer);
      for (const animation of held) animation.cancel();
    };
  }, []);

  useLayoutEffect(() => {
    const root = ref.current;
    const before = last.current;
    last.current = live.current.shown;
    if (!root || reducedMotion() || before.join() === key) return;
    for (const animation of root.getAnimations({ subtree: true })) animation.cancel();
    swing(root, before, live.current.shown, 280, 0);
  }, [key]);

  return (
    <div ref={ref} {...stylex.props(styles.readers)}>
      {readings.map((reading) => {
        const off = offBy(reading);
        return (
          <div
            key={reading.person.who}
            className={`ts-reader ${stylex.props(styles.reader).className}`}
          >
            <span aria-hidden="true" {...stylex.props(styles.clock)}>
              {off && (
                <i
                  {...stylex.props(styles.hand, styles.ghost)}
                  style={{ "--a": `${hourAngle(reading.truth)}deg` }}
                />
              )}
              <i
                className={`ts-min ${stylex.props(styles.hand, styles.minuteHand).className}`}
                style={{ "--a": `${minuteAngle(reading.shown)}deg` }}
              />
              <i
                className={`ts-hour ${stylex.props(styles.hand, off !== null && styles.hourOff).className}`}
                style={{ "--a": `${hourAngle(reading.shown)}deg` }}
              />
            </span>
            <span {...stylex.props(styles.read)}>
              <span {...stylex.props(styles.who)}>
                {reading.person.who} · {reading.person.city}
              </span>
              <b {...stylex.props(styles.time, off !== null && styles.off)}>{timeOf(reading.shown)}</b>
              <span {...stylex.props(styles.date)}>{dayOf(reading.shown)}</span>
              {off && (
                <span {...stylex.props(styles.should)}>
                  <span className="sr-only">{off}, </span>should be {timeOf(reading.truth)}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

type Line = { c: ReactNode; hot?: boolean; note?: boolean };

function Wire({ lines }: { lines: Line[] }) {
  return (
    <div {...stylex.props(styles.wire)}>
      {lines.map((line, index) => (
        <code
          key={index}
          data-note={line.note || undefined}
          {...stylex.props(
            styles.line,
            line.note && styles.note,
            line.hot && styles.hot,
            stylex.defaultMarker(),
          )}
        >
          {line.c}
        </code>
      ))}
    </div>
  );
}

const str = (text: string) => <span {...stylex.props(styles.str)}>"{text}"</span>;

type Way = "bad" | "good";

function OrdersTable({ way }: { way: Way }) {
  const rows = [
    { id: 41, by: RINA },
    { id: 42, by: SAM },
  ]
    .map((row) => ({ ...row, at: way === "bad" ? wallOf(MOMENT, row.by.tz) : MOMENT }))
    .sort((a, b) => a.at - b.at || a.id - b.id);
  const first = rows[0]?.at ?? 0;
  const gap = ((rows[rows.length - 1]?.at ?? 0) - first) / HOUR;
  return (
    <div {...stylex.props(styles.view)}>
      <Wire
        lines={[
          { c: "-- Rina and Sam order in the same second", note: true },
          {
            c: way === "bad" ? "created_at timestamp  -- the writer's clock" : "created_at  -- UTC",
            hot: true,
          },
        ]}
      />
      <table {...stylex.props(styles.table)}>
        <thead>
          <tr>
            <th scope="col" {...stylex.props(styles.th)}>
              id
            </th>
            <th scope="col" {...stylex.props(styles.th)}>
              by
            </th>
            <th scope="col" {...stylex.props(styles.th)}>
              created_at
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td {...stylex.props(styles.td)}>{row.id}</td>
              <td {...stylex.props(styles.td)}>{row.by.who}</td>
              <td {...stylex.props(styles.td, styles.at)}>{digits(row.at).replace("T", " ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p {...stylex.props(styles.sum)}>
        {gap ? `One second, stored ${gap} h apart.` : "One second, one value."}
      </p>
    </div>
  );
}

const parseWall = (date: string, time: string) => Date.parse(`${date}T${time}:00Z`);

function ReminderDemo({ way }: { way: Way }) {
  const [date, setDate] = useState("2026-01-01");
  const [time, setTime] = useState("07:00");
  const typed = parseWall(date, time);
  const wall = Number.isNaN(typed) ? parseWall("2026-01-01", "07:00") : typed;
  const meant = wall - JAKARTA;
  const stored = way === "bad" ? wall : meant;
  const id = `ts-${way}`;
  return (
    <div {...stylex.props(styles.view)}>
      <div {...stylex.props(styles.form)}>
        <span {...stylex.props(styles.formHead)}>New reminder · Rina, Jakarta</span>
        <label htmlFor={`${id}-date`} className="sr-only">
          Date
        </label>
        <input
          id={`${id}-date`}
          type="date"
          value={date}
          required
          onChange={(event) => setDate(event.target.value)}
          {...stylex.props(styles.input)}
        />
        <label htmlFor={`${id}-time`} className="sr-only">
          Time
        </label>
        <input
          id={`${id}-time`}
          type="time"
          value={time}
          required
          onChange={(event) => setTime(event.target.value)}
          {...stylex.props(styles.input)}
        />
      </div>
      <Wire
        lines={
          way === "bad"
            ? [
                { c: "POST /reminders" },
                { c: <>at: {str(digits(wall))}</>, hot: true },
                { c: "// no zone, so the server reads it as UTC", note: true },
              ]
            : [
                { c: "POST /reminders" },
                { c: <>at: {str(utcIso(meant))}</>, hot: true },
                { c: <>// or {str(`${digits(wall)}+07:00`)}</>, note: true },
              ]
        }
      />
      <Readers readings={[readAt(RINA, stored, meant), readAt(SAM, stored, meant)]} utc={stored} />
    </div>
  );
}

const ORDER_TIMES = [-30, 135, 400, 1270, 1640];
const DAY = 24 * HOUR;

type Fate = "shown" | "missed" | "extra" | "out";
const FATE: Record<Fate, string> = {
  shown: "shown",
  missed: "missed",
  extra: "wrong day",
  out: "",
};

function FilterDemo({ way }: { way: Way }) {
  const [date, setDate] = useState("2026-01-10");
  const typed = parseWall(date, "00:00");
  const start = Number.isNaN(typed) ? parseWall("2026-01-10", "00:00") : typed;
  const from = way === "bad" ? start : start - JAKARTA;
  const orders = ORDER_TIMES.map((minutes, index) => {
    const wall = start + minutes * 60_000;
    const instant = wall - JAKARTA;
    const inRange = instant >= from && instant < from + DAY;
    const hers = minutes >= 0 && minutes < 24 * 60;
    const fate: Fate = inRange ? (hers ? "shown" : "extra") : hers ? "missed" : "out";
    return { id: 51 + index, wall, instant, fate };
  });
  return (
    <div {...stylex.props(styles.view)}>
      <label {...stylex.props(styles.form)}>
        <span {...stylex.props(styles.formHead)}>Rina's orders on</span>
        <input
          type="date"
          value={date}
          required
          onChange={(event) => setDate(event.target.value)}
          {...stylex.props(styles.input)}
        />
      </label>
      <Wire
        lines={
          way === "bad"
            ? [
                { c: "GET /orders" },
                { c: <>from={digits(from)}</>, hot: true },
                { c: <>to={digits(from + DAY)}</>, hot: true },
              ]
            : [
                { c: "GET /orders" },
                { c: <>from={utcIso(from)}</>, hot: true },
                { c: <>to={utcIso(from + DAY)}</>, hot: true },
              ]
        }
      />
      <ul {...stylex.props(styles.orders)}>
        {orders.map((order) => {
          const wrong = order.fate === "missed" || order.fate === "extra";
          return (
            <li
              key={order.id}
              {...stylex.props(
                styles.order,
                order.fate === "out" && styles.orderOut,
                order.fate === "shown" && styles.orderShown,
                wrong && styles.orderWrong,
              )}
            >
              <span {...stylex.props(styles.orderId)}>#{order.id}</span>
              <span {...stylex.props(styles.when, order.fate === "missed" && styles.whenMissed)}>
                {shortDay(order.wall)}, {timeOf(order.wall)}
                <small {...stylex.props(styles.utc)}>
                  {shortDay(order.instant)}, {hhmm(order.instant)} UTC
                </small>
              </span>
              {FATE[order.fate] && (
                <span
                  {...stylex.props(
                    styles.fate,
                    order.fate === "shown" && styles.fateShown,
                    wrong && styles.fateWrong,
                  )}
                >
                  {FATE[order.fate]}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const RIGHT = [readAt(RINA, MOMENT, MOMENT), readAt(SAM, MOMENT, MOMENT)];
const NO_Z = [RINA, SAM].map((person) => ({
  person,
  shown: wallOf(MOMENT, "UTC"),
  truth: wallOf(MOMENT, person.tz),
}));
const SERVER_WALL = wallOf(MOMENT, SAM.tz);
const SERVER_TIME = [RINA, SAM].map((person) => ({
  person,
  shown: SERVER_WALL,
  truth: wallOf(MOMENT, person.tz),
}));
const serverString = (() => {
  const at = new Date(SERVER_WALL);
  return `${at.getUTCMonth() + 1}/${at.getUTCDate()}/${at.getUTCFullYear()}, ${timeOf(SERVER_WALL, true)}`;
})();

const LESSONS: Lesson[] = [
  {
    title: "Store the moment in UTC",
    body: (
      <>
        Rina in Jakarta and Sam in New York order in the same second. A column with no offset saves
        each writer's own clock, so one moment lands as two times. Save it in UTC and it lands as
        one.
      </>
    ),
    extra: (
      <p className="tip">
        UTC has no daylight saving and no political changes. It means the same moment everywhere.
      </p>
    ),
    bad: {
      label: "Local, no offset",
      costs: ["1 moment, 2 values", "12 h apart"],
      view: <OrdersTable way="bad" />,
    },
    good: {
      label: "UTC",
      costs: ["1 moment, 1 value", "0 s apart"],
      view: <OrdersTable way="good" />,
    },
  },
  {
    title: "Return it with a Z",
    body: (
      <>
        An ISO string with no <code>Z</code> has no zone, so each browser reads the digits as its
        own local time. Rina and Sam both see 6:00 AM, and both are wrong. With the <code>Z</code>,
        each browser moves it to its own zone.
      </>
    ),
    bad: {
      label: "No Z",
      costs: ["Rina 7 h early", "Sam 5 h late"],
      view: (
        <div {...stylex.props(styles.view)}>
          <Wire
            lines={[
              { c: "GET /orders/41" },
              { c: <>createdAt: {str(digits(MOMENT))}</>, hot: true },
            ]}
          />
          <Readers readings={NO_Z} utc={MOMENT} />
        </div>
      ),
    },
    good: {
      label: "Ends in Z",
      costs: ["0 h off"],
      view: (
        <div {...stylex.props(styles.view)}>
          <Wire
            lines={[
              { c: "GET /orders/41" },
              { c: <>createdAt: {str(utcIso(MOMENT))}</>, hot: true },
            ]}
          />
          <Readers readings={RIGHT} utc={MOMENT} />
        </div>
      ),
    },
  },
  {
    title: "Turn it local in the browser",
    body: (
      <>
        The server knows its own time zone, not the reader's. Format the time there and it's right
        only for people who live where the server runs. Send UTC, and let each browser format it.
      </>
    ),
    bad: {
      label: "Server time",
      costs: ["right for 1 of 2", "Rina 12 h off"],
      view: (
        <div {...stylex.props(styles.view)}>
          <Wire
            lines={[
              { c: "// the API, running in New York", note: true },
              { c: "createdAt.toLocaleString()", hot: true },
              { c: <>→ {str(serverString)}</> },
            ]}
          />
          <Readers readings={SERVER_TIME} utc={MOMENT} />
        </div>
      ),
    },
    good: {
      label: "Viewer's time",
      costs: ["right for 2 of 2"],
      view: (
        <div {...stylex.props(styles.view)}>
          <Wire
            lines={[
              { c: "// in each reader's browser", note: true },
              { c: "new Date(createdAt).toLocaleString()", hot: true },
              { c: <>← {str(utcIso(MOMENT))}</> },
            ]}
          />
          <Readers readings={RIGHT} utc={MOMENT} />
        </div>
      ),
    },
  },
  {
    title: "Send the zone with the input",
    body: (
      <>
        Rina sets a reminder for 7:00 AM. Sent as <code>2026-01-01T07:00:00</code>, the server can't
        tell whose 7:00 that is and reads it as UTC. Send the UTC time with a <code>Z</code>, or the
        time with its offset. Both name one moment.
      </>
    ),
    bad: {
      label: "No zone",
      costs: ["7 h late for both"],
      view: <ReminderDemo way="bad" />,
    },
    good: {
      label: "UTC or offset",
      costs: ["0 h off"],
      view: <ReminderDemo way="good" />,
    },
  },
  {
    title: "Filter by the user's day",
    body: (
      <>
        Rina asks for her orders on Jan 10. Her day starts at midnight in Jakarta, which is 17:00
        UTC the day before. Send midnight with no zone and the server queries 07:00 to 07:00 her
        time: early orders go missing and the next morning's slip in.
      </>
    ),
    bad: {
      label: "UTC midnight",
      costs: ["2 missed", "1 from the next day"],
      view: <FilterDemo way="bad" />,
    },
    good: {
      label: "Her midnight",
      costs: ["3 of 3", "0 extra"],
      view: <FilterDemo way="good" />,
    },
  },
];

const TLDR = [
  ["Saving a timestamp", "UTC, with no offset column"],
  ["Returning one from the API", "ISO 8601 ending in Z"],
  ["Showing it to someone", "Format it in their browser"],
  ["Sending a time the user picked", "Convert to UTC, or keep its offset"],
  ["Filtering by a date", "The user's day as a UTC range"],
  ["Date math", "On Date values, never on the string"],
] as const;

const code = (text: string) => <code>{text}</code>;

const LEVELS: Level[] = [
  {
    name: "Two readers",
    prompt: (
      <>
        The order is stored as <code>2026-01-10 06:00:00</code> UTC. Rina should see 1:00 PM and Sam
        1:00 AM. Where does the formatting run?
      </>
    ),
    piece: "Intl.DateTimeFormat",
    answer: "browser",
    rows: [
      { depth: 0, text: "Database", kind: "dir" },
      {
        depth: 1,
        slot: {
          id: "sql",
          label: "in the SELECT",
          note: "The query formats in one zone for everyone, so Rina and Sam can't both be right.",
          cost: ["right for 1 zone"],
        },
      },
      { depth: 0, text: "API", kind: "dir", tag: "runs in New York" },
      {
        depth: 1,
        slot: {
          id: "api",
          label: "before res.json()",
          note: "The server formats on New York's clock. Sam gets 1:00 AM, and Rina gets it too.",
          cost: ["Rina 12 h off"],
        },
      },
      { depth: 0, text: "Each reader's browser", kind: "dir" },
      {
        depth: 1,
        slot: {
          id: "browser",
          label: "when the order renders",
          note: "Each browser knows its own zone, so one UTC string becomes 1:00 PM for Rina and 1:00 AM for Sam.",
          cost: ["right for 2 of 2"],
        },
      },
    ],
  },
  {
    name: "7:00 in Jakarta",
    prompt: <>Rina picks Jan 1, 7:00 AM for a reminder. Where does that time become UTC?</>,
    piece: "→ UTC",
    answer: "client",
    rows: [
      { depth: 0, text: "Rina's browser", kind: "dir", tag: "UTC+7" },
      { depth: 1, text: code('picked = "2026-01-01T07:00"') },
      {
        depth: 1,
        slot: {
          id: "client",
          label: "before the request",
          note: "Her browser knows she's at UTC+7, so it sends 2026-01-01T00:00:00.000Z. The server has nothing to guess.",
          cost: ["0 h off"],
        },
      },
      { depth: 0, text: "API", kind: "dir" },
      {
        depth: 1,
        slot: {
          id: "api",
          label: "when the request arrives",
          note: "The string that arrives has no zone. The server reads 07:00 as UTC, 7 hours after she meant.",
          cost: ["7 h late"],
        },
      },
      { depth: 0, text: "Database", kind: "dir" },
      {
        depth: 1,
        slot: {
          id: "db",
          label: "on insert, as Asia/Jakarta",
          note: "Right for Rina, but now everyone is assumed to live in Jakarta. Sam's reminders land 12 hours off.",
          cost: ["right for Jakarta only"],
        },
      },
    ],
  },
  {
    name: "One offset",
    prompt: (
      <>
        Rina's browser has her 7:00 AM and its <code>+07:00</code> offset. Where is the offset worth
        sending?
      </>
    ),
    piece: "+07:00",
    answer: "body",
    rows: [
      { depth: 0, text: "POST /reminders, from Rina", kind: "dir" },
      {
        depth: 1,
        lead: code('at: "2026-01-01T07:00:00'),
        slot: {
          id: "body",
          label: '…"',
          note: "With its offset the server knows the exact moment, and stores it as 00:00 UTC.",
          cost: ["0 h off"],
        },
      },
      { depth: 0, text: "Database, reminders", kind: "dir" },
      {
        depth: 1,
        lead: code("at_offset"),
        slot: {
          id: "db",
          label: "new column",
          note: "An offset you don't need, kept forever. Store the UTC moment and nothing else.",
          cost: ["+1 column", "2 zones per row"],
        },
      },
      { depth: 0, text: "GET /reminders, to Sam", kind: "dir" },
      {
        depth: 1,
        lead: code('at: "2026-01-01T07:00:00'),
        slot: {
          id: "reply",
          label: '…"',
          note: "Sam gets Rina's offset back, and every writer's zone leaks into the reply. Return UTC with a Z.",
          cost: ["1 format per writer"],
        },
      },
    ],
  },
  {
    name: "Whose Jan 10?",
    prompt: (
      <>
        Three filters for Jan 10 each need a start. Whose day starts at{" "}
        <code>2026-01-09T17:00Z</code>?
      </>
    ),
    piece: "from=2026-01-09T17:00Z",
    answer: "rina",
    rows: [
      { depth: 0, text: "UTC report, run by the server", kind: "dir", tag: "UTC" },
      {
        depth: 1,
        slot: {
          id: "utc",
          label: "from=",
          note: "The UTC day starts at 00:00Z. From 17:00 the day before, the report counts 7 hours of Jan 9.",
          cost: ["7 h of Jan 9"],
        },
      },
      { depth: 0, text: "Rina, Jakarta", kind: "dir", tag: "UTC+7" },
      {
        depth: 1,
        slot: {
          id: "rina",
          label: "from=",
          note: "Midnight in Jakarta is 17:00 UTC the day before, so her whole Jan 10 is in range.",
          cost: ["3 of 3 orders"],
        },
      },
      { depth: 0, text: "Sam, New York", kind: "dir", tag: "UTC−5" },
      {
        depth: 1,
        slot: {
          id: "sam",
          label: "from=",
          note: "Sam's Jan 10 starts at 05:00 UTC. From 17:00 the day before, he gets 12 hours of Jan 9.",
          cost: ["12 h of Jan 9"],
        },
      },
    ],
  },
];

export function HandlingTimestamps() {
  return (
    <RuleLanding
      className="handling-timestamps"
      costsStyle={styles.costs}
      lead={
        <>
          Five steps a timestamp takes, each with the wrong way and the right one side by side,
          shown to two people in two time zones. Then a mini quiz where you put each piece in the
          flow yourself.
        </>
      }
      learn={{
        title: "One moment, two clocks",
        intro: (
          <>
            Rina lives in Jakarta, at UTC+7. Sam lives in New York, at UTC−5. Each example follows
            one moment to both of them: on the left the way it tends to go wrong, on the right the
            way the rule does it.
          </>
        ),
      }}
      lessons={LESSONS}
      tldr={TLDR}
      quiz={{
        intro: (
          <>
            Four timestamps, four trips from a browser to the database and back. Drag each piece to
            the step where it belongs, or tap it and then tap a spot. A wrong spot tells you what it
            would cost.
          </>
        ),
        levels: LEVELS,
        board: "flow",
      }}
      take="store, send and show time the same way"
    />
  );
}
