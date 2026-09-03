import { cx } from "@/stylex";
import { getButtonClasses } from "../../../components/button-styles";
import { Card } from "../../../components/card";
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

type GuidelineHeroProps = {
  title: string;
  description: React.ReactNode;
  badge?: {
    icon?: React.ElementType;
    text: string;
  };
  markdownUrl?: string;
};

async function readMarkdown(markdownUrl: string) {
  const response = await fetch(markdownUrl);
  if (!response.ok) return null;
  return response.text();
}

export function RuleOfThumbHero({ title, description, badge, markdownUrl }: GuidelineHeroProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!markdownUrl) return;
    try {
      const text = await readMarkdown(markdownUrl);
      if (text === null) return;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDownload() {
    if (!markdownUrl) return;
    try {
      const text = await readMarkdown(markdownUrl);
      if (text === null) return;
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
  }

  return (
    <div className={cx("text-center mb-16")}>
      {badge && (
        <div className={cx("flex justify-center mb-6")}>
          <div className={cx("inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent backdrop-blur-md border border-border text-accent-foreground text-sm font-medium")}>
            {badge.icon && <badge.icon size={16} />}
            {badge.text}
          </div>
        </div>
      )}

      <h1 className={cx("text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6")}>
        {title}
      </h1>

      <div className={cx("text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8")}>
        {description}
      </div>

      {markdownUrl && (
        <div className={cx("flex items-center justify-center relative")}>
          <div className={cx("inline-flex rounded-md shadow-sm")}>
            <a
              href={markdownUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={getButtonClasses({
                className: "rounded-r-none border-r-0 pr-3 z-10 hover:z-20",
                variant: "neutral",
              })}
            >
              <MarkdownLogoIcon size={16} className={cx("mr-2")} />
              View Markdown
            </a>
            <Menu.Root>
              <Menu.Trigger
                className={getButtonClasses({
                  className:
                    "rounded-l-none pl-2 pr-2 -ml-px z-10 hover:z-20 cursor-pointer data-popup-open:bg-card",
                  variant: "neutral",
                })}
                aria-label="More options"
              >
                <CaretDownIcon size={16} />
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner side="bottom" align="end" sideOffset={8} className={cx("z-50")}>
                  <Menu.Popup
                    className={cn(
                      "w-fit rounded-xl border border-border bg-popover backdrop-blur-xl p-1 shadow-lg z-50 flex flex-col outline-none origin-top",
                      "transition-[transform,opacity,scale] duration-150",
                      "data-starting-style:scale-95 data-starting-style:opacity-0",
                      "data-ending-style:scale-95 data-ending-style:opacity-0",
                    )}
                  >
                    <Menu.Item
                      onClick={handleDownload}
                      className={cx("flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-lg transition-colors cursor-pointer outline-none select-none hover:bg-accent data-highlighted:bg-card")}
                    >
                      <DownloadSimpleIcon size={16} />
                      Download Markdown
                    </Menu.Item>
                    <Menu.Item
                      onClick={handleCopy}
                      closeOnClick={false}
                      className={cx("flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-lg transition-colors cursor-pointer outline-none select-none hover:bg-accent data-highlighted:bg-card")}
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

type SectionHeadingProps = {
  title: string;
  description: string;
};

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className={cx("mb-8")}>
      <h2 className={cx("text-2xl font-bold text-foreground mb-4")}>{title}</h2>
      <p className={cx("text-muted-foreground")}>{description}</p>
    </div>
  );
}

// ============================================================================
// Best Practice Card
// ============================================================================

type BestPracticeProps = {
  emoji: string;
  title: string;
  description: string;
};

export function BestPractice({ emoji, title, description }: BestPracticeProps) {
  return (
    <Card className={cx("flex items-start gap-4 p-4")}>
      <span className={cx("text-2xl mt-1")}>{emoji}</span>
      <div>
        <h4 className={cx("font-medium text-foreground mb-1")}>{title}</h4>
        <p className={cx("text-sm text-muted-foreground leading-relaxed")}>{description}</p>
      </div>
    </Card>
  );
}

// ============================================================================
// Code Comparison
// ============================================================================

type CodeComparisonProps = {
  badTitle: string;
  badCode: string;
  badReason: string;
  goodTitle: string;
  goodCode: string;
  goodReason: string;
};

export function CodeComparison({
  badTitle,
  badCode,
  badReason,
  goodTitle,
  goodCode,
  goodReason,
}: CodeComparisonProps) {
  return (
    <div className={cx("flex flex-col items-stretch lg:grid lg:grid-cols-2 gap-4")}>
      {/* Don't / Bad */}
      <Card
        className={cx("border-negative/30 bg-card/30 hover:border-negative/30 overflow-hidden")}
        hoverEffect={false}
      >
        <div className={cx("px-4 py-3 border-b border-negative/30 bg-negative/10 flex items-center gap-2")}>
          <XIcon size={16} className={cx("text-negative-foreground")} />
          <span className={cx("font-medium text-negative-foreground")}>{badTitle}</span>
        </div>
        <div className={cx("overflow-x-auto")}>
          <CodeBlock code={badCode} />
        </div>
        <div className={cx("px-4 py-3 border-t border-negative/30 bg-negative/10 text-sm text-negative-foreground flex items-start gap-2")}>
          <XIcon size={14} className={cx("shrink-0 mt-1")} />
          <span>{badReason}</span>
        </div>
      </Card>

      {/* Do / Good */}
      <Card
        className={cx("border-positive/30 bg-card/30 hover:border-positive/30 overflow-hidden")}
        hoverEffect={false}
      >
        <div className={cx("px-4 py-3 border-b border-positive/30 bg-positive/10 flex items-center gap-2")}>
          <CheckIcon size={16} className={cx("text-positive-foreground")} />
          <span className={cx("font-medium text-positive-foreground")}>{goodTitle}</span>
        </div>
        <div className={cx("overflow-x-auto")}>
          <CodeBlock code={goodCode} />
        </div>
        <div className={cx("px-4 py-3 border-t border-positive/30 bg-positive/10 text-sm text-positive-foreground flex items-start gap-2")}>
          <CheckIcon size={14} className={cx("shrink-0 mt-0.5")} />
          <span>{goodReason}</span>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Code Example (Single)
// ============================================================================

type CodeExampleProps = {
  title: string;
  code: string;
  description?: string;
};

export function CodeExample({ title, code, description }: CodeExampleProps) {
  return (
    <Card className={cx("overflow-hidden")}>
      <div className={cx("px-4 py-3 border-b border-border flex items-center gap-2")}>
        <span className={cx("font-medium text-foreground")}>{title}</span>
      </div>
      <div className={cx("overflow-x-auto")}>
        <CodeBlock code={code} />
      </div>
      {description && (
        <div className={cx("px-4 py-3 border-t border-border bg-background text-sm text-muted-foreground")}>
          {description}
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// Tabbed Code Example
// ============================================================================

type TabbedCodeExampleTab = {
  label: string;
  code: string;
};

type TabbedCodeExampleProps = {
  title: string;
  tabs: TabbedCodeExampleTab[];
  description: string;
};

export function TabbedCodeExample({ title, tabs, description }: TabbedCodeExampleProps) {
  return (
    <Card className={cx("overflow-hidden")}>
      <Tabs.Root defaultValue={tabs[0]?.label}>
        <div className={cx("px-4 py-3 border-b border-border flex items-center justify-between gap-4")}>
          <span className={cx("font-medium text-foreground")}>{title}</span>
          <Tabs.List className={cx("flex gap-1 bg-background rounded-lg p-1")}>
            {tabs.map((tab) => (
              <Tabs.Tab
                key={tab.label}
                value={tab.label}
                className={cx("px-3 py-1.5 text-xs font-medium rounded-md transition-all text-muted-foreground hover:text-foreground hover:bg-accent data-selected:bg-zinc-500/10 data-selected:text-foreground")}
              >
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </div>
        {tabs.map((tab) => (
          <Tabs.Panel key={tab.label} value={tab.label} className={cx("overflow-x-auto")}>
            <CodeBlock code={tab.code} />
          </Tabs.Panel>
        ))}
        <div className={cx("px-4 py-3 border-t border-border bg-background text-sm text-muted-foreground")}>
          {description}
        </div>
      </Tabs.Root>
    </Card>
  );
}

// ============================================================================
// Quick Ref Table
// ============================================================================

type QuickRefItem = {
  scenario: string;
  action: string;
};

type QuickRefTableProps = {
  items: QuickRefItem[];
};

export function QuickRefTable({ items }: QuickRefTableProps) {
  return (
    <div className={cx("relative")}>
      {items.map((item, i) => (
        <div key={`${item.scenario}:${item.action}`} className={cx("flex gap-4 group")}>
          {/* Timeline column */}
          <div className={cx("flex flex-col items-center shrink-0")}>
            <div className={cx("size-7 rounded-full bg-accent text-accent-foreground border border-border flex items-center justify-center text-xs font-semibold text-accent-foreground group-hover:border-foreground/30 group-hover:text-foreground transition-colors")}>
              {i + 1}
            </div>
            {i < items.length - 1 && (
              <div className={cx("w-px flex-1 border-l border-dashed border-border")} />
            )}
          </div>
          {/* Content */}
          <div className={cx("pb-6 pt-0.5")}>
            <p className={cx("text-sm")}>
              <span className={cx("font-medium text-foreground")}>{item.scenario}</span>
              <span className={cx("text-muted-foreground")}> → {item.action}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Quick Ref Card (used by other pages)
// ============================================================================

type QuickRefCardProps = {
  emoji: string;
  title: string;
  action: string;
};

export function QuickRefCard({ emoji, title, action }: QuickRefCardProps) {
  return (
    <Card className={cx("flex items-center gap-4 p-4")}>
      <div className={cx("text-2xl shrink-0")}>{emoji}</div>
      <p className={cx("text-sm sm:text-base")}>
        <span className={cx("font-medium text-foreground")}>{title}</span>
        <span className={cx("text-muted-foreground")}> → </span>
        <span className={cx("text-muted-foreground")}>{action}</span>
      </p>
    </Card>
  );
}

export { ButtonVariantMatrix } from "./button-variant-matrix";
