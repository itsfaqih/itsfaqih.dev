import { cx } from "@/stylex";
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
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "@tanstack/react-router";
import { GUIDELINES } from "../../../data/guidelines";
import { colorOf, ruleNumber, RuleThumb } from "../../-components/rule-art";
import { cn } from "@/cn";
import { PageContainer } from "../../../components/page-container";

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

  const rule = useCurrentRule();
  const number = rule ? ruleNumber(rule) : null;

  return (
    <header className="arc rot-hero" style={{ "--c": rule ? colorOf(rule.label) : "var(--go)" }}>
      <div className="rot-text">
        <div className="rot-crumb">
          <Link to="/rule-of-thumb">← All rules</Link>
          {number && <span className="c">No.{number}</span>}
          <span className="c">{badge?.text ?? rule?.label}</span>
        </div>
        <h1>{title}</h1>
        <div className="rot-lead">{description}</div>
        {markdownUrl && (
          <div className="rot-actions">
            <a href={markdownUrl} target="_blank" rel="noopener noreferrer" className="btn soft sm">
              <MarkdownLogoIcon size={16} />
              View Markdown
            </a>
            <Menu.Root>
              <Menu.Trigger className="btn soft sm rot-more" aria-label="More options">
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
                      className={cx(
                        "flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-lg transition-colors cursor-pointer outline-none select-none hover:bg-accent data-highlighted:bg-card",
                      )}
                    >
                      <DownloadSimpleIcon size={16} />
                      Download Markdown
                    </Menu.Item>
                    <Menu.Item
                      onClick={handleCopy}
                      closeOnClick={false}
                      className={cx(
                        "flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-lg transition-colors cursor-pointer outline-none select-none hover:bg-accent data-highlighted:bg-card",
                      )}
                    >
                      <span className="rot-swap rot-swap-icon" data-on={copied ? "b" : "a"}>
                        <CopyIcon size={16} weight="regular" />
                        <CheckIcon size={16} weight="regular" />
                      </span>
                      <span className="rot-swap" data-on={copied ? "b" : "a"}>
                        <span aria-hidden={copied}>Copy Markdown</span>
                        <span aria-hidden={!copied}>Copied!</span>
                      </span>
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>
        )}
      </div>
      {rule && (
        <div className="cover">
          <RuleThumb rule={rule} play />
        </div>
      )}
      <ContentsRail />
    </header>
  );
}

/** The guideline whose article is on screen, if any. */
export function useCurrentRule() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return GUIDELINES.find((guideline) => guideline.href === path);
}

// ============================================================================
// Contents Rail
// ============================================================================

type RailHeading = { element: HTMLHeadingElement; text: string };

// One tick per section heading, fixed in the left margin on wide screens, plus the
// checkpoint bar along the navbar's bottom edge: one segment per section, as wide as
// the section is long, filling as the reading line passes through it. The headings
// belong to each article, so both read them from the DOM. The rail renders into
// <body> because the page container keeps a transform from its entrance animation,
// which would pin a fixed child to the container.
function ContentsRail() {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const rule = useCurrentRule();
  const [headings, setHeadings] = useState<RailHeading[]>([]);
  const [barHost, setBarHost] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const page = anchorRef.current?.closest(".rule-of-thumb-page");
    if (!page) return;
    setHeadings(
      Array.from(page.querySelectorAll("h2"), (element, index) => {
        // The section's key cap number, shown by rot.css.
        element.dataset.stage = String(index + 1);
        return { element, text: element.textContent ?? "" };
      }),
    );
    setBarHost(document.querySelector<HTMLElement>(".arc-bar"));
  }, []);

  useEffect(() => {
    const page = anchorRef.current?.closest(".rule-of-thumb-page");
    if (!page || headings.length === 0) return;

    // A section runs from its heading to the next, and the last one ends at the pager.
    let spans: { start: number; end: number }[] = [];
    const measure = () => {
      const tops = headings.map(({ element }) => element.getBoundingClientRect().top + scrollY);
      const pager = page.querySelector(".rot-pager");
      const finish = pager
        ? pager.getBoundingClientRect().top + scrollY
        : page.getBoundingClientRect().bottom + scrollY;
      spans = tops.map((start, index) => ({
        start,
        end: Math.max(start + 1, tops[index + 1] ?? finish),
      }));
      barRef.current?.querySelectorAll("i").forEach((segment, index) => {
        const span = spans[index];
        if (span) segment.style.flexGrow = String(span.end - span.start);
      });
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = scrollY + innerHeight * 0.3;
      // The bar maps the page's scroll onto the route, so the closing sections fill
      // even when they all fit in the last screen.
      const route = { from: spans[0]?.start ?? 0, to: spans.at(-1)?.end ?? 0 };
      const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const reached = route.from + (route.to - route.from) * Math.min(1, scrollY / scrollable);
      let current = 0;
      spans.forEach(({ start, end }, index) => {
        if (start < line) current = index;
        const segment = barRef.current?.children[index];
        if (!(segment instanceof HTMLElement)) return;
        const progress = Math.min(1, Math.max(0, (reached - start) / (end - start)));
        segment.style.setProperty("--p", String(progress));
        segment.toggleAttribute("data-done", progress >= 1);
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    const resizes = new ResizeObserver(onResize);
    resizes.observe(page);
    measure();
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      resizes.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [headings, barHost]);

  const hue = { "--c": rule ? colorOf(rule.label) : "var(--go)" };

  return (
    <span ref={anchorRef} hidden>
      {headings.length > 0 &&
        barHost &&
        createPortal(
          <div ref={barRef} className="arc rot-xp" style={hue} aria-hidden="true">
            {headings.map((heading) => (
              <i key={heading.text}>
                <b />
              </i>
            ))}
          </div>,
          barHost,
        )}
      {headings.length > 0 &&
        createPortal(
          <nav className="arc rot-rail" aria-label="On this page" style={hue}>
            <ol>
              {headings.map((heading, index) => (
                <li key={heading.text}>
                  <button
                    type="button"
                    aria-current={index === active ? "location" : undefined}
                    onClick={() =>
                      heading.element.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                  >
                    <i />
                    <span>{heading.text}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>,
          document.body,
        )}
    </span>
  );
}

// ============================================================================
// Rule Page
// ============================================================================

// The blocks that rise in as they first scroll into view. Prose stays put, and a block
// inside another block arrives with its parent.
const REVEALED =
  'h2, h2 + p, [data-rule-of-thumb-card="true"], .rk-feature, .code-block, .rk-steps > li';

/** Plays each block's entrance once, when it first enters the viewport. Blocks that
 *  arrive in the same frame stagger; ones already scrolled past show at once. */
function useArticleReveal(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const blocks = Array.from(root.querySelectorAll<HTMLElement>(REVEALED)).filter(
      (block) => !block.closest(".rot-hero") && !block.parentElement?.closest(REVEALED),
    );
    const reveals = new IntersectionObserver(
      (entries) => {
        let step = 0;
        for (const entry of entries) {
          const passed = entry.boundingClientRect.bottom < 0;
          if (!entry.isIntersecting && !passed) continue;
          if (!(entry.target instanceof HTMLElement)) continue;
          entry.target.style.setProperty("--rv", String(passed ? 0 : Math.min(step++, 4)));
          entry.target.classList.add("in");
          reveals.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    for (const block of blocks) {
      if (block.classList.contains("in")) continue;
      block.setAttribute("data-rv", "");
      reveals.observe(block);
    }
    return () => reveals.disconnect();
  }, [rootRef]);
}

/** The article shell: the arcade kit's scope, tinted with the rule's topic hue. */
export function RulePage({ children }: { children: React.ReactNode }) {
  const rule = useCurrentRule();
  const rootRef = useRef<HTMLDivElement>(null);
  useArticleReveal(rootRef);
  return (
    <PageContainer maxWidth="3xl" className="rule-of-thumb-page rot-page">
      <div
        ref={rootRef}
        style={{ display: "contents", "--c": rule ? colorOf(rule.label) : "var(--go)" }}
      >
        {children}
      </div>
    </PageContainer>
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
// Feature Tiles
// ============================================================================

type FeatureTile = {
  icon: React.ElementType;
  title: string;
  description: string;
};

/** The article's overview: one tile per principle, laid out like the index page's tiles. */
export function FeatureTiles({
  items,
  columns,
  label,
}: {
  items: readonly FeatureTile[];
  columns: 2 | 3;
  label: string;
}) {
  return (
    <ul className="rk-features" style={{ "--cols": columns }} aria-label={label}>
      {items.map(({ icon: Icon, title, description }) => (
        <li key={title} className="rk-feature">
          <span className="ico" aria-hidden="true">
            <Icon size={20} weight="bold" />
          </span>
          <h3>{title}</h3>
          <p>{description}</p>
        </li>
      ))}
    </ul>
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
    <Card className="rk-tip">
      <span className="rk-slot" aria-hidden="true">
        {emoji}
      </span>
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </Card>
  );
}

// ============================================================================
// Verdict panels
// ============================================================================

type VerdictProps = {
  good: boolean;
  title: string;
  reason?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/** One side of a bad / good pair: a stamped header, the evidence, and why. */
export function Verdict({ good, title, reason, children, className }: VerdictProps) {
  const Mark = good ? CheckIcon : XIcon;
  return (
    <Card className={cn("rk-verdict", good && "good", className)} hoverEffect={false}>
      <div className="rk-head">
        <span className="rk-stamp" aria-hidden="true">
          <Mark size={14} weight="bold" />
        </span>
        <span>
          <span className="sr-only">{good ? "Do: " : "Don't: "}</span>
          {title}
        </span>
      </div>
      {children}
      {reason && (
        <div className="rk-foot">
          <Mark size={14} weight="bold" />
          <span>{reason}</span>
        </div>
      )}
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
    <div className="rk-pair">
      <Verdict good={false} title={badTitle} reason={badReason}>
        <div className="rk-body">
          <CodeBlock code={badCode} />
        </div>
      </Verdict>
      <Verdict good title={goodTitle} reason={goodReason}>
        <div className="rk-body">
          <CodeBlock code={goodCode} />
        </div>
      </Verdict>
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
    <Card className={cx("overflow-hidden")} hoverEffect={false}>
      <div className="rk-head">{title}</div>
      <div className="rk-body">
        <CodeBlock code={code} />
      </div>
      {description && <div className="rk-foot">{description}</div>}
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
    <Card className={cx("overflow-hidden")} hoverEffect={false}>
      <Tabs.Root defaultValue={tabs[0]?.label}>
        <div className="rk-head has-tabs">
          <span>{title}</span>
          <Tabs.List className="rk-tabs">
            {tabs.map((tab) => (
              <Tabs.Tab key={tab.label} value={tab.label} className="rk-tab">
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </div>
        {tabs.map((tab) => (
          <Tabs.Panel key={tab.label} value={tab.label} className="rk-body">
            <CodeBlock code={tab.code} />
          </Tabs.Panel>
        ))}
        <div className="rk-foot">{description}</div>
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
    <ol className="rk-steps">
      {items.map((item, i) => (
        <li key={`${item.scenario}:${item.action}`}>
          <span className="rk-n">{i + 1}</span>
          <p>
            <b>{item.scenario}</b> <span aria-hidden="true">→</span> {item.action}
          </p>
        </li>
      ))}
    </ol>
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
    <Card className="rk-tip center">
      <span className="rk-slot" aria-hidden="true">
        {emoji}
      </span>
      <p>
        <strong>{title}</strong> <span className="rk-to">→</span> {action}
      </p>
    </Card>
  );
}

export { ButtonVariantMatrix } from "./button-variant-matrix";
