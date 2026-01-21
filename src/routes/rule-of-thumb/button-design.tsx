import { createFileRoute } from "@tanstack/react-router";
import { GuidelinePagination } from "./-components/guideline-pagination";
import { useState, useEffect } from "react";
import { cn } from "@/cn";
import {
  AnimationDemo,
  AnimationStage,
  AnimationControls,
  AnimatedCursor,
  useAnimationDemo,
} from "../../components/animation-demo";
import "./button-design.css";
import { GlassyButton } from "../../components/glassy-button";
import { PageContainer } from "../../components/page-container";
import {
  ArrowLeftIcon,
  CircleNotchIcon,
  CursorIcon,
  CheckIcon,
  ProhibitIcon,
  SparkleIcon,
  ArrowRightIcon,
  CaretRightIcon,
  HandIcon,
  GearIcon,
  PlusIcon,
  TrashIcon,
  WarningIcon,
  XIcon,
  PencilIcon,
  ArrowUpRightIcon,
  CaretDownIcon,
  DownloadSimpleIcon,
  ArrowsClockwiseIcon,
  DeviceMobileIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { SimpleTooltip } from "@/components/tooltip";
import { BestPractice, CodeExample, RuleOfThumbHero, ButtonVariantMatrix } from "./-components";

export const Route = createFileRoute("/rule-of-thumb/button-design")({
  component: ButtonStates,
});

// ============================================================================
// Interactive Button Demo Component
// ============================================================================

function InteractiveButtonDemo() {
  return (
    <AnimationDemo duration={6000} masterAnimationName="button-demo-cursor-move">
      <InteractiveButtonDemoContent />
    </AnimationDemo>
  );
}

function InteractiveButtonDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  // Base styles: Primary variant
  const base = cn(
    "relative overflow-hidden inline-flex items-center justify-center gap-2 px-3 h-8.5 rounded-md text-blue-700 dark:text-blue-100 transition-all text-sm backdrop-blur-md border border-blue-500/20 dark:border-blue-400/30",
    "bg-linear-to-b from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10",
    "",
  );

  return (
    <>
      <AnimationStage>
        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="button-demo-cursor-move"
          rippleAnimationName="button-demo-cursor-ripple"
        />

        {/* The Button */}
        <div
          className={cn(
            base,
            "cursor-default grid place-items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          )}
          style={{
            ...animationStyle,
            animationName:
              status !== "idle"
                ? "button-demo-width, button-demo-container-scale, button-demo-border-success"
                : "none",
            borderColor: "rgba(228, 228, 231, 0.4)", // Default border
          }}
        >
          {/* Highlight Overlay (Hover Simulation) */}
          <div
            className="absolute inset-0 bg-linear-to-b from-blue-500/20 to-blue-500/10 dark:from-blue-400/30 dark:to-blue-400/20 pointer-events-none"
            style={{
              ...animationStyle,
              animationName: status !== "idle" ? "button-demo-highlight" : "none",
              opacity: 0,
            }}
          />

          {/* Idle Content */}
          <div
            className="col-start-1 col-end-1 row-start-1 row-end-1 flex items-center gap-2"
            style={{
              ...animationStyle,
              animationName: status !== "idle" ? "button-demo-content-idle" : "none",
            }}
          >
            Submit
          </div>

          {/* Loading Content */}
          <div
            className="col-start-1 col-end-1 row-start-1 row-end-1 flex items-center gap-2 justify-center"
            style={{
              ...animationStyle,
              animationName: status !== "idle" ? "button-demo-content-loading" : "none",
              opacity: 0,
            }}
          >
            <CircleNotchIcon size={18} className="animate-spin" />
            Processing...
          </div>

          {/* Success Content */}
          <div
            className="col-start-1 col-end-1 row-start-1 row-end-1 flex items-center gap-2 justify-center text-emerald-600 dark:text-emerald-400"
            style={{
              ...animationStyle,
              animationName: status !== "idle" ? "button-demo-content-success" : "none",
              opacity: 0,
            }}
          >
            <CheckIcon size={18} />
            Done!
          </div>
        </div>
      </AnimationStage>

      <AnimationControls title="Button Interaction">
        <p className="text-sm text-(--text-secondary)">
          <strong className="text-(--text-primary)">Complete Lifecycle:</strong> A well-designed
          button handles idle, hover, press, loading, and success states seamlessly.
        </p>
      </AnimationControls>
    </>
  );
}

// ============================================================================
// Interactive Disabled Demo Component
// ============================================================================

function InteractiveDisabledDemo() {
  return (
    <AnimationDemo duration={4000} masterAnimationName="disabled-demo-cursor-move">
      <InteractiveDisabledDemoContent />
    </AnimationDemo>
  );
}

function InteractiveDisabledDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  return (
    <>
      <style>
        {`
          @keyframes disabled-demo-cursor-move {
            0% { transform: translate(100px, 80px); }
            35% { transform: translate(0px, 0px); } /* Center/Over button */
            65% { transform: translate(20px, -15px); } /* Still over button */
            100% { transform: translate(100px, 80px); }
          }
           @keyframes disabled-demo-cursor-swap {
            0%, 16% { opacity: 1; }
            17%, 71% { opacity: 0; }
            72%, 100% { opacity: 1; }
          }
          @keyframes disabled-demo-cursor-swap-inverse {
            0%, 16% { opacity: 0; }
            17%, 71% { opacity: 1; }
            72%, 100% { opacity: 0; }
          }
        `}
      </style>
      <AnimationStage>
        {/* Disabled Button - Centered */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <GlassyButton
            disabled
            className="w-24 opacity-60 cursor-not-allowed bg-none bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-none shadow-none border-black/5 dark:border-white/5"
          >
            Submit
          </GlassyButton>
        </div>

        {/* Cursor Container - Origin at Center */}
        <div
          className="absolute top-1/2 left-1/2 pointer-events-none z-50"
          style={{
            ...animationStyle,
            animationName: status !== "idle" ? "disabled-demo-cursor-move" : "none",
            marginLeft: "-6px", // Offset to center pointer tip visually
            marginTop: "-2px",
          }}
        >
          {/* Default Pointer */}
          <div
            className="absolute top-0 left-0"
            style={{
              animation:
                status !== "idle" ? "4000ms disabled-demo-cursor-swap linear infinite" : "none",
            }}
          >
            <CursorIcon className="fill-white text-black stroke-1 rotate-20" size={24} />
          </div>

          {/* Forbidden Cursor */}
          <div
            className="absolute top-0 left-0"
            style={{
              animation:
                status !== "idle"
                  ? "4000ms disabled-demo-cursor-swap-inverse linear infinite"
                  : "none",
              opacity: 0,
            }}
          >
            <ProhibitIcon className="text-red-500" size={24} />
          </div>
        </div>
      </AnimationStage>

      <AnimationControls title="Disabled State Behavior">
        <p className="text-sm text-(--text-secondary)">
          <strong className="text-(--text-primary)">Visual Feedback:</strong> When a button is
          disabled, the cursor should immediately change to indicate the action is forbidden.
        </p>
      </AnimationControls>
    </>
  );
}

// ============================================================================
// Code Example Component with Syntax Highlighting
// ============================================================================

// ============================================================================
// Interactive State Code Component
// ============================================================================

type CodeState = "idle" | "hover" | "loading" | "disabled" | "pressing";

const STATE_INFO: Record<CodeState, { label: string; description: string }> = {
  idle: {
    label: "Idle",
    description: "The default resting state. Clearly clickable with base styling.",
  },
  hover: {
    label: "Hover",
    description: "Provides feedback when cursor is over the button. Signals interactivity.",
  },
  loading: {
    label: "Loading",
    description: "Shows progress while processing. Prevents double-clicks.",
  },
  disabled: {
    label: "Disabled",
    description: "Indicates unavailable action. Muted appearance, no pointer events.",
  },
  pressing: {
    label: "Pressing",
    description: "Visual feedback on click/tap. Scale-down or color shift.",
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
    
    // Hover state (Glassy overlay)
    "hover:bg-zinc-500/5 dark:hover:bg-white/10",
    "hover:shadow-lg",
    
    // Pressing state (active)
    "active:scale-95",
    
    // Loading & Disabled conditional styles
    isLoading
      ? "cursor-wait"
      : !isDisabled
        ? "cursor-not-allowed opacity-60"
        : "cursor-default"
  )}
>
  {isLoading ? (
    <>
      <CircleNotchIcon className="animate-spin" size={18} />
      Processing...
    </>
  ) : (
    "Submit"
  )}
</button>`;

  // Define which line ranges to highlight for each state
  const highlightRanges: Record<CodeState, number[]> = {
    idle: [5, 6, 7], // Base classes
    hover: [10, 11], // hover: classes
    loading: [17, 24, 25, 26, 27, 28], // isLoading conditional
    disabled: [19, 20], // disabled conditional
    pressing: [14], // active: classes
  };

  // Explicit class mappings for Tailwind
  const stateStyles: Record<
    CodeState,
    {
      tabActive: string;
      labelColor: string;
      highlightBg: string;
      highlightBorder: string;
    }
  > = {
    idle: {
      tabActive: "bg-zinc-500/10 text-zinc-900 dark:text-zinc-100 border-zinc-500/20",
      labelColor: "text-zinc-900 dark:text-zinc-100",
      highlightBg: "rgba(113, 113, 122, 0.1)",
      highlightBorder: "#a1a1aa",
    },
    hover: {
      tabActive: "bg-zinc-500/10 text-zinc-900 dark:text-zinc-100 border-zinc-500/20",
      labelColor: "text-zinc-900 dark:text-zinc-100",
      highlightBg: "rgba(113, 113, 122, 0.1)",
      highlightBorder: "#a1a1aa",
    },
    loading: {
      tabActive: "bg-zinc-500/10 text-zinc-900 dark:text-zinc-100 border-zinc-500/20",
      labelColor: "text-zinc-900 dark:text-zinc-100",
      highlightBg: "rgba(113, 113, 122, 0.1)",
      highlightBorder: "#a1a1aa",
    },
    disabled: {
      tabActive: "bg-zinc-500/10 text-zinc-900 dark:text-zinc-100 border-zinc-500/20",
      labelColor: "text-zinc-900 dark:text-zinc-100",
      highlightBg: "rgba(113, 113, 122, 0.1)",
      highlightBorder: "#a1a1aa",
    },
    pressing: {
      tabActive: "bg-zinc-500/10 text-zinc-900 dark:text-zinc-100 border-zinc-500/20",
      labelColor: "text-zinc-900 dark:text-zinc-100",
      highlightBg: "rgba(113, 113, 122, 0.1)",
      highlightBorder: "#a1a1aa",
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
    <div className="rounded-2xl squircle border border-(--border-color) bg-(--bg-secondary) overflow-hidden">
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
                    ? `${stateStyles[state].tabActive}`
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
          className="interactive-code [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:m-0! [&_code]:text-sm!"
          style={
            {
              "--highlight-bg":
                activeState === "idle"
                  ? "rgba(113, 113, 122, 0.1)"
                  : activeState === "hover"
                    ? "rgba(113, 113, 122, 0.1)"
                    : activeState === "loading"
                      ? "rgba(113, 113, 122, 0.1)"
                      : activeState === "disabled"
                        ? "rgba(113, 113, 122, 0.1)"
                        : "rgba(113, 113, 122, 0.1)",
              "--highlight-border":
                activeState === "idle"
                  ? "#a1a1aa"
                  : activeState === "hover"
                    ? "#a1a1aa"
                    : activeState === "loading"
                      ? "#a1a1aa"
                      : activeState === "disabled"
                        ? "#a1a1aa"
                        : "#a1a1aa",
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
      <RuleOfThumbHero
        title="Button Design"
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
          icon: HandIcon,
          text: "Interaction Design",
        }}
        markdownUrl="/rule-of-thumb/button-design.md"
      />

      {/* Interactive Demo */}
      <div className="mb-16">
        <InteractiveButtonDemo />
      </div>

      {/* States Overview Grid */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-(--text-primary) text-center mb-8">
          The Essential States
        </h2>
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-0 pl-px pt-px"
          role="list"
          aria-label="Button states"
        >
          {[
            {
              icon: SparkleIcon,
              title: "Idle State",
              description: "The default resting state. Clearly clickable with hover effects.",
            },
            {
              icon: CursorIcon,
              title: "Hover State",
              description:
                "Provides feedback when cursor is over the button. Signals interactivity.",
            },
            {
              icon: HandIcon,
              title: "Pressing State",
              description: "Visual feedback on press. Scale-down or click effect.",
            },
            {
              icon: CircleNotchIcon,
              title: "Loading State",
              description: "Shows progress while waiting. Prevents double-clicks.",
            },
            {
              icon: ProhibitIcon,
              title: "Disabled State",
              description: "Indicates unavailable action. Reduced opacity and no pointer.",
            },
          ].map((state) => (
            <div
              key={state.title}
              className="relative flex flex-col items-center justify-center gap-3 p-6 h-auto min-h-[200px] transition-all group hover:z-10 -ml-px -mt-px
                before:pointer-events-none before:absolute before:-inset-x-2 before:top-0 before:bottom-0 before:border-t before:border-b before:border-zinc-200 dark:before:border-white/10 group-hover:before:border-(--text-secondary) before:transition-colors before:mask-[linear-gradient(to_right,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]
                after:pointer-events-none after:absolute after:-inset-y-2 after:left-0 after:right-0 after:border-l after:border-r after:border-zinc-200 dark:after:border-white/10 group-hover:after:border-(--text-secondary) after:transition-colors after:mask-[linear-gradient(to_bottom,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]"
              role="listitem"
            >
              <div
                className="w-10 h-10 flex items-center justify-center z-10 rounded-lg bg-zinc-500/10 dark:bg-zinc-500/20 text-(--text-primary)"
                aria-hidden="true"
              >
                <state.icon size={20} />
              </div>
              <h3 className="font-semibold text-(--text-primary) text-center z-10">
                {state.title}
              </h3>
              <p className="text-sm text-(--text-secondary) text-center leading-relaxed z-10">
                {state.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Disabled Demo Section */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-(--text-primary) text-center mb-8">
          Disabled State UX
        </h2>
        <InteractiveDisabledDemo />
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

        {/* Visual Style Variants */}
        {/* Visual Style Variants */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-3">Visual Hierarchy</h3>

          <div className="mb-4 p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <GlassyButton variant="primary">Primary Action</GlassyButton>
                <span className="text-xs text-(--text-secondary)">Primary</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <GlassyButton variant="secondary">Secondary Action</GlassyButton>
                <span className="text-xs text-(--text-secondary)">Secondary</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <GlassyButton variant="ghost">Ghost Action</GlassyButton>
                <span className="text-xs text-(--text-secondary)">Ghost</span>
              </div>
            </div>
            <p className="text-xs text-(--text-secondary) mt-4">
              Use <strong>Primary</strong> for the main call-to-action, <strong>Secondary</strong>{" "}
              for standard actions, and <strong>Ghost</strong> for low-priority or repetitive
              actions.
            </p>
          </div>
        </div>

        {/* Destructive Actions */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-3">Destructive Actions</h3>

          <div className="mb-4 p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <GlassyButton variant="destructive">Delete Project</GlassyButton>
                <span className="text-xs text-(--text-secondary)">Destructive</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <GlassyButton variant="ghost-destructive">Cancel Subscription</GlassyButton>
                <span className="text-xs text-(--text-secondary)">Ghost Destructive</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <h4 className="font-semibold text-(--text-primary) mb-2 text-sm flex items-center gap-2">
              <WarningIcon size={16} className="text-red-500" />
              Avoid Red for Primary Actions
            </h4>
            <p className="text-sm text-(--text-secondary)">
              Reserved red colors for <strong>destructive</strong> actions (delete, remove, block).
              Using red for a primary action (like "Confirm" or "Save") creates cognitive friction
              as users are trained to associate red with danger/warning.
            </p>
          </div>
        </div>

        {/* Variant States Matrix */}
        <ButtonVariantMatrix />

        {/* Leading Icon Variant */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-3">With Leading Icon</h3>

          {/* Visual Demo */}
          <div className="mb-4 p-6 rounded-xl squircle border border-(--border-color) bg-(--bg-secondary)">
            <div className="flex flex-wrap items-center gap-4">
              <GlassyButton variant="ghost" leadingIcon={<ArrowLeftIcon size={18} />}>
                Go Back
              </GlassyButton>
              <GlassyButton variant="primary" leadingIcon={<CheckIcon className="size-4" />}>
                Approve
              </GlassyButton>
              <GlassyButton variant="destructive" leadingIcon={<XIcon className="size-4" />}>
                Reject
              </GlassyButton>
              <GlassyButton variant="secondary" leadingIcon={<PencilIcon className="size-4" />}>
                Edit
              </GlassyButton>
            </div>
            <p className="text-xs text-(--text-secondary) mt-3">Try hovering and clicking!</p>
          </div>

          {/* When to Use */}
          {/* When to Use */}
          <div className="mb-4 rounded-xl squircle border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-5">
            <h4 className="font-semibold text-(--text-primary) mb-4 text-sm">
              When to Use Leading Icons
            </h4>
            <div className="space-y-4">
              {[
                {
                  icon: ArrowLeftIcon,
                  title: "Back/Return actions",
                  description: "The arrow naturally points to where you're going.",
                },
                {
                  icon: CheckIcon,
                  title: "Confirmation actions",
                  description: 'Check marks before "Approve", "Confirm", "Accept".',
                },
                {
                  icon: PlusIcon,
                  title: "Add/Create actions",
                  description: 'Plus icon before "Add Item", "New Project".',
                },
                {
                  icon: SparkleIcon,
                  title: "Feature emphasis",
                  description: "Drawing attention to the action type first.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 items-start">
                  <div className="mt-0.5 p-1 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <item.icon size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-(--text-primary)">{item.title}</p>
                    <p className="text-xs text-(--text-secondary) leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <CodeExample
            title="Leading Icon Button"
            code={`// Using the leadingIcon prop automatically adjusts padding
<GlassyButton leadingIcon={<ArrowLeftIcon size={18} />}>
  Go Back
</GlassyButton>`}
            description="The GlassyButton component automatically detects the icon and applies 'pl-2 pr-3' for optical balance."
          />
        </div>

        {/* Trailing Icon Variant */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-3">With Trailing Icon</h3>

          {/* Visual Demo */}
          <div className="mb-4 p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)">
            <div className="flex flex-wrap items-center gap-4">
              <GlassyButton variant="primary" trailingIcon={<ArrowRightIcon size={18} />}>
                Continue
              </GlassyButton>
              <GlassyButton variant="secondary" trailingIcon={<ArrowRightIcon size={18} />}>
                Next Step
              </GlassyButton>
              <GlassyButton variant="ghost" trailingIcon={<CaretRightIcon size={18} />}>
                Skip
              </GlassyButton>
            </div>
            <p className="text-xs text-(--text-secondary) mt-3">
              Notice how the reduced right padding (pr-4) keeps the content visually centered.
            </p>
          </div>

          {/* When to Use */}
          {/* When to Use */}
          <div className="mb-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-5">
            <h4 className="font-semibold text-(--text-primary) mb-4 text-sm">
              When to Use Trailing Icons
            </h4>
            <div className="space-y-4">
              {[
                {
                  icon: ArrowRightIcon,
                  title: "Forward/Next actions",
                  description: '"Continue", "Next Step", "Proceed".',
                },
                {
                  icon: ArrowUpRightIcon,
                  title: "External links",
                  description: "Indicating the action opens something new.",
                },
                {
                  icon: CaretDownIcon,
                  title: "Dropdown triggers",
                  description: "Chevron indicating expandable content.",
                },
                {
                  icon: DownloadSimpleIcon,
                  title: "Download actions",
                  description: 'Arrow pointing down after "Download".',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 items-start">
                  <div className="mt-0.5 p-1 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <item.icon size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-(--text-primary)">{item.title}</p>
                    <p className="text-xs text-(--text-secondary) leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-(--text-secondary) mt-4 italic border-t border-(--border-color) pt-3">
              Rule of thumb: Trailing icons often indicate <strong>direction</strong> or{" "}
              <strong>consequence</strong> of the action.
            </p>
          </div>

          <CodeExample
            title="Trailing Icon Button"
            code={`// Using the trailingIcon prop automatically adjusts padding
<GlassyButton trailingIcon={<ArrowRightIcon size={18} />}>
  Continue
</GlassyButton>`}
            description="The GlassyButton component automatically detects the icon and applies 'pl-3 pr-2' for optical balance."
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
                <SimpleTooltip content="Settings">
                  <GlassyButton variant="ghost" className="size-8.5 p-0" aria-label="Settings">
                    <GearIcon size={20} />
                  </GlassyButton>
                </SimpleTooltip>
                <span className="text-xs text-(--text-secondary)">Square Ghost</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <SimpleTooltip content="Add item">
                  <GlassyButton variant="secondary" className="size-8.5 p-0" aria-label="Add item">
                    <PlusIcon size={20} />
                  </GlassyButton>
                </SimpleTooltip>
                <span className="text-xs text-(--text-secondary)">Square Secondary</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <SimpleTooltip content="Delete">
                  <GlassyButton variant="destructive" className="size-8.5 p-0" aria-label="Delete">
                    <TrashIcon size={20} />
                  </GlassyButton>
                </SimpleTooltip>
                <span className="text-xs text-(--text-secondary)">Square Destructive</span>
              </div>
            </div>
            <p className="text-xs text-(--text-secondary) mt-4">
              Icon-only buttons work great for toolbars and compact UIs.
            </p>
          </div>

          {/* When to Use */}
          {/* When to Use */}
          <div className="mb-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-5">
            <h4 className="font-semibold text-(--text-primary) mb-4 text-sm">
              When to Use Icon-Only Buttons
            </h4>
            <div className="space-y-4">
              {[
                {
                  icon: GearIcon,
                  title: "Toolbars & action bars",
                  description: "Where space is limited and icons are universally understood.",
                },
                {
                  icon: ArrowsClockwiseIcon,
                  title: "Repeated actions",
                  description: "Close buttons, expand/collapse, media controls.",
                },
                {
                  icon: DeviceMobileIcon,
                  title: "Mobile interfaces",
                  description: "Maximizing touch target while saving horizontal space.",
                },
                {
                  icon: MagnifyingGlassIcon,
                  title: "Universally recognized icons",
                  description: "Play, pause, close, settings, search.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 items-start">
                  <div className="mt-0.5 p-1 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <item.icon size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-(--text-primary)">{item.title}</p>
                    <p className="text-xs text-(--text-secondary) leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
                <p className="font-medium text-(--text-primary)">Tooltip is mandatory</p>
                <p className="text-xs mt-1">
                  Icons can be ambiguous. Always provide a tooltip to explain the action. We use a
                  custom <code className="px-1.5 py-0.5 rounded bg-(--bg-primary)">Tooltip</code>{" "}
                  component (powered by Base UI) for consistent user experience.
                </p>
              </div>
            </div>
          </div>

          <CodeExample
            title="Icon Only Button"
            code={`// 1. Mandatory Tooltip
// 2. Square sizing (size-8.5 p-0)
// 3. Aria-label for accessibility
<SimpleTooltip content="Settings">
  <GlassyButton 
    className="size-8.5 p-0" 
    aria-label="Settings"
  >
    <GearIcon size={20} />
  </GlassyButton>
</SimpleTooltip>`}
            description="Icon-only buttons should be square (via explicit classes) and must always have a tooltip and aria-label."
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
      <GuidelinePagination />
    </PageContainer>
  );
}
