import {
  ArrowClockwiseIcon,
  CaretLeftIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
  PauseIcon,
  PencilSimpleIcon,
  PlayIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { reducedMotion } from "../../hooks/use-media-query";
import { type Lesson, type Level, RuleLanding } from "./-components/rule-landing";
import "./table-design.css";

type Store<T> = {
  get: () => T;
  update: (next: (now: T) => T) => void;
  subscribe: (listener: () => void) => () => void;
};

function store<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    update(next) {
      value = next(value);
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const useStore = <T,>(source: Store<T>) =>
  useSyncExternalStore(source.subscribe, source.get, source.get);

type Demos = { ticker: Store<Ticker>; roster: Store<Roster>; filter: Store<Filter> };

const DemosContext = createContext<Demos | null>(null);

function useDemos() {
  const demos = useContext(DemosContext);
  if (!demos) throw new Error("Table demos render inside <TableDesign>.");
  return demos;
}

type Person = { name: string; role: "Admin" | "Editor" | "Viewer" };

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th scope="col" className={className}>
      {children}
    </th>
  );
}

type Ticker = { values: number[]; step: number; hot: number | null };

const ACCOUNTS = ["Acme", "Globex", "Initech", "Umbrella", "Hooli"];
const MRR = [12500, 8750.5, 340, 95200, 1111.11];
const TICKS: readonly (readonly [row: number, value: number])[] = [
  [1, 8811.25],
  [3, 95320],
  [0, 12480.5],
  [1, 8790],
  [4, 1204.75],
  [2, 362.4],
  [0, 12500],
  [3, 95200],
  [1, 8750.5],
  [4, 1111.11],
  [2, 340],
];
const TICK_MS = 1600;

const money = (value: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const tick = (now: Ticker): Ticker => {
  const [row, value] = TICKS[now.step % TICKS.length] ?? [0, 0];
  return {
    values: now.values.map((old, at) => (at === row ? value : old)),
    step: now.step + 1,
    hot: row,
  };
};

function Reels({ text }: { text: string }) {
  const chars = [...text];
  return (
    <span className="td-reels" aria-hidden="true">
      {chars.map((char, at) => {
        const key = chars.length - at;
        if (!/\d/.test(char)) return <span key={key}>{char}</span>;
        return (
          <span key={key} className="td-reel">
            <span className="td-strip" style={{ "--n": Number(char) }}>
              {DIGITS.map((digit) => (
                <span key={digit}>{digit}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function NumbersDemo({ careful }: { careful: boolean }) {
  const { ticker } = useDemos();
  const { values, step, hot } = useStore(ticker);
  return (
    <div className="td-card">
      <table className={careful ? "td-table td-money" : "td-table td-money td-ragged"}>
        <caption className="sr-only">Monthly revenue by account</caption>
        <colgroup>
          <col />
          <col className="td-col-money" />
        </colgroup>
        <thead>
          <tr>
            <Th>Account</Th>
            <Th className={careful ? "td-num" : undefined}>MRR ($)</Th>
          </tr>
        </thead>
        <tbody>
          {ACCOUNTS.map((account, row) => {
            const value = values[row] ?? 0;
            return (
              <tr key={account}>
                <td>{account}</td>
                <td className={careful ? "td-num" : undefined}>
                  {hot === row && <i key={step} className="td-flash" aria-hidden="true" />}
                  {careful ? (
                    <>
                      <span className="sr-only">{money(value)}</span>
                      <Reels text={money(value)} />
                    </>
                  ) : (
                    String(value)
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LiveSwitch() {
  const { ticker } = useDemos();
  const ref = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(true);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (reducedMotion()) setPlaying(false);
    const lesson = ref.current?.closest(".lesson");
    if (!lesson) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSeen(entry?.isIntersecting ?? false),
      {
        threshold: 0.4,
      },
    );
    observer.observe(lesson);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !seen) return;
    const id = setInterval(() => ticker.update(tick), TICK_MS);
    return () => clearInterval(id);
  }, [playing, seen, ticker]);

  return (
    <button
      ref={ref}
      type="button"
      className="td-live"
      aria-pressed={!playing}
      onClick={() => setPlaying((value) => !value)}
    >
      <span className="td-dot" data-on={playing || undefined} aria-hidden="true" />
      {playing ? "Live" : "Paused"}
      {playing ? (
        <PauseIcon weight="bold" aria-hidden="true" />
      ) : (
        <PlayIcon weight="bold" aria-hidden="true" />
      )}
      <span className="sr-only">{playing ? ", pause updates" : ", play updates"}</span>
    </button>
  );
}

type Roster = {
  phase: "loading" | "error" | "ready";
  settles: boolean;
  users: readonly Person[];
  query: string;
};
type RosterView = "loading" | "empty" | "error" | "none" | "data";

const TEAM: readonly Person[] = [
  { name: "Alice Johnson", role: "Admin" },
  { name: "Bob Smith", role: "Editor" },
  { name: "Carol Williams", role: "Viewer" },
  { name: "David Brown", role: "Editor" },
];
const READY: Roster = { phase: "ready", settles: false, users: TEAM, query: "" };
const PRESETS: Record<RosterView, Roster> = {
  loading: { ...READY, phase: "loading" },
  empty: { ...READY, users: [] },
  error: { ...READY, phase: "error" },
  none: { ...READY, query: "zed" },
  data: READY,
};
const VIEW_NAMES: readonly (readonly [RosterView, string])[] = [
  ["loading", "Loading"],
  ["empty", "Empty"],
  ["error", "Error"],
  ["none", "No results"],
  ["data", "Data"],
];

const matches = (roster: Roster) =>
  roster.users.filter((user) =>
    user.name.toLowerCase().includes(roster.query.trim().toLowerCase()),
  );

function viewOf(roster: Roster): RosterView {
  if (roster.phase !== "ready") return roster.phase;
  if (roster.users.length === 0) return "empty";
  return matches(roster).length === 0 ? "none" : "data";
}

function StateSwitch() {
  const { roster } = useDemos();
  const now = useStore(roster);
  const view = viewOf(now);

  useEffect(() => {
    if (now.phase !== "loading" || !now.settles) return;
    const id = setTimeout(() => roster.update(() => READY), 1100);
    return () => clearTimeout(id);
  }, [now, roster]);

  return (
    <Segments
      label="Table state"
      options={VIEW_NAMES}
      value={view}
      onPick={(next) => roster.update(() => PRESETS[next])}
    />
  );
}

function Segments<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: readonly (readonly [T, string])[];
  value: T;
  onPick: (next: T) => void;
}) {
  return (
    <div className="td-seg" role="group" aria-label={label}>
      {options.map(([key, name]) => (
        <button key={key} type="button" aria-pressed={value === key} onClick={() => onPick(key)}>
          {name}
        </button>
      ))}
    </div>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <label className="td-search">
      <MagnifyingGlassIcon weight="bold" aria-hidden="true" />
      <input
        type="search"
        value={value}
        placeholder="Search users"
        aria-label="Search users"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function StatesDemo({ careful }: { careful: boolean }) {
  const { roster } = useDemos();
  const now = useStore(roster);
  const view = viewOf(now);
  const set = (next: Partial<Roster>) => roster.update((old) => ({ ...old, ...next }));

  let body: ReactNode;
  if (view === "data") {
    body = matches(now).map((user) => (
      <tr key={user.name}>
        <td>{user.name}</td>
        <td className="td-dim">{user.role}</td>
      </tr>
    ));
  } else if (!careful) {
    body = (
      <tr>
        <td colSpan={2} className="td-blank">
          {view === "loading" ? (
            <span className="td-spin" role="img" aria-label="Loading" />
          ) : (
            "No data"
          )}
        </td>
      </tr>
    );
  } else if (view === "loading") {
    body = TEAM.map((user) => (
      <tr key={user.name} className="td-bones" aria-hidden="true">
        <td>
          <span className="td-bone" style={{ "--w": `${user.name.length * 6}px` }} />
        </td>
        <td>
          <span className="td-bone" style={{ "--w": "44px" }} />
        </td>
      </tr>
    ));
  } else {
    const say = {
      empty: {
        title: "No users yet",
        hint: "Invite your first teammate.",
        act: "Add user",
        run: () => set({ users: [{ name: "Dana Whitfield", role: "Admin" }], query: "" }),
      },
      error: {
        title: "Couldn't load users",
        hint: "The server didn't answer.",
        act: "Retry",
        run: () => set({ phase: "loading", settles: true }),
      },
      none: {
        title: `No results for "${now.query.trim()}"`,
        hint: "Check the spelling, or clear the search.",
        act: "Clear search",
        run: () => set({ query: "" }),
      },
    }[view];
    body = (
      <tr>
        <td colSpan={2} className="td-blank">
          <div className="td-said" data-tone={view}>
            <b>{say.title}</b>
            <span>{say.hint}</span>
            <button
              type="button"
              className={view === "none" ? "td-btn" : "td-btn go"}
              onClick={say.run}
            >
              {view === "error" && <ArrowClockwiseIcon weight="bold" aria-hidden="true" />}
              {say.act}
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="td-card">
      <div className="td-bar">
        <SearchBox value={now.query} onChange={(query) => set({ query })} />
      </div>
      <table
        className={careful ? "td-table td-held" : "td-table"}
        aria-busy={view === "loading" || undefined}
      >
        <caption className="sr-only">Team members</caption>
        <colgroup>
          <col />
          <col className="td-col-role" />
        </colgroup>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Role</Th>
          </tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
}

const CREW: readonly Person[] = [
  { name: "Ana Li", role: "Admin" },
  { name: "Bob Smith", role: "Editor" },
  { name: "Carol Williams", role: "Viewer" },
  { name: "Ed Ng", role: "Editor" },
];

function ActionsDemo({ careful }: { careful: boolean }) {
  const [rows, setRows] = useState(CREW);
  const [editing, setEditing] = useState<string | null>(null);
  const remove = (name: string) => setRows((now) => now.filter((row) => row.name !== name));
  const edit = (name: string) => setEditing((now) => (now === name ? null : name));

  return (
    <div className="td-card">
      <table className={careful ? "td-table td-acts" : "td-table td-acts td-hover-acts"}>
        <caption className="sr-only">Team members with actions</caption>
        <colgroup>
          <col />
          <col className="td-col-role" />
          {careful && <col className="td-col-acts" />}
        </colgroup>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Role</Th>
            {careful && (
              <Th className="td-num">
                <span className="sr-only">Actions</span>
              </Th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ name, role }) => (
            <tr key={name} data-editing={editing === name || undefined}>
              <td>
                {name}
                {!careful && (
                  <span className="td-inline">
                    <button
                      type="button"
                      aria-label={`Edit ${name}`}
                      aria-pressed={editing === name}
                      onClick={() => edit(name)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${name}`}
                      onClick={() => remove(name)}
                    >
                      Delete
                    </button>
                  </span>
                )}
              </td>
              <td className="td-dim">{role}</td>
              {careful && (
                <td className="td-num">
                  <span className="td-icons">
                    <IconButton
                      tip="Edit"
                      label={`Edit ${name}`}
                      pressed={editing === name}
                      onClick={() => edit(name)}
                    >
                      <PencilSimpleIcon weight="bold" />
                    </IconButton>
                    <IconButton
                      tip="Delete"
                      label={`Delete ${name}`}
                      danger
                      onClick={() => remove(name)}
                    >
                      <TrashIcon weight="bold" />
                    </IconButton>
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="td-foot">
        <span>
          {rows.length} of {CREW.length} users
        </span>
        {rows.length < CREW.length && (
          <button type="button" className="td-link" onClick={() => setRows(CREW)}>
            Restore
          </button>
        )}
      </div>
    </div>
  );
}

function IconButton({
  tip,
  label,
  danger = false,
  pressed,
  onClick,
  children,
}: {
  tip: string;
  label: string;
  danger?: boolean;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <span className="td-tipped">
      <button
        type="button"
        className={danger ? "td-icon no" : "td-icon"}
        aria-label={label}
        aria-pressed={pressed}
        onClick={onClick}
      >
        {children}
      </button>
      <span className="td-tip" aria-hidden="true">
        {tip}
      </span>
    </span>
  );
}

type Filter = "all" | "admin" | "owner";

const STAFF: readonly Person[] = [
  { name: "Alice Johnson", role: "Admin" },
  { name: "Bob Smith", role: "Editor" },
  { name: "Carol Williams", role: "Viewer" },
  { name: "David Brown", role: "Admin" },
  { name: "Erin Clark", role: "Editor" },
  { name: "Frank Moore", role: "Viewer" },
  { name: "Grace Hall", role: "Admin" },
  { name: "Hiro Tanaka", role: "Editor" },
  { name: "Ivy Chen", role: "Viewer" },
];
const PER_PAGE = 4;

const FILTERED: Record<Filter, readonly Person[]> = {
  all: STAFF,
  admin: STAFF.filter((person) => person.role === "Admin"),
  owner: [],
};
const FILTERS: readonly (readonly [Filter, string])[] = [
  ["all", `All ${FILTERED.all.length}`],
  ["admin", `Admins ${FILTERED.admin.length}`],
  ["owner", `Owners ${FILTERED.owner.length}`],
];

function FilterSwitch() {
  const { filter } = useDemos();
  const value = useStore(filter);
  return (
    <Segments
      label="Filter by role"
      options={FILTERS}
      value={value}
      onPick={(next) => filter.update(() => next)}
    />
  );
}

function PagerDemo({ careful }: { careful: boolean }) {
  const { filter } = useDemos();
  const value = useStore(filter);
  return <PagedTable key={value} people={FILTERED[value]} careful={careful} />;
}

function PagedTable({ people, careful }: { people: readonly Person[]; careful: boolean }) {
  const [page, setPage] = useState(1);
  const pages = Math.ceil(people.length / PER_PAGE);
  const shown = people.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  return (
    <div className="td-card">
      <table className="td-table">
        <caption className="sr-only">Users, page {page}</caption>
        <colgroup>
          <col />
          <col className="td-col-role" />
        </colgroup>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Role</Th>
          </tr>
        </thead>
        <tbody>
          {shown.length === 0 ? (
            <tr>
              <td colSpan={2} className="td-blank">
                <div className="td-said">
                  <b>No owners</b>
                  <span>Nobody has the Owner role yet.</span>
                </div>
              </td>
            </tr>
          ) : (
            shown.map((person) => (
              <tr key={person.name}>
                <td>{person.name}</td>
                <td className="td-dim">{person.role}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {(!careful || pages > 1) && <Pager page={page} pages={pages} onPage={setPage} />}
    </div>
  );
}

function Pager({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (next: number) => void;
}) {
  return (
    <nav className="td-pager" aria-label="Pages">
      <span>
        Page {page} of {pages}
      </span>
      <span className="td-pages">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <CaretLeftIcon weight="bold" aria-hidden="true" />
        </button>
        {Array.from({ length: pages }, (_, at) => at + 1).map((n) => (
          <button
            key={n}
            type="button"
            aria-current={n === page ? "page" : undefined}
            onClick={() => onPage(n)}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          <CaretRightIcon weight="bold" aria-hidden="true" />
        </button>
      </span>
    </nav>
  );
}

const URL_PER_PAGE = 3;
const URL_PAGES = Math.ceil(STAFF.length / URL_PER_PAGE);

type Browse = { page: number; reloading: boolean; reloads: number };

function UrlDemo({ careful }: { careful: boolean }) {
  const [now, setNow] = useState<Browse>({ page: 2, reloading: false, reloads: 0 });
  const query = careful && now.page > 1 ? `?page=${now.page}` : "";

  useEffect(() => {
    if (!now.reloading) return;
    const id = setTimeout(
      () =>
        setNow((old) => ({
          page: careful ? old.page : 1,
          reloading: false,
          reloads: old.reloads + 1,
        })),
      420,
    );
    return () => clearTimeout(id);
  }, [now.reloading, careful]);

  const shown = STAFF.slice((now.page - 1) * URL_PER_PAGE, now.page * URL_PER_PAGE);
  return (
    <div className="td-card">
      <div className="td-bar td-browser">
        <button
          type="button"
          className="td-icon"
          aria-label="Reload"
          disabled={now.reloading}
          onClick={() => setNow((old) => ({ ...old, reloading: true }))}
        >
          <ArrowClockwiseIcon weight="bold" aria-hidden="true" />
        </button>
        <span className="td-address">
          <span className="td-host">acme.app</span>/users
          {query && <b>{query}</b>}
        </span>
      </div>
      <table className="td-table" data-reloading={now.reloading || undefined}>
        <caption className="sr-only">Users, page {now.page}</caption>
        <colgroup>
          <col />
          <col className="td-col-role" />
        </colgroup>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Role</Th>
          </tr>
        </thead>
        <tbody>
          {shown.map((person) => (
            <tr key={person.name}>
              <td>{person.name}</td>
              <td className="td-dim">{person.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager
        page={now.page}
        pages={URL_PAGES}
        onPage={(page) => setNow((old) => ({ ...old, page }))}
      />
      <p className="td-note" aria-live="polite">
        {now.reloads === 0
          ? "Pick a page, then reload."
          : careful
            ? `Reloaded. Still on page ${now.page}.`
            : "Reloaded. Back on page 1."}
      </p>
    </div>
  );
}

const LESSONS: Lesson[] = [
  {
    title: "Line numbers up on the right",
    body: (
      <>
        People compare numbers by their last digits. Right-align the column, set{" "}
        <code>tabular-nums</code> so every digit is the same width, and format with{" "}
        <code>toLocaleString()</code>. The figures below are live. Watch the right edge.
      </>
    ),
    extra: <LiveSwitch />,
    bad: {
      label: "Left, as typed",
      costs: ["edges 25px apart", "12500, no commas"],
      view: <NumbersDemo careful={false} />,
    },
    good: {
      label: "Right, tabular",
      costs: ["1 edge", "tabular-nums", "12,500.00"],
      view: <NumbersDemo careful />,
    },
  },
  {
    title: "Give every state a next step",
    body: (
      <>
        A table spends real time loading, empty, broken or searched down to nothing. Draw each one.
        Skeleton rows keep the shape while it loads, and every blank says why and what to do next.
        Pick a state, search, then press the buttons.
      </>
    ),
    extra: <StateSwitch />,
    bad: {
      label: "Left blank",
      costs: ["3 states, 1 message", "0 next steps"],
      view: <StatesDemo careful={false} />,
    },
    good: {
      label: "Says what's next",
      costs: ["1 next step each", "height holds"],
      view: <StatesDemo careful />,
    },
  },
  {
    title: "Put actions in a fixed last column",
    body: (
      <>
        Row actions go in the last column, right-aligned, at a fixed width, so Edit sits in the same
        place on every row. Icon buttons save the room, and a tooltip names each one. Hover the
        rows, then delete one.
      </>
    ),
    bad: {
      label: "Hover only",
      costs: ["hidden until hover", "Edit at 3 x-positions"],
      view: <ActionsDemo careful={false} />,
    },
    good: {
      label: "Last column",
      costs: ["always there", "1 column, 76px", "2 tooltips"],
      view: <ActionsDemo careful />,
    },
  },
  {
    title: "No pager for one page",
    body: (
      <>
        A pager earns its place when there's a second page. With one page it's a row of dead arrows,
        and under an empty table it counts pages of nothing. Filter the list and watch both.
      </>
    ),
    extra: <FilterSwitch />,
    bad: {
      label: "Always there",
      costs: ["Page 1 of 1", "2 dead arrows"],
      view: <PagerDemo careful={false} />,
    },
    good: {
      label: "Past page 1",
      costs: ["0 dead controls"],
      view: <PagerDemo careful />,
    },
  },
  {
    title: "Keep the page in the URL",
    body: (
      <>
        Store the page in the address as <code>?page=2</code>. Then a reload, the Back button and a
        link you send all land where you were. Each table below starts on page 2. Reload both.
      </>
    ),
    bad: {
      label: "In state",
      costs: ["reload → page 1", "link says /users"],
      view: <UrlDemo careful={false} />,
    },
    good: {
      label: "In the URL",
      costs: ["?page=2", "reload keeps it"],
      view: <UrlDemo careful />,
    },
  },
];

const CHEAT_SHEET = [
  ["A column of numbers", "Right-aligned, tabular-nums, toLocaleString()"],
  ["Money in a finance view", "A monospace face lines up even better"],
  ["Rows on their way", "Skeleton rows at the real row height"],
  ["Empty, failed or no match", "Say which, with one way forward: Add, Retry, Clear search"],
  ["Row actions", "Icon buttons with tooltips in a fixed last column"],
  ["One page, or none", "No pager"],
  ["The current page", "In the URL, as ?page=2"],
] as const;

const LEVELS: Level[] = [
  {
    name: "Where the actions go",
    prompt: (
      <>
        Each user row gets <b>Edit</b> and <b>Delete</b>. Names run from 6 to 22 characters. Where
        do the buttons go?
      </>
    ),
    piece: "Edit · Delete",
    answer: "last",
    rows: [
      { depth: 0, text: "<tr>", kind: "comp" },
      {
        depth: 1,
        slot: {
          id: "first",
          label: "+ <td> first",
          note: "The row now opens with buttons, and every name starts one column later than you read it.",
          cost: ["names pushed right"],
        },
      },
      { depth: 1, text: "<td> Alice Johnson" },
      {
        depth: 1,
        slot: {
          id: "name",
          label: "+ inside the name cell, after the text",
          note: "Each name is a different length, so Edit lands somewhere new on every row.",
          cost: ["a new x per row"],
        },
      },
      { depth: 1, text: "<td> alice@acme.com" },
      { depth: 1, text: "<td> Admin" },
      {
        depth: 1,
        slot: {
          id: "last",
          label: "+ <td> last, w-24, text-right",
          note: "One right-aligned column at a fixed width. Edit sits in the same place on every row.",
          cost: ["1 x-position", "96px"],
        },
      },
    ],
  },
  {
    name: "Format at the edge",
    prompt: (
      <>
        The table sorts by MRR and shows <code>12,500.00</code>. Where should{" "}
        <code>toLocaleString()</code> run?
      </>
    ),
    piece: "toLocaleString()",
    answer: "cell",
    rows: [
      { depth: 0, text: "<RevenueTable>", kind: "comp" },
      { depth: 1, text: "const rows = await getRevenue()" },
      {
        depth: 2,
        slot: {
          id: "api",
          label: "+ in getRevenue(), on the server",
          note: 'Every MRR arrives as a string like "12,500.00", so b.mrr - a.mrr is NaN and the sort stops working.',
          cost: ["NaN sort", "strings in state"],
        },
      },
      { depth: 1, text: "rows.sort(byMrr)" },
      {
        depth: 2,
        slot: {
          id: "sort",
          label: "+ in the sort, as the key",
          note: 'Sorted as text, "9,000.00" ranks above "12,500.00", because 9 beats 1.',
          cost: ["9,000 > 12,500"],
        },
      },
      { depth: 1, text: '<td className="text-right tabular-nums">' },
      {
        depth: 2,
        slot: {
          id: "cell",
          label: "+ {row.mrr…}",
          note: "Sort the raw numbers and format only when you draw the cell.",
          cost: ["sorts as numbers", "reads 12,500.00"],
        },
      },
    ],
  },
  {
    name: "Nothing to show",
    prompt: (
      <>
        The users table has three ways to come up empty. Which one gets the <b>Add user</b> button?
      </>
    ),
    piece: "Add user",
    answer: "empty",
    rows: [
      { depth: 0, text: "<UsersTable>", kind: "comp" },
      { depth: 1, text: '"Couldn\'t load users"', tag: "error" },
      {
        depth: 2,
        slot: {
          id: "error",
          label: "+ its button",
          note: "The list failed to load. It isn't empty. Add user hides the failure, and Retry is what helps.",
          cost: ["hides the error", "0 retries"],
        },
      },
      { depth: 1, text: '"No users yet"', tag: "empty" },
      {
        depth: 2,
        slot: {
          id: "empty",
          label: "+ its button",
          note: "Nothing here yet, so the next step is adding the first one.",
          cost: ["1 next step"],
        },
      },
      { depth: 1, text: '"No results for "zed""', tag: "search" },
      {
        depth: 2,
        slot: {
          id: "search",
          label: "+ its button",
          note: "They already have users. The search hid them, so Clear search is the way back.",
          cost: ["wrong way out", "duplicate users"],
        },
      },
    ],
  },
  {
    name: "One page or two",
    prompt: (
      <>
        The table shows 25 rows per page. Three filters return 25, 31 and 0 users. Which one gets
        the pager?
      </>
    ),
    piece: "<Pagination>",
    answer: "31",
    rows: [
      { depth: 0, text: "<UsersTable pageSize={25}>", kind: "comp" },
      { depth: 1, text: "role=admin", tag: "25 users" },
      {
        depth: 2,
        slot: {
          id: "25",
          label: "+ pager",
          note: "25 rows fill exactly one page. The pager would read Page 1 of 1 with two dead arrows.",
          cost: ["Page 1 of 1", "2 dead arrows"],
        },
      },
      { depth: 1, text: "role=any", tag: "31 users" },
      {
        depth: 2,
        slot: {
          id: "31",
          label: "+ pager",
          note: "The last 6 rows need a second page, so this is the one list that needs a pager.",
          cost: ["2 pages"],
        },
      },
      { depth: 1, text: "role=owner", tag: "0 users" },
      {
        depth: 2,
        slot: {
          id: "0",
          label: "+ pager",
          note: "Nothing to page through. Under the empty state it would say Page 1 of 0.",
          cost: ["Page 1 of 0"],
        },
      },
    ],
  },
  {
    name: "Page 3, shared",
    prompt: (
      <>
        You're on page 3 of the orders and send the link to a teammate. Where does the page number
        live?
      </>
    ),
    piece: "page 3",
    answer: "url",
    rows: [
      { depth: 0, text: "<OrdersPage>", kind: "comp" },
      {
        depth: 1,
        slot: {
          id: "state",
          label: "+ useState()",
          note: "Reload or press Back and you're on page 1 again. The link you sent opens on page 1 too.",
          cost: ["reload → page 1"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "url",
          label: "+ /orders?page=",
          note: "The page is part of the link, so a reload, Back and your teammate all land on page 3.",
          cost: ["?page=3", "shareable"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "storage",
          label: "+ localStorage",
          note: "It survives your reload, but your teammate's browser has its own storage and opens page 1.",
          cost: ["link → page 1"],
        },
      },
    ],
  },
];

export function TableDesign() {
  const [demos] = useState<Demos>(() => ({
    ticker: store<Ticker>({ values: MRR, step: 0, hot: null }),
    roster: store(PRESETS.empty),
    filter: store<Filter>("admin"),
  }));
  return (
    <DemosContext value={demos}>
      <RuleLanding
        className="table-design"
        lead={
          <>
            Five tables, each built the usual way and the careful way side by side, and every one of
            them works. Then a mini quiz where you put each piece where it belongs.
          </>
        }
        learn={{
          title: "Tables get scanned, not read",
          intro: (
            <>
              People run their eyes down a column to find one value. Each example shows the same
              table twice. The left one is how tables tend to ship, and the right one follows the
              rule. Click both.
            </>
          ),
        }}
        lessons={LESSONS}
        tldr={CHEAT_SHEET}
        quiz={{
          intro: (
            <>
              Five tables, five pieces. Drag each piece to where it belongs, or tap it and then tap
              a spot. A wrong spot tells you what it would cost.
            </>
          ),
          levels: LEVELS,
          board: "table",
        }}
        take="build tables the same way"
      />
    </DemosContext>
  );
}
