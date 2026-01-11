import { createFileRoute, Link } from "@tanstack/react-router";
// Force refresh
import { useState, createContext, useContext, useMemo } from "react";
import { PageContainer } from "../../components/page-container";
import { Dialog } from "@base-ui/react";
import {
  ArrowLeft,
  MousePointer,
  Play,
  Pause,
  X,
  Scan,
  ShieldCheck,
  Keyboard,
  AlertTriangle,
  Target,
  MessageSquareWarning,
  RotateCcw,
} from "lucide-react";
import { BestPractice, GuidelineHero } from "./components";

export const Route = createFileRoute("/my-views/dialog-design")({
  component: DialogDesign,
});

// FakeCursor component extracted to src/components/fake-cursor.tsx

import { useCssAnimation } from "../../hooks/use-css-animation";
import { cn } from "@/cn";

const ANIMATION_STYLE_DEFAULTS = {
  animationIterationCount: "1",
  animationFillMode: "forwards",
  animationPlayState: "paused",
};

interface GlassyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  centered?: boolean;
}

function GlassyButton({ centered, className, children, ...props }: GlassyButtonProps) {
  return (
    <button
      className={cn(
        "relative overflow-hidden inline-flex items-center gap-2 px-3 rounded-md text-(--text-primary) transition-all text-sm backdrop-blur-md border border-gray-500/20 bg-linear-to-b from-gray-500/5 to-gray-500/0 hover:from-gray-500/10 hover:to-gray-500/5 before:absolute before:inset-0 before:bg-current before:opacity-0 before:scale-0 before:rounded-full before:transition-all active:before:duration-300 before:duration-0 active:before:scale-150 active:before:opacity-10 active:shadow-lg",
        centered ? "justify-center h-8.5" : "py-1.5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// For non-button elements (like divs acting as buttons/labels)
function FakeButton({
  centered,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { centered?: boolean }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden inline-flex items-center gap-2 px-3 rounded-md text-(--text-primary) transition-all text-sm backdrop-blur-md border border-gray-500/20 bg-linear-to-b from-gray-500/5 to-gray-500/0 hover:from-gray-500/10 hover:to-gray-500/5 before:absolute before:inset-0 before:bg-current before:opacity-0 before:scale-0 before:rounded-full before:transition-all active:before:duration-300 before:duration-0 active:before:scale-150 active:before:opacity-10 active:shadow-lg",
        centered ? "justify-center h-8.5" : "py-1.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AnimationSlider(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-125"
      {...props}
    />
  );
}

function DemoOverlay({
  onClick,
  icon,
  label,
  circleClass = "bg-black/10 border-black/20 group-hover:bg-black/20",
  textClass = "text-black",
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  circleClass?: string;
  textClass?: string;
}) {
  return (
    <div className="absolute inset-0 z-60 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm transition-all duration-500">
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95 bg-white/50 dark:bg-black/50 p-4 rounded-2xl backdrop-blur-sm"
      >
        <div
          className={`p-4 rounded-full border backdrop-blur-md shadow-lg transition-colors ${circleClass}`}
        >
          {icon}
        </div>
        <span className={`text-sm font-medium shadow-sm ${textClass}`}>{label}</span>
      </button>
    </div>
  );
}

function DemoDialog({
  title,
  description,
  children,
  open,
  onOpenChange,
  container,
  modal,
  trigger,
  onBackdropClick,
}: {
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  container: HTMLDivElement | null;
  modal?: boolean;
  onBackdropClick?: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={modal ?? false}>
      {/* modal={false} prevents body scroll lock for these embedded demos */}
      {trigger && <Dialog.Trigger render={trigger as React.ReactElement} />}
      <Dialog.Portal container={container}>
        <Dialog.Backdrop
          className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-all duration-300 ease-out opacity-100 data-starting-style:opacity-0 data-ending-style:opacity-0"
          onClick={onBackdropClick}
        />
        <Dialog.Popup className="absolute top-1/2 left-1/2 z-20 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 outline-none p-6 rounded-xl bg-(--bg-primary) border border-(--border-color) shadow-2xl transition-all duration-300 ease-out origin-center opacity-100 scale-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0">
          <div className="flex items-center justify-between mb-2">
            <Dialog.Title className="font-semibold text-(--text-primary)">{title}</Dialog.Title>
            <Dialog.Close className="text-(--text-secondary) hover:text-(--text-primary) p-1 rounded hover:bg-(--bg-secondary) transition-colors cursor-pointer">
              <X size={18} />
            </Dialog.Close>
          </div>
          {description && (
            <Dialog.Description className="text-sm text-(--text-secondary) mb-4">
              {description}
            </Dialog.Description>
          )}
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// --- Animation Demo Context & Components ---

interface AnimationDemoContextType extends ReturnType<typeof useCssAnimation> {
  animationStyle: React.CSSProperties;
}

const AnimationDemoContext = createContext<AnimationDemoContextType | null>(null);

function useAnimationDemo() {
  const context = useContext(AnimationDemoContext);
  if (!context) throw new Error("useAnimationDemo must be used within AnimationDemo");
  return context;
}

function AnimationDemo({
  duration,
  masterAnimationName,
  children,
  className,
}: {
  duration: number;
  masterAnimationName: string;
  children: React.ReactNode;
  className?: string;
}) {
  const animationData = useCssAnimation({ duration, masterAnimationName });

  const animationStyle = useMemo(
    () => ({
      animationDuration: `${duration}ms`,
      ...ANIMATION_STYLE_DEFAULTS,
    }),
    [duration],
  );

  return (
    <AnimationDemoContext.Provider value={{ ...animationData, animationStyle }}>
      <div
        className={cn(
          "rounded-2xl border border-(--border-color) bg-(--bg-secondary)/50 backdrop-blur-md overflow-hidden shadow-sm h-full flex flex-col",
          className,
        )}
      >
        {children}
      </div>
    </AnimationDemoContext.Provider>
  );
}

function AnimationStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { status, containerRef, restart } = useAnimationDemo();

  return (
    <div
      className={cn(
        "relative p-8 flex flex-col items-center justify-center min-h-[400px] flex-1 overflow-hidden",
        className,
      )}
    >
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none">
        {children}
      </div>

      {(status === "idle" || status === "finished") && (
        <DemoOverlay
          onClick={restart}
          icon={
            status === "finished" ? (
              <RotateCcw size={24} className="text-black ml-0" />
            ) : (
              <Play size={24} className="fill-black text-black ml-1" />
            )
          }
          label={status === "finished" ? "Replay" : "Watch Demo"}
        />
      )}
    </div>
  );
}

interface AnimationControlsProps {
  title: string;
  children?: React.ReactNode;
}

function AnimationControls({ title, children }: AnimationControlsProps) {
  const { progress, handleSeek: seek, togglePlay, status } = useAnimationDemo();

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  return (
    <div className="border-t border-(--border-color) p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-black">{title}</span>
        <GlassyButton onClick={togglePlay}>
          {status === "playing" ? (
            <>
              <Pause size={14} /> Pause
            </>
          ) : status === "finished" ? (
            <>
              <RotateCcw size={14} /> Replay
            </>
          ) : (
            <>
              <Play size={14} /> Play
            </>
          )}
        </GlassyButton>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <AnimationSlider min="0" max="100" value={progress} onChange={onSeek} />
      </div>
      {children}
    </div>
  );
}

interface AnimatedCursorProps {
  moveAnimationName: string;
  rippleAnimationName: string;
}

function AnimatedCursor({ moveAnimationName, rippleAnimationName }: AnimatedCursorProps) {
  const { status, animationStyle } = useAnimationDemo();

  if (status === "idle") return null;

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        ...animationStyle,
        animationName: moveAnimationName,
      }}
    >
      <MousePointer className="fill-white stroke-1 rotate-20" />
      {/* Ripple */}
      <div
        className="absolute top-0 left-0 w-8 h-8 rounded-full bg-black/50 dark:bg-white/50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          ...animationStyle,
          animationName: rippleAnimationName,
        }}
      />
    </div>
  );
}

// --- Mock Dialog Components ---
function MockBackdrop({ animationName }: { animationName?: string }) {
  const { status, animationStyle } = useAnimationDemo();
  return (
    <div
      className="absolute inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-sm z-10"
      style={{
        ...animationStyle,
        animationName: status !== "idle" ? animationName : "none",
        opacity: status === "idle" ? 1 : undefined,
      }}
    />
  );
}

function MockDialog({
  children,
  className,
  animationName,
  transform = "scale(1)",
}: {
  children: React.ReactNode;
  className?: string; // for sizing/width
  animationName?: string;
  transform?: string;
}) {
  const { status, animationStyle } = useAnimationDemo();
  return (
    <div
      className={cn(
        "absolute left-1/2 top-1/2 z-20 outline-none p-6 rounded-xl bg-(--bg-primary) border border-(--border-color) shadow-2xl",
        className || "w-full max-w-sm",
      )}
      style={{
        ...animationStyle,
        animationName: status !== "idle" ? animationName : "none",
        opacity: status === "idle" ? 1 : undefined,
        transform,
        translate: "-50% -50%",
      }}
    >
      {children}
    </div>
  );
}

function KeyboardKey({
  children,
  animationName,
  className,
}: {
  children: React.ReactNode;
  animationName?: string;
  className?: string;
}) {
  const { status, animationStyle } = useAnimationDemo();
  return (
    <div className="absolute top-8 right-8 z-20 origin-bottom">
      <div
        className={cn(
          "font-bold font-mono leading-none transition-all select-none border-2 flex items-center justify-center",
          "px-3 py-2 rounded-lg text-xs bg-zinc-100 border-zinc-300 shadow-[0_4px_0_#d4d4d8] text-zinc-500 dark:bg-zinc-800 dark:border-zinc-600 dark:shadow-[0_4px_0_#52525b] dark:text-zinc-400",
          className,
        )}
        style={{
          ...animationStyle,
          animationName: status !== "idle" && animationName ? animationName : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function FocusTrapDemo() {
  return (
    <AnimationDemo duration={4000} masterAnimationName="demo-focus-tab-press">
      <FocusTrapDemoContent />
    </AnimationDemo>
  );
}

function FocusTrapDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  return (
    <>
      <AnimationStage>
        {/* Fake TAB Key */}
        <KeyboardKey animationName="demo-focus-tab-press">TAB</KeyboardKey>

        <MockBackdrop />
        <MockDialog className="w-full max-w-xs">
          <div className="font-semibold text-(--text-primary) mb-4">Focus Trap Demo</div>
          <div className="flex gap-2">
            <button
              className="flex-1 px-4 py-2 rounded-lg border border-(--border-color) text-(--text-secondary) transition-shadow"
              style={{
                ...animationStyle,
                animationName: status !== "idle" ? "demo-focus-btn-1" : "none",
              }}
            >
              Cancel
            </button>
            <button
              className="flex-1 px-4 py-2 rounded-lg bg-black text-white transition-shadow hover:bg-zinc-800"
              style={{
                ...animationStyle,
                animationName: status !== "idle" ? "demo-focus-btn-2" : "none",
              }}
            >
              Confirm
            </button>
          </div>
          <div className="text-xs text-(--text-secondary) mt-4 text-center">
            Tab key cycles focus within the dialog.
          </div>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Focus Trap">
        <p className="text-sm text-(--text-secondary)">
          <strong className="text-(--text-primary)">Focus Trap:</strong> Keeps keyboard focus inside
          the dialog.
        </p>
      </AnimationControls>
    </>
  );
}

function EscapeCloseDemo() {
  return (
    <AnimationDemo duration={2500} masterAnimationName="demo-esc-key">
      <EscapeCloseDemoContent />
    </AnimationDemo>
  );
}

function EscapeCloseDemoContent() {
  // useAnimationDemo context is used by child components (KeyboardKey, MockDialog, MockBackdrop)

  return (
    <>
      <AnimationStage>
        {/* Fake ESC Key */}
        <KeyboardKey animationName="demo-esc-key">ESC</KeyboardKey>

        <MockBackdrop animationName="demo-esc-dialog" />

        <MockDialog animationName="demo-esc-dialog">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-(--text-primary)">Press ESC to Close</div>
            <X size={18} className="text-(--text-secondary)" />
          </div>
          <div className="text-sm text-(--text-secondary) mb-4">
            Keyboard users expect Escape to dismiss dialogs.
          </div>
          <div className="w-full h-8.5 rounded-lg bg-black text-white flex items-center justify-center text-sm font-medium shadow-sm ring-2 ring-black ring-offset-1 dark:ring-offset-black">
            Or Click Here
          </div>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Escape Key">
        <p className="text-sm text-(--text-secondary)">
          Listen for{" "}
          <code className="px-1 py-0.5 rounded bg-(--bg-secondary) text-emerald-400">keydown</code>{" "}
          events.
        </p>
      </AnimationControls>
    </>
  );
}

function AutoFocusFormDemo() {
  return (
    <AnimationDemo duration={5000} masterAnimationName="demo-cursor-move">
      <AutoFocusFormDemoContent />
    </AnimationDemo>
  );
}

function AutoFocusFormDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  return (
    <>
      <AnimationStage>
        {/* The Trigger Button */}
        <FakeButton
          centered
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            ...animationStyle,
            animationName: status !== "idle" ? "demo-button-press" : "none",
          }}
        >
          Open Form
        </FakeButton>

        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-cursor-move"
          rippleAnimationName="demo-cursor-ripple"
        />

        <MockBackdrop animationName="demo-dialog-cycle" />

        <MockDialog animationName="demo-dialog-cycle" className="w-full max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-(--text-primary)">Add Item</div>
            <X size={18} className="text-(--text-secondary)" />
          </div>
          <div className="w-full h-8.5 rounded-lg border border-(--border-color) bg-(--bg-secondary) mb-4 ring-2 ring-black flex items-center px-2.5 text-sm text-(--text-primary)">
            <span className="w-[1.5px] h-5 bg-black block animate-[caret-blink_1s_step-end_infinite]"></span>
          </div>
          <div className="text-xs text-(--text-secondary) mb-4">✨ Input is auto-focused</div>
          <FakeButton centered className="w-full">
            Add
          </FakeButton>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Form Dialog">
        <p className="text-sm text-(--text-secondary)">Focus the first input field.</p>
      </AnimationControls>
    </>
  );
}

function AutoFocusConfirmDemo() {
  return (
    <AnimationDemo duration={5000} masterAnimationName="demo-confirm-cursor">
      <AutoFocusConfirmDemoContent />
    </AnimationDemo>
  );
}

function AutoFocusConfirmDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  return (
    <>
      <AnimationStage>
        {/* Trigger Button */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden inline-flex items-center gap-2 px-3 h-8.5 rounded-md text-white bg-black shadow-md text-sm pointer-events-none"
          style={{
            ...animationStyle,
            animationName: status !== "idle" ? "demo-confirm-trigger" : "none",
          }}
        >
          Delete Item
        </div>

        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-confirm-cursor"
          rippleAnimationName="demo-confirm-ripple"
        />

        <MockBackdrop animationName="demo-confirm-dialog" />

        <MockDialog animationName="demo-confirm-dialog" className="w-full max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-(--text-primary)">Delete Item?</div>
          </div>
          <div className="text-sm text-(--text-secondary) mb-6">This action cannot be undone.</div>

          <div className="flex gap-2">
            <div className="flex-1 h-8.5 flex items-center justify-center rounded-lg border border-(--border-color) text-(--text-secondary) text-sm">
              Cancel
            </div>
            {/* Delete Button */}
            <div
              className="flex-1 h-8.5 rounded-lg bg-black text-white flex items-center justify-center text-sm font-medium shadow-sm ring-2 ring-black ring-offset-1 dark:ring-offset-black"
              style={{
                ...animationStyle,
                animationName: status !== "idle" ? "demo-confirm-delete" : "none",
              }}
            >
              Delete
            </div>
          </div>
          <p className="text-xs text-(--text-secondary) mt-4 text-center">
            ✨ Delete button is auto-focused
          </p>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Confirmation">
        <p className="text-sm text-(--text-secondary)">Focus the primary action.</p>
      </AnimationControls>
    </>
  );
}

function InfoDialogDemo() {
  return (
    <AnimationDemo duration={3000} masterAnimationName="demo-info-cursor">
      <InfoDialogDemoContent />
    </AnimationDemo>
  );
}

function InfoDialogDemoContent() {
  return (
    <>
      <AnimationStage>
        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-info-cursor"
          rippleAnimationName="demo-info-ripple"
        />

        <MockBackdrop animationName="demo-info-dialog" />

        <MockDialog animationName="demo-info-dialog" className="w-full max-w-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-(--text-primary)">Information</div>
            <X size={18} className="text-(--text-secondary)" />
          </div>
          <div className="text-sm text-(--text-secondary) mb-6">
            Click anywhere outside to close.
          </div>
          <div className="w-full h-8.5 rounded-lg bg-black text-white flex items-center justify-center text-sm font-medium shadow-sm ring-2 ring-black ring-offset-1 dark:ring-offset-black">
            Got it
          </div>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Info Dialog">
        <p className="text-sm text-(--text-secondary)">
          Info dialogs should be dismissible by clicking the backdrop.
        </p>
      </AnimationControls>
    </>
  );
}

function FormDialogDemo() {
  return (
    <AnimationDemo duration={3000} masterAnimationName="demo-form-cursor">
      <FormDialogDemoContent />
    </AnimationDemo>
  );
}

function FormDialogDemoContent() {
  return (
    <>
      <AnimationStage>
        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-form-cursor"
          rippleAnimationName="demo-form-ripple"
        />

        {/* Note: FormDialogDemo has a static backdrop (no animation name) */}
        <div className="absolute inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-sm z-10" />

        <MockDialog animationName="demo-form-dialog-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-(--text-primary)">Edit Profile</div>
            <X size={18} className="text-(--text-secondary)" />
          </div>
          <div className="text-sm text-(--text-secondary) mb-4">Data loss prevention.</div>

          <div
            onClick={(e) => e.preventDefault()}
            className="w-full px-4 py-2 rounded-lg border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) mb-4 text-sm"
          >
            Your name...
          </div>
          <div className="w-full h-8.5 rounded-lg bg-black text-white flex items-center justify-center text-sm font-medium shadow-sm ring-2 ring-black ring-offset-1 dark:ring-offset-black">
            Save Changes
          </div>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Form Dialog">
        <p className="text-sm text-(--text-secondary)">
          Form dialogs should NOT close on backdrop click to prevent data loss.
        </p>
      </AnimationControls>
    </>
  );
}

function DiscardConfirmDemo() {
  return (
    <AnimationDemo duration={8000} masterAnimationName="demo-discard-cursor">
      <DiscardConfirmDemoContent />
    </AnimationDemo>
  );
}

function DiscardConfirmDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  return (
    <>
      <AnimationStage>
        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-discard-cursor"
          rippleAnimationName="demo-discard-ripple"
        />

        {/* Mock Dialog Backdrop */}
        <MockBackdrop animationName="demo-discard-main-dialog" />

        {/* Main Dialog (Edit Profile) */}
        <MockDialog animationName="demo-discard-main-dialog">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-(--text-primary)">Edit Profile</div>
            <X size={18} className="text-(--text-secondary)" />
          </div>
          <div className="text-sm text-(--text-secondary) mb-4">Make changes to your profile.</div>

          <div className="w-full px-4 py-2 rounded-lg border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) mb-4 text-sm h-24 overflow-hidden relative">
            <span
              className="inline-block whitespace-nowrap overflow-hidden border-r-2 border-transparent align-bottom"
              style={{
                ...animationStyle,
                animationName: status !== "idle" ? "demo-discard-typing" : "none",
                width: status === "idle" ? "0" : undefined,
              }}
            >
              Making changes...
            </span>
          </div>
          <div className="flex gap-2 justify-end">
            <div className="px-3 py-1.5 rounded-md border border-(--border-color) text-sm text-(--text-secondary)">
              Cancel
            </div>
            <div className="px-3 py-1.5 rounded-md bg-black text-white text-sm">Save</div>
          </div>
        </MockDialog>

        {/* Confirmation Dialog (Discard Changes?) */}
        {/* This dialog appears OVER the other one */}
        <MockDialog
          animationName="demo-discard-dialog-2"
          className="w-full max-w-[280px]"
          transform="scale(0.95)" /* Start slightly smaller/hidden logic handled by keyframes */
        >
          <div className="font-semibold text-(--text-primary) mb-2">Discard Changes?</div>
          <div className="text-sm text-(--text-secondary) mb-4">
            You have unsaved changes. Are you sure you want to discard them?
          </div>
          <div className="flex gap-2 justify-end">
            <div className="px-3 py-1.5 rounded-md border border-(--border-color) text-sm text-(--text-secondary)">
              Keep Editing
            </div>
            <div className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-medium">
              Discard
            </div>
          </div>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Discard Confirmation">
        <p className="text-sm text-(--text-secondary)">
          Confirm before discarding unsaved changes.
        </p>
      </AnimationControls>
    </>
  );
}
function PrincipleCard({
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

function ScrollLockDemo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-(--bg-secondary) border border-(--border-color) rounded-xl overflow-hidden">
        <div className="p-4 border-b border-(--border-color) bg-(--bg-primary) flex items-center justify-between">
          <span className="font-medium text-sm text-(--text-primary)">Standard Page</span>
          <div className="w-16 h-4 bg-(--bg-secondary) rounded-full"></div>
        </div>
        <div className="relative h-48 overflow-y-scroll scrollbar-show">
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-2/3 animate-pulse"></div>
            <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="bg-(--bg-secondary) border border-(--border-color) rounded-xl overflow-hidden relative">
        <div className="p-4 border-b border-(--border-color) bg-(--bg-primary) flex items-center justify-between pr-8">
          <span className="font-medium text-sm text-(--text-primary)">Dialog Open</span>
          <div className="w-16 h-4 bg-(--bg-secondary) rounded-full"></div>
        </div>
        <div className="relative h-48 overflow-hidden bg-gray-900/5 pr-8">
          <div className="p-4 space-y-3 opacity-30">
            <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-full"></div>
            <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-full"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-(--bg-primary) p-4 rounded-lg shadow-xl border border-(--border-color) w-full max-w-[200px] text-center">
              <div className="text-xs font-semibold mb-2 text-(--text-primary)">Dialog</div>
              <div className="text-[10px] text-(--text-secondary)">
                Scroll locked & padding added
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-16 right-2 flex flex-col items-center gap-1">
          <div className="h-12 w-1.5 bg-rose-500/20 rounded-full animate-pulse relative">
            <div className="absolute inset-0 bg-rose-500/50 rounded-full animate-ping"></div>
          </div>
          <span className="text-[10px] text-rose-500 font-bold whitespace-nowrap -rotate-90 origin-center translate-y-8">
            Locked
          </span>
        </div>
      </div>
    </div>
  );
}

function InteractiveDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-12 rounded-2xl border border-(--border-color) bg-linear-to-br from-indigo-500/10 to-purple-500/10 flex flex-col items-center justify-center gap-6 text-center">
      <div className="max-w-md">
        <h3 className="text-2xl font-bold text-(--text-primary) mb-2">Try the Real Deal</h3>
        <p className="text-(--text-secondary)">
          Experience clear focus trap, scroll locking, and accessible interactions.
        </p>
      </div>
      <DemoDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        container={typeof document !== "undefined" ? (document.body as HTMLDivElement) : null}
        modal={true} // True modal behavior
        title="Interactive Dialog"
        description="This is a fully accessible modal dialog with scroll locking."
        trigger={
          <button
            onClick={() => setIsOpen(true)}
            className="px-8 py-4 rounded-full bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            Open Interactive Dialog <MousePointer size={18} />
          </button>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-(--text-primary)">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-md border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) focus:ring-2 focus:ring-indigo-500 outline-none"
              autoFocus
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-(--text-primary)">Feedback</label>
            <textarea
              placeholder="Your thoughts..."
              className="w-full px-3 py-2 rounded-md border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-md hover:bg-(--bg-secondary) transition-colors text-(--text-secondary)"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </DemoDialog>
    </div>
  );
}

function DialogDesign() {
  return (
    <PageContainer maxWidth="3xl">
      <GuidelineHero
        title="Dialog Design Guidelines"
        description={
          <>
            Accessible, intuitive modal dialogs.
            <br />
            <span className="text-(--text-primary) font-medium">
              Focus management, keyboard navigation, and data safety.
            </span>
          </>
        }
        badge={{ icon: MessageSquareWarning, text: "Accessibility & UX" }}
      />

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-(--text-primary) text-center mb-8">
          The Six Principles
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <PrincipleCard
            icon={Scan}
            title="Focus Trap"
            description="Keep focus inside the modal."
            color="bg-indigo-500"
          />
          <PrincipleCard
            icon={ShieldCheck}
            title="Inert Background"
            description="Make outside content non-interactive."
            color="bg-amber-500"
          />
          <PrincipleCard
            icon={Keyboard}
            title="Escape to Close"
            description="Allow dismissal with Escape key."
            color="bg-emerald-500"
          />
          <PrincipleCard
            icon={Target}
            title="Smart Auto-Focus"
            description="Focus first input or primary action."
            color="bg-purple-500"
          />
          <PrincipleCard
            icon={MousePointer}
            title="Smart Backdrop"
            description="Disable backdrop close for forms."
            color="bg-cyan-500"
          />
          <PrincipleCard
            icon={AlertTriangle}
            title="Discard Confirmation"
            description="Warn before losing data."
            color="bg-rose-500"
          />
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-(--text-primary) mb-2">Focus Trap</h2>
        <p className="text-(--text-secondary) mb-6">Focus should cycle within the modal only.</p>
        <FocusTrapDemo />
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-(--text-primary) mb-2">Escape Key to Close</h2>
        <p className="text-(--text-secondary) mb-6">Always allow closing with Escape.</p>
        <EscapeCloseDemo />
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-(--text-primary) mb-2">Smart Auto-Focus</h2>
        <p className="text-(--text-secondary) mb-6">Focus the most relevant element on open.</p>
        <div className="space-y-12">
          <div>
            <h3 className="text-lg font-semibold text-(--text-primary) mb-4">Form Dialogs</h3>
            <p className="text-(--text-secondary) mb-4">
              For forms, focus the first interactive input field. This allows users to start typing
              immediately.
            </p>
            <AutoFocusFormDemo />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
              Confirmation Dialogs
            </h3>
            <p className="text-(--text-secondary) mb-4">
              For confirmations, focus the primary action button (e.g., "Delete") or the "Cancel"
              button if the action is destructive and you want to prevent accidental clicks. In this
              demo, we focus the destructive action for speed, assuming a deliberate trigger.
            </p>
            <AutoFocusConfirmDemo />
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-(--text-primary) mb-2">Backdrop Click Behavior</h2>
        <p className="text-(--text-secondary) mb-6">
          Disable backdrop close for forms to prevent data loss. Info dialogs can be dismissed by
          clicking outside.
        </p>
        <div className="grid grid-cols-1 gap-8">
          <InfoDialogDemo />
          <FormDialogDemo />
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-(--text-primary) mb-2">Discard Confirmation</h2>
        <p className="text-(--text-secondary) mb-6">Confirm before discarding unsaved changes.</p>
        <DiscardConfirmDemo />
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-(--text-primary) mb-2">Scroll Locking</h2>
        <p className="text-(--text-secondary) mb-6">
          Dialogs should prevent the page from scrolling while open. Ideally, use{" "}
          <code className="px-1 py-0.5 rounded bg-(--bg-secondary) text-(--text-primary)">
            overflow: hidden
          </code>{" "}
          on the body and compensate for the missing scrollbar to avoid layout shifts.
        </p>
        <ScrollLockDemo />
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-(--text-primary) mb-2">Interactive Example</h2>
        <p className="text-(--text-secondary) mb-6">
          Put it all together in a real-world scenario.
        </p>
        <InteractiveDemo />
      </div>

      <div className="mb-20">
        <h2 className="text-2xl font-bold text-(--text-primary) text-center mb-8">
          Best Practices
        </h2>
        <div className="space-y-4">
          <BestPractice
            emoji="🎯"
            title="Use native <dialog>"
            description="It handles focus trap and inert automatically."
          />
          <BestPractice
            emoji="🛡️"
            title="Inert Attribute"
            description="Use the `inert` attribute to make background content inaccessible."
          />
          <BestPractice
            emoji="🔄"
            title="Restore focus"
            description="Return focus to trigger on close."
          />
          <BestPractice emoji="📱" title="Test keyboard" description="Ensure Tab/Esc work." />
          <BestPractice
            emoji="♿"
            title="ARIA attributes"
            description='Use role="dialog", aria-modal="true".'
          />
        </div>
      </div>

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
