import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { reducedMotion } from "../../hooks/use-media-query";
import {
  type Lesson,
  type Level,
  onceOnScreen,
  RuleLanding,
} from "./-components/rule-landing";
import "./data-loading.css";

type Step = readonly [at: number, run: () => void];

function useScript() {
  const timers = useRef<number[]>([]);
  const stop = () => {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current = [];
  };
  useEffect(() => stop, []);
  return (steps: readonly Step[]) => {
    stop();
    for (const [at, run] of steps) timers.current.push(window.setTimeout(run, at));
  };
}

function Spinner({ small = false }: { small?: boolean }) {
  return <span className={small ? "dl-spin sm" : "dl-spin"} aria-hidden="true" />;
}

function Controls({ children }: { children: ReactNode }) {
  return <div className="dl-ctl">{children}</div>;
}

const money = (value: number) => `$${value.toLocaleString("en-US")}`;

type Bar = { label: string; from: number; to: number; kind: "code" | "render" | "req" | "defer" };
type Waterfall = { bars: Bar[]; paint: number };

const AXIS = 1000;
const SWEEP = 1600;

const LATE: Waterfall = {
  bars: [
    { label: "app.js", from: 0, to: 300, kind: "code" },
    { label: "<Orders>", from: 300, to: 330, kind: "render" },
    { label: "GET /orders", from: 330, to: 820, kind: "req" },
  ],
  paint: 840,
};

const EARLY: Waterfall = {
  bars: [
    { label: "app.js", from: 0, to: 300, kind: "code" },
    { label: "GET /orders", from: 0, to: 500, kind: "req" },
    { label: "<Orders>", from: 500, to: 520, kind: "render" },
    { label: "GET /reviews", from: 0, to: 880, kind: "defer" },
  ],
  paint: 520,
};

type Sweep = { state: "still" } | { state: "armed" } | { state: "run"; n: number };

function WaterfallView({ bars, paint }: Waterfall) {
  const ref = useRef<HTMLDivElement>(null);
  const [sweep, setSweep] = useState<Sweep>({ state: "still" });

  useLayoutEffect(() => {
    const chart = ref.current;
    if (!chart || reducedMotion()) return;
    setSweep({ state: "armed" });
    return onceOnScreen(chart, () => setSweep({ state: "run", n: 1 }));
  }, []);

  const pct = (ms: number) => `${(ms / AXIS) * 100}%`;
  const run = sweep.state === "run" ? sweep.n : 0;

  return (
    <div ref={ref} className="dl-view">
      <div className="wf" data-state={sweep.state} style={{ "--sweep": `${SWEEP}ms` }}>
        <ul className="wf-labels" aria-hidden="true">
          {bars.map((bar) => (
            <li key={bar.label}>{bar.label}</li>
          ))}
        </ul>
        <div key={run} className="wf-plot">
          <ul className="wf-lanes">
            {bars.map((bar) => (
              <li key={bar.label}>
                <span
                  className={`wf-bar ${bar.kind}`}
                  style={{ left: pct(bar.from), width: pct(bar.to - bar.from) }}
                />
                <span className="sr-only">
                  {bar.label}: {bar.from} to {bar.to}ms
                  {bar.kind === "defer" ? ", deferred" : ""}
                </span>
              </li>
            ))}
          </ul>
          <span
            className="wf-paint"
            data-end={paint > AXIS * 0.6 || undefined}
            style={{ left: pct(paint), "--at": `${(paint / AXIS) * SWEEP}ms` }}
          >
            <b>
              <span className="wf-long">on screen </span>
              {paint}ms
            </b>
          </span>
          <span className="wf-cover" aria-hidden="true" />
          <span className="wf-grid" aria-hidden="true" />
        </div>
        <span className="wf-axis" aria-hidden="true">
          {[0, 250, 500, 750, 1000].map((ms) => (
            <i key={ms} style={{ left: pct(ms) }}>
              {ms}
            </i>
          ))}
        </span>
      </div>
      <Controls>
        <span className="dl-note">
          <i className="wf-key req" /> request <i className="wf-key code" /> code
          {bars.some((bar) => bar.kind === "defer") && (
            <>
              <i className="wf-key defer" /> deferred
            </>
          )}
        </span>
        <button
          type="button"
          className="btn soft sm dl-replay"
          onClick={() => setSweep({ state: "run", n: run + 1 })}
        >
          Replay
        </button>
      </Controls>
    </div>
  );
}

const REVENUE = [48210, 49875, 47930, 51402];

type Refetch = { at: number; fetching: boolean; fresh: boolean };

function RevenueCard({ swr }: { swr: boolean }) {
  const [card, setCard] = useState<Refetch>({ at: 0, fetching: false, fresh: false });
  const play = useScript();
  const value = REVENUE[card.at % REVENUE.length] ?? 0;
  const blank = card.fetching && !swr;

  function refetch() {
    setCard((now) => ({ ...now, fetching: true }));
    play([[900, () => setCard((now) => ({ at: now.at + 1, fetching: false, fresh: true }))]]);
  }

  return (
    <div className="dl-view">
      <div className="dl-card">
        <div className="dl-head">
          <span>Revenue, this week</span>
          <span className="dl-status" aria-live="polite">
            {swr && card.fetching ? (
              <>
                <Spinner small /> Updating
              </>
            ) : card.fresh ? (
              "Updated just now"
            ) : (
              "Updated 5 min ago"
            )}
          </span>
        </div>
        <div className="dl-figure">
          {blank ? (
            <Spinner />
          ) : (
            <b key={card.at} data-fresh={card.fresh || undefined}>
              {money(value)}
            </b>
          )}
          <span className="dl-sub" data-hide={blank || undefined}>
            12% over last week
          </span>
        </div>
      </div>
      <Controls>
        <span className="dl-note">Refetch takes 900ms</span>
        <button type="button" className="btn soft sm" disabled={card.fetching} onClick={refetch}>
          Refetch
        </button>
      </Controls>
    </div>
  );
}

const MAIL = [
  ["Rina", "Invoice #2041 is paid"],
  ["Deploy bot", "main is green again"],
  ["Sam", "Notes from Tuesday"],
  ["Ops", "Disk at 81% on db-2"],
  ["Maya", "Can we move standup?"],
] as const;

const SPIN_DELAY = 200;

type Inbox =
  | { phase: "rest"; top: number; said: string | null }
  | { phase: "wait"; top: number; skeleton: boolean; said: string | null };

function InboxView({ delay }: { delay: boolean }) {
  const [inbox, setInbox] = useState<Inbox>({ phase: "rest", top: 0, said: null });
  const play = useScript();
  const skeleton = inbox.phase === "wait" && inbox.skeleton;

  function load(ms: number) {
    const shownFor = delay ? Math.max(0, ms - SPIN_DELAY) : ms;
    const reply = ms < 1000 ? `${ms}ms` : `${ms / 1000}s`;
    const said =
      shownFor === 0
        ? `Reply in ${reply}. No skeleton.`
        : delay
          ? `Reply in ${reply}. Skeleton from 200ms, for ${shownFor}ms.`
          : `Reply in ${reply}. Skeleton flashed for ${shownFor}ms.`;
    setInbox((now) => ({ phase: "wait", top: now.top, skeleton: !delay, said: now.said }));
    play([
      ...(delay
        ? [
            [
              SPIN_DELAY,
              () => setInbox((now) => (now.phase === "wait" ? { ...now, skeleton: true } : now)),
            ] as const,
          ]
        : []),
      [ms, () => setInbox((now) => ({ phase: "rest", top: now.top + 1, said }))],
    ]);
  }

  const rows = [0, 1, 2].map((offset) => MAIL[(inbox.top + offset) % MAIL.length] ?? MAIL[0]);

  return (
    <div className="dl-view">
      <div className="dl-card">
        <div className="dl-head">
          <span>Inbox</span>
          <span className="dl-status">{inbox.top + 3} unread</span>
        </div>
        <ul className="dl-mail" data-skeleton={skeleton || undefined}>
          {rows.map(([from, subject], index) => (
            <li key={`${inbox.top}-${index}`}>
              <i aria-hidden="true">{from.charAt(0)}</i>
              <span>
                <b>{from}</b>
                <em>{subject}</em>
              </span>
            </li>
          ))}
        </ul>
        <p className="dl-said" aria-live="polite">
          {inbox.said ?? "Pick how fast the server replies."}
        </p>
      </div>
      <Controls>
        <span className="dl-note">Server replies in</span>
        <span className="dl-pair">
          <button
            type="button"
            className="btn soft sm"
            disabled={inbox.phase === "wait"}
            onClick={() => load(80)}
          >
            80ms
          </button>
          <button
            type="button"
            className="btn soft sm"
            disabled={inbox.phase === "wait"}
            onClick={() => load(1200)}
          >
            1.2s
          </button>
        </span>
      </Controls>
    </div>
  );
}

const TEAM = [
  ["Ana", "Design"],
  ["Budi", "Engineering"],
  ["Citra", "Product"],
] as const;

type TeamLoad = "ok" | "loading" | "failed";

function TeamView({ inline }: { inline: boolean }) {
  const [team, setTeam] = useState<TeamLoad>("ok");
  const [toast, setToast] = useState(0);
  const play = useScript();

  function fail() {
    setTeam("loading");
    play([
      [
        500,
        () => {
          setTeam("failed");
          if (!inline) setToast((n) => n + 1);
        },
      ],
    ]);
  }

  function retry() {
    setTeam("loading");
    play([[600, () => setTeam("ok")]]);
  }

  return (
    <div className="dl-view">
      <div className="dl-card dl-team">
        <div className="dl-head">
          <span>Team</span>
          <span className="dl-status">3 members</span>
        </div>
        <div className="dl-body">
          {team === "loading" ? (
            <Spinner />
          ) : team === "ok" ? (
            <ul className="dl-people">
              {TEAM.map(([name, role]) => (
                <li key={name}>
                  <i aria-hidden="true">{name.charAt(0)}</i>
                  <b>{name}</b>
                  <span>{role}</span>
                </li>
              ))}
            </ul>
          ) : inline ? (
            <div className="dl-error" role="alert">
              <b>Couldn't load the team.</b>
              <span>The server didn't answer. Your other cards are fine.</span>
              <button type="button" className="btn go sm" onClick={retry}>
                Retry
              </button>
              <code>logged · req 7f3a</code>
            </div>
          ) : (
            <p className="dl-empty">No members yet</p>
          )}
        </div>
        {toast > 0 && (
          <p key={toast} className="dl-toast" role="status">
            Something went wrong
          </p>
        )}
      </div>
      <Controls>
        <span className="dl-note">The next request fails</span>
        <button type="button" className="btn soft sm" disabled={team === "loading"} onClick={fail}>
          Fail a request
        </button>
      </Controls>
    </div>
  );
}

const RESPONSE = '{ "id": 1, "name": "Alice" }';

type Profile = { id: number; name: string; city: string };
type Outcome = { ok: true; user: Profile } | { ok: false; error: string };

const describe = (cause: unknown) =>
  cause instanceof Error ? `${cause.name}: ${cause.message}` : "Error: unknown";

function trustJson(body: string): Outcome {
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

function parseJson(body: string): Outcome {
  const user = parseProfile(JSON.parse(body));
  return { ok: true, user: { ...user, city: user.city.toUpperCase() } };
}

function ParseView({ parse }: { parse: boolean }) {
  const [fetching, setFetching] = useState(false);
  const [runs, setRuns] = useState(0);
  const play = useScript();
  const outcome = parse ? parseJson(RESPONSE) : trustJson(RESPONSE);

  function fetchUser() {
    setFetching(true);
    play([
      [
        450,
        () => {
          setFetching(false);
          setRuns((n) => n + 1);
        },
      ],
    ]);
  }

  return (
    <div className="dl-view">
      <pre className="dl-code">
        <span className="c">{"// GET /users/1 → "}</span>
        {RESPONSE}
        {"\n"}
        {parse ? (
          <>
            {"const user = "}
            <mark>User.parse</mark>
            {"(await res.json());\n"}
            <span className="c">{'// city: z.string().catch("Unknown")'}</span>
          </>
        ) : (
          <>
            {"const user = await res.json(); "}
            <span className="c">{"// any"}</span>
          </>
        )}
        {"\n"}
        {"render(user.city.toUpperCase());"}
      </pre>
      <div className="dl-card dl-result" aria-live="polite">
        {fetching ? (
          <Spinner />
        ) : outcome.ok ? (
          <div key={runs} className="dl-profile">
            <i aria-hidden="true">{outcome.user.name.charAt(0)}</i>
            <b>{outcome.user.name}</b>
            <span className="dl-city">{outcome.user.city}</span>
          </div>
        ) : (
          <div key={runs} className="dl-crash" role="alert">
            <b>Uncaught {outcome.error.split(":")[0]}</b>
            <code>{outcome.error}</code>
          </div>
        )}
      </div>
      <Controls>
        <span className="dl-note">The API left out city</span>
        <button type="button" className="btn soft sm" disabled={fetching} onClick={fetchUser}>
          Fetch /users/1
        </button>
      </Controls>
    </div>
  );
}

const SPENT = { label: "Laptop", amount: -1830 };
const HISTORY = [
  { label: "Salary", amount: 2400 },
  { label: "Groceries", amount: -62 },
  { label: "Coffee", amount: -4 },
];

type Signal = "offline" | "connecting" | "online";

function WalletView({ careful }: { careful: boolean }) {
  const [signal, setSignal] = useState<Signal>("offline");
  const play = useScript();
  const online = signal === "online";
  const rows = online ? [SPENT, ...HISTORY].slice(0, 3) : HISTORY;

  function connect() {
    setSignal("connecting");
    play([[700, () => setSignal("online")]]);
  }

  return (
    <div className="dl-view">
      <div className="dl-card">
        <div className="dl-head">
          <span>Wallet</span>
          <span className="dl-status" data-signal={signal}>
            {signal === "connecting" ? (
              <>
                <Spinner small /> Connecting
              </>
            ) : online ? (
              "Online"
            ) : (
              "No signal, day 3"
            )}
          </span>
        </div>
        <div className="dl-balance">
          <span>Balance</span>
          {online ? (
            <b key="live" data-jump={!careful || undefined}>
              {money(310)}
            </b>
          ) : careful ? (
            <b className="dl-wait">Needs a connection</b>
          ) : (
            <b>{money(2140)}</b>
          )}
        </div>
        <div className="dl-hist">
          <div className="dl-hist-head">
            <span>Recent</span>
            {careful && (
              <span className="dl-stamp">{online ? "Updated just now" : "Updated 2 days ago"}</span>
            )}
          </div>
          <ul>
            {rows.map((row) => (
              <li key={row.label} data-new={(online && row === SPENT) || undefined}>
                <span>{row.label}</span>
                <b>
                  {row.amount < 0 ? "−" : "+"}
                  {money(Math.abs(row.amount))}
                </b>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Controls>
        <span className="dl-note">Opened from cache</span>
        <button
          type="button"
          className="btn soft sm"
          disabled={signal === "connecting"}
          onClick={online ? () => setSignal("offline") : connect}
        >
          {online ? "Reopen offline" : "Get signal"}
        </button>
      </Controls>
    </div>
  );
}

const LESSONS: Lesson[] = [
  {
    title: "Start fetching early",
    body: (
      <>
        Fetch in the route loader, not in a component. A fetch in <code>useEffect</code> waits for
        the page's code to load and render first. A loader starts it with the navigation, so the two
        run side by side. Await what the page needs and stream the rest.
      </>
    ),
    bad: {
      label: "In useEffect",
      costs: ["data at 840ms", "1 waterfall"],
      view: <WaterfallView {...LATE} />,
    },
    good: {
      label: "In the loader",
      costs: ["data at 520ms", "0 waterfalls"],
      view: <WaterfallView {...EARLY} />,
    },
  },
  {
    title: "Keep stale data on screen",
    body: (
      <>
        When you refetch data you already have, leave it where it is. Show a small spinner while the
        request runs, then swap the new value in place. Press Refetch on both.
      </>
    ),
    bad: {
      label: "Blank",
      costs: ["blank 900ms"],
      view: <RevenueCard swr={false} />,
    },
    good: {
      label: "Stale, then fresh",
      costs: ["0ms blank", "1 quiet update"],
      view: <RevenueCard swr />,
    },
  },
  {
    title: "Wait before the skeleton",
    body: (
      <>
        Most replies are quick. Show loading UI only once a request has run past 200ms, so a fast
        reply swaps straight in instead of flashing a skeleton for a few frames.
      </>
    ),
    bad: {
      label: "At once",
      costs: ["flashes 80ms"],
      view: <InboxView delay={false} />,
    },
    good: {
      label: "After 200ms",
      costs: ["0 flashes"],
      view: <InboxView delay />,
    },
  },
  {
    title: "Errors where the data was",
    body: (
      <>
        Put the error in the spot the data would have filled, and give it a Retry button. A toast
        fades before anyone reads it and leaves an empty card behind. Log every failure so you hear
        about it before your users tell you.
      </>
    ),
    bad: {
      label: "A toast",
      costs: ["0 retries", "gone in 3s"],
      view: <TeamView inline={false} />,
    },
    good: {
      label: "Inline, with Retry",
      costs: ["1 tap to recover", "logged"],
      view: <TeamView inline />,
    },
  },
  {
    title: "Parse at the boundary",
    body: (
      <>
        Data from an API is a guess until you check it. Parse it right after <code>fetch()</code>,
        give optional fields a fallback, and the rest of your code gets real types. Skip it and a
        missing field crashes far from where it came in.
      </>
    ),
    extra: (
      <p className="tip">
        When a required field fails, show a plain message and log the details. Update the schema
        when the API changes; it documents the API too.
      </p>
    ),
    bad: {
      label: "Trust it",
      costs: ["1 crash", "blank card"],
      view: <ParseView parse={false} />,
    },
    good: {
      label: "Parse it",
      costs: ["0 crashes", "1 fallback"],
      view: <ParseView parse />,
    },
  },
  {
    title: "Persist what can't mislead",
    body: (
      <>
        A cache saved to disk is old the next time it opens. Persist history, settings and static
        content, and show when it was updated. Never persist balances, prices or stock counts: a
        stale number there leads to a wrong decision.
      </>
    ),
    extra: (
      <p className="dl-stores">
        <code>localStorage · ~5MB, sync</code>
        <code>IndexedDB · large, async</code>
        <code>PGlite · SQL + sync</code>
      </p>
    ),
    bad: {
      label: "Persist all",
      costs: ["$1,830 off", "no date"],
      view: <WalletView careful={false} />,
    },
    good: {
      label: "History only",
      costs: ["balance always live", "history dated"],
      view: <WalletView careful />,
    },
  },
];

const TLDR = [
  ["SEO or first paint matters", "Render it on the server. Behind a login, an SPA is fine"],
  ["Data a route needs", "Start it in the loader, batch it, stream the rest"],
  ["Refetching data you have", "Keep it on screen, spin small"],
  ["A reply that may be quick", "Loading UI only after 200ms"],
  ["A request that fails", "The error in its place, with Retry. Log it"],
  ["Updates within a second", "A WebSocket. Every 30s or slower: polling"],
  ["Anything from an API", "Parse it where it arrives"],
] as const;

const at = (ms: string, text: string) => (
  <>
    <time>{ms}</time>
    {text}
  </>
);

const LEVELS: Level[] = [
  {
    name: "A quick reply",
    prompt: (
      <>
        Most replies to this list land in 80ms. A few take 2s. When does the{" "}
        <code>&lt;Spinner /&gt;</code> appear?
      </>
    ),
    piece: "<Spinner />",
    answer: "delay",
    rows: [
      { depth: 0, text: at("0ms", "You press Refresh") },
      {
        depth: 1,
        slot: {
          id: "now",
          label: "show it at once",
          note: "Most replies land at 80ms, so the spinner blinks on and off on almost every click.",
          cost: ["flashes 80ms", "most clicks"],
        },
      },
      { depth: 0, text: at("80ms", "Most replies land") },
      {
        depth: 1,
        slot: {
          id: "delay",
          label: "show it at 200ms, if still waiting",
          note: "Quick replies never show it. Slow ones get it at 200ms, when the wait is real.",
          cost: ["0 flashes"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "late",
          label: "show it at 1s, if still waiting",
          note: "A slow reply sits for a full second with no sign the click did anything.",
          cost: ["1s of nothing"],
        },
      },
      { depth: 0, text: at("2000ms", "A slow reply lands") },
    ],
  },
  {
    name: "Back to the tab",
    prompt: (
      <>
        You switch back to a tab of prices loaded 5 minutes ago. They refetch on focus. What do the
        cached prices do while it runs?
      </>
    ),
    piece: "cached prices",
    answer: "stay",
    rows: [
      { depth: 0, text: at("0ms", "The tab gets focus, refetch starts") },
      {
        depth: 1,
        slot: {
          id: "blank",
          label: "make way for a full spinner",
          note: "Prices you could have read vanish for 600ms, then come back a little different.",
          cost: ["blank 600ms"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "stay",
          label: "stay, with a small spinner beside them",
          note: "You read them at once, and the fresh numbers swap in place when they land.",
          cost: ["0ms blank", "1 quiet update"],
        },
      },
      { depth: 0, text: at("600ms", "Fresh prices arrive") },
      {
        depth: 1,
        slot: {
          id: "keep",
          label: "stay until the next page load",
          note: "The fresh prices arrive and nobody sees them. The cache never revalidates.",
          cost: ["stale until reload"],
        },
      },
    ],
  },
  {
    name: "Twenty orders",
    prompt: (
      <>
        The orders page lists 20 orders, one <code>&lt;OrderRow&gt;</code> each. Where does the
        fetch start?
      </>
    ),
    piece: "fetch(orders)",
    answer: "loader",
    rows: [
      { depth: 0, text: at("0ms", "You click Orders") },
      {
        depth: 1,
        slot: {
          id: "loader",
          label: "in the route loader",
          note: "It starts with the navigation and runs while the page's code loads. One request for the list.",
          cost: ["data at 500ms", "1 request"],
        },
      },
      { depth: 0, text: at("300ms", "Code loaded, <Orders> renders") },
      {
        depth: 1,
        slot: {
          id: "effect",
          label: "in useEffect in <Orders>",
          note: "It waits for the code and the first render, so the data shows 300ms later than it could.",
          cost: ["+300ms", "1 waterfall"],
        },
      },
      { depth: 0, text: at("320ms", "Each <OrderRow> renders") },
      {
        depth: 1,
        slot: {
          id: "rows",
          label: "in useEffect in each <OrderRow>",
          note: "Twenty requests where one would do, each after its row has rendered.",
          cost: ["20 requests", "+320ms"],
        },
      },
    ],
  },
  {
    name: "One card fails",
    prompt: (
      <>
        A dashboard loads five cards. <code>GET /revenue</code> fails with a 500. What does the user
        see?
      </>
    ),
    piece: "error + Retry",
    answer: "inline",
    rows: [
      { depth: 0, text: at("0ms", "The dashboard opens") },
      { depth: 0, text: at("400ms", "Four cards load") },
      { depth: 0, text: at("420ms", "GET /revenue → 500") },
      {
        depth: 1,
        slot: {
          id: "page",
          label: "an error page instead of the dashboard",
          note: "Four good cards are thrown away for one bad one, and nothing retries in place.",
          cost: ["4 cards lost"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "inline",
          label: "inside the revenue card",
          note: "It sits where the chart would be, the other four stay, and one tap retries. Log it as well.",
          cost: ["1 tap to recover", "4 cards kept"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "toast",
          label: "a toast: Something went wrong",
          note: "It fades in 4s, doesn't say which card, and the revenue card stays empty.",
          cost: ["gone in 4s", "0 retries"],
        },
      },
    ],
  },
  {
    name: "Offline on day 3",
    prompt: (
      <>
        A banking app persists its cache. On day 3 you open it with no signal. What may it show from
        the cache?
      </>
    ),
    piece: "from cache",
    answer: "history",
    rows: [
      { depth: 0, text: at("Day 1", "The app loads and saves its cache") },
      { depth: 0, text: at("Day 2", "You spend $1,830 on your laptop") },
      { depth: 0, text: at("Day 3", "You open the app, no signal") },
      {
        depth: 1,
        slot: {
          id: "balance",
          label: "Balance: $2,140",
          note: "It's $310 now. You'd plan with $1,830 you no longer have.",
          cost: ["$1,830 off"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "history",
          label: "Last week's payments, updated 2 days ago",
          note: "Past payments don't change, and the date says how old the list is.",
          cost: ["safe to persist", "dated"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "rate",
          label: "1 USD = 16,240 IDR",
          note: "Rates move by the minute. A two-day-old rate prices every transfer wrong.",
          cost: ["2 days stale"],
        },
      },
    ],
  },
];

export function DataLoading() {
  return (
    <RuleLanding
      className="data-loading"
      lead={
        <>
          Six loading moments, each running the wrong way and the right way side by side. Then a
          mini quiz where you place each one on a request timeline.
        </>
      }
      learn={{
        title: "Fast first paint, smooth updates",
        intro: (
          <>
            People judge loading by what they see while they wait. Each example runs the same
            request twice: on the left the way it often gets built, on the right the way the rule
            builds it. Press the buttons on both.
          </>
        ),
      }}
      lessons={LESSONS}
      tldr={TLDR}
      quiz={{
        intro: (
          <>
            Five requests, five timelines. Drag each piece to where it belongs, or tap it and then
            tap a spot. A wrong spot tells you what it would cost.
          </>
        ),
        levels: LEVELS,
        board: "timeline",
      }}
      take="load data the same way"
    />
  );
}
