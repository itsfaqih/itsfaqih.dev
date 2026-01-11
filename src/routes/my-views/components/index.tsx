import { Tabs } from "@base-ui/react/tabs";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
// Assuming you declare cn somewhere, but these components use template literals mostly.
// If you want to use cn, import it. For now, strict copy + refinement.

// ============================================================================
// Opinion Hero
// ============================================================================

interface GuidelineHeroProps {
  title: string;
  description: React.ReactNode;
  badge?: {
    icon: React.ElementType;
    text: string;
  };
}

export function GuidelineHero({ title, description, badge }: GuidelineHeroProps) {
  return (
    <div className="text-center mb-16">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      {badge && (
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 text-indigo-400 text-sm font-medium shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <badge.icon size={16} />
            {badge.text}
          </div>
        </div>
      )}

      <h1 className="text-4xl sm:text-5xl font-bold text-(--text-primary) tracking-tight mb-6">
        {title}
      </h1>

      <div className="text-xl text-(--text-secondary) leading-relaxed max-w-2xl mx-auto">
        {description}
      </div>
    </div>
  );
}

// ============================================================================
// Section Heading
// ============================================================================

interface SectionHeadingProps {
  title: string;
  description: string;
}

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-(--text-primary) mb-4">{title}</h2>
      <p className="text-(--text-secondary)">{description}</p>
    </div>
  );
}

// ============================================================================
// Principle Card
// ============================================================================

interface PrincipleCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

export function PrincipleCard({ icon: Icon, title, description }: PrincipleCardProps) {
  return (
    <div className="p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)/50 backdrop-blur-md shadow-sm hover:shadow-lg hover:border-(--text-secondary)/30 transition-all duration-300">
      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center mb-4 ring-1 ring-inset ring-indigo-500/20">
        <Icon size={20} className="text-indigo-400" />
      </div>
      <h3 className="font-semibold text-(--text-primary) mb-2">{title}</h3>
      <p className="text-sm text-(--text-secondary) leading-relaxed">{description}</p>
    </div>
  );
}

// ============================================================================
// Best Practice Card
// ============================================================================

interface BestPracticeProps {
  emoji: string;
  title: string;
  description: string;
}

export function BestPractice({ emoji, title, description }: BestPracticeProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-(--bg-secondary)/50 backdrop-blur-md border border-(--border-color) shadow-sm hover:shadow-md hover:border-(--text-secondary)/30 transition-all">
      <span className="text-2xl mt-1">{emoji}</span>
      <div>
        <h4 className="font-medium text-(--text-primary) mb-1">{title}</h4>
        <p className="text-sm text-(--text-secondary) leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Code Comparison
// ============================================================================

interface CodeComparisonProps {
  badTitle: string;
  badCode: string;
  badReason: string;
  goodTitle: string;
  goodCode: string;
  goodReason: string;
}

export function CodeComparison({
  badTitle,
  badCode,
  badReason,
  goodTitle,
  goodCode,
  goodReason,
}: CodeComparisonProps) {
  const [highlightedBad, setHighlightedBad] = useState<string>("");
  const [highlightedGood, setHighlightedGood] = useState<string>("");

  useEffect(() => {
    import("shiki").then(({ codeToHtml }) => {
      codeToHtml(badCode, {
        lang: "tsx",
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
      }).then(setHighlightedBad);

      codeToHtml(goodCode, {
        lang: "tsx",
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
      }).then(setHighlightedGood);
    });
  }, [badCode, goodCode]);

  return (
    <div className="flex flex-col items-center lg:grid lg:grid-cols-2 gap-4">
      {/* Don't / Bad */}
      <div className="rounded-xl border border-red-500/30 bg-(--bg-secondary)/30 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-red-500/5 transition-all">
        <div className="px-4 py-3 border-b border-red-500/30 bg-red-500/5 flex items-center gap-2">
          <X size={16} className="text-red-400" />
          <span className="font-medium text-red-400">{badTitle}</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <div
            className="text-sm [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:m-0! [&_code]:text-sm!"
            dangerouslySetInnerHTML={{ __html: highlightedBad }}
          />
        </div>
        <div className="px-4 py-3 border-t border-red-500/30 bg-red-500/5 text-sm text-red-400">
          <X size={14} className="inline mr-2" />
          {badReason}
        </div>
      </div>

      {/* Do / Good */}
      <div className="rounded-xl border border-emerald-500/30 bg-(--bg-secondary)/30 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-emerald-500/5 transition-all">
        <div className="px-4 py-3 border-b border-emerald-500/30 bg-emerald-500/5 flex items-center gap-2">
          <Check size={16} className="text-emerald-400" />
          <span className="font-medium text-emerald-400">{goodTitle}</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <div
            className="text-sm [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:m-0! [&_code]:text-sm!"
            dangerouslySetInnerHTML={{ __html: highlightedGood }}
          />
        </div>
        <div className="px-4 py-3 border-t border-emerald-500/30 bg-emerald-500/5 text-sm text-emerald-400">
          <Check size={14} className="inline mr-2" />
          {goodReason}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Code Example (Single)
// ============================================================================

interface CodeExampleProps {
  title: string;
  code: string;
  description: string;
}

export function CodeExample({ title, code, description }: CodeExampleProps) {
  const [highlighted, setHighlighted] = useState<string>("");

  useEffect(() => {
    import("shiki").then(({ codeToHtml }) => {
      codeToHtml(code, {
        lang: "tsx",
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
      }).then(setHighlighted);
    });
  }, [code]);

  return (
    <div className="rounded-xl border border-(--border-color) bg-(--bg-secondary)/50 backdrop-blur-md overflow-hidden group hover:border-(--text-secondary)/30 hover:shadow-lg transition-all duration-300">
      <div className="px-4 py-3 border-b border-(--border-color) flex items-center gap-2">
        <span className="font-medium text-(--text-primary)">{title}</span>
      </div>
      <div className="p-4 overflow-x-auto">
        <div
          className="text-sm [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:m-0! [&_code]:text-sm!"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
      <div className="px-4 py-3 border-t border-(--border-color) bg-(--bg-primary) text-sm text-(--text-secondary)">
        {description}
      </div>
    </div>
  );
}

// ============================================================================
// Tabbed Code Example
// ============================================================================

interface TabbedCodeExampleTab {
  label: string;
  code: string;
}

interface TabbedCodeExampleProps {
  title: string;
  tabs: TabbedCodeExampleTab[];
  description: string;
}

export function TabbedCodeExample({ title, tabs, description }: TabbedCodeExampleProps) {
  const [highlightedCode, setHighlightedCode] = useState<Record<string, string>>({});

  useEffect(() => {
    import("shiki").then(({ codeToHtml }) => {
      tabs.forEach((tab) => {
        codeToHtml(tab.code, {
          lang: "tsx",
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
        }).then((html) => {
          setHighlightedCode((prev) => ({ ...prev, [tab.label]: html }));
        });
      });
    });
  }, [tabs]);

  return (
    <Tabs.Root
      defaultValue={tabs[0]?.label}
      className="rounded-xl border border-(--border-color) bg-(--bg-secondary)/50 backdrop-blur-md overflow-hidden group hover:border-(--text-secondary)/30 hover:shadow-lg transition-all duration-300"
    >
      <div className="px-4 py-3 border-b border-(--border-color) flex items-center justify-between gap-4">
        <span className="font-medium text-(--text-primary)">{title}</span>
        <Tabs.List className="flex gap-1 bg-(--bg-primary) rounded-lg p-1">
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.label}
              value={tab.label}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-all text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) data-selected:bg-indigo-500/20 data-selected:text-indigo-400 data-selected:shadow-sm"
            >
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </div>
      {tabs.map((tab) => (
        <Tabs.Panel key={tab.label} value={tab.label} className="p-4 overflow-x-auto">
          <div
            className="text-sm [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:m-0! [&_code]:text-sm!"
            dangerouslySetInnerHTML={{ __html: highlightedCode[tab.label] || "" }}
          />
        </Tabs.Panel>
      ))}
      <div className="px-4 py-3 border-t border-(--border-color) bg-(--bg-primary) text-sm text-(--text-secondary)">
        {description}
      </div>
    </Tabs.Root>
  );
}

// ============================================================================
// Quick Ref Card
// ============================================================================

interface QuickRefCardProps {
  emoji: string;
  title: string;
  action: string;
}

export function QuickRefCard({ emoji, title, action }: QuickRefCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-(--border-color) bg-(--bg-secondary)/50 backdrop-blur-md shadow-sm hover:shadow-md hover:border-(--text-secondary)/30 transition-all">
      <div className="text-2xl drop-shadow-sm">{emoji}</div>
      <div>
        <p className="font-medium text-(--text-primary)">{title}</p>
        <p className="text-sm text-(--text-secondary)">{action}</p>
      </div>
    </div>
  );
}
