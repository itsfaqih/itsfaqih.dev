import { HINT } from "./hints";
import { styles } from "./table-design.css";
import { reducedMotion } from "../hooks/media-query";
import {
  CREW,
  DIGITS,
  FILTERED,
  FILTERS,
  type Filter,
  matches,
  money,
  MRR,
  PER_PAGE,
  type Person,
  PRESETS,
  READY,
  type Roster,
  STAFF,
  START_FILTER,
  TICK_MS,
  TICKS,
  URL_PAGES,
  URL_PER_PAGE,
  VIEW_NAMES,
  viewOf,
} from "./table-design";
import { view } from "./table-design.view";

type Store<T> = {
  get: () => T;
  update: (next: (now: T) => T) => void;
  subscribe: (listener: (now: T) => void) => () => void;
};

function store<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<(now: T) => void>();
  return {
    get: () => value,
    update(next) {
      const now = next(value);
      if (Object.is(now, value)) return;
      value = now;
      for (const listener of listeners) listener(value);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

type Ticker = { values: number[]; step: number; hot: number | null };

// One page holds one of each demo pair, and both panes of a pair read the same store.
const ticker = store<Ticker>({ values: MRR, step: 0, hot: null });
const roster = store<Roster>(PRESETS.empty);
const filter = store<Filter>(START_FILTER);

const tick = (now: Ticker): Ticker => {
  const [row, value] = TICKS[now.step % TICKS.length] ?? [0, 0];
  return {
    values: now.values.map((old, at) => (at === row ? value : old)),
    step: now.step + 1,
    hot: row,
  };
};

const part = <T extends Element = HTMLElement>(root: ParentNode, name: string) =>
  root.querySelector<T>(`[data-part="${name}"]`)!;

function cloneOf<T extends Element>(template: HTMLTemplateElement, kind: abstract new () => T) {
  const node = template.content.firstElementChild?.cloneNode(true);
  if (!(node instanceof kind))
    throw new Error(`template "${template.dataset.part}" holds no ${kind.name}`);
  return node;
}

const texts = (element: Element) =>
  [...element.childNodes].filter((node): node is Text => node.nodeType === Node.TEXT_NODE);

/** Makes `nodes` the children of `parent`, moving only what is out of place, as a keyed render does. */
function place(parent: Element, nodes: readonly Node[]) {
  nodes.forEach((node, at) => {
    const here = parent.childNodes[at];
    if (here !== node) parent.insertBefore(node, here ?? null);
  });
  while (parent.childNodes.length > nodes.length) parent.lastChild!.remove();
}

function personRow(template: HTMLTemplateElement, { name, role }: Person) {
  const row = cloneOf(template, HTMLTableRowElement);
  const [nameCell, roleCell] = row.cells;
  nameCell!.textContent = name;
  roleCell!.textContent = role;
  return row;
}

/** The page a pager button asks for, or undefined for a click elsewhere. */
function pageAsked(target: EventTarget | null, page: number) {
  if (!(target instanceof Element)) return undefined;
  const key = target.closest<HTMLElement>("[data-page], [data-step]");
  if (!key) return undefined;
  return key.dataset.page ? Number(key.dataset.page) : page + Number(key.dataset.step);
}

function paintNav(nav: HTMLElement, page: number, pages: number) {
  texts(nav.firstElementChild!)[1]!.data = String(page);
  nav.querySelector<HTMLButtonElement>('[data-step="-1"]')!.disabled = page <= 1;
  nav.querySelector<HTMLButtonElement>('[data-step="1"]')!.disabled = page >= pages;
  for (const key of nav.querySelectorAll<HTMLButtonElement>("[data-page]")) {
    const on = Number(key.dataset.page) === page;
    if (on) key.setAttribute("aria-current", "page");
    else key.removeAttribute("aria-current");
    key.className = view.pageKey(on);
  }
}

/** The Live/Paused switch: ticks the revenue while playing and while its lesson is on screen. */
class TableLive extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const button = this.querySelector("button")!;
    const dot = button.firstElementChild!;
    const label = texts(button)[0]!;
    const sr = button.lastElementChild!;
    const icons = {
      pause: button.querySelector("svg")!,
      play: cloneOf(part<HTMLTemplateElement>(this, "play"), SVGSVGElement),
    };
    let playing = true;
    let seen = false;
    let timer = 0;

    const run = () => {
      clearInterval(timer);
      if (playing && seen) timer = window.setInterval(() => ticker.update(tick), TICK_MS);
    };
    const paint = () => {
      dot.className = view.dot(playing);
      label.data = playing ? "Live" : "Paused";
      (playing ? icons.play : icons.pause).replaceWith(playing ? icons.pause : icons.play);
      sr.textContent = playing ? ", pause updates" : ", play updates";
      run();
    };

    if (reducedMotion()) {
      playing = false;
      paint();
    }
    button.addEventListener(
      "click",
      () => {
        playing = !playing;
        paint();
      },
      { signal: controller.signal },
    );
    const observer = new IntersectionObserver(
      ([entry]) => {
        const now = entry?.isIntersecting ?? false;
        if (now === seen) return;
        seen = now;
        run();
      },
      { threshold: 0.4 },
    );
    const lesson = this.closest(".lesson");
    if (lesson) observer.observe(lesson);

    this.#stop = () => {
      controller.abort();
      observer.disconnect();
      clearInterval(timer);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

/** Keeps a reel's digits, keyed from the right, so a changed digit rolls to its new place. */
function roll(reels: Element, text: string) {
  const chars = [...text];
  while (reels.children.length > chars.length) reels.firstElementChild!.remove();
  while (reels.children.length < chars.length) reels.prepend(document.createElement("span"));
  chars.forEach((char, at) => {
    const old = reels.children[at]!;
    const digit = /\d/.test(char);
    const strip = old.firstElementChild;
    if (digit && old.className === styles.reel && strip instanceof HTMLElement) {
      strip.style.setProperty("--n", char);
      return;
    }
    if (!digit && !old.className && !strip) {
      old.textContent = char;
      return;
    }
    const next = document.createElement("span");
    if (digit) {
      next.className = styles.reel;
      const fresh = document.createElement("span");
      fresh.className = styles.strip;
      fresh.style.setProperty("--n", char);
      for (const n of DIGITS) {
        const cell = document.createElement("span");
        cell.className = styles.digit;
        cell.textContent = n;
        fresh.append(cell);
      }
      next.append(fresh);
    } else {
      next.textContent = char;
    }
    old.replaceWith(next);
  });
}

/** The revenue table, as typed or right-aligned with rolling tabular digits. */
class TableNumbers extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const careful = this.dataset.careful === "true";
    const cells = [...this.querySelector("tbody")!.rows].map((row) => row.cells[1]!);
    let flash: HTMLElement | undefined;
    this.#stop = ticker.subscribe(({ values, hot }) => {
      flash?.remove();
      flash = undefined;
      cells.forEach((cell, at) => {
        const value = values[at] ?? 0;
        if (careful) {
          cell.querySelector("span")!.textContent = money(value);
          roll(cell.lastElementChild!, money(value));
        } else {
          texts(cell).at(-1)!.data = String(value);
        }
        if (hot !== at) return;
        flash = document.createElement("i");
        flash.className = styles.flash;
        flash.setAttribute("aria-hidden", "true");
        cell.prepend(flash);
      });
    });
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

/** A row of toggle keys picking the roster's state or the pager's filter. */
class TableSegments extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const keys = [...this.querySelectorAll<HTMLButtonElement>("[data-key]")];
    const ofRoster = this.dataset.of === "roster";
    let settle = 0;

    const paint = (value: string) => {
      for (const key of keys) {
        const on = key.dataset.key === value;
        key.setAttribute("aria-pressed", String(on));
        key.className = view.segKey(on);
      }
    };
    this.addEventListener(
      "click",
      (event) => {
        const key =
          event.target instanceof Element
            ? event.target.closest<HTMLElement>("[data-key]")?.dataset.key
            : undefined;
        const shown = VIEW_NAMES.find(([name]) => name === key)?.[0];
        const role = FILTERS.find(([name]) => name === key)?.[0];
        if (ofRoster && shown) roster.update(() => PRESETS[shown]);
        else if (!ofRoster && role) filter.update(() => role);
      },
      { signal: controller.signal },
    );
    // A retried load settles after a beat; any change to the roster meanwhile restarts the wait.
    const unsubscribe = ofRoster
      ? roster.subscribe((now) => {
          paint(viewOf(now));
          clearTimeout(settle);
          if (now.phase === "loading" && now.settles)
            settle = window.setTimeout(() => roster.update(() => READY), 1100);
        })
      : filter.subscribe(paint);

    this.#stop = () => {
      controller.abort();
      unsubscribe();
      clearTimeout(settle);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

/** The users table through loading, empty, failed and no-match, blank or with a next step. */
class TableStates extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const careful = this.dataset.careful === "true";
    const input = part<HTMLInputElement>(this, "search");
    const table = this.querySelector("table")!;
    const body = table.tBodies[0]!;
    const rowTemplate = part<HTMLTemplateElement>(this, "row");
    const rows = new Map<string, HTMLTableRowElement>();
    const rowOf = (person: Person) => {
      let row = rows.get(person.name);
      if (!row) {
        row = personRow(rowTemplate, person);
        rows.set(person.name, row);
      }
      return row;
    };
    const said = careful ? part(this, "said") : undefined;
    const blank = careful ? undefined : part(this, "blank");
    const blankCell = blank?.firstElementChild;
    const noData = blankCell?.firstChild;
    const spin = careful
      ? undefined
      : cloneOf(part<HTMLTemplateElement>(this, "spin"), HTMLSpanElement);
    const bones = careful ? [...part<HTMLTemplateElement>(this, "bones").content.children] : [];
    const retry = careful
      ? cloneOf(part<HTMLTemplateElement>(this, "retry"), SVGSVGElement)
      : undefined;
    const title = said && part(said, "title");
    const hint = said && part(said, "hint");
    const act = said && part<HTMLButtonElement>(said, "act");
    const actText = act && texts(act).at(-1);

    const set = (next: Partial<Roster>) => roster.update((old) => ({ ...old, ...next }));
    const SAY = {
      empty: {
        title: () => "No users yet",
        hint: "Add your first teammate.",
        act: "Add user",
        run: () => set({ users: [{ name: "Dana Whitfield", role: "Admin" }], query: "" }),
      },
      error: {
        title: () => "Couldn't load users",
        hint: "The server didn't answer.",
        act: "Retry",
        run: () => set({ phase: "loading", settles: true }),
      },
      none: {
        title: (now: Roster) => `No results for "${now.query.trim()}"`,
        hint: "Check the spelling, or clear the search.",
        act: "Clear search",
        run: () => set({ query: "" }),
      },
    };

    const paint = (now: Roster) => {
      const shown = viewOf(now);
      if (input.value !== now.query) input.value = now.query;
      if (shown === "loading") table.setAttribute("aria-busy", "true");
      else table.removeAttribute("aria-busy");
      if (shown === "data") return place(body, matches(now).map(rowOf));
      if (blankCell && blank && spin && noData) {
        const inside = shown === "loading" ? spin : noData;
        if (blankCell.firstChild !== inside) blankCell.replaceChildren(inside);
        return place(body, [blank]);
      }
      if (shown === "loading") return place(body, bones);
      if (!said || !title || !hint || !act || !actText || !retry) return;
      const say = SAY[shown];
      title.textContent = say.title(now);
      title.className = view.saidTitle(shown === "error");
      hint.textContent = say.hint;
      act.className = view.saidButton(shown !== "none");
      if (shown === "error") {
        if (!retry.isConnected) act.prepend(retry);
      } else retry.remove();
      actText.data = say.act;
      place(body, [said]);
    };

    input.addEventListener("input", () => set({ query: input.value }), {
      signal: controller.signal,
    });
    act?.addEventListener(
      "click",
      () => {
        const shown = viewOf(roster.get());
        if (shown !== "loading" && shown !== "data") SAY[shown].run();
      },
      { signal: controller.signal },
    );
    const unsubscribe = roster.subscribe(paint);
    paint(roster.get());

    this.#stop = () => {
      controller.abort();
      unsubscribe();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

/** The users table with row actions, inline on hover or in a fixed last column. */
class TableActions extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const careful = this.dataset.careful === "true";
    const body = this.querySelector("tbody")!;
    const trs = [...body.rows];
    const rowOf = new Map(CREW.map(({ name }, at) => [name, trs[at]!]));
    const nameOf = new Map(CREW.map(({ name }, at) => [trs[at]!, name]));
    const count = texts(part(this, "count"))[0]!;
    const foot = part(this, "count").parentElement!;
    const restore = cloneOf(part<HTMLTemplateElement>(this, "restore"), HTMLButtonElement);
    let present = CREW.map(({ name }) => name);
    let editing: string | null = null;

    const paint = () => {
      const shown = present.map((name) => rowOf.get(name)!);
      place(body, shown);
      shown.forEach((row, at) => {
        const name = nameOf.get(row)!;
        const on = editing === name;
        const [nameCell, roleCell, actsCell] = row.cells;
        const label = part(nameCell!, "name");
        if (at === 0) label.setAttribute("data-hint", HINT.hover);
        else label.removeAttribute("data-hint");
        nameCell!.className = view.nameCell(on);
        roleCell!.className = view.roleCell(on);
        if (actsCell) actsCell.className = view.actsCell(on);
        const edit = row.querySelector<HTMLButtonElement>('[data-act="edit"]')!;
        edit.setAttribute("aria-pressed", String(on));
        if (careful) edit.className = view.iconKey(false, on);
      });
      count.data = String(present.length);
      if (present.length < CREW.length) {
        if (!restore.isConnected) foot.append(restore);
      } else restore.remove();
    };

    this.addEventListener(
      "click",
      (event) => {
        const key =
          event.target instanceof Element ? event.target.closest<HTMLElement>("[data-act]") : null;
        if (!key) return;
        const name = nameOf.get(key.closest("tr")!) ?? "";
        if (key.dataset.act === "restore") present = CREW.map((person) => person.name);
        else if (key.dataset.act === "delete") present = present.filter((now) => now !== name);
        else editing = editing === name ? null : name;
        paint();
      },
      { signal: controller.signal },
    );

    this.#stop = () => controller.abort();
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

/** The paged users table under the role filter; a new filter mounts its table afresh on page 1. */
class TablePager extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const rowTemplate = part<HTMLTemplateElement>(this, "row");
    let card = part(this, "card");
    let people = FILTERED[filter.get()];
    let page = 1;

    this.addEventListener(
      "click",
      (event) => {
        const asked = pageAsked(event.target, page);
        if (asked === undefined) return;
        page = asked;
        const pages = Math.ceil(people.length / PER_PAGE);
        texts(part(card, "caption")).at(-1)!.data = String(page);
        place(
          part(card, "rows"),
          people
            .slice((page - 1) * PER_PAGE, page * PER_PAGE)
            .map((person) => personRow(rowTemplate, person)),
        );
        paintNav(part(card, "nav"), page, pages);
      },
      { signal: controller.signal },
    );
    const unsubscribe = filter.subscribe((now) => {
      const fresh = cloneOf(
        this.querySelector<HTMLTemplateElement>(`template[data-filter="${now}"]`)!,
        HTMLElement,
      );
      card.replaceWith(fresh);
      card = fresh;
      people = FILTERED[now];
      page = 1;
    });

    this.#stop = () => {
      controller.abort();
      unsubscribe();
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

/** A paged table behind an address bar. Reload keeps the page only when the URL holds it. */
class TableUrl extends HTMLElement {
  #stop?: () => void;

  connectedCallback() {
    const controller = new AbortController();
    const careful = this.dataset.careful === "true";
    const reload = part<HTMLButtonElement>(this, "reload");
    const address = part(this, "address");
    const query = address.querySelector("b");
    const caption = texts(part(this, "caption")).at(-1)!;
    const body = part(this, "rows");
    const nav = part(this, "nav");
    const note = part(this, "note");
    const rowTemplate = part<HTMLTemplateElement>(this, "row");
    let now = { page: 2, reloading: false, reloads: 0 };
    let drawn = now.page;
    let timer = 0;

    const paint = () => {
      const asked = careful && now.page > 1 ? `?page=${now.page}` : "";
      if (query && asked) {
        query.textContent = asked;
        if (!query.isConnected) address.append(query);
      } else {
        query?.remove();
      }
      reload.disabled = now.reloading;
      caption.data = String(now.page);
      body.className = view.body(now.reloading);
      if (drawn !== now.page) {
        drawn = now.page;
        place(
          body,
          STAFF.slice((now.page - 1) * URL_PER_PAGE, now.page * URL_PER_PAGE).map((person) =>
            personRow(rowTemplate, person),
          ),
        );
      }
      paintNav(nav, now.page, URL_PAGES);
      note.textContent =
        now.reloads === 0
          ? "Pick a page, then reload."
          : careful
            ? `Reloaded. Still on page ${now.page}.`
            : "Reloaded. Back on page 1.";
    };

    reload.addEventListener(
      "click",
      () => {
        now = { ...now, reloading: true };
        paint();
        timer = window.setTimeout(() => {
          now = { page: careful ? now.page : 1, reloading: false, reloads: now.reloads + 1 };
          paint();
        }, 420);
      },
      { signal: controller.signal },
    );
    nav.addEventListener(
      "click",
      (event) => {
        const asked = pageAsked(event.target, now.page);
        if (asked === undefined) return;
        now = { ...now, page: asked };
        paint();
      },
      { signal: controller.signal },
    );

    this.#stop = () => {
      controller.abort();
      clearTimeout(timer);
    };
  }

  disconnectedCallback() {
    this.#stop?.();
  }
}

customElements.define("table-live", TableLive);
customElements.define("table-numbers", TableNumbers);
customElements.define("table-segments", TableSegments);
customElements.define("table-states", TableStates);
customElements.define("table-actions", TableActions);
customElements.define("table-pager", TablePager);
customElements.define("table-url", TableUrl);
