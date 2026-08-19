import { cx } from "@/stylex";
import { useEffect, useState, type CSSProperties } from "react";

import { highlightShikiCode } from "../shiki-loader";

type CodeState = "idle" | "hover" | "focus" | "pending" | "disabled" | "pressing";

const STATE_INFO: Record<CodeState, { label: string; description: string }> = {
  idle: {
    label: "Idle",
    description: "The default resting state. Clearly clickable with base styling.",
  },
  hover: {
    label: "Hover",
    description: "Provides feedback when cursor is over the button. Signals interactivity.",
  },
  focus: {
    label: "Focus",
    description: "Shows when focused via keyboard navigation. Essential for accessibility.",
  },
  pending: {
    label: "Pending",
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

export function InteractiveStateCode() {
  const [activeState, setActiveState] = useState<CodeState>("idle");
  const [highlightedCode, setHighlightedCode] = useState<string>("");

  // The complete code as a single string for shiki
  const code = `// Complete button with all states
<button
  disabled={isPending || isDisabled}
  className={cn(
    // Base styles (Idle)
    "px-6 py-3 rounded-xl font-medium text-white",
    "flex items-center justify-center gap-2",
    "transition-all duration-200",
    
    // Hover state (Glassy overlay)
    "hover:bg-zinc-500/5 dark:hover:bg-white/10",
    "hover:shadow-lg",
    
    // Focus state (keyboard navigation)
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-ring focus-visible:ring-offset-2",
    
    // Pressing state (active)
    "active:scale-95",
    
    // Pending & Disabled conditional styles
    isPending
      ? "cursor-wait"
      : !isDisabled
        ? "cursor-not-allowed opacity-60"
        : "cursor-default"
  )}
>
  {isPending ? (
    <>
      <CircleNotchIcon className={cx("animate-spin")} size={18} />
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
    focus: [14, 15], // focus-visible: classes
    pending: [20, 27, 28, 29, 30, 31], // isPending conditional
    disabled: [22, 23], // disabled conditional
    pressing: [18], // active: classes
  };

  const HIGHLIGHT_BG = "rgba(113, 113, 122, 0.1)";
  const HIGHLIGHT_BORDER = "#a1a1aa";
  const TAB_ACTIVE = "bg-zinc-500/10 text-zinc-900 dark:text-zinc-100 border-zinc-500/20";
  const LABEL_COLOR = "text-zinc-900 dark:text-zinc-100";

  // Use shiki for syntax highlighting
  useEffect(() => {
    highlightShikiCode(code, "tsx").then(setHighlightedCode);
  }, [code]);

  const highlightedLines = highlightRanges[activeState];

  return (
    <div className={cx("rounded-2xl squircle border border-border bg-card overflow-hidden")}>
      {/* State selector tabs */}
      <div className={cx("p-4 border-b border-border bg-background")}>
        <div className={cx("flex flex-wrap gap-2")}>
          {(Object.keys(STATE_INFO) as CodeState[]).map((state) => {
            const info = STATE_INFO[state];
            const isActive = activeState === state;
            return (
              <button
                key={state}
                onClick={() => setActiveState(state)}
                className={cx(`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                  ? TAB_ACTIVE
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
                  }`)}
              >
                {info.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className={cx("px-4 py-3 border-b border-border bg-background")}>
        <p className={cx("text-sm text-muted-foreground")}>
          <span className={cx(`font-medium ${LABEL_COLOR}`)}>
            {STATE_INFO[activeState].label}:
          </span>{" "}
          {STATE_INFO[activeState].description}
        </p>
      </div>

      {/* Code block with syntax highlighting and line highlighting */}
      <div className={cx("p-4 overflow-x-auto text-sm")}>
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
          className={cx("interactive-code [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:m-0! [&_code]:text-sm!")}
          style={
            {
              "--highlight-bg": HIGHLIGHT_BG,
              "--highlight-border": HIGHLIGHT_BORDER,
            } as CSSProperties
          }
        >
          {highlightedCode ? (
            <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          ) : (
            <pre className={cx("text-muted-foreground")}>{code}</pre>
          )}
        </div>
      </div>

      {/* Tips for the active state */}
      <div className={cx("px-4 py-3 border-t border-border bg-background text-sm")}>
        {activeState === "idle" && (
          <p className={cx("text-muted-foreground")}>
            <strong className={cx("text-foreground")}>💡 Tip:</strong> Base styles define the button's
            default appearance. Keep these consistent across your design system.
          </p>
        )}
        {activeState === "hover" && (
          <p className={cx("text-muted-foreground")}>
            <strong className={cx("text-foreground")}>💡 Tip:</strong> Combine subtle effects (color,
            shadow, transform) for a polished hover. Avoid jarring changes.
          </p>
        )}
        {activeState === "pending" && (
          <p className={cx("text-muted-foreground")}>
            <strong className={cx("text-foreground")}>💡 Tip:</strong> Always disable during pending to
            prevent double-submissions. Update the label to show progress.
          </p>
        )}
        {activeState === "focus" && (
          <p className={cx("text-muted-foreground")}>
            <strong className={cx("text-foreground")}>💡 Tip:</strong> Use focus-visible instead of focus
            to only show the ring on keyboard navigation, not mouse clicks.
          </p>
        )}
        {activeState === "disabled" && (
          <p className={cx("text-muted-foreground")}>
            <strong className={cx("text-foreground")}>💡 Tip:</strong> Use reduced opacity and
            cursor-not-allowed. Consider adding a tooltip explaining why it's disabled.
          </p>
        )}
        {activeState === "pressing" && (
          <p className={cx("text-muted-foreground")}>
            <strong className={cx("text-foreground")}>💡 Tip:</strong> Use short durations (100-150ms) for
            snappy feedback. Scale-down
          </p>
        )}
      </div>
    </div>
  );
}