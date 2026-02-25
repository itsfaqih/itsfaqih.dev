import { DrawerPreview as Drawer } from "@base-ui/react/drawer";
import { PreviewCard } from "@base-ui/react/preview-card";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
export const Route = createFileRoute("/")({
  component: Home,
});

const linkPreviewHandle = PreviewCard.createHandle<string>();
const NAME_LINES = ["Faqih", "Muntashir."] as const;
const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+-=";
const INTRO_TOTAL_FRAMES = 30;
const INTRO_TICK_MS = 45;
const REVEAL_BUFFER = 2;
const EXPERIENCE_INTRO_TOTAL_FRAMES = 36;
const EXPERIENCE_INTRO_TICK_MS = 40;
const EXPERIENCE_CARD_INTRO_MS = 920;
const EXPERIENCE_ITEM_STAGGER_STEP_MS = 75;
const EXPERIENCE_DETAIL_STAGGER_MS = 100;
const EXPERIENCE_DETAIL_OBJECTIVE_OFFSET_MS = 420;
const EXPERIENCE_DETAIL_SKILL_OFFSET_MS = 560;
const EXPERIENCE_OBJECTIVE_STAGGER_MS = 70;
const EXPERIENCE_SKILL_STAGGER_MS = 60;

type LinkMetadata = {
  title: string;
  description: string;
  image: React.ReactNode;
};

type PopupContentProps = {
  href: string;
};

type ExternalLinkProps = {
  href: string;
  children: React.ReactNode;
};

type ScrambleLockTextProps = {
  finalText: string;
  renderedText: string;
  block?: boolean;
  edgeBleed?: boolean;
  allowMarquee?: boolean;
};

type ScrambleTextSegment = {
  final: string;
  rendered: string;
  isWhitespace: boolean;
};

type TechTag =
  | "react"
  | "typescript"
  | "tailwindcss"
  | "postgresql"
  | "aws"
  | "express"
  | "mongodb"
  | "laravel"
  | "vue"
  | "php"
  | "figma";

type MissionStatus = "completed" | "in-progress";

type ExperienceItem = {
  title: string;
  subtitle: string;
  date: string;
  status: MissionStatus;
  description: readonly string[];
  tags: readonly TechTag[];
};

const EXPERIENCES = [
  {
    title: "Mid Software Engineer",
    subtitle: "EvidenceCare",
    date: "Sep 2024 - Present",
    status: "in-progress",
    description: [
      "Authored technical documentation for service scaffolding, reverse proxy configuration, and semantic release pipelines.",
      "Built an automated PR reviewer to validate database permissions and reduce runtime errors.",
      "Modernized tooling and upgraded dependencies across all TypeScript codebases.",
      "Optimized Docker image builds, reducing image size by approximately 30%.",
    ],
    tags: [
      "react",
      "typescript",
      "tailwindcss",
      "postgresql",
      "aws",
      "express",
    ] as const,
  },
  {
    title: "Full Stack Engineer",
    subtitle: "VESTIS LABS",
    date: "Sep 2023 - Sep 2024",
    status: "completed",
    description: [
      "Reduced API calls by caching with React Query.",
      "Created e2e tests with 70%+ coverage using Playwright.",
      "Overhauled app design with glassmorphism and micro-interactions.",
      "Built a custom drag-and-drop page builder from scratch.",
    ],
    tags: ["react", "typescript", "tailwindcss", "mongodb", "express"] as const,
  },
  {
    title: "Full Stack Engineer",
    subtitle: "Jatis Mobile",
    date: "Sep 2022 - Aug 2023",
    status: "completed",
    description: [
      "Built a client-side chatbot using XState and a chatbot flow builder with React Flow.",
      "Led a team of 4 developers.",
      "Recognized as top-performer of Q4 2022.",
    ],
    tags: ["react", "typescript", "tailwindcss"] as const,
  },
  {
    title: "Founding Project Manager & Full-stack Developer",
    subtitle: "Rapidev",
    date: "Dec 2021 - Aug 2022",
    status: "completed",
    description: [
      "Managed a product team of 10 for early-stage startups.",
      "Integrated Xendit and Midtrans payment gateways.",
      "Achieved 80% load time reduction through optimization.",
    ],
    tags: ["react", "typescript", "laravel"] as const,
  },
  {
    title: "Full Stack Engineer",
    subtitle: "Freelance",
    date: "Feb 2020 - Dec 2021",
    status: "completed",
    description: [
      "Built applications for LPP Polytechnic Yogyakarta using Laravel, React, Vue, and InertiaJS.",
      "Crafted custom WordPress/Blogger templates and translated Figma designs to pixel-perfect websites.",
    ],
    tags: ["react", "vue", "laravel", "php"] as const,
  },
  {
    title: "Frontend Engineer",
    subtitle: "Mitra Integrasi Informatika",
    date: "Sep 2020 - Feb 2021",
    status: "completed",
    description: [
      "Implemented JWT authentication for multiple projects.",
      "Performed code reviews and managed repositories.",
      "Designed admin dashboard UI using Figma.",
    ],
    tags: ["react", "typescript", "figma"] as const,
  },
] as const satisfies readonly ExperienceItem[];

const EXPERIENCE_SCRAMBLE_DURATION_MS =
  EXPERIENCE_INTRO_TOTAL_FRAMES * EXPERIENCE_INTRO_TICK_MS;
const EXPERIENCE_MAX_OBJECTIVES = Math.max(
  ...EXPERIENCES.map((item) => item.description.length),
);
const EXPERIENCE_MAX_TAGS = Math.max(
  ...EXPERIENCES.map((item) => item.tags.length),
);
const EXPERIENCE_MAX_DELAY_MS = Math.max(
  (EXPERIENCES.length - 1) * EXPERIENCE_ITEM_STAGGER_STEP_MS,
  EXPERIENCE_DETAIL_OBJECTIVE_OFFSET_MS +
    Math.max(0, EXPERIENCE_MAX_OBJECTIVES - 1) *
      EXPERIENCE_OBJECTIVE_STAGGER_MS,
  EXPERIENCE_DETAIL_SKILL_OFFSET_MS +
    Math.max(0, EXPERIENCE_MAX_TAGS - 1) * EXPERIENCE_SKILL_STAGGER_MS,
);
const TOTAL_MISSION_COUNT = EXPERIENCES.length;
const IN_PROGRESS_MISSION_COUNT = EXPERIENCES.filter(
  (experience) => experience.status === "in-progress",
).length;
const COMPLETED_MISSION_COUNT = TOTAL_MISSION_COUNT - IN_PROGRESS_MISSION_COUNT;

function scrambleText(target: string, revealCount: number): string {
  return target
    .split("")
    .map((char, index) => {
      if (char === " ") {
        return char;
      }
      if (index < revealCount) {
        return char;
      }
      return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    })
    .join("");
}

function scrambleByProgress(target: string, progress: number): string {
  if (progress >= 1) {
    return target;
  }

  const revealCount = Math.floor(target.length * progress);
  return scrambleText(target, revealCount);
}

function Home(): React.JSX.Element {
  const [nameLines, setNameLines] = React.useState(() =>
    NAME_LINES.map((line) => scrambleText(line, 0)),
  );
  const [isIntroDone, setIsIntroDone] = React.useState(false);
  const [introProgress, setIntroProgress] = React.useState(0);
  const [selectedExperienceIndex, setSelectedExperienceIndex] =
    React.useState(0);
  const [isMissionDrawerOpen, setIsMissionDrawerOpen] = React.useState(false);
  const [isExperienceVisible, setIsExperienceVisible] = React.useState(false);
  const [isExperienceItemsVisible, setIsExperienceItemsVisible] =
    React.useState(false);
  const [experienceScrambleNow, setExperienceScrambleNow] = React.useState<
    number | null
  >(null);
  const experienceSectionRef = React.useRef<HTMLElement | null>(null);
  const experienceScrambleStartRef = React.useRef<number | null>(null);
  const selectedExperience = EXPERIENCES[selectedExperienceIndex];

  React.useEffect(() => {
    let frame = 0;
    const maxLineLength = Math.max(...NAME_LINES.map((line) => line.length));

    const intervalId = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / INTRO_TOTAL_FRAMES, 1);
      const revealCount = Math.floor(
        (frame / INTRO_TOTAL_FRAMES) * (maxLineLength + REVEAL_BUFFER),
      );
      setIntroProgress(progress);

      setNameLines(NAME_LINES.map((line) => scrambleText(line, revealCount)));

      if (frame >= INTRO_TOTAL_FRAMES) {
        window.clearInterval(intervalId);
        setNameLines([...NAME_LINES]);
        setIntroProgress(1);
        setIsIntroDone(true);
      }
    }, INTRO_TICK_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    const section = experienceSectionRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsExperienceVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isExperienceVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsExperienceItemsVisible(true);
    }, EXPERIENCE_CARD_INTRO_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isExperienceVisible]);

  React.useEffect(() => {
    if (!isExperienceItemsVisible) {
      return;
    }

    const startTime = window.performance.now();
    experienceScrambleStartRef.current = startTime;
    setExperienceScrambleNow(startTime);

    const intervalId = window.setInterval(() => {
      const now = window.performance.now();
      setExperienceScrambleNow(now);

      if (
        now - startTime >=
        EXPERIENCE_MAX_DELAY_MS + EXPERIENCE_SCRAMBLE_DURATION_MS
      ) {
        window.clearInterval(intervalId);
      }
    }, EXPERIENCE_INTRO_TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [isExperienceItemsVisible]);

  function scrambleDescription(text: string): string {
    return scrambleByProgress(text, introProgress);
  }

  function renderIntroText(
    text: string,
    options?: { block?: boolean },
  ): React.ReactNode {
    const rendered = scrambleDescription(text);
    if (rendered === text) {
      return text;
    }

    return (
      <ScrambleLockText
        finalText={text}
        renderedText={rendered}
        block={options?.block}
      />
    );
  }

  function scrambleExperienceCardText(text: string, delayMs = 0): string {
    const startTime = experienceScrambleStartRef.current;
    if (startTime === null || experienceScrambleNow === null) {
      return text;
    }

    const elapsed = experienceScrambleNow - startTime - delayMs;
    if (elapsed <= 0) {
      return text;
    }

    const progress = Math.min(elapsed / EXPERIENCE_SCRAMBLE_DURATION_MS, 1);
    return scrambleByProgress(text, progress);
  }

  function renderExperienceCardText(
    text: string,
    options?: {
      block?: boolean;
      delayMs?: number;
      edgeBleed?: boolean;
      allowMarquee?: boolean;
    },
  ): React.ReactNode {
    const rendered = scrambleExperienceCardText(text, options?.delayMs ?? 0);
    const hasScrambleStarted = experienceScrambleStartRef.current !== null;
    if (!hasScrambleStarted) {
      return text;
    }

    return (
      <ScrambleLockText
        finalText={text}
        renderedText={rendered}
        block={options?.block}
        edgeBleed={options?.edgeBleed}
        allowMarquee={options?.allowMarquee}
      />
    );
  }

  function selectMission(index: number): void {
    setSelectedExperienceIndex(index);
    setIsMissionDrawerOpen(false);
  }

  function renderMissionStatusBadge(
    status: MissionStatus,
    options?: { active?: boolean; compact?: boolean },
  ): React.JSX.Element {
    const isActive = options?.active ?? false;
    const isCompact = options?.compact ?? false;
    const label = status === "in-progress" ? "In Progress" : "Completed";
    const sizeClass = isCompact
      ? "px-2 py-0.5 text-[0.58rem] @xl:text-[0.62rem]"
      : "px-2.5 py-1 text-[0.62rem] @xl:text-[0.68rem]";
    const toneClass = isActive
      ? "border-current/35 bg-current/10 text-current"
      : status === "in-progress"
        ? "border-amber-500/40 bg-amber-500/12 text-amber-700 dark:text-amber-300"
        : "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

    return (
      <span
        className={`inline-flex items-center rounded-full border font-semibold uppercase tracking-[0.12em] ${sizeClass} ${toneClass}`}
      >
        {label}
      </span>
    );
  }

  function renderMissionButton(
    index: number,
    options?: { animated?: boolean },
  ): React.JSX.Element {
    const experience = EXPERIENCES[index];
    const isActive = index === selectedExperienceIndex;
    const missionDelay = index * EXPERIENCE_ITEM_STAGGER_STEP_MS;
    const shouldAnimate = options?.animated ?? true;

    return (
      <button
        key={`${experience.subtitle}-${experience.date}`}
        type="button"
        onClick={() => selectMission(index)}
        className={`${shouldAnimate ? "mission-item-intro " : ""}text-left rounded-md border px-4 py-3 @xl:px-5 @xl:py-4 transition-colors ${
          isActive
            ? "border-foreground bg-foreground text-background"
            : "border-foreground/20 hover:border-foreground/50 hover:bg-foreground/5"
        }`}
        style={
          shouldAnimate
            ? ({
                "--mission-delay": `${missionDelay}ms`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-base @xl:text-lg font-medium tracking-wide whitespace-nowrap">
            {renderExperienceCardText(experience.subtitle, {
              delayMs: missionDelay,
            })}
          </span>
          <span className="text-sm @xl:text-base opacity-80">
            {renderExperienceCardText(`#${index + 1}`, {
              delayMs: missionDelay,
            })}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-sm @xl:text-base opacity-70 whitespace-nowrap">
            {renderExperienceCardText(experience.date, {
              delayMs: missionDelay,
            })}
          </span>
          {renderMissionStatusBadge(experience.status, {
            active: isActive,
            compact: true,
          })}
        </div>
      </button>
    );
  }

  return (
    <main className="pt-8 lg:pt-12">
      <section className="@container max-w-6xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl @xl:text-6xl @3xl:text-8xl font-bold">
          {nameLines.map((line, index) => (
            <span
              key={NAME_LINES[index]}
              className="name-glitch-line"
              data-text={line}
              data-state={isIntroDone ? "settled" : "intro"}
            >
              {line}
            </span>
          ))}
        </h1>
        <div className="text-lg @xl:text-xl @3xl:text-3xl pt-4 @xl:pt-6 @3xl:pt-10 pb-8 flex flex-col gap-4 leading-relaxed text-pretty">
          <p>
            {renderIntroText(
              "Full-stack engineer based in Yogyakarta, Indonesia with 5+ years of professional experience. Currently building healthcare software at ",
            )}
            <ExternalLink href="https://evidencecare.com">
              {renderIntroText("EvidenceCare")}
            </ExternalLink>
            {renderIntroText(" for the US market.")}
          </p>
          <p>
            {renderIntroText("Created ")}
            <ExternalLink href="https://github.com/itsfaqih/fama">
              {renderIntroText("Fama")}
            </ExternalLink>
            {renderIntroText(
              ", an open source portfolio template with 230+ GitHub stars and 48 forks. Built ",
            )}
            <ExternalLink href="https://schemata.ruine.app">
              {renderIntroText("Schemata")}
            </ExternalLink>
            {renderIntroText(
              ", a drag-and-drop ERD builder for visual database schema design.",
            )}
          </p>
          <p>
            {renderIntroText(
              "Led cross-functional product teams of 10 engineers and designers. Recognized as top performer at ",
            )}
            <ExternalLink href="https://jatismobile.com/">
              {renderIntroText("Jatis Mobile")}
            </ExternalLink>
            {renderIntroText(
              " (Q4 2022). Contributed to the Indonesian PHP community through ",
            )}
            <ExternalLink href="https://www.figma.com/design/qNIg0A9h7PnrFdOVSBbMEH/PHPID-Online-Learning-Redesign?node-id=0-1&t=PcPvOnrKzLginYqa-1">
              {renderIntroText("UI design work")}
            </ExternalLink>
            {renderIntroText(" for ")}
            <ExternalLink href="https://github.com/phpid-jakarta/phpid-learning">
              {renderIntroText("PHPID Learning")}
            </ExternalLink>
            {renderIntroText(".")}
          </p>

          <PreviewCard.Root<string> handle={linkPreviewHandle}>
            {({ payload }) => (
              <PreviewCard.Portal>
                <PreviewCard.Positioner sideOffset={8} side="top">
                  <PreviewCard.Popup className="rounded-xl bg-background border overflow-hidden w-80 max-w-[90vw] p-0 outline-none opacity-100 scale-100 transition-[opacity,transform] duration-200 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 data-[side=top]:origin-bottom data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left">
                    {payload && <PopupContent href={payload} />}
                  </PreviewCard.Popup>
                </PreviewCard.Positioner>
              </PreviewCard.Portal>
            )}
          </PreviewCard.Root>
        </div>

        <section
          ref={experienceSectionRef}
          className={`pt-10 @xl:pt-16 pb-14 @xl:pb-20 ${isExperienceVisible ? "experience-visible" : ""} ${isExperienceItemsVisible ? "experience-items-visible" : ""}`}
        >
          <div className="mb-10 @xl:mb-14 flex justify-center">
            <h2 className="text-center text-4xl @xl:text-7xl font-bold tracking-wide">
              {isExperienceVisible ? "Experience" : ""}
            </h2>
          </div>

          <article className="lg:-mx-24 flex flex-col gap-1 @xl:gap-4 lg:flex-row lg:items-start">
            <div className="mission-card-intro mission-card-intro-list mission-card-surface mission-card-border rounded-lg p-3 @xl:p-4 lg:w-[25rem] lg:shrink-0 lg:[transform:perspective(1200px)_rotateY(6deg)]">
              <div>
                <div className="text-base uppercase tracking-[0.2em] opacity-60 px-2 py-1">
                  {renderExperienceCardText("Missions")}
                </div>
                <div className="px-2 py-1 flex flex-wrap gap-1.5 @xl:gap-2 text-[0.58rem] @xl:text-[0.66rem] uppercase tracking-[0.14em] opacity-85">
                  <span className="rounded-full border border-foreground/20 px-2 py-0.5 @xl:px-2.5 @xl:py-1">
                    {renderExperienceCardText(`${TOTAL_MISSION_COUNT} Total`)}
                  </span>
                  <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 @xl:px-2.5 @xl:py-1 text-emerald-700 dark:text-emerald-300">
                    {renderExperienceCardText(
                      `${COMPLETED_MISSION_COUNT} Completed`,
                    )}
                  </span>
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/12 px-2 py-0.5 @xl:px-2.5 @xl:py-1 text-amber-700 dark:text-amber-300">
                    {renderExperienceCardText(
                      `${IN_PROGRESS_MISSION_COUNT} In Progress`,
                    )}
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-2 md:max-lg:hidden">
                  {EXPERIENCES.map((_, index) => renderMissionButton(index))}
                </div>
                <div className="mt-2 hidden md:max-lg:flex md:max-lg:flex-col md:max-lg:gap-2">
                  {renderMissionButton(selectedExperienceIndex)}

                  <Drawer.Root
                    open={isMissionDrawerOpen}
                    onOpenChange={setIsMissionDrawerOpen}
                    swipeDirection="down"
                  >
                    <Drawer.Trigger className="rounded-md border border-foreground/35 px-4 py-3 text-sm uppercase tracking-[0.18em] text-left hover:border-foreground/60 hover:bg-foreground/5 transition-colors">
                      {renderExperienceCardText("View More")}
                    </Drawer.Trigger>
                    <Drawer.Portal>
                      <Drawer.Backdrop className="fixed inset-0 z-40 bg-background/65 backdrop-blur-[1.5px] transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
                      <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center p-3 md:p-5">
                        <Drawer.Popup className="mission-drawer-popup w-full max-w-2xl rounded-t-xl bg-background border border-foreground/20 shadow-2xl outline-none">
                          <Drawer.Content className="max-h-[75vh] overflow-y-auto p-3">
                            <div className="mb-2 flex items-center justify-between px-1">
                              <Drawer.Title className="text-base uppercase tracking-[0.2em] opacity-60">
                                Missions
                              </Drawer.Title>
                              <Drawer.Close className="rounded-md border border-foreground/25 px-3 py-1.5 text-xs uppercase tracking-[0.14em] hover:border-foreground/50 hover:bg-foreground/5 transition-colors">
                                Close
                              </Drawer.Close>
                            </div>
                            <div className="flex flex-col gap-2 pb-1">
                              {EXPERIENCES.map((_, index) =>
                                renderMissionButton(index, { animated: false }),
                              )}
                            </div>
                          </Drawer.Content>
                        </Drawer.Popup>
                      </Drawer.Viewport>
                    </Drawer.Portal>
                  </Drawer.Root>
                </div>
              </div>
            </div>

            <article className="mission-card-intro mission-card-intro-detail mission-card-surface mission-card-border rounded-lg w-full p-5 @xl:p-8 lg:flex-1 lg:max-w-[calc(100%-6rem)] lg:[transform:perspective(1200px)_rotateY(-6deg)]">
              <div
                key={selectedExperienceIndex}
                className={`${
                  isExperienceItemsVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex flex-col items-start gap-3">
                  <div className="min-w-0 w-full">
                    <div
                      className="mission-detail-stagger text-3xl @xl:text-5xl font-bold whitespace-nowrap [--scramble-edge-bleed-inline:1.25rem] @xl:[--scramble-edge-bleed-inline:2rem]"
                      style={{ "--detail-delay": "0ms" } as React.CSSProperties}
                    >
                      {renderExperienceCardText(selectedExperience.title, {
                        block: true,
                        delayMs: 0,
                        edgeBleed: true,
                        allowMarquee: true,
                      })}
                    </div>
                    <div
                      className="mission-detail-stagger mt-3 text-lg @xl:text-2xl opacity-80"
                      style={
                        {
                          "--detail-delay": `${EXPERIENCE_DETAIL_STAGGER_MS}ms`,
                        } as React.CSSProperties
                      }
                    >
                      {renderExperienceCardText(selectedExperience.subtitle, {
                        block: true,
                        delayMs: EXPERIENCE_DETAIL_STAGGER_MS,
                      })}
                    </div>
                  </div>
                  <div
                    className="mission-detail-stagger flex items-center gap-2.5 text-base @xl:text-lg uppercase tracking-widest opacity-70 whitespace-nowrap"
                    style={
                      {
                        "--detail-delay": `${EXPERIENCE_DETAIL_STAGGER_MS * 2}ms`,
                      } as React.CSSProperties
                    }
                  >
                    <span>
                      {renderExperienceCardText(selectedExperience.date, {
                        delayMs: EXPERIENCE_DETAIL_STAGGER_MS * 2,
                      })}
                    </span>
                    {renderMissionStatusBadge(selectedExperience.status)}
                  </div>
                </div>

                <div
                  className="mission-detail-stagger mt-5 @xl:mt-7"
                  style={
                    {
                      "--detail-delay": `${EXPERIENCE_DETAIL_STAGGER_MS * 3}ms`,
                    } as React.CSSProperties
                  }
                >
                  <div className="text-base uppercase tracking-[0.2em] opacity-60 mb-3">
                    {renderExperienceCardText("Objectives", {
                      delayMs: EXPERIENCE_DETAIL_STAGGER_MS * 3,
                    })}
                  </div>
                  <ul className="space-y-3">
                    {selectedExperience.description.map((item, index) => (
                      <li
                        key={item}
                        className="mission-objective-stagger text-lg @xl:text-xl leading-relaxed flex gap-3"
                        style={
                          {
                            "--objective-delay": `${index * EXPERIENCE_OBJECTIVE_STAGGER_MS}ms`,
                          } as React.CSSProperties
                        }
                      >
                        <span className="opacity-60 mt-[2px]">▸</span>
                        <span>
                          {renderExperienceCardText(item, {
                            block: true,
                            delayMs:
                              EXPERIENCE_DETAIL_OBJECTIVE_OFFSET_MS +
                              index * EXPERIENCE_OBJECTIVE_STAGGER_MS,
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className="mission-detail-stagger mt-6 @xl:mt-8"
                  style={
                    {
                      "--detail-delay": `${EXPERIENCE_DETAIL_OBJECTIVE_OFFSET_MS}ms`,
                    } as React.CSSProperties
                  }
                >
                  <div className="text-base uppercase tracking-[0.2em] opacity-60 mb-3">
                    {renderExperienceCardText("Loadout", {
                      delayMs: EXPERIENCE_DETAIL_OBJECTIVE_OFFSET_MS,
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedExperience.tags.map((tag, index) => (
                      <span
                        key={tag}
                        className="mission-skill-stagger text-sm @xl:text-base uppercase tracking-wider border border-foreground/25 rounded px-3 py-1.5 bg-foreground/[0.04]"
                        style={
                          {
                            "--skill-delay": `${index * EXPERIENCE_SKILL_STAGGER_MS}ms`,
                          } as React.CSSProperties
                        }
                      >
                        {renderExperienceCardText(tag, {
                          delayMs:
                            EXPERIENCE_DETAIL_SKILL_OFFSET_MS +
                            index * EXPERIENCE_SKILL_STAGGER_MS,
                        })}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </article>
        </section>
      </section>
    </main>
  );
}

function ScrambleLockText({
  finalText,
  renderedText,
  block = false,
  edgeBleed = false,
  allowMarquee = false,
}: ScrambleLockTextProps): React.JSX.Element {
  const wrapperRef = React.useRef<HTMLSpanElement | null>(null);
  const trackRef = React.useRef<HTMLSpanElement | null>(null);
  const [marqueeDistancePx, setMarqueeDistancePx] = React.useState(0);

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track || !block || !allowMarquee) {
      setMarqueeDistancePx(0);
      return;
    }

    const measure = () => {
      const distance = Math.max(0, track.scrollWidth - wrapper.clientWidth);
      setMarqueeDistancePx(distance > 8 ? distance : 0);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    observer.observe(track);

    return () => observer.disconnect();
  }, [allowMarquee, block, finalText]);

  const inlineSegments = React.useMemo(() => {
    if (block) {
      return null;
    }

    const finalSegments = finalText.split(/(\s+)/);
    const renderedSegments = renderedText.split(/(\s+)/);
    if (finalSegments.length !== renderedSegments.length) {
      return null;
    }

    return finalSegments.map(
      (segment, index): ScrambleTextSegment => ({
        final: segment,
        rendered: renderedSegments[index] ?? segment,
        isWhitespace: /\s+/.test(segment),
      }),
    );
  }, [block, finalText, renderedText]);

  if (!block) {
    if (!inlineSegments) {
      return <span>{renderedText}</span>;
    }

    return (
      <span className="scramble-lock-text scramble-lock-text-inline">
        {inlineSegments.map((segment, index) => (
          <React.Fragment key={`${index}-${segment.final}`}>
            {segment.isWhitespace ? (
              segment.final
            ) : (
              <span className="scramble-lock-inline-word">
                <span className="scramble-lock-text-base">{segment.final}</span>
                <span className="scramble-lock-text-overlay" aria-hidden="true">
                  {segment.rendered}
                </span>
              </span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  }

  const marqueeDurationSec = Math.max(4.5, marqueeDistancePx / 30 + 1.8);

  return (
    <span
      ref={wrapperRef}
      className={`scramble-lock-text ${block ? "scramble-lock-text-block" : ""} ${block && allowMarquee ? "scramble-lock-text-block-nowrap" : ""} ${edgeBleed ? "scramble-lock-text-edge-bleed" : ""} ${marqueeDistancePx > 0 ? "scramble-lock-text-marquee" : ""}`}
      style={
        marqueeDistancePx > 0
          ? ({
              "--scramble-marquee-distance": `-${marqueeDistancePx}px`,
              "--scramble-marquee-duration": `${marqueeDurationSec}s`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <span ref={trackRef} className="scramble-lock-text-track">
        <span className="scramble-lock-text-base">{finalText}</span>
        <span className="scramble-lock-text-overlay" aria-hidden="true">
          {renderedText}
        </span>
      </span>
    </span>
  );
}

function PopupContent({ href }: PopupContentProps): React.JSX.Element {
  const metadata = LINK_METADATA[href];

  if (metadata) {
    return (
      <div className="flex flex-col">
        {metadata.image}
        <div className="p-4 bg-linear-to-b from-transparent to-background">
          <h3 className="font-semibold text-foreground text-lg leading-tight mb-1">
            {metadata.title}
          </h3>
          <p className="text-sm text-foreground">{metadata.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-background">
      <p className="text-sm text-foreground break-all">{href}</p>
    </div>
  );
}

const LINK_METADATA: Record<string, LinkMetadata> = {
  "https://evidencecare.com": {
    title: "EvidenceCare",
    description:
      "A healthcare technology company that optimizes clinical workflows and empowers better care decisions through their EHR-integrated platform.",
    image: (
      <img
        src="/preview-images/evidencecare-logo.webp"
        alt="EvidenceCare Logo"
        className="w-full h-full p-4 object-cover drop-shadow-[2px_2px_0_white,-2px_-2px_0_white,2px_-2px_0_white,-2px_2px_0_white]"
      />
    ),
  },
  "https://github.com/itsfaqih/fama": {
    title: "Fama",
    description:
      "A minimal, clean personal branding portfolio template built with React, TailwindCSS, and Framer Motion.",
    image: (
      <img
        src="/preview-images/fama.webp"
        alt="Fama Design Preview"
        className="w-full h-full object-cover"
      />
    ),
  },
  "https://schemata.ruine.app": {
    title: "Schemata",
    description:
      "Developer-friendly Entity Relationship Diagram (ERD) builder with a beautiful interface.",
    image: (
      <img
        src="/preview-images/schemata.webp"
        alt="Schemata App Preview"
        className="w-full h-full object-cover"
      />
    ),
  },
  "https://jatismobile.com/": {
    title: "Jatis Mobile",
    description:
      "Indonesia's leading digital communication and distribution company, specializing in WhatsApp Business API, AI chatbots, and omnichannel messaging.",
    image: (
      <img
        src="/preview-images/jatis-mobile-logo.webp"
        alt="Jatis Mobile Logo"
        className="w-full h-full object-cover"
      />
    ),
  },
  "https://github.com/phpid-jakarta/phpid-learning": {
    title: "PHPID Learning",
    description:
      "Open source repository for the Indonesian PHP community's online learning sessions, including schedules and resources.",
    image: (
      <img
        src="/preview-images/phpid-online-learning-logo.webp"
        alt="PHPID Learning Logo"
        className="w-full h-full object-cover"
      />
    ),
  },
  "https://www.figma.com/design/qNIg0A9h7PnrFdOVSBbMEH/PHPID-Online-Learning-Redesign?node-id=0-1&t=PcPvOnrKzLginYqa-1":
    {
      title: "PHPID Learning Redesign",
      description:
        "Redesign of the Indonesian PHP community's online learning sessions.",
      image: (
        <img
          src="/preview-images/phpid-learning-redesign.webp"
          alt="PHPID Learning Redesign Preview"
          className="w-full h-full object-cover"
        />
      ),
    },
};

function ExternalLink({
  href,
  children,
}: ExternalLinkProps): React.JSX.Element {
  return (
    <PreviewCard.Trigger
      handle={linkPreviewHandle}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group underline underline-offset-4 inline-flex items-center decoration-gray-400 hover:decoration-gray-800 transition-colors cursor-pointer"
      payload={href}
    >
      {children}
      <ArrowUpRightIcon className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform opacity-60 ml-0.5" />
    </PreviewCard.Trigger>
  );
}
