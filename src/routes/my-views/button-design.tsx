import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useFakeCursor } from "../../components/fake-cursor";
import { PageContainer } from "../../components/page-container";
import {
  ArrowLeft,
  Loader2,
  MousePointer,
  Check,
  Ban,
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  Hand,
  Settings,
  Plus,
} from "lucide-react";
import { BestPractice, CodeExample, GuidelineHero } from "./components";

export const Route = createFileRoute("/my-views/button-design")({
  component: ButtonStates,
});

// ============================================================================
// Interactive Button Demo Component
// ============================================================================

type ButtonState = "idle" | "hover" | "loading" | "disabled" | "pressing" | "success";

function InteractiveButtonDemo() {
  const [state, setState] = useState<ButtonState>("idle");
  const [autoPlay, setAutoPlay] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cursor = useFakeCursor(containerRef);

  useEffect(() => {
    if (autoPlay) cursor.show();
    else cursor.hide();
  }, [autoPlay, cursor.show, cursor.hide]);

  useEffect(() => {
    if (!autoPlay) return;

    let timeout: NodeJS.Timeout;

    const runSequence = () => {
      // Sequence: Idle -> Hover -> Pressing -> Loading -> Success -> Idle

      switch (state) {
        case "idle":
          timeout = setTimeout(() => {
            if (buttonRef.current) cursor.moveTo(buttonRef.current);
            setState("hover");
          }, 1000);
          break;
        case "hover":
          timeout = setTimeout(() => {
            cursor.pressDown();
            setState("pressing");
          }, 800);
          break;
        case "pressing":
          timeout = setTimeout(() => {
            cursor.pressUp();
            setState("loading");
            cursor.setType("wait");
          }, 300);
          break;
        case "loading":
          // Move cursor away halfway through loading
          setTimeout(() => {
            cursor.setPosition({ x: "70%", y: "80%" });
            cursor.setType("default");
          }, 1200);
          timeout = setTimeout(() => setState("success"), 2500);
          break;
        case "success":
          timeout = setTimeout(() => setState("idle"), 1500);
          break;
        case "disabled":
          timeout = setTimeout(() => setState("idle"), 2000);
          break;
      }
    };

    runSequence();

    return () => clearTimeout(timeout);
  }, [autoPlay, state, cursor]);

  // Initial positioning
  useEffect(() => {
    if (autoPlay && state === "idle") {
      cursor.setPosition({ x: "70%", y: "80%" });
      cursor.setType("default");
    }
  }, [autoPlay, state === "idle"]);

  const handleClick = () => {
    if (state === "disabled" || state === "loading") return;

    setState("pressing");
    setTimeout(() => {
      setState("loading");
      setTimeout(() => {
        setState("success");
        setTimeout(() => {
          setState("idle");
        }, 1500);
      }, 2000);
    }, 150);
  };

  const getButtonStyles = () => {
    const base =
      "relative px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 min-w-[160px]";

    switch (state) {
      case "idle":
        return `${base} bg-indigo-600 hover:bg-indigo-700 active:scale-95 cursor-pointer`;
      case "hover":
        return `${base} bg-indigo-700 cursor-pointer shadow-lg shadow-indigo-500/25 -translate-y-0.5`;
      case "loading":
        return `${base} bg-indigo-600 cursor-wait`;
      case "disabled":
        return `${base} bg-zinc-400 dark:bg-zinc-600 cursor-not-allowed opacity-60`;
      case "pressing":
        return `${base} bg-indigo-700 scale-95`;
      case "success":
        return `${base} bg-emerald-600`;
      default:
        return base;
    }
  };

  const getButtonContent = () => {
    switch (state) {
      case "idle":
        return "Submit";
      case "hover":
        return "Submit";
      case "loading":
        return (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        );
      case "disabled":
        return "Submit";
      case "pressing":
        return "Submit";
      case "success":
        return (
          <>
            <Check size={18} />
            Done!
          </>
        );
      default:
        return "Submit";
    }
  };

  const stateInfo: Record<ButtonState, { label: string; description: string; color: string }> = {
    idle: {
      label: "Idle",
      description: "Ready for interaction. Hover and click are available.",
      color: "text-indigo-400",
    },
    hover: {
      label: "Hover",
      description: "Cursor over button. Shows interactivity.",
      color: "text-purple-400",
    },
    loading: {
      label: "Loading",
      description: "Action in progress. Button is non-interactive.",
      color: "text-amber-400",
    },
    disabled: {
      label: "Disabled",
      description: "Interaction is blocked. Shows reduced opacity.",
      color: "text-zinc-400",
    },
    pressing: {
      label: "Pressing",
      description: "Active press state. Shows scale-down feedback.",
      color: "text-emerald-400",
    },
    success: {
      label: "Success",
      description: "Action completed. Provides positive feedback.",
      color: "text-emerald-400",
    },
  };

  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary)/50 backdrop-blur-md overflow-hidden shadow-sm">
      <div
        ref={containerRef}
        className="relative p-8 flex flex-col items-center justify-center min-h-[200px] bg-linear-to-br from-indigo-500/5 to-purple-500/5"
      >
        {cursor.RenderCursor()}

        <button
          ref={buttonRef}
          onClick={handleClick}
          disabled={state === "disabled" || state === "loading"}
          className={getButtonStyles()}
        >
          {getButtonContent()}
        </button>
      </div>

      <div className="border-t border-(--border-color) p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`text-lg font-semibold ${stateInfo[state].color}`}>
              {stateInfo[state].label}
            </span>
            <span className="text-sm text-(--text-secondary)">{stateInfo[state].description}</span>
          </div>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="relative overflow-hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-(--text-primary) transition-all text-sm backdrop-blur-md border border-gray-500/20 bg-linear-to-b from-gray-500/5 to-gray-500/0 hover:from-gray-500/10 hover:to-gray-500/5 before:absolute before:inset-0 before:bg-current before:opacity-0 before:scale-0 before:rounded-full before:transition-all active:before:duration-300 before:duration-0 active:before:scale-150 active:before:opacity-10 active:shadow-lg"
          >
            {autoPlay ? <Pause size={14} /> : <Play size={14} />}
            {autoPlay ? "Pause" : "Auto-play"}
          </button>
        </div>

        {/* Finite State Machine Diagram */}
        <div className="flex flex-col gap-4">
          {/* Main flow: Idle → Hover → Pressing → Loading → Success → Idle */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(["idle", "hover", "pressing", "loading", "success"] as ButtonState[]).map(
              (s, index, arr) => (
                <div key={s} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAutoPlay(false);
                      setState(s);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm shadow-sm ${
                      state === s
                        ? "bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500/50 shadow-indigo-500/20"
                        : "bg-(--bg-primary)/50 text-(--text-secondary) hover:text-(--text-primary) border border-(--border-color) hover:bg-(--bg-primary)/70"
                    }`}
                  >
                    {stateInfo[s].label}
                  </button>
                  {index < arr.length - 1 && (
                    <ArrowRight size={16} className="text-(--text-secondary) shrink-0" />
                  )}
                </div>
              ),
            )}
            {/* Loop back arrow */}
            <div className="flex items-center gap-2">
              <ArrowRight size={16} className="text-(--text-secondary)" />
              <span className="text-xs text-(--text-secondary) italic">loops</span>
            </div>
          </div>

          {/* Branch: Disabled state */}
          <div className="flex items-center justify-center gap-2 text-sm text-(--text-secondary)">
            <span className="italic">or when invalid:</span>
            <ArrowRight size={14} />
            <button
              onClick={() => {
                setAutoPlay(false);
                setState("disabled");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm shadow-sm ${
                state === "disabled"
                  ? "bg-zinc-500/20 text-zinc-400 border-2 border-zinc-500/50"
                  : "bg-(--bg-primary)/50 text-(--text-secondary) hover:text-(--text-primary) border border-(--border-color) hover:bg-(--bg-primary)/70"
              }`}
            >
              Disabled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// State Card Component
// ============================================================================

function StateCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-4`}>
        <Icon size={20} className="text-white" />
      </div>
      <h3 className="font-semibold text-(--text-primary) mb-2">{title}</h3>
      <p className="text-sm text-(--text-secondary)">{description}</p>
    </div>
  );
}

// ============================================================================
// Code Example Component with Syntax Highlighting
// ============================================================================

// ============================================================================
// Interactive State Code Component
// ============================================================================

type CodeState = "idle" | "hover" | "loading" | "disabled" | "pressing";

const STATE_INFO: Record<CodeState, { label: string; description: string; color: string }> = {
  idle: {
    label: "Idle",
    description: "The default resting state. Clearly clickable with base styling.",
    color: "indigo",
  },
  hover: {
    label: "Hover",
    description: "Provides feedback when cursor is over the button. Signals interactivity.",
    color: "purple",
  },
  loading: {
    label: "Loading",
    description: "Shows progress while processing. Prevents double-clicks.",
    color: "amber",
  },
  disabled: {
    label: "Disabled",
    description: "Indicates unavailable action. Muted appearance, no pointer events.",
    color: "zinc",
  },
  pressing: {
    label: "Pressing",
    description: "Visual feedback on click/tap. Scale-down or color shift.",
    color: "emerald",
  },
};

function InteractiveStateCode() {
  const [activeState, setActiveState] = useState<CodeState>("idle");
  const [highlightedCode, setHighlightedCode] = useState<string>("");

  // The complete code as a single string for shiki
  const code = `// Complete button with all states
<button
  disabled={isLoading || isDisabled}
  className={cn(
    // Base styles (Idle)
    "px-6 py-3 rounded-xl font-medium text-white",
    "flex items-center justify-center gap-2",
    "transition-all duration-200",
    
    // Hover state
    "hover:bg-indigo-700",
    "hover:shadow-lg hover:shadow-indigo-500/25",
    "hover:-translate-y-0.5",
    
    // Pressing state (active)
    "active:scale-95",
    "active:translate-y-0",
    
    // Loading & Disabled conditional styles
    isLoading
      ? "bg-indigo-600 cursor-wait"
      : !isDisabled
        ? "bg-zinc-400 cursor-not-allowed opacity-60"
        : "bg-indigo-600 cursor-pointer"
  )}
>
  {isLoading ? (
    <>
      <Loader2 className="animate-spin" size={18} />
      Processing...
    </>
  ) : (
    "Submit"
  )}
</button>`;

  // Define which line ranges to highlight for each state
  const highlightRanges: Record<CodeState, number[]> = {
    idle: [5, 6, 7, 8], // Base classes
    hover: [11, 12, 13], // hover: classes
    loading: [3, 20, 21, 27, 28, 29, 30, 31, 32, 33, 34], // isLoading conditional
    disabled: [3, 22, 23], // disabled conditional
    pressing: [16, 17], // active: classes
  };

  // Explicit class mappings for Tailwind
  const stateStyles: Record<
    CodeState,
    {
      tabActive: string;
      tabActiveLight: string;
      labelColor: string;
      highlightBg: string;
      highlightBgLight: string;
      highlightBorder: string;
    }
  > = {
    idle: {
      tabActive: "bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500/50",
      tabActiveLight: "bg-indigo-100 text-indigo-700 border-2 border-indigo-300",
      labelColor: "text-indigo-400 dark:text-indigo-400",
      highlightBg: "bg-indigo-500/15 dark:bg-indigo-500/20",
      highlightBgLight: "bg-indigo-100",
      highlightBorder: "border-l-3 border-indigo-500",
    },
    hover: {
      tabActive: "bg-purple-500/20 text-purple-400 border-2 border-purple-500/50",
      tabActiveLight: "bg-purple-100 text-purple-700 border-2 border-purple-300",
      labelColor: "text-purple-400 dark:text-purple-400",
      highlightBg: "bg-purple-500/15 dark:bg-purple-500/20",
      highlightBgLight: "bg-purple-100",
      highlightBorder: "border-l-3 border-purple-500",
    },
    loading: {
      tabActive: "bg-amber-500/20 text-amber-400 border-2 border-amber-500/50",
      tabActiveLight: "bg-amber-100 text-amber-700 border-2 border-amber-300",
      labelColor: "text-amber-400 dark:text-amber-400",
      highlightBg: "bg-amber-500/15 dark:bg-amber-500/20",
      highlightBgLight: "bg-amber-100",
      highlightBorder: "border-l-3 border-amber-500",
    },
    disabled: {
      tabActive: "bg-zinc-500/20 text-zinc-400 border-2 border-zinc-500/50",
      tabActiveLight: "bg-zinc-200 text-zinc-700 border-2 border-zinc-400",
      labelColor: "text-zinc-400 dark:text-zinc-400",
      highlightBg: "bg-zinc-500/15 dark:bg-zinc-500/20",
      highlightBgLight: "bg-zinc-200",
      highlightBorder: "border-l-3 border-zinc-500",
    },
    pressing: {
      tabActive: "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50",
      tabActiveLight: "bg-emerald-100 text-emerald-700 border-2 border-emerald-300",
      labelColor: "text-emerald-400 dark:text-emerald-400",
      highlightBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
      highlightBgLight: "bg-emerald-100",
      highlightBorder: "border-l-3 border-emerald-500",
    },
  };

  // Use shiki for syntax highlighting
  useEffect(() => {
    import("shiki").then(({ codeToHtml }) => {
      codeToHtml(code, {
        lang: "tsx",
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
      }).then(setHighlightedCode);
    });
  }, [code]);

  const styles = stateStyles[activeState];
  const highlightedLines = highlightRanges[activeState];

  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) overflow-hidden">
      {/* State selector tabs */}
      <div className="p-4 border-b border-(--border-color) bg-(--bg-primary)">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATE_INFO) as CodeState[]).map((state) => {
            const info = STATE_INFO[state];
            const isActive = activeState === state;
            return (
              <button
                key={state}
                onClick={() => setActiveState(state)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? `${stateStyles[state].tabActive} dark:${stateStyles[state].tabActive}`
                    : "bg-(--bg-secondary) text-(--text-secondary) hover:text-(--text-primary) border border-(--border-color)"
                }`}
              >
                {info.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-3 border-b border-(--border-color) bg-(--bg-primary)">
        <p className="text-sm text-(--text-secondary)">
          <span className={`font-medium ${styles.labelColor}`}>
            {STATE_INFO[activeState].label}:
          </span>{" "}
          {STATE_INFO[activeState].description}
        </p>
      </div>

      {/* Code block with syntax highlighting and line highlighting */}
      <div className="p-4 overflow-x-auto text-sm">
        <style>
          {`
            .interactive-code .shiki code {
              display: block;
            }
            .interactive-code .shiki .line {
              display: block;
              padding: 0.15rem 0.5rem;
              margin: -0.15rem -0.5rem;
              min-height: 1rem;
              line-height: 1rem;
              border-left: 3px solid transparent;
              transition: all 0.2s ease;
            }
            ${highlightedLines
              .map(
                (lineNum) => `
              .interactive-code .shiki .line:nth-child(${lineNum}) {
                background: var(--highlight-bg);
                border-left-color: var(--highlight-border);
                opacity: 1 !important;
              }
            `,
              )
              .join("")}
            .interactive-code .shiki .line:not(:nth-child(${highlightedLines.join("):not(:nth-child(")})) {
              opacity: 0.4;
            }
          `}
        </style>
        <div
          className="interactive-code [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_code]:!text-sm"
          style={
            {
              "--highlight-bg":
                activeState === "idle"
                  ? "rgba(99, 102, 241, 0.15)"
                  : activeState === "hover"
                    ? "rgba(168, 85, 247, 0.15)"
                    : activeState === "loading"
                      ? "rgba(245, 158, 11, 0.15)"
                      : activeState === "disabled"
                        ? "rgba(113, 113, 122, 0.15)"
                        : "rgba(16, 185, 129, 0.15)",
              "--highlight-border":
                activeState === "idle"
                  ? "#6366f1"
                  : activeState === "hover"
                    ? "#a855f7"
                    : activeState === "loading"
                      ? "#f59e0b"
                      : activeState === "disabled"
                        ? "#71717a"
                        : "#10b981",
            } as React.CSSProperties
          }
        >
          {highlightedCode ? (
            <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          ) : (
            <pre className="text-(--text-secondary)">{code}</pre>
          )}
        </div>
      </div>

      {/* Tips for the active state */}
      <div className="px-4 py-3 border-t border-(--border-color) bg-(--bg-primary) text-sm">
        {activeState === "idle" && (
          <p className="text-(--text-secondary)">
            <strong className="text-(--text-primary)">💡 Tip:</strong> Base styles define the
            button's default appearance. Keep these consistent across your design system.
          </p>
        )}
        {activeState === "hover" && (
          <p className="text-(--text-secondary)">
            <strong className="text-(--text-primary)">💡 Tip:</strong> Combine subtle effects
            (color, shadow, transform) for a polished hover. Avoid jarring changes.
          </p>
        )}
        {activeState === "loading" && (
          <p className="text-(--text-secondary)">
            <strong className="text-(--text-primary)">💡 Tip:</strong> Always disable during loading
            to prevent double-submissions. Update the label to show progress.
          </p>
        )}
        {activeState === "disabled" && (
          <p className="text-(--text-secondary)">
            <strong className="text-(--text-primary)">💡 Tip:</strong> Use reduced opacity and
            cursor-not-allowed. Consider adding a tooltip explaining why it's disabled.
          </p>
        )}
        {activeState === "pressing" && (
          <p className="text-(--text-secondary)">
            <strong className="text-(--text-primary)">💡 Tip:</strong> Use short durations
            (100-150ms) for snappy feedback. Scale-down
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Best Practice Item Component
// ============================================================================

// ============================================================================
// Main Page Component
// ============================================================================

function ButtonStates() {
  return (
    <PageContainer maxWidth="3xl">
      {/* Hero Section */}
      <GuidelineHero
        title="Mastering Button Interactions"
        description={
          <>
            The details that make buttons feel tangible and responsive.
            <br />
            <span className="text-(--text-primary) font-medium">
              Don't settle for browser defaults.
            </span>
          </>
        }
        badge={{
          icon: Hand,
          text: "Interaction Design",
        }}
      />

      {/* Interactive Demo */}
      <div className="mb-16">
        <InteractiveButtonDemo />
      </div>

      {/* States Overview Grid */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-(--text-primary) text-center mb-8">
          The Five Essential States
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StateCard
            icon={Sparkles}
            title="Idle State"
            description="The default resting state. Clearly clickable with hover effects."
            color="bg-indigo-500"
          />
          <StateCard
            icon={MousePointer}
            title="Hover State"
            description="Provides feedback when cursor is over the button. Signals interactivity."
            color="bg-purple-500"
          />
          <StateCard
            icon={Hand}
            title="Pressing State"
            description="Visual feedback on press. Scale-down or click effect."
            color="bg-emerald-500"
          />
          <StateCard
            icon={Loader2}
            title="Loading State"
            description="Shows progress while waiting. Prevents double-clicks."
            color="bg-amber-500"
          />
          <StateCard
            icon={Ban}
            title="Disabled State"
            description="Indicates unavailable action. Reduced opacity and no pointer."
            color="bg-zinc-500"
          />
        </div>
      </div>

      {/* Button States - Interactive Code Block */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-(--text-primary) text-center mb-4">
          Button States Implementation
        </h2>
        <p className="text-(--text-secondary) text-center mb-8 max-w-2xl mx-auto">
          Click on each state to see which parts of the code handle it. A complete button should
          handle all five states in a single, unified component.
        </p>
        <InteractiveStateCode />
      </div>

      {/* Button Variants */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-(--text-primary) text-center mb-4">
          Button Variants
        </h2>
        <p className="text-(--text-secondary) text-center mb-8 max-w-2xl mx-auto">
          Buttons with icons require special attention to optical alignment. When adding icons, the
          padding should be adjusted to maintain visual balance.
        </p>

        {/* Leading Icon Variant */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-3">With Leading Icon</h3>

          {/* Visual Demo */}
          <div className="mb-4 p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)">
            <div className="flex flex-wrap items-center gap-4">
              <button className="pl-4 pr-6 py-3 rounded-xl bg-indigo-600 text-white font-medium flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all duration-200">
                <ArrowLeft size={18} />
                Go Back
              </button>
              <button className="pl-4 pr-6 py-3 rounded-xl bg-emerald-600 text-white font-medium flex items-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all duration-200">
                <Check size={18} />
                Approve
              </button>
              <button className="pl-4 pr-6 py-3 rounded-xl bg-purple-600 text-white font-medium flex items-center gap-2 hover:bg-purple-700 active:scale-95 transition-all duration-200">
                <Sparkles size={18} />
                Generate
              </button>
            </div>
            <p className="text-xs text-(--text-secondary) mt-3">Try hovering and clicking!</p>
          </div>

          {/* When to Use */}
          <div className="mb-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <h4 className="font-medium text-(--text-primary) mb-2 text-sm">
              When to Use Leading Icons
            </h4>
            <ul className="text-sm text-(--text-secondary) space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">←</span>
                <span>
                  <strong>Back/Return actions</strong> — The arrow naturally points to where you're
                  going
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">✓</span>
                <span>
                  <strong>Confirmation actions</strong> — Check marks before "Approve", "Confirm",
                  "Accept"
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">+</span>
                <span>
                  <strong>Add/Create actions</strong> — Plus icon before "Add Item", "New Project"
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">★</span>
                <span>
                  <strong>Feature emphasis</strong> — Drawing attention to the action type first
                </span>
              </li>
            </ul>
          </div>

          <CodeExample
            title="Leading Icon Button"
            code={`// Leading icon with adjusted padding
<button
  className="
    pl-4 pr-6 py-3 rounded-xl
    bg-indigo-600 text-white font-medium
    flex items-center gap-2
    hover:bg-indigo-700
    transition-all duration-200
  "
>
  <ArrowLeft size={18} />
  Go Back
</button>

// Key insight: Reduce LEFT padding when icon is on the left.
// The icon itself provides visual weight, so less padding
// is needed to achieve optical balance.
//
// Standard padding:  px-6 (24px both sides)
// With leading icon: pl-4 pr-6 (16px left, 24px right)`}
            description="Reduce padding on the side with the icon. Icons have inherent visual weight that substitutes for some padding."
          />
        </div>

        {/* Trailing Icon Variant */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-3">With Trailing Icon</h3>

          {/* Visual Demo */}
          <div className="mb-4 p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)">
            <div className="flex flex-wrap items-center gap-4">
              <button className="pl-6 pr-4 py-3 rounded-xl bg-indigo-600 text-white font-medium flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all duration-200">
                Continue
                <ArrowRight size={18} />
              </button>
              <button className="pl-6 pr-4 py-3 rounded-xl bg-amber-600 text-white font-medium flex items-center gap-2 hover:bg-amber-700 active:scale-95 transition-all duration-200">
                Next Step
                <ArrowRight size={18} />
              </button>
              <button className="pl-6 pr-4 py-3 rounded-xl bg-rose-600 text-white font-medium flex items-center gap-2 hover:bg-rose-700 active:scale-95 transition-all duration-200">
                Submit
                <Check size={18} />
              </button>
            </div>
            <p className="text-xs text-(--text-secondary) mt-3">
              Notice how the reduced right padding (pr-4) keeps the content visually centered.
            </p>
          </div>

          {/* When to Use */}
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <h4 className="font-medium text-(--text-primary) mb-2 text-sm">
              When to Use Trailing Icons
            </h4>
            <ul className="text-sm text-(--text-secondary) space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-amber-400">→</span>
                <span>
                  <strong>Forward/Next actions</strong> — "Continue", "Next Step", "Proceed"
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">↗</span>
                <span>
                  <strong>External links</strong> — Indicating the action opens something new
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">▼</span>
                <span>
                  <strong>Dropdown triggers</strong> — Chevron indicating expandable content
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">↓</span>
                <span>
                  <strong>Download actions</strong> — Arrow pointing down after "Download"
                </span>
              </li>
            </ul>
            <p className="text-xs text-(--text-secondary) mt-3 italic">
              Rule of thumb: Trailing icons often indicate <strong>direction</strong> or{" "}
              <strong>consequence</strong> of the action.
            </p>
          </div>

          <CodeExample
            title="Trailing Icon Button"
            code={`// Trailing icon with adjusted padding
<button
  className="
    pl-6 pr-4 py-3 rounded-xl
    bg-indigo-600 text-white font-medium
    flex items-center gap-2
    hover:bg-indigo-700
    transition-all duration-200
  "
>
  Continue
  <ArrowRight size={18} />
</button>

// Key insight: Reduce RIGHT padding when icon is on the right.
// This mirrors the leading icon approach.
//
// Standard padding:    px-6 (24px both sides)
// With trailing icon:  pl-6 pr-4 (24px left, 16px right)
//
// The optical center of the button remains balanced
// because the icon compensates for the reduced padding.`}
            description="Mirror the leading icon approach: reduce padding on the icon side to maintain optical balance."
          />
        </div>

        {/* Icon Only Variant */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-3">Icon Only</h3>

          {/* Visual Demo */}
          <div className="mb-4 p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)">
            <div className="flex flex-wrap items-center gap-4">
              {/* Square variants */}
              <div className="flex flex-col items-center gap-2">
                <button
                  className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all duration-200"
                  aria-label="Settings"
                >
                  <Settings size={20} />
                </button>
                <span className="text-xs text-(--text-secondary)">Square</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all duration-200"
                  aria-label="Add item"
                >
                  <Plus size={20} />
                </button>
                <span className="text-xs text-(--text-secondary)">Square</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 active:scale-95 transition-all duration-200"
                  aria-label="Play"
                >
                  <Play size={20} />
                </button>
                <span className="text-xs text-(--text-secondary)">Square</span>
              </div>

              <div className="w-px h-12 bg-(--border-color) mx-2" />

              {/* Circular variants */}
              <div className="flex flex-col items-center gap-2">
                <button
                  className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 active:scale-95 transition-all duration-200"
                  aria-label="Settings"
                >
                  <Settings size={20} />
                </button>
                <span className="text-xs text-(--text-secondary)">Circular</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 active:scale-95 transition-all duration-200"
                  aria-label="Add item"
                >
                  <Plus size={20} />
                </button>
                <span className="text-xs text-(--text-secondary)">Circular</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  className="w-12 h-12 rounded-full bg-cyan-600 text-white flex items-center justify-center hover:bg-cyan-700 active:scale-95 transition-all duration-200"
                  aria-label="Check"
                >
                  <Check size={20} />
                </button>
                <span className="text-xs text-(--text-secondary)">Circular</span>
              </div>
            </div>
            <p className="text-xs text-(--text-secondary) mt-4">
              Icon-only buttons work great for toolbars and compact UIs.
            </p>
          </div>

          {/* When to Use */}
          <div className="mb-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <h4 className="font-medium text-(--text-primary) mb-2 text-sm">
              When to Use Icon-Only Buttons
            </h4>
            <ul className="text-sm text-(--text-secondary) space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">⚙️</span>
                <span>
                  <strong>Toolbars & action bars</strong> — Where space is limited and icons are
                  universally understood
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">🔁</span>
                <span>
                  <strong>Repeated actions</strong> — Close buttons, expand/collapse, media controls
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">📱</span>
                <span>
                  <strong>Mobile interfaces</strong> — Maximizing touch target while saving
                  horizontal space
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">🎯</span>
                <span>
                  <strong>Universally recognized icons</strong> — Play, pause, close, settings,
                  search
                </span>
              </li>
            </ul>
          </div>

          {/* Accessibility Requirements */}
          <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <h4 className="font-semibold text-(--text-primary) mb-2 text-sm flex items-center gap-2">
              <span>⚠️</span> Required: Accessibility & Clarity
            </h4>
            <div className="space-y-3 text-sm text-(--text-secondary)">
              <div>
                <p className="font-medium text-(--text-primary)">
                  Always add{" "}
                  <code className="px-1.5 py-0.5 rounded bg-(--bg-primary) text-rose-400">
                    aria-label
                  </code>
                </p>
                <p className="text-xs mt-1">
                  Screen readers cannot interpret icons. The aria-label provides the accessible name
                  that describes the button's action.
                </p>
              </div>
              <div>
                <p className="font-medium text-(--text-primary)">Add a tooltip for sighted users</p>
                <p className="text-xs mt-1">
                  Even with universally recognized icons, tooltips eliminate ambiguity. Show the
                  tooltip on hover/focus with a short delay (300-500ms).
                </p>
              </div>
            </div>
          </div>

          <CodeExample
            title="Icon Only Button"
            code={`// Icon-only button (square or circular)
<button
  className="
    w-12 h-12 rounded-xl
    bg-indigo-600 text-white
    flex items-center justify-center
    hover:bg-indigo-700
    transition-all duration-200
  "
  aria-label="Settings"
>
  <Settings size={20} />
</button>

// Circular variant
<button
  className="
    w-12 h-12 rounded-full
    bg-indigo-600 text-white
    flex items-center justify-center
    hover:bg-indigo-700
    transition-all duration-200
  "
  aria-label="Add item"
>
  <Plus size={20} />
</button>

// Critical: Always include aria-label for icon-only buttons!
// Without visible text, screen readers need the label.`}
            description="Icon-only buttons should be square or circular with equal width/height. Always include aria-label for accessibility."
          />
        </div>

        {/* Why Optical Alignment Matters */}
        <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <h4 className="font-semibold text-(--text-primary) mb-2 flex items-center gap-2">
            <span>👁️</span> Why Optical Alignment Matters
          </h4>
          <p className="text-sm text-(--text-secondary) mb-3">
            Icons are visually denser than whitespace. When you place an icon at the edge of a
            button, it creates an optical illusion where that side appears "heavier" than the other.
          </p>
          <p className="text-sm text-(--text-secondary)">
            By reducing the padding on the icon side, you're compensating for this visual weight,
            making the button appear evenly balanced. This is the same principle used in typography
            when kerning letters—mathematical spacing isn't always visually correct.
          </p>
        </div>
      </div>

      {/* Best Practices */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-(--text-primary) text-center mb-8">
          Best Practices
        </h2>
        <div className="space-y-4">
          <BestPractice
            emoji="⚡"
            title="Keep transitions snappy"
            description="Use 100-200ms for state changes. Any longer feels sluggish."
          />
          <BestPractice
            emoji="🎯"
            title="Prevent double-clicks"
            description="Always disable the button during loading to prevent duplicate submissions."
          />
          <BestPractice
            emoji="💬"
            title="Update button text"
            description="Change from 'Submit' to 'Processing...' to 'Done!' for clear communication."
          />
          <BestPractice
            emoji="🔄"
            title="Show success state"
            description="After completing an action, briefly show a success state before resetting."
          />
          <BestPractice
            emoji="🎨"
            title="Maintain contrast"
            description="Even in disabled state, ensure text remains readable for accessibility."
          />
        </div>
      </div>

      {/* Why This Matters */}
      <div className="mb-20">
        <div className="p-8 rounded-2xl bg-linear-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
          <h2 className="text-xl font-bold text-(--text-primary) mb-4">Why Button States Matter</h2>
          <ul className="space-y-3 text-(--text-secondary)">
            <li className="flex items-start gap-3">
              <span className="text-lg">🧠</span>
              <span>
                <strong className="text-(--text-primary)">Reduces uncertainty</strong> — Users know
                their action was registered
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">🚫</span>
              <span>
                <strong className="text-(--text-primary)">Prevents errors</strong> — Loading state
                blocks double-submissions
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">✨</span>
              <span>
                <strong className="text-(--text-primary)">Feels premium</strong> — Polished
                micro-interactions build trust
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">♿</span>
              <span>
                <strong className="text-(--text-primary)">Improves accessibility</strong> — Clear
                states help all users understand what's happening
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center pb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </footer>
    </PageContainer>
  );
}
