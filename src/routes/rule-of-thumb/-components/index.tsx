import { getGlassyClasses } from "../../../components/glassy-button";
import { GlassyCard } from "../../../components/glassy-card";
import { Tabs } from "@base-ui/react/tabs";
import { Menu } from "@base-ui/react/menu";
import {
  CheckIcon,
  XIcon,
  MarkdownLogoIcon,
  CaretDownIcon,
  DownloadSimpleIcon,
  CopyIcon,
} from "@phosphor-icons/react";
import { CodeBlock } from "../../../components/code-block";
import { useState } from "react";
import { cn } from "@/cn";

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
  markdownUrl?: string;
}

export function RuleOfThumbHero({ title, description, badge, markdownUrl }: GuidelineHeroProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!markdownUrl) return;
    try {
      const res = await fetch(markdownUrl);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async () => {
    if (!markdownUrl) return;
    try {
      const res = await fetch(markdownUrl);
      const text = await res.text();
      const blob = new Blob([text], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = markdownUrl.split("/").pop() || "guide.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="text-center mb-16">
      {badge && (
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-500/10 backdrop-blur-md border border-(--border-color) text-(--text-primary) text-sm font-medium">
            <badge.icon size={16} />
            {badge.text}
          </div>
        </div>
      )}

      <h1 className="text-4xl sm:text-5xl font-bold text-(--text-primary) tracking-tight mb-6">
        {title}
      </h1>

      <div className="text-xl text-(--text-secondary) leading-relaxed max-w-2xl mx-auto mb-8">
        {description}
      </div>

      {markdownUrl && (
        <div className="flex items-center justify-center relative">
          <div className="inline-flex rounded-md shadow-sm">
            <a
              href={markdownUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={getGlassyClasses(
                "rounded-r-none border-r-0 pr-3 z-10 hover:z-20",
                "secondary",
              )}
            >
              <MarkdownLogoIcon size={16} className="mr-2" />
              View Markdown
            </a>
            <Menu.Root>
              <Menu.Trigger
                className={getGlassyClasses(
                  "rounded-l-none pl-2 pr-2 -ml-px z-10 hover:z-20 cursor-pointer data-popup-open:bg-(--bg-secondary)",
                  "secondary",
                )}
                aria-label="More options"
              >
                <CaretDownIcon size={16} />
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
                  <Menu.Popup
                    className={cn(
                      "w-48 rounded-xl border border-(--border-color) bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-1 shadow-lg z-50 flex flex-col outline-none origin-top",
                      "transition-[transform,opacity,scale] duration-150",
                      "data-starting-style:scale-95 data-starting-style:opacity-0",
                      "data-ending-style:scale-95 data-ending-style:opacity-0",
                    )}
                  >
                    <Menu.Item
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-(--text-primary) rounded-lg transition-colors cursor-pointer outline-none select-none hover:bg-(--bg-secondary) data-highlighted:bg-(--bg-secondary)"
                    >
                      <DownloadSimpleIcon size={16} />
                      Download Markdown
                    </Menu.Item>
                    <Menu.Item
                      onClick={handleCopy}
                      closeOnClick={false}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-(--text-primary) rounded-lg transition-colors cursor-pointer outline-none select-none hover:bg-(--bg-secondary) data-highlighted:bg-(--bg-secondary)"
                    >
                      {copied ? (
                        <CheckIcon size={16} weight="regular" />
                      ) : (
                        <CopyIcon size={16} weight="regular" />
                      )}
                      {copied ? "Copied!" : "Copy Markdown"}
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>
        </div>
      )}
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
// Best Practice Card
// ============================================================================

interface BestPracticeProps {
  emoji: string;
  title: string;
  description: string;
}

export function BestPractice({ emoji, title, description }: BestPracticeProps) {
  return (
    <GlassyCard className="flex items-start gap-4 p-4">
      <span className="text-2xl mt-1">{emoji}</span>
      <div>
        <h4 className="font-medium text-(--text-primary) mb-1">{title}</h4>
        <p className="text-sm text-(--text-secondary) leading-relaxed">{description}</p>
      </div>
    </GlassyCard>
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
  return (
    <div className="flex flex-col items-center lg:grid lg:grid-cols-2 gap-4">
      {/* Don't / Bad */}
      <GlassyCard
        className="border-red-500/30 bg-(--bg-secondary)/30 hover:border-red-500/30 overflow-hidden"
        hoverEffect={false}
      >
        <div className="px-4 py-3 border-b border-red-500/30 bg-red-500/5 flex items-center gap-2">
          <XIcon size={16} className="text-red-400" />
          <span className="font-medium text-red-400">{badTitle}</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <CodeBlock code={badCode} />
        </div>
        <div className="px-4 py-3 border-t border-red-500/30 bg-red-500/5 text-sm text-red-400">
          <XIcon size={14} className="inline mr-2" />
          {badReason}
        </div>
      </GlassyCard>

      {/* Do / Good */}
      <GlassyCard
        className="border-emerald-500/30 bg-(--bg-secondary)/30 hover:border-emerald-500/30 overflow-hidden"
        hoverEffect={false}
      >
        <div className="px-4 py-3 border-b border-emerald-500/30 bg-emerald-500/5 flex items-center gap-2">
          <CheckIcon size={16} className="text-emerald-400" />
          <span className="font-medium text-emerald-400">{goodTitle}</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <CodeBlock code={goodCode} />
        </div>
        <div className="px-4 py-3 border-t border-emerald-500/30 bg-emerald-500/5 text-sm text-emerald-400">
          <CheckIcon size={14} className="inline mr-2" />
          {goodReason}
        </div>
      </GlassyCard>
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
  return (
    <GlassyCard className="overflow-hidden">
      <div className="px-4 py-3 border-b border-(--border-color) flex items-center gap-2">
        <span className="font-medium text-(--text-primary)">{title}</span>
      </div>
      <div className="p-4 overflow-x-auto">
        <CodeBlock code={code} />
      </div>
      <div className="px-4 py-3 border-t border-(--border-color) bg-(--bg-primary) text-sm text-(--text-secondary)">
        {description}
      </div>
    </GlassyCard>
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
  return (
    <GlassyCard className="overflow-hidden">
      <Tabs.Root defaultValue={tabs[0]?.label}>
        <div className="px-4 py-3 border-b border-(--border-color) flex items-center justify-between gap-4">
          <span className="font-medium text-(--text-primary)">{title}</span>
          <Tabs.List className="flex gap-1 bg-(--bg-primary) rounded-lg p-1">
            {tabs.map((tab) => (
              <Tabs.Tab
                key={tab.label}
                value={tab.label}
                className="px-3 py-1.5 text-xs font-medium rounded-md transition-all text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) data-selected:bg-zinc-500/10 data-selected:text-(--text-primary)"
              >
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </div>
        {tabs.map((tab) => (
          <Tabs.Panel key={tab.label} value={tab.label} className="p-4 overflow-x-auto">
            <CodeBlock code={tab.code} />
          </Tabs.Panel>
        ))}
        <div className="px-4 py-3 border-t border-(--border-color) bg-(--bg-primary) text-sm text-(--text-secondary)">
          {description}
        </div>
      </Tabs.Root>
    </GlassyCard>
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
    <GlassyCard className="flex items-center gap-4 p-4">
      <div className="text-2xl">{emoji}</div>
      <div>
        <p className="font-medium text-(--text-primary)">{title}</p>
        <p className="text-sm text-(--text-secondary)">{action}</p>
      </div>
    </GlassyCard>
  );
}

export * from "./button-variant-matrix";
