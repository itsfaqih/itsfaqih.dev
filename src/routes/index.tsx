import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { VISIBLE_GUIDELINES } from "../data/guidelines";
import { SLIDES, TICKER } from "../data/home";
import { useMediaQuery } from "../hooks/use-media-query";
import { Backdrop } from "./-components/backdrop";
import { HeroPrints, SCENE_LEAD_MS, SLIDE_MS } from "./-components/hero/hero-prints";
import { RuleSpread } from "./-components/rule-spread";
import { StackShowcase, type StackGroup, type StackUse } from "./-components/stack-showcase";
import { TechIcon, techBrand } from "./-components/tech-icon";
import { useCutIns } from "./-components/use-cut-ins";
import { pageHead } from "../seo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () =>
    pageHead({
      path: "/",
      title: "Faqih Muntashir · Full-Stack Engineer in Yogyakarta",
      description:
        "Full-stack engineer in Yogyakarta with 5+ years on web products: frontends, backends, and agent tooling. Now building healthcare software at EvidenceCare.",
      type: "website",
    }),
});

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
    stack: ["React", "Tailwind CSS"],
  },
  {
    kind: "UI KIT",
    title: "ruine UI",
    summary: "Dashboard kit",
    href: "https://github.com/ruine-dev/ruine-ui-dashboard",
    color: "var(--ux)",
    stack: ["Astro", "Tailwind CSS"],
  },
  {
    kind: "TEMPLATE",
    title: "Fama",
    summary: "Portfolio template",
    href: "https://github.com/itsfaqih/fama",
    color: "var(--ar)",
    stack: ["React", "Framer", "Tailwind CSS"],
  },
  {
    kind: "DESIGN",
    title: "PHPID",
    summary: "Learning platform redesign",
    href: "https://www.figma.com/design/qNIg0A9h7PnrFdOVSBbMEH/PHPID-Online-Learning-Redesign?node-id=0-1&t=PcPvOnrKzLginYqa-1",
    color: "var(--ts)",
    stack: ["Figma"],
  },
];

const OTHER_WORK = [
  {
    company: "Mitra Integrasi Informatika",
    role: "Frontend Engineer",
    years: "2020 → 2021",
    stack: ["React", "TypeScript", "Figma"],
  },
];

const THIS_SITE = {
  title: "itsfaqih.dev",
  summary: "This site",
  stack: [
    "React",
    "TypeScript",
    "TanStack Start",
    "TanStack Router",
    "Base UI",
    "Phosphor Icons",
    "Vite",
    "Vitest",
    "Playwright",
    "Storybook",
    "Oxlint",
    "Oxfmt",
  ],
};

const STACK_GROUPS: StackGroup[] = [
  { label: "Languages", tools: ["TypeScript", "PHP", "HTML", "CSS"] },
  {
    label: "Frameworks and libraries",
    tools: [
      "React",
      "Vue",
      "Next.js",
      "Astro",
      "React Router",
      "TanStack Start",
      "TanStack Router",
      "TanStack Query",
      "Effect",
      "XState",
      "Zustand",
      "Redux",
      "Zod",
      "React Flow",
      "Tailwind CSS",
      "PostCSS",
      "Base UI",
      "Radix UI",
      "Shadcn UI",
      "Phosphor Icons",
      "InertiaJS",
    ],
  },
  { label: "Design", tools: ["Figma", "Framer"] },
  {
    label: "Backend and data",
    tools: [
      "Node.js",
      "Express",
      "Laravel",
      "AdonisJS",
      "tRPC",
      "Prisma",
      "Drizzle",
      "WebSocket",
      "Trigger.dev",
      "PostgreSQL",
      "MySQL",
      "MariaDB",
      "MongoDB",
      "Redis",
      "Snowflake",
    ],
  },
  {
    label: "Testing and quality",
    tools: ["Vitest", "Jest", "Playwright", "MSW", "Storybook", "Biome", "Oxlint", "Oxfmt"],
  },
  {
    label: "DevOps and infrastructure",
    tools: [
      "Docker",
      "Git",
      "Vite",
      "Bun",
      "NGINX",
      "Apache",
      "IIS",
      "Amazon Route 53",
      "Amazon CodeBuild",
      "Amazon CodePipeline",
      "Amazon ECR",
      "Amazon WAF",
      "Amazon S3",
      "Amazon SES",
      "Amazon SNS",
    ],
  },
  { label: "Email and templating", tools: ["Mailjet", "Maizzle", "EJS"] },
  {
    label: "AI tools",
    tools: ["Claude Code", "OpenAI Codex", "OpenCode", "OpenRouter", "Hermes"],
  },
];

const STACK_SOURCES = [
  ...[...EXPERIENCE, ...OTHER_WORK].map((job) => ({
    use: { kind: "work" as const, name: job.company, detail: `${job.role} · ${job.years}` },
    stack: job.stack,
  })),
  ...[...PROJECTS, THIS_SITE].map((project) => ({
    use: { kind: "project" as const, name: project.title, detail: project.summary },
    stack: project.stack,
  })),
];

const STACK_PLACES = STACK_SOURCES.map((source) => source.use);
const STACK_USES = usesByTool(STACK_SOURCES);

function usesByTool(sources: { use: StackUse; stack: string[] }[]) {
  const uses: Record<string, StackUse[]> = {};
  sources.forEach(({ use, stack }) => stack.forEach((tool) => (uses[tool] ??= []).push(use)));
  return uses;
}

// The band slides by exactly half its width, so each half must outrun the widest screen or its
// end shows. One set is about 1170px; three sets make a half wide enough for a 3500px screen.
const TICKER_RUN = Array.from({ length: 6 }, () => TICKER).flat();

function Index() {
  const [introDone, setIntroDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useCutIns(rootRef, introDone);

  return (
    <div ref={rootRef} className="arc arc-scan">
      <Backdrop />
      <Intro onDone={setIntroDone} />

      <div className="arc-wrap">
        <Hero introDone={introDone} />
      </div>

      <div className="ticker-wrap" data-loop data-cut aria-hidden="true">
        <div className="ticker">
          {TICKER_RUN.map(({ word, color }, index) => (
            <span key={index} style={{ "--c": color }}>
              {word} ★
            </span>
          ))}
        </div>
      </div>

      <div className="arc-wrap">
        <section id="rules">
          <div className="sh2">
            <h2>
              <small data-cut style={{ "--c": "var(--cw)" }}>
                Writing
              </small>
              <span data-cut>Rule of Thumb</span>
            </h2>
            <p data-cut>Opinions I've earned from my experience</p>
          </div>
          <RuleSpread rules={VISIBLE_GUIDELINES} />
        </section>

        <section id="work">
          <div className="sh2">
            <h2>
              <small data-cut style={{ "--c": "var(--ux)" }}>
                Experience
              </small>
              <span data-cut>Where I've worked</span>
            </h2>
          </div>
          <ExperienceList />
        </section>

        <StackShowcase groups={STACK_GROUPS} places={STACK_PLACES} uses={STACK_USES} />

        <section id="projects">
          <div className="sh2">
            <h2>
              <small data-cut style={{ "--c": "var(--ts)" }}>
                Side projects
              </small>
              <span data-cut>Projects</span>
            </h2>
          </div>
          <div className="stages">
            {PROJECTS.map((project) => (
              <a
                key={project.title}
                className="stg"
                data-cut
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ "--c": project.color }}
              >
                <small>{project.kind}</small>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
              </a>
            ))}
          </div>
        </section>

        <div id="contact" className="end" data-cut>
          <h2>
            <small data-cut style={{ "--c": "var(--ax)" }}>
              Contact
            </small>
            <span data-cut>Ready to bring the next level of care to your product?</span>
          </h2>
          <div className="acts" data-cut style={{ marginTop: 24 }}>
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

        <footer data-cut>
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

const SKIP_GRACE_MS = 1200;
function Intro({ onDone }: { onDone: (introDone: boolean) => void }) {
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
      } catch {}
      onDone(true);
      removeTimer = window.setTimeout(() => setGone(true), 700);
    };
    const skip = () => {
      if (performance.now() - openedAt > SKIP_GRACE_MS) finish();
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

function Hero({ introDone }: { introDone: boolean }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [slide, setSlide] = useState({ index: 0, run: 0, lead: 0 });
  const [pausedByUser, setPausedByUser] = useState<boolean | null>(null);

  const runRef = useRef(0);
  const remainingRef = useRef(SLIDE_MS);

  const userPaused = pausedByUser ?? reduced;
  const current = SLIDES[slide.index]!;

  const go = (index: number) => {
    runRef.current += 1;
    const lead = reduced ? 0 : SCENE_LEAD_MS;
    remainingRef.current = SLIDE_MS + lead;
    setSlide({ index, run: runRef.current, lead });
  };

  useEffect(() => {
    const requested = Number(new URLSearchParams(location.search).get("slide"));
    if (requested > 0 && requested < SLIDES.length) go(requested);
  }, []);

  const advance = useEffectEvent(() => go((slide.index + 1) % SLIDES.length));
  useEffect(() => {
    if (!introDone || userPaused) return;
    const run = slide.run;
    const armedAt = performance.now();
    const timer = setTimeout(advance, remainingRef.current);
    return () => {
      clearTimeout(timer);
      if (runRef.current === run) remainingRef.current -= performance.now() - armedAt;
    };
  }, [introDone, userPaused, slide.run]);

  return (
    <div className="hero" data-started={introDone ? "" : undefined}>
      <div>
        <div className="tag" data-cut>
          Full-stack engineer · Yogyakarta
        </div>
        <h1 data-cut>
          <span className="lead-in">I build</span>
          <span className="rot" data-cycled={slide.run ? "" : undefined}>
            {SLIDES.map((item, index) => (
              <span
                key={item.tab}
                className={index === slide.index ? "ph on" : "ph"}
                style={{ "--c": item.color }}
                aria-hidden={index === slide.index ? undefined : true}
              >
                <span className="l2">{item.phrase}</span>
                <span className="l3">
                  <span className="hl">{item.highlight}</span>.
                </span>
              </span>
            ))}
          </span>
        </h1>
        <p className="lead" data-cut>
          I'm Faqih, a full-stack engineer with 5+ years on web products: frontends, backends, and
          lately the agent tooling around them. Right now I'm building healthcare software at{" "}
          <a href="https://evidence.care" target="_blank" rel="noopener noreferrer">
            EvidenceCare
          </a>
          .
        </p>
        <div className="acts">
          <a className="btn go" href="#contact" data-cut style={{ "--c": current.color }}>
            Connect with me
          </a>
          <a className="scroll-cue" href="#rules" data-cut>
            <span className="mouse" aria-hidden="true">
              <span className="wheel" />
            </span>
            Scroll down
          </a>
        </div>
      </div>

      <div
        className="bench"
        data-cut
        data-held={userPaused ? "" : undefined}
        style={{ "--c": current.color }}
      >
        <HeroPrints index={slide.index} restartKey={slide.run} playing={introDone} />
        <div className="bench-ctl">
          <div className="pips" role="group" aria-label="What I build">
            {SLIDES.map((item, index) => (
              <button
                key={item.tab}
                type="button"
                className="pip"
                aria-label={item.tab}
                aria-pressed={index === slide.index}
                style={{
                  "--c": item.color,
                  "--ms": `${SLIDE_MS + (index === slide.index ? slide.lead : 0)}ms`,
                }}
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
    after.pills.forEach((to, pill) => {
      const from = before.pills.get(pill);
      if (!from) return;
      const dx = from.xInRow - to.xInRow;
      const dy = from.yInRow - to.yInRow;
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
    <div ref={listRef} className="hs">
      {EXPERIENCE.map((job, index) => {
        const isOpen = open === index;
        const panelId = `job-${index}`;
        return (
          <div key={job.company} className="hs-row" data-cut data-on={isOpen ? "" : undefined}>
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
  pills: Map<Element, { xInRow: number; yInRow: number; order: number }>;
};

function snapshotOf(list: HTMLElement): Snapshot {
  const rows = new Map<Element, number>();
  const pills = new Map<Element, { xInRow: number; yInRow: number; order: number }>();
  for (const row of list.querySelectorAll(".hs-row")) {
    const box = row.getBoundingClientRect();
    rows.set(row, box.top);
    row.querySelectorAll(".hs-stack li").forEach((pill, order) => {
      const at = pill.getBoundingClientRect();
      pills.set(pill, { xInRow: at.left - box.left, yInRow: at.top - box.top, order });
    });
  }
  return { height: list.getBoundingClientRect().height, rows, pills };
}
