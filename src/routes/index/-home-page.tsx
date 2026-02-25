import { DrawerPreview as Drawer } from "@base-ui/react/drawer";
import { PreviewCard } from "@base-ui/react/preview-card";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import React from "react";
import { flushSync } from "react-dom";
import {
  ExternalLink,
  PopupContent,
  linkPreviewHandle,
} from "./-components/link-preview";
import { ScrambleText } from "./-components/scramble-text";
import type {
  ExperienceItem,
  MissionStatus,
  TechDragSource,
  TechPreviewPayload,
  TechSlotBaseProps,
  TechSlotStateProps,
  TechSlotsState,
  TechStackItem,
  TechTag,
} from "./-types/home-types";
import {
  createTechSlotId,
  getDistanceFromPointToRect,
  getTechIconSrc,
  isSameTechDragSource,
  parseTechSlotId,
  scrambleByProgress,
  scrambleText,
} from "./-utils/home-utils";

const techPreviewHandle = PreviewCard.createHandle<string>();
const NAME_LINES = ["Faqih", "Muntashir."] as const;
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

const TECH_STACK = [
  {
    name: "TypeScript",
    icon: "typescript",
    color: "#3178C6",
    category: "Frontend",
  },
  { name: "React", icon: "react", color: "#61DAFB", category: "Frontend" },
  { name: "Astro", icon: "astro", color: "#FF5D01", category: "Frontend" },
  {
    name: "Tailwind CSS",
    icon: "tailwindcss",
    color: "#06B6D4",
    category: "Frontend",
  },
  { name: "Laravel", icon: "laravel", color: "#FF2D20", category: "Backend" },
  { name: "MySQL", icon: "mysql", color: "#4479A1", category: "Backend" },
  { name: "PHP", icon: "php", color: "#777BB4", category: "Backend" },
  {
    name: "PostgreSQL",
    icon: "postgresql",
    color: "#4169E1",
    category: "Backend",
  },
  { name: "Node.js", icon: "nodedotjs", color: "#339933", category: "Backend" },
  { name: "Express", icon: "express", color: "#000000", category: "Backend" },
  { name: "Figma", icon: "figma", color: "#F24E1E", category: "Design Tools" },
] as const satisfies readonly TechStackItem[];

const TECH_INVENTORY_SLOT_COUNT = 25;
const TECH_HOTBAR_SLOT_COUNT = 9;
const TECH_DROP_SNAP_DISTANCE_PX = 22;
const HOTBAR_TECH_NAMES = [
  "TypeScript",
  "React",
  "Tailwind CSS",
  "PostgreSQL",
  "Node.js",
  "Express",
] as const;
const TECH_STACK_BY_NAME = new Map(
  TECH_STACK.map((item) => [item.name, item] as const),
);
const HOTBAR_ACTIVE_ITEMS = HOTBAR_TECH_NAMES.flatMap((name) => {
  const item = TECH_STACK_BY_NAME.get(name);
  return item ? [item] : [];
});
const HOTBAR_ACTIVE_ITEM_NAMES = new Set(
  HOTBAR_ACTIVE_ITEMS.map((item) => item.name),
);
const INVENTORY_ONLY_ITEMS = TECH_STACK.filter(
  (item) => !HOTBAR_ACTIVE_ITEM_NAMES.has(item.name),
);
const TECH_INVENTORY_SLOTS = Array.from(
  { length: TECH_INVENTORY_SLOT_COUNT },
  (_, index) => INVENTORY_ONLY_ITEMS[index] ?? null,
);
const TECH_HOTBAR_SLOTS = Array.from(
  { length: TECH_HOTBAR_SLOT_COUNT },
  (_, index) => HOTBAR_ACTIVE_ITEMS[index] ?? null,
);
const TECH_TAG_BY_ICON: Record<string, TechTag | undefined> = {
  typescript: "typescript",
  react: "react",
  astro: undefined,
  tailwindcss: "tailwindcss",
  laravel: "laravel",
  mysql: undefined,
  php: "php",
  postgresql: "postgresql",
  nodedotjs: undefined,
  express: "express",
  figma: "figma",
};
const TECH_PREVIEW_LOOKUP: Record<string, TechPreviewPayload> = Object.fromEntries(
  TECH_STACK.map((item) => {
    const mappedTag = TECH_TAG_BY_ICON[item.icon];
    const usedIn = mappedTag
      ? EXPERIENCES.filter((experience) =>
          (experience.tags as readonly TechTag[]).includes(mappedTag),
        ).map((experience) => experience.subtitle)
      : [];
    return [
      item.name,
      {
        name: item.name,
        usedIn,
      } satisfies TechPreviewPayload,
    ];
  }),
);

export function HomePage(): React.JSX.Element {
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
  const [techSlots, setTechSlots] = React.useState<TechSlotsState>(() => ({
    inventory: [...TECH_INVENTORY_SLOTS],
    hotbar: [...TECH_HOTBAR_SLOTS],
  }));
  const [techDragSource, setTechDragSource] = React.useState<TechDragSource | null>(
    null,
  );
  const [draggedTechItem, setDraggedTechItem] = React.useState<TechStackItem | null>(
    null,
  );
  const [techDropTarget, setTechDropTarget] = React.useState<TechDragSource | null>(
    null,
  );
  const experienceSectionRef = React.useRef<HTMLElement | null>(null);
  const experienceScrambleStartRef = React.useRef<number | null>(null);
  const techSlotsRef = React.useRef(techSlots);
  const techDropTargetRef = React.useRef<TechDragSource | null>(null);
  const selectedExperience = EXPERIENCES[selectedExperienceIndex];
  const inventorySlots = techSlots.inventory;
  const hotbarSlots = techSlots.hotbar;

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

  React.useEffect(() => {
    techSlotsRef.current = techSlots;
  }, [techSlots]);

  React.useEffect(() => {
    techDropTargetRef.current = techDropTarget;
  }, [techDropTarget]);

  function scrambleDescription(text: string): string {
    return scrambleByProgress(text, introProgress);
  }

  function renderIntroInlineText(text: string): React.ReactNode {
    const rendered = scrambleDescription(text);
    if (rendered === text) {
      return text;
    }

    return <ScrambleText.Inline finalText={text} renderedText={rendered} />;
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

  function renderExperienceInlineText(text: string, delayMs = 0): React.ReactNode {
    const rendered = scrambleExperienceCardText(text, delayMs);
    const hasScrambleStarted = experienceScrambleStartRef.current !== null;
    if (!hasScrambleStarted) {
      return text;
    }

    return <ScrambleText.Inline finalText={text} renderedText={rendered} />;
  }

  function renderExperienceBlockText(text: string, delayMs = 0): React.ReactNode {
    const rendered = scrambleExperienceCardText(text, delayMs);
    const hasScrambleStarted = experienceScrambleStartRef.current !== null;
    if (!hasScrambleStarted) {
      return text;
    }

    return <ScrambleText.Block finalText={text} renderedText={rendered} />;
  }

  function renderExperienceMarqueeText(text: string, delayMs = 0): React.ReactNode {
    const rendered = scrambleExperienceCardText(text, delayMs);
    const hasScrambleStarted = experienceScrambleStartRef.current !== null;
    if (!hasScrambleStarted) {
      return text;
    }

    return <ScrambleText.Marquee finalText={text} renderedText={rendered} />;
  }

  function selectMission(index: number): void {
    setSelectedExperienceIndex(index);
    setIsMissionDrawerOpen(false);
  }

  function renderMissionStatusBadgeBase(
    status: MissionStatus,
    sizeClass: string,
    toneClass: string,
  ): React.JSX.Element {
    const label = status === "in-progress" ? "In Progress" : "Completed";

    return (
      <span
        className={`inline-flex items-center rounded-full border font-semibold uppercase tracking-[0.12em] ${sizeClass} ${toneClass}`}
      >
        {label}
      </span>
    );
  }

  function renderMissionStatusBadge(status: MissionStatus): React.JSX.Element {
    const toneClass =
      status === "in-progress"
        ? "border-amber-500/40 bg-amber-500/12 text-amber-700 dark:text-amber-300"
        : "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

    return renderMissionStatusBadgeBase(
      status,
      "px-2.5 py-1 text-[0.62rem] @xl:text-[0.68rem]",
      toneClass,
    );
  }

  function renderMissionStatusBadgeCompact(status: MissionStatus): React.JSX.Element {
    const toneClass =
      status === "in-progress"
        ? "border-amber-500/40 bg-amber-500/12 text-amber-700 dark:text-amber-300"
        : "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

    return renderMissionStatusBadgeBase(
      status,
      "px-2 py-0.5 text-[0.58rem] @xl:text-[0.62rem]",
      toneClass,
    );
  }

  function renderMissionStatusBadgeCompactSelected(
    status: MissionStatus,
  ): React.JSX.Element {
    return renderMissionStatusBadgeBase(
      status,
      "px-2 py-0.5 text-[0.58rem] @xl:text-[0.62rem]",
      "border-current/35 bg-current/10 text-current",
    );
  }

  function renderMissionButtonBase(
    index: number,
    variant: "animated" | "static",
  ): React.JSX.Element {
    const experience = EXPERIENCES[index];
    const isActive = index === selectedExperienceIndex;
    const missionDelay = index * EXPERIENCE_ITEM_STAGGER_STEP_MS;
    const isAnimated = variant === "animated";

    return (
      <button
        key={`${experience.subtitle}-${experience.date}`}
        type="button"
        onClick={() => selectMission(index)}
        className={`${isAnimated ? "mission-item-intro " : ""}text-left rounded-md border px-4 py-3 @xl:px-5 @xl:py-4 transition-colors ${
          isActive
            ? "border-foreground bg-foreground text-background"
            : "border-foreground/20 hover:border-foreground/50 hover:bg-foreground/5"
        }`}
        style={
          isAnimated
            ? ({
                "--mission-delay": `${missionDelay}ms`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-base @xl:text-lg font-medium tracking-wide whitespace-nowrap">
            {renderExperienceInlineText(experience.subtitle, missionDelay)}
          </span>
          <span className="text-sm @xl:text-base opacity-80">
            {renderExperienceInlineText(`#${index + 1}`, missionDelay)}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-sm @xl:text-base opacity-70 whitespace-nowrap">
            {renderExperienceInlineText(experience.date, missionDelay)}
          </span>
          {isActive
            ? renderMissionStatusBadgeCompactSelected(experience.status)
            : renderMissionStatusBadgeCompact(experience.status)}
        </div>
      </button>
    );
  }

  function renderAnimatedMissionButton(index: number): React.JSX.Element {
    return renderMissionButtonBase(index, "animated");
  }

  function renderStaticMissionButton(index: number): React.JSX.Element {
    return renderMissionButtonBase(index, "static");
  }

  const inventoryFilledCount = inventorySlots.reduce(
    (count, item) => (item ? count + 1 : count),
    0,
  );
  const isDraggingTechItem = techDragSource !== null;
  const isInventoryDropZoneActive = techDropTarget?.zone === "inventory";
  const isHotbarDropZoneActive = techDropTarget?.zone === "hotbar";
  const techDndSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    }),
  );
  const techCollisionDetection = React.useCallback(
    (args: Parameters<typeof closestCenter>[0]) => {
      const directPointerCollisions = pointerWithin(args);
      if (directPointerCollisions.length > 0) {
        return directPointerCollisions;
      }

      if (args.pointerCoordinates) {
        const { x, y } = args.pointerCoordinates;
        const nearbyDroppables = args.droppableContainers.filter((container) => {
          const rect = args.droppableRects.get(container.id);
          if (!rect) {
            return false;
          }

          const distance = getDistanceFromPointToRect(x, y, rect);
          return distance <= TECH_DROP_SNAP_DISTANCE_PX;
        });

        if (nearbyDroppables.length > 0) {
          return closestCenter({
            ...args,
            collisionRect: {
              top: y,
              right: x,
              bottom: y,
              left: x,
              width: 0,
              height: 0,
            },
            droppableContainers: nearbyDroppables,
          });
        }

        return [];
      }

      return closestCenter(args);
    },
    [],
  );

  const clearTechDragState = React.useCallback((): void => {
    techDropTargetRef.current = null;
    flushSync(() => {
      setTechDragSource(null);
      setDraggedTechItem(null);
      setTechDropTarget(null);
    });
  }, []);

  const swapTechSlots = React.useCallback(
    (source: TechDragSource, target: TechDragSource): void => {
      setTechSlots((current) => {
        const nextInventory = [...current.inventory];
        const nextHotbar = [...current.hotbar];
        const sourceSlots = source.zone === "inventory" ? nextInventory : nextHotbar;
        const targetSlots = target.zone === "inventory" ? nextInventory : nextHotbar;
        const sourceItem = sourceSlots[source.index];
        if (!sourceItem) {
          return current;
        }

        [sourceSlots[source.index], targetSlots[target.index]] = [
          targetSlots[target.index],
          sourceItem,
        ];

        const nextSlots: TechSlotsState = {
          inventory: nextInventory,
          hotbar: nextHotbar,
        };
        techSlotsRef.current = nextSlots;
        return nextSlots;
      });
    },
    [],
  );

  const handleTechDragStart = React.useCallback(
    (event: DragStartEvent): void => {
      const source = parseTechSlotId(event.active.id);
      if (!source) {
        clearTechDragState();
        return;
      }

      const currentSlots = techSlotsRef.current;
      const sourceSlots =
        source.zone === "inventory" ? currentSlots.inventory : currentSlots.hotbar;
      const sourceItem = sourceSlots[source.index];
      if (!sourceItem) {
        clearTechDragState();
        return;
      }

      techDropTargetRef.current = null;
      flushSync(() => {
        setTechDragSource(source);
        setDraggedTechItem(sourceItem);
        setTechDropTarget(null);
      });
    },
    [clearTechDragState],
  );

  const handleTechDragOver = React.useCallback((event: DragOverEvent): void => {
    const target = event.over ? parseTechSlotId(event.over.id) : null;
    setTechDropTarget((current) => {
      if (isSameTechDragSource(current, target)) {
        return current;
      }
      techDropTargetRef.current = target;
      return target;
    });
  }, []);

  const handleTechDragEnd = React.useCallback(
    (event: DragEndEvent): void => {
      const source = parseTechSlotId(event.active.id);
      const target =
        techDropTargetRef.current ?? (event.over ? parseTechSlotId(event.over.id) : null);
      if (!source || !target) {
        clearTechDragState();
        return;
      }
      if (isSameTechDragSource(source, target)) {
        clearTechDragState();
        return;
      }

      techDropTargetRef.current = null;
      flushSync(() => {
        swapTechSlots(source, target);
        setTechDragSource(null);
        setDraggedTechItem(null);
        setTechDropTarget(null);
      });
    },
    [clearTechDragState, swapTechSlots],
  );

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
            {renderIntroInlineText(
              "Full-stack engineer based in Yogyakarta, Indonesia with 5+ years of professional experience. Currently building healthcare software at ",
            )}
            <ExternalLink href="https://evidencecare.com">
              {renderIntroInlineText("EvidenceCare")}
            </ExternalLink>
            {renderIntroInlineText(" for the US market.")}
          </p>
          <p>
            {renderIntroInlineText("Created ")}
            <ExternalLink href="https://github.com/itsfaqih/fama">
              {renderIntroInlineText("Fama")}
            </ExternalLink>
            {renderIntroInlineText(
              ", an open source portfolio template with 230+ GitHub stars and 48 forks. Built ",
            )}
            <ExternalLink href="https://schemata.ruine.app">
              {renderIntroInlineText("Schemata")}
            </ExternalLink>
            {renderIntroInlineText(
              ", a drag-and-drop ERD builder for visual database schema design.",
            )}
          </p>
          <p>
            {renderIntroInlineText(
              "Led cross-functional product teams of 10 engineers and designers. Recognized as top performer at ",
            )}
            <ExternalLink href="https://jatismobile.com/">
              {renderIntroInlineText("Jatis Mobile")}
            </ExternalLink>
            {renderIntroInlineText(
              " (Q4 2022). Contributed to the Indonesian PHP community through ",
            )}
            <ExternalLink href="https://www.figma.com/design/qNIg0A9h7PnrFdOVSBbMEH/PHPID-Online-Learning-Redesign?node-id=0-1&t=PcPvOnrKzLginYqa-1">
              {renderIntroInlineText("UI design work")}
            </ExternalLink>
            {renderIntroInlineText(" for ")}
            <ExternalLink href="https://github.com/phpid-jakarta/phpid-learning">
              {renderIntroInlineText("PHPID Learning")}
            </ExternalLink>
            {renderIntroInlineText(".")}
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
                  {renderExperienceInlineText("Missions")}
                </div>
                <div className="px-2 py-1 flex flex-wrap gap-1.5 @xl:gap-2 text-[0.58rem] @xl:text-[0.66rem] uppercase tracking-[0.14em] opacity-85">
                  <span className="rounded-full border border-foreground/20 px-2 py-0.5 @xl:px-2.5 @xl:py-1">
                    {renderExperienceInlineText(`${TOTAL_MISSION_COUNT} Total`)}
                  </span>
                  <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 @xl:px-2.5 @xl:py-1 text-emerald-700 dark:text-emerald-300">
                    {renderExperienceInlineText(
                      `${COMPLETED_MISSION_COUNT} Completed`,
                    )}
                  </span>
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/12 px-2 py-0.5 @xl:px-2.5 @xl:py-1 text-amber-700 dark:text-amber-300">
                    {renderExperienceInlineText(
                      `${IN_PROGRESS_MISSION_COUNT} In Progress`,
                    )}
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-2 md:max-lg:hidden">
                  {EXPERIENCES.map((_, index) => renderAnimatedMissionButton(index))}
                </div>
                <div className="mt-2 hidden md:max-lg:flex md:max-lg:flex-col md:max-lg:gap-2">
                  {renderAnimatedMissionButton(selectedExperienceIndex)}

                  <Drawer.Root
                    open={isMissionDrawerOpen}
                    onOpenChange={setIsMissionDrawerOpen}
                    swipeDirection="down"
                  >
                    <Drawer.Trigger className="rounded-md border border-foreground/35 px-4 py-3 text-sm uppercase tracking-[0.18em] text-left hover:border-foreground/60 hover:bg-foreground/5 transition-colors">
                      {renderExperienceInlineText("View More")}
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
                                renderStaticMissionButton(index),
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
                      {renderExperienceMarqueeText(selectedExperience.title, 0)}
                    </div>
                    <div
                      className="mission-detail-stagger mt-3 text-lg @xl:text-2xl opacity-80"
                      style={
                        {
                          "--detail-delay": `${EXPERIENCE_DETAIL_STAGGER_MS}ms`,
                        } as React.CSSProperties
                      }
                    >
                      {renderExperienceBlockText(
                        selectedExperience.subtitle,
                        EXPERIENCE_DETAIL_STAGGER_MS,
                      )}
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
                      {renderExperienceInlineText(
                        selectedExperience.date,
                        EXPERIENCE_DETAIL_STAGGER_MS * 2,
                      )}
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
                    {renderExperienceInlineText(
                      "Objectives",
                      EXPERIENCE_DETAIL_STAGGER_MS * 3,
                    )}
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
                          {renderExperienceBlockText(
                            item,
                            EXPERIENCE_DETAIL_OBJECTIVE_OFFSET_MS +
                              index * EXPERIENCE_OBJECTIVE_STAGGER_MS,
                          )}
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
                    {renderExperienceInlineText(
                      "Loadout",
                      EXPERIENCE_DETAIL_OBJECTIVE_OFFSET_MS,
                    )}
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
                        {renderExperienceInlineText(
                          tag,
                          EXPERIENCE_DETAIL_SKILL_OFFSET_MS +
                            index * EXPERIENCE_SKILL_STAGGER_MS,
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </article>
        </section>

        <section
          className={`pb-14 @xl:pb-20 ${isDraggingTechItem ? "tech-drag-active" : ""}`}
        >
          <div className="mb-8 @xl:mb-10">
            <h2 className="text-center text-3xl @xl:text-6xl font-bold tracking-wide">
              Tech Stack &amp; Tools
            </h2>
          </div>

          <PreviewCard.Root handle={techPreviewHandle}>
            {({ payload }) => (
              <DndContext
                sensors={techDndSensors}
                collisionDetection={techCollisionDetection}
                onDragStart={handleTechDragStart}
                onDragOver={handleTechDragOver}
                onDragEnd={handleTechDragEnd}
                onDragCancel={clearTechDragState}
              >
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 @xl:gap-5">
                  <div className="overflow-x-auto pb-1">
                    <div
                      className={`tech-panel-card tech-panel-card-inventory mx-auto w-max max-w-full rounded-md p-3 @xl:p-4 ${
                        isInventoryDropZoneActive ? "tech-panel-card-active" : ""
                      }`}
                    >
                      <div className="tech-panel-header mb-3 flex items-center justify-between gap-2">
                        <h3 className="text-sm @xl:text-base uppercase tracking-[0.2em] opacity-85">
                          Inventory
                        </h3>
                        <span className="rounded-full border border-foreground/20 bg-foreground/[0.03] px-2.5 py-1 text-[0.56rem] @xl:text-[0.66rem] uppercase tracking-[0.14em] opacity-80">
                          {inventoryFilledCount}/{TECH_INVENTORY_SLOT_COUNT} slots
                        </span>
                      </div>

                      <div className="tech-slot-grid tech-slot-grid-inventory grid grid-cols-5 gap-1.5 @xl:gap-2">
                        {inventorySlots.map((item, index) => {
                          const isDragOrigin =
                            techDragSource?.zone === "inventory" &&
                            techDragSource.index === index;
                          return (
                            <TechSlot.Inventory
                              key={`inventory-slot-${index}`}
                              index={index}
                              item={item}
                              isDragOrigin={isDragOrigin}
                              isDropTarget={
                                techDropTarget?.zone === "inventory" &&
                                techDropTarget.index === index
                              }
                              isDraggingTechItem={isDraggingTechItem}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto pb-1">
                    <div
                      className={`tech-panel-card tech-panel-card-hotbar mx-auto w-max max-w-full rounded-md p-2.5 @xl:p-3 ${
                        isHotbarDropZoneActive ? "tech-panel-card-active" : ""
                      }`}
                    >
                      <div className="tech-panel-header mb-2 flex items-center justify-between gap-2">
                        <h3 className="text-xs @xl:text-sm uppercase tracking-[0.2em] opacity-85">
                          Hotbar
                        </h3>
                        <span className="rounded-full border border-foreground/20 bg-foreground/[0.03] px-2 py-0.5 text-[0.56rem] @xl:text-[0.66rem] uppercase tracking-[0.12em] opacity-75">
                          Active Stack
                        </span>
                      </div>

                      <div className="tech-slot-grid tech-slot-grid-hotbar grid grid-cols-9 gap-1.5 @xl:gap-2">
                        {hotbarSlots.map((item, index) => {
                          const isDragOrigin =
                            techDragSource?.zone === "hotbar" &&
                            techDragSource.index === index;
                          return (
                            <TechSlot.Hotbar
                              key={`hotbar-slot-${index}`}
                              index={index}
                              item={item}
                              isDragOrigin={isDragOrigin}
                              isDropTarget={
                                techDropTarget?.zone === "hotbar" &&
                                techDropTarget.index === index
                              }
                              isDraggingTechItem={isDraggingTechItem}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <DragOverlay dropAnimation={null}>
                  {draggedTechItem ? (
                    <div className="tech-slot tech-slot-card tech-slot-drag-proxy aspect-square w-11 @xl:w-14 p-1">
                      <div className="tech-slot-visual h-full w-full">
                        <img
                          src={getTechIconSrc(draggedTechItem)}
                          alt={draggedTechItem.name}
                          className="tech-slot-icon-image h-full w-full object-contain p-1"
                          draggable={false}
                        />
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>

                <PreviewCard.Portal>
                  <PreviewCard.Positioner
                    sideOffset={14}
                    side="top"
                    className="tech-preview-positioner"
                  >
                    <PreviewCard.Popup className="tech-preview-popup tech-preview-popup-layer w-72 max-w-[88vw] rounded-lg border border-foreground/20 bg-background/95 p-3 shadow-2xl outline-none opacity-100 scale-100 transition-[opacity,transform] duration-150 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95">
                      {payload && TECH_PREVIEW_LOOKUP[payload] && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-sm @xl:text-base uppercase tracking-[0.18em] font-semibold">
                            {TECH_PREVIEW_LOOKUP[payload].name}
                          </h4>
                          <p className="text-xs @xl:text-sm opacity-85 leading-relaxed">
                            {TECH_PREVIEW_LOOKUP[payload].usedIn.length > 0
                              ? `Used in: ${TECH_PREVIEW_LOOKUP[payload].usedIn.join(", ")}`
                              : "Used in: No listed experience yet."}
                          </p>
                        </div>
                      )}
                    </PreviewCard.Popup>
                  </PreviewCard.Positioner>
                </PreviewCard.Portal>
              </DndContext>
            )}
          </PreviewCard.Root>
        </section>
      </section>
    </main>
  );
}

const TechSlot = {
  Inventory: InventoryTechSlot,
  Hotbar: HotbarTechSlot,
} as const;

function InventoryTechSlot({
  index,
  item,
  isDragOrigin,
  isDropTarget,
  isDraggingTechItem,
}: TechSlotStateProps): React.JSX.Element {
  return (
    <TechSlotBase
      zone="inventory"
      index={index}
      item={item}
      isDragOrigin={isDragOrigin}
      isDropTarget={isDropTarget}
      isDraggingTechItem={isDraggingTechItem}
      className={`tech-slot tech-slot-card aspect-square w-11 @xl:w-14 p-1 ${
        item ? "tech-slot-filled" : "tech-slot-empty"
      }`}
      style={
        item
          ? ({
              "--tech-slot-accent": item.color,
            } as React.CSSProperties)
          : undefined
      }
      emptyLabel="Empty"
      emptyClassName="flex h-full items-center justify-center text-[0.5rem] uppercase tracking-[0.12em] opacity-40"
    />
  );
}

function HotbarTechSlot({
  index,
  item,
  isDragOrigin,
  isDropTarget,
  isDraggingTechItem,
}: TechSlotStateProps): React.JSX.Element {
  return (
    <TechSlotBase
      zone="hotbar"
      index={index}
      item={item}
      isDragOrigin={isDragOrigin}
      isDropTarget={isDropTarget}
      isDraggingTechItem={isDraggingTechItem}
      className={`tech-slot tech-slot-card tech-slot-hotbar aspect-square w-11 @xl:w-14 p-1 ${
        item ? "tech-slot-filled tech-slot-hotbar-active" : "tech-slot-empty"
      }`}
      style={
        item
          ? ({
              "--tech-slot-accent": item.color,
            } as React.CSSProperties)
          : undefined
      }
      emptyLabel="-"
      emptyClassName="flex h-full items-center justify-center text-[0.5rem] uppercase tracking-[0.1em] opacity-35"
    />
  );
}

function TechSlotBase({
  zone,
  index,
  item,
  isDragOrigin,
  isDropTarget,
  isDraggingTechItem,
  className,
  style,
  emptyLabel,
  emptyClassName,
}: TechSlotBaseProps): React.JSX.Element {
  const slotId = createTechSlotId(zone, index);
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: slotId,
  });
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef: setDraggableRef,
  } = useDraggable({
    id: slotId,
    disabled: item === null,
  });
  const showDropTarget = isDropTarget && !isDragOrigin;
  const showDropOverState = isOver && !isDragOrigin && !showDropTarget;

  return (
    <div
      ref={setDroppableRef}
      className={`${className} ${showDropTarget ? "tech-slot-drop-target" : ""} ${
        showDropOverState ? "tech-slot-drop-over" : ""
      } ${isDragOrigin ? "tech-slot-drag-origin" : ""}`}
      style={style}
    >
      {item ? (
        <PreviewCard.Trigger
          ref={setDraggableRef}
          handle={techPreviewHandle}
          payload={item.name}
          render={<button type="button" />}
          className={`tech-slot-preview-trigger tech-slot-visual h-full w-full ${
            isDragOrigin ? "cursor-grabbing" : "cursor-grab"
          } ${isDraggingTechItem ? "tech-preview-disabled" : ""}`}
          style={isDragging ? { opacity: 0 } : isDragOrigin ? { opacity: 0.12 } : undefined}
          {...listeners}
          {...attributes}
        >
          <img
            src={getTechIconSrc(item)}
            alt={item.name}
            loading="lazy"
            draggable={false}
            className="tech-slot-icon-image h-full w-full object-contain p-1"
          />
        </PreviewCard.Trigger>
      ) : (
        <div className={emptyClassName}>{emptyLabel}</div>
      )}
    </div>
  );
}
