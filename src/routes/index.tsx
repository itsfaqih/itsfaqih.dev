import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { VISIBLE_GUIDELINES } from "../data/guidelines";
import { SLIDES } from "../data/home";
import { Backdrop } from "./-components/backdrop";
import { ExperienceList, type Job } from "./-components/experience-list";
import { Hero } from "./-components/hero/hero";
import { heroType } from "./-components/hero-type";
import { Intro } from "./-components/intro";
import { reticle } from "./-components/reticle";
import { RuleSpread } from "./-components/rule-spread";
import { StackShowcase, type StackGroup } from "./-components/stack-showcase";
import { useCutIns } from "./-components/use-cut-ins";
import { LINKS, pageHead } from "../seo";
import { fonts, motion, palette } from "../theme.stylex";
import { button } from "../components/button";

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

const EXPERIENCE: Job[] = [
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

const TICKER_RUN = Array.from({ length: 6 }, () => SLIDES).flat();

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

      <div {...stylex.props(styles.ticker)} data-loop data-cut aria-hidden="true">
        <div {...stylex.props(styles.tickerTrack, styles.pausable)}>
          {TICKER_RUN.map(({ ticker, color }, index) => (
            <span key={index} {...stylex.props(styles.tickerTile, styles.pausable)} style={{ "--c": color }}>
              {ticker} ★
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
          <ExperienceList jobs={EXPERIENCE} />
        </section>

        <StackShowcase groups={STACK_GROUPS} sources={STACK_SOURCES} />

        <section id="projects">
          <div className="sh2">
            <h2>
              <small data-cut style={{ "--c": "var(--ts)" }}>
                Side projects
              </small>
              <span data-cut>Projects</span>
            </h2>
          </div>
          <div {...stylex.props(styles.projects)}>
            {PROJECTS.map((project) => (
              <a
                key={project.title}
                {...stylex.props(reticle.card, reticle.aim, styles.project)}
                data-cut
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ "--c": project.color }}
              >
                <small {...stylex.props(styles.projectKind)}>{project.kind}</small>
                <h3 {...stylex.props(styles.projectTitle)}>{project.title}</h3>
                <p {...stylex.props(styles.projectSummary)}>{project.summary}</p>
              </a>
            ))}
          </div>
        </section>

        <div id="contact" {...stylex.props(styles.contact)} data-cut>
          <h2>
            <small data-cut style={{ "--c": "var(--ax)" }}>
              Contact
            </small>
            <span data-cut>Ready to bring the next level of care to your product?</span>
          </h2>
          <div {...stylex.props(heroType.acts)} data-cut style={{ marginTop: 24 }}>
            <a {...stylex.props(button.base, button.go)} href={`mailto:${LINKS.email}`}>
              {`Email ${LINKS.email}`}
            </a>
            <a
              {...stylex.props(button.base, button.soft)}
              href={LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <footer {...stylex.props(styles.footer)} data-cut>
          <span>© 2026 Faqih Muntashir</span>
          <span>
            <a {...stylex.props(styles.footerLink)} href={LINKS.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>{" "}
            ·{" "}
            <a
              {...stylex.props(styles.footerLink)}
              href={LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>{" "}
            ·{" "}
            <a {...stylex.props(styles.footerLink)} href={LINKS.dribbble} target="_blank" rel="noopener noreferrer">
              Dribbble
            </a>{" "}
            ·{" "}
            <a {...stylex.props(styles.footerLink)} href="https://medium.com/@itsfaqih" target="_blank" rel="noopener noreferrer">
              Medium
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}

const STACKED = "@media (max-width: 960px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const LIFT = "translateY(-4px) rotate(-1deg)";

const marquee = stylex.keyframes({ to: { transform: "translate(-50%)" } });

const styles = stylex.create({
  ticker: {
    overflow: "hidden",
    backgroundColor: palette["--go"],
    color: palette["--on-accent"],
  },
  // Three sets per half (see TICKER_RUN) at the speed two sets once ran in 26s.
  tickerTrack: {
    display: "flex",
    width: "max-content",
    animationName: marquee,
    animationDuration: "64s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    userSelect: "none",
  },
  // Tiles butt edge to edge so the band reads as one striped bar.
  tickerTile: {
    font: `900 22px/56px ${fonts["--display"]}`,
    paddingBlock: 0,
    paddingInline: "28px",
    backgroundColor: "var(--c)",
    whiteSpace: "nowrap",
  },
  // useCutIns sets .paused on the band while it is off screen (arcade.css pauses the band itself).
  pausable: {
    animationPlayState: { default: null, ":is(.paused *)": "paused !important" },
  },
  projects: {
    display: "grid",
    gridTemplateColumns: { default: "repeat(4, 1fr)", [STACKED]: "1fr 1fr" },
    gap: "10px",
  },
  // A [data-cut] piece: hover, focus and press key on pseudo-classes, so its class list never
  // changes. It tilts up off its key, and sinks onto it while pressed.
  project: {
    position: "relative",
    borderRadius: "16px",
    padding: "16px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: {
      default: palette["--hair"],
      ":hover": "var(--c)",
      ":focus-visible": "var(--c)",
      ":active": "var(--c)",
    },
    boxShadow: {
      default: `${palette["--raise"]}, 0 4px 0 ${palette["--drop-ink"]}`,
      ":hover": `${palette["--raise"]}, 0 8px 0 var(--key)`,
      ":focus-visible": `${palette["--raise"]}, 0 8px 0 var(--key)`,
      ":active": `${palette["--raise"]}, 0 1px 0 var(--key)`,
    },
    transform: {
      default: null,
      ":hover": { default: LIFT, [REDUCE]: "none" },
      ":focus-visible": { default: LIFT, [REDUCE]: "none" },
      ":active": { default: "translateY(3px)", [REDUCE]: "none" },
    },
    outline: { default: null, ":focus-visible": `3px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-visible": "3px" },
    transitionProperty: "transform, box-shadow, border-color",
    transitionDuration: { default: "220ms, 220ms, 120ms", ":active": "100ms" },
    transitionTimingFunction: `${motion["--snap"]}, ${motion["--snap"]}, ease`,
    transitionDelay: "0s, 0s, 0s",
    transitionBehavior: "normal, normal, normal",
  },
  projectKind: {
    font: `700 11px ${fonts["--display"]}`,
    color: `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
  },
  projectTitle: {
    marginTop: "4px",
    marginInline: 0,
    marginBottom: "2px",
    font: `700 17px ${fonts["--display"]}`,
    color: palette["--text"],
  },
  projectSummary: {
    margin: 0,
    fontSize: "14px",
  },
  contact: {
    marginTop: "24px",
    marginInline: 0,
    marginBottom: "48px",
    borderRadius: "28px",
    padding: { default: "48px", [STACKED]: "28px" },
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--go"],
    boxShadow: `${palette["--raise"]}, 0 5px 0 ${palette["--go-shadow"]}`,
  },
  footer: {
    fontSize: "13px",
    color: palette["--mute"],
    paddingBottom: "32px",
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  footerLink: {
    color: { default: null, ":hover": palette["--text"] },
  },
});
