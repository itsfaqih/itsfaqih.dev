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

  function scrambleDescription(text: string): string {
    return scrambleByProgress(text, introProgress);
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
            {scrambleDescription(
              "Full-stack engineer based in Yogyakarta, Indonesia with 5+ years of professional experience. Currently building healthcare software at ",
            )}
            <ExternalLink href="https://evidencecare.com">
              {scrambleDescription("EvidenceCare")}
            </ExternalLink>
            {scrambleDescription(" for the US market.")}
          </p>
          <p>
            {scrambleDescription("Created ")}
            <ExternalLink href="https://github.com/itsfaqih/fama">
              {scrambleDescription("Fama")}
            </ExternalLink>
            {scrambleDescription(
              ", an open source portfolio template with 230+ GitHub stars and 48 forks. Built ",
            )}
            <ExternalLink href="https://schemata.ruine.app">
              {scrambleDescription("Schemata")}
            </ExternalLink>
            {scrambleDescription(", a drag-and-drop ERD builder for visual database schema design.")}
          </p>
          <p>
            {scrambleDescription(
              "Led cross-functional product teams of 10 engineers and designers. Recognized as top performer at ",
            )}
            <ExternalLink href="https://jatismobile.com/">
              {scrambleDescription("Jatis Mobile")}
            </ExternalLink>
            {scrambleDescription(
              " (Q4 2022). Contributed to the Indonesian PHP community through ",
            )}
            <ExternalLink href="https://www.figma.com/design/qNIg0A9h7PnrFdOVSBbMEH/PHPID-Online-Learning-Redesign?node-id=0-1&t=PcPvOnrKzLginYqa-1">
              {scrambleDescription("UI design work")}
            </ExternalLink>
            {scrambleDescription(" for ")}
            <ExternalLink href="https://github.com/phpid-jakarta/phpid-learning">
              {scrambleDescription("PHPID Learning")}
            </ExternalLink>
            {scrambleDescription(".")}
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
      </section>
    </main>
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
          <p className="text-sm text-foreground">
            {metadata.description}
          </p>
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
  "https://www.figma.com/design/qNIg0A9h7PnrFdOVSBbMEH/PHPID-Online-Learning-Redesign?node-id=0-1&t=PcPvOnrKzLginYqa-1": {
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


function ExternalLink({ href, children }: ExternalLinkProps): React.JSX.Element {
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
