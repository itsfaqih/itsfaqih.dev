import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GUIDELINES } from "../data/guidelines";
import { useMediaQuery } from "../hooks/use-media-query";
import { Backdrop } from "./-components/backdrop";
import { HeroPrints } from "./-components/hero/hero-prints";
import { RuleSelect } from "./-components/rule-select";
import { TechIcon, techBrand } from "./-components/tech-icon";
import { useCutIns } from "./-components/use-cut-ins";

export const Route = createFileRoute("/")({
  component: Index,
});

const RULES = GUIDELINES.filter((guideline) => !guideline.hidden);

// One headline phrase per kind of work. Each has its own printed scene on the hero card,
// and `ms` fits a whole number of the scene's `loops`, so a slide ends as its scene clears.
const SLIDES = [
  { tab: "Interfaces", color: "var(--ux)", phrase: "interfaces that ", highlight: "feel right", ms: 8000, loops: 2 },
  { tab: "Agents", color: "var(--cw)", phrase: "agents that ", highlight: "finish the job", ms: 8800, loops: 2 },
  { tab: "Dev tools", color: "var(--ar)", phrase: "dev tools that ", highlight: "save hours", ms: 8800, loops: 2 },
  { tab: "Backends", color: "var(--ts)", phrase: "backends that ", highlight: "run reliably", ms: 7000, loops: 1 },
  { tab: "Tests", color: "var(--ax)", phrase: "test suites you ", highlight: "can trust", ms: 9600, loops: 2 },
];

const EXPERIENCE = [
  {
    years: "2024 → now",
    company: "EvidenceCare",
    role: "Software Engineer",
    stack: [
      "TypeScript",
      "React Router",
      "Express",
      "PostgreSQL",
      "Snowflake",
      "Docker",
      "Vite",
      "Vitest",
      "Biome",
      "Zod",
      "Tailwind CSS",
    ],
    achievements: [
      "Designed and built an MCP server and a linter. The MCP cut development time for a single component by 66%, and the wider project is projected to save about $15K a month.",
      "Cut deployment time from several hours to minutes by optimizing database migrations for both fresh environments and existing databases.",
      "Standardized modern tooling across TypeScript codebases: ts-node to tsx, CRA to Vite, Prettier and ESLint to Biome, Jest to Vitest, Joi to Zod.",
      "Reduced Docker image size by 30% on select projects with an optimized image build.",
      "Architected multi-tenancy on a single RDS instance and PHI-safe logging.",
      "Built an automated PR reviewer that checks database permissions before merge.",
    ],
  },
  {
    years: "2023 → 2024",
    company: "Vestis Labs",
    role: "Full Stack Engineer",
    stack: ["React", "TypeScript", "Next.js", "TanStack Router", "Express", "MongoDB", "Tailwind CSS"],
    achievements: [
      "Simplified more than 80% of the code structure by co-locating related code and removing unnecessary abstractions.",
      "Overhauled the website's UI design for consistency and clarity.",
      "Designed the data model for the digital ID website and its drag-and-drop builder.",
      "Reduced API calls and sped up page loads with React Query in-memory caching and HTTP caching.",
      "Made the image annotator faster and usable on phones by moving rendering from React to direct DOM manipulation.",
    ],
  },
  {
    years: "2022 → 2023",
    company: "Jatis Mobile",
    role: "Full Stack Engineer",
    stack: ["React", "TypeScript", "XState", "React Flow", "AdonisJS", "Tailwind CSS", "Figma"],
    achievements: [
      "Eliminated server-side chatbot costs by building a client-side chatbot with XState that simulates a WhatsApp-style experience.",
      "Designed the UI and built the chatbot flow builder from scratch through deployment with React Flow, Tailwind CSS and AdonisJS.",
      "Led a team of 4 developers to deliver one of the company's main products.",
      "Joined as a Web Designer and grew into a Full Stack Engineer role.",
      "Recognized as a top performer in Q4 2022 among hundreds of colleagues.",
    ],
  },
  {
    years: "2021 → 2022",
    company: "Rapidev",
    role: "Founding Engineer · PM",
    stack: ["React", "TypeScript", "Laravel", "MySQL", "Figma"],
    achievements: [
      "Cut dashboard load time by 80% by eager loading to fix N+1 queries and moving pagination to the server.",
      "Reduced the steps to update hotel availability and pricing by 66%.",
      "Integrated the Xendit and Midtrans payment gateways.",
      "Managed a 10-person product team delivering for 3 early-stage startups.",
      "Designed user journeys, dashboards and database structures for every app the company built.",
      "Mentored developers and designers through code and design reviews, and wrote the team's central documentation.",
    ],
  },
];

const PROJECTS = [
  {
    kind: "WEB APP",
    title: "Schemata",
    summary: "ERD builder",
    href: "https://schemata.ruine.app/",
    color: "var(--cw)",
  },
  {
    kind: "UI KIT",
    title: "ruine UI",
    summary: "Dashboard kit",
    href: "https://github.com/ruine-dev/ruine-ui-dashboard",
    color: "var(--ux)",
  },
  {
    kind: "TEMPLATE",
    title: "Fama",
    summary: "Portfolio template",
    href: "https://github.com/itsfaqih/fama",
    color: "var(--ar)",
  },
  {
    kind: "DESIGN",
    title: "PHPID",
    summary: "Learning platform redesign",
    href: "https://www.figma.com/design/qNIg0A9h7PnrFdOVSBbMEH/PHPID-Online-Learning-Redesign?node-id=0-1&t=PcPvOnrKzLginYqa-1",
    color: "var(--ts)",
  },
];

const STACK = [
  "TypeScript",
  "React",
  "TanStack",
  "Effect",
  "XState",
  "Base UI",
  "Node.js",
  "Laravel",
  "PostgreSQL",
  "Redis",
  "Vitest",
  "Playwright",
  "Docker",
  "Figma",
  "Claude Code",
];

const TICKER = ["INTERFACES", "AGENTIC SETUPS", "DEV TOOLS", "APIS", "HEALTHCARE SOFTWARE"];

function Index() {
  const [started, setStarted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Entrances wait for the intro to hand off, so nothing plays under the shutter.
  useCutIns(rootRef, started);

  return (
    <div ref={rootRef} className="arc arc-scan">
      <Backdrop />
      <Intro onDone={setStarted} />

      <div className="arc-wrap">
        <Hero started={started} />
      </div>

      <div className="ticker-wrap" data-loop data-cut aria-hidden="true">
        <div className="ticker">
          {[...TICKER, ...TICKER].map((word, index) => (
            <span key={index}>{word} ★</span>
          ))}
        </div>
      </div>

      <div className="arc-wrap">
        <section id="rules">
          <div className="sh2" data-cut>
            <h2 className="pop-in">
              <small>Writing</small>Rule of Thumb
            </h2>
            <p className="pop-in">
              <b className="disp">{RULES.length}</b> rules so far. Opinions I've earned in code
              review, many with demos you can try.{" "}
              <Link to="/rule-of-thumb" className="disp">
                See the index →
              </Link>
            </p>
          </div>
          <RuleSelect rules={RULES} pageSize={20} />
        </section>

        <section id="work">
          <div className="sh2" data-cut>
            <h2 className="pop-in">
              <small>Experience</small>Where I've worked
            </h2>
            <p className="pop-in">Five-plus years across six roles. Open one for everything I shipped there.</p>
          </div>
          <ExperienceList />
        </section>

        <section id="projects" className="two">
          <div data-cut>
            <div className="sh2">
              <h2 className="pop-in">
                <small>Side projects</small>Projects
              </h2>
            </div>
            <div className="stages">
              {PROJECTS.map((project, index) => (
                <a
                  key={project.title}
                  className="stg"
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ "--c": project.color, "--i": index }}
                >
                  <small>{project.kind}</small>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                </a>
              ))}
            </div>
          </div>
          <div data-cut>
            <div className="sh2">
              <h2 className="pop-in">
                <small>Tools I use</small>Stack
              </h2>
            </div>
            <ul className="pups">
              {STACK.map((tool, index) => (
                <li key={tool} style={{ ...techBrand(tool), "--i": index }}>
                  <TechIcon name={tool} />
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="end" data-cut>
          <h2 className="pop-in">
            <small>Contact</small>Have a product that needs this level of care?
          </h2>
          <div className="acts pop-in" style={{ marginTop: 24 }}>
            <a className="btn go" href="mailto:itsfaqih@gmail.com">
              Email itsfaqih@gmail.com
            </a>
            <a
              className="btn soft"
              href="https://www.linkedin.com/in/itsfaqih"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <footer>
          <span>© 2026 Faqih Muntashir</span>
          <span>
            <a href="https://github.com/itsfaqih" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>{" "}
            ·{" "}
            <a
              href="https://www.linkedin.com/in/itsfaqih"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>{" "}
            ·{" "}
            <a href="https://dribbble.com/itsfaqih" target="_blank" rel="noopener noreferrer">
              Dribbble
            </a>{" "}
            ·{" "}
            <a href="https://medium.com/@itsfaqih" target="_blank" rel="noopener noreferrer">
              Medium
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}

// Intro: name slam, fast cuts through what I build, shutter split.
function Intro({ onDone }: { onDone: (started: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const element = ref.current;
    const html = document.documentElement;
    if (!element || html.classList.contains("no-intro")) {
      setGone(true);
      onDone(true);
      return;
    }

    const openedAt = performance.now();
    let removeTimer = 0;
    const finish = () => {
      if (element.classList.contains("out")) return;
      element.classList.add("out");
      html.classList.add("no-intro");
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {
        // Private mode: the intro will simply play again next visit.
      }
      onDone(true);
      removeTimer = window.setTimeout(() => setGone(true), 700);
    };
    // Ignore skips in the first 1.2s so a stray key does not cut the name card.
    const skip = () => {
      if (performance.now() - openedAt > 1200) finish();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["Escape", "Enter", " "].includes(event.key)) skip();
    };
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target === element) finish();
    };

    element.addEventListener("animationend", onAnimationEnd);
    element.addEventListener("click", skip);
    addEventListener("keydown", onKeyDown);
    element.classList.add("play");
    return () => {
      element.removeEventListener("animationend", onAnimationEnd);
      element.removeEventListener("click", skip);
      removeEventListener("keydown", onKeyDown);
      clearTimeout(removeTimer);
    };
  }, [onDone]);

  if (gone) return null;

  return (
    <div ref={ref} className="arc-intro" aria-hidden="true">
      <div className="sh t" />
      <div className="sh b" />
      <div className="stage">
        <div className="name">FAQIH MUNTASHIR</div>
        <div className="slot">
          {["INTERFACES", "AGENTS", "DEV TOOLS", "BACKENDS"].map((word, index, words) => (
            <span
              key={word}
              className={index === words.length - 1 ? "cutw last" : "cutw"}
              style={{ "--i": index, "--c": SLIDES[index]!.color }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hero: rotating headline and the screen whose scene acts out each phrase.
function Hero({ started }: { started: boolean }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [slide, setSlide] = useState({ index: 0, run: 0 });
  const [pausedByUser, setPausedByUser] = useState<boolean | null>(null);
  const [hovering, setHovering] = useState(false);

  const runRef = useRef(0);
  const remainingRef = useRef(SLIDES[0]!.ms);

  // Reduced motion starts paused; the visitor can still press play.
  const userPaused = pausedByUser ?? reduced;
  const held = userPaused || hovering;
  const current = SLIDES[slide.index]!;

  const go = (index: number) => {
    runRef.current += 1;
    remainingRef.current = SLIDES[index]!.ms;
    setSlide({ index, run: runRef.current });
  };

  // Deep link for screenshots: /?slide=2
  useEffect(() => {
    const requested = Number(new URLSearchParams(location.search).get("slide"));
    if (requested > 0 && requested < SLIDES.length) go(requested);
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  // Advance after the slide's remaining time. Holding (hover or pause) banks what is left.
  useEffect(() => {
    if (!started || held) return;
    const run = slide.run;
    const armedAt = performance.now();
    const timer = setTimeout(() => go((slide.index + 1) % SLIDES.length), remainingRef.current);
    return () => {
      clearTimeout(timer);
      if (runRef.current === run) remainingRef.current -= performance.now() - armedAt;
    };
  });

  return (
    <div className="hero" data-started={started ? "" : undefined}>
      <div>
        <div className="tag">Full-stack engineer · Yogyakarta</div>
        <h1>
          <span className="lead-in">I build</span>
          <span className="rot">
            {SLIDES.map((item, index) => (
              <span
                key={item.tab}
                className={index === slide.index ? "ph on" : "ph"}
                style={{ "--c": item.color }}
                aria-hidden={index === slide.index ? undefined : true}
              >
                <span className="l2">{item.phrase}</span>
                <span className="l3">
                  <span className="hl">{item.highlight}</span>
                  .
                </span>
              </span>
            ))}
          </span>
        </h1>
        <p className="lead">
          I'm Faqih, a full-stack engineer with 5+ years on web products: frontends, backends, and
          lately the agent tooling around them. Right now I'm building healthcare software at{" "}
          <a href="https://evidence.care" target="_blank" rel="noopener noreferrer">
            EvidenceCare
          </a>
          .
        </p>
        <div className="acts">
          <a className="btn go" href="mailto:itsfaqih@gmail.com">
            Email itsfaqih@gmail.com
          </a>
          <a className="btn soft" href="#rules">
            Read my rules
          </a>
        </div>
      </div>

      <div
        className={held ? "bench held" : "bench"}
        style={{ "--c": current.color }}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
      >
        <HeroPrints index={slide.index} run={slide.run} playing={started} ms={current.ms} loops={current.loops} />
        <div className="bench-ctl">
          <div className="pips" role="group" aria-label="What I build">
            {SLIDES.map((item, index) => (
              <button
                key={item.tab}
                type="button"
                className="pip"
                aria-label={item.tab}
                aria-pressed={index === slide.index}
                style={{ "--c": item.color, "--ms": `${item.ms}ms` }}
                onClick={() => go(index)}
              >
                <i key={index === slide.index ? slide.run : "idle"} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="pause"
            aria-label={userPaused ? "Play" : "Pause"}
            onClick={() => setPausedByUser(!userPaused)}
          >
            {userPaused ? "▶" : "❚❚"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExperienceList() {
  const [open, setOpen] = useState(0);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const listRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<Snapshot | null>(null);

  const toggle = (index: number) => {
    const list = listRef.current;
    if (list && !reduced) beforeRef.current = snapshotOf(list);
    setOpen(open === index ? -1 : index);
  };

  // FLIP: rows slide to their new place; the stack pills leave one column and enter the other.
  useLayoutEffect(() => {
    const list = listRef.current;
    const before = beforeRef.current;
    beforeRef.current = null;
    if (!list || !before) return;
    const after = snapshotOf(list);
    const glide: KeyframeAnimationOptions = {
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "backwards",
    };
    if (before.height !== after.height) {
      list.animate([{ height: `${before.height}px` }, { height: `${after.height}px` }], {
        ...glide,
        duration: 380,
      });
    }
    after.rows.forEach((to, row) => {
      const from = before.rows.get(row);
      if (from === undefined || Math.abs(from - to) < 0.5) return;
      row.animate([{ transform: `translateY(${from - to}px)` }, { transform: "none" }], {
        ...glide,
        duration: 380,
      });
    });
    // Each pill rises and fades from where it was, then slides in from the left at its new place.
    after.pills.forEach((to, pill) => {
      const from = before.pills.get(pill);
      if (!from) return;
      const dx = from.x - to.x;
      const dy = from.y - to.y;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      pill.animate(
        [
          { offset: 0, opacity: 1, transform: `translate(${dx}px, ${dy}px)`, easing: "ease-in" },
          { offset: 0.38, opacity: 0, transform: `translate(${dx}px, ${dy - 10}px)` },
          { offset: 0.38, opacity: 0, transform: "translateX(-18px)", easing: glide.easing },
          { offset: 1, opacity: 1, transform: "none" },
        ],
        { duration: 520, delay: to.order * 18, fill: "backwards" },
      );
    });
  }, [open]);

  return (
    <div ref={listRef} className="hs" data-cut>
      {EXPERIENCE.map((job, index) => {
        const isOpen = open === index;
        const panelId = `job-${index}`;
        return (
          <div key={job.company} className={isOpen ? "hs-row on" : "hs-row"} style={{ "--i": index }}>
            <button
              type="button"
              className="hs-head"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
            >
              <span className="rk">{job.years}</span>
              <h3>
                {job.company}
                <small>{job.role}</small>
              </h3>
              <span className="hs-x" aria-hidden="true" />
            </button>
            <ul className="hs-stack" aria-label={`${job.company} stack`}>
              {job.stack.map((tool) => (
                <li key={tool} style={techBrand(tool)}>
                  <TechIcon name={tool} />
                  {tool}
                </li>
              ))}
            </ul>
            <div id={panelId} className="hs-body">
              {isOpen && (
                <ul className="hs-list">
                  {job.achievements.map((item, at) => (
                    <li key={item} style={{ "--j": at }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type Snapshot = {
  height: number;
  rows: Map<Element, number>;
  pills: Map<Element, { x: number; y: number; order: number }>;
};

// Row tops, and each pill's offset inside its row, so a pill's glide does not double the row's slide.
function snapshotOf(list: HTMLElement): Snapshot {
  const rows = new Map<Element, number>();
  const pills = new Map<Element, { x: number; y: number; order: number }>();
  for (const row of list.querySelectorAll(".hs-row")) {
    const box = row.getBoundingClientRect();
    rows.set(row, box.top);
    row.querySelectorAll(".hs-stack li").forEach((pill, order) => {
      const at = pill.getBoundingClientRect();
      pills.set(pill, { x: at.left - box.left, y: at.top - box.top, order });
    });
  }
  return { height: list.getBoundingClientRect().height, rows, pills };
}

