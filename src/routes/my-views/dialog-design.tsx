import { createFileRoute } from "@tanstack/react-router";
import { GuidelinePagination } from "./-components/guideline-pagination";
// Force refresh
import { useState } from "react";
import { PageContainer } from "../../components/page-container";
import { Dialog } from "@base-ui/react";
import { Drawer } from "vaul";
import { getGlassyClasses } from "../../components/glassy-button";
import { useMediaQuery } from "../../hooks/use-media-query";

import {
  CursorIcon,
  XIcon,
  CornersOutIcon,
  ShieldCheckIcon,
  KeyboardIcon,
  WarningIcon,
  TargetIcon,
  SpeakerHighIcon,
} from "@phosphor-icons/react";
import { BestPractice, GuidelineHero } from "./-components";
import { GlassyButton } from "../../components/glassy-button";

export const Route = createFileRoute("/my-views/dialog-design")({
  component: DialogDesign,
});

import { cn } from "@/cn";
import {
  AnimationDemo,
  AnimationStage,
  AnimationControls,
  AnimatedCursor,
  useAnimationDemo,
} from "../../components/animation-demo";

// For non-button elements (like divs acting as buttons/labels)
function FakeButton({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={getGlassyClasses(className)} {...props}>
      {children}
    </div>
  );
}

// --- Animation Demo Context & Components ---

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
        "absolute left-1/2 top-1/2 z-20 outline-none p-6 rounded-xl squircle bg-(--bg-primary) border border-(--border-color)",
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
          "px-3 py-2 rounded-lg text-xs bg-zinc-100 border-zinc-300 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-400",
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
            <XIcon size={18} className="text-(--text-secondary)" />
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
          <code className="px-1 py-0.5 rounded bg-(--bg-secondary) text-(--text-primary)">
            keydown
          </code>{" "}
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
            <XIcon size={18} className="text-(--text-secondary)" />
          </div>
          <div className="w-full h-8.5 rounded-lg border border-(--border-color) bg-(--bg-secondary) mb-4 ring-2 ring-black flex items-center px-2.5 text-sm text-(--text-primary)">
            <span className="w-[1.5px] h-5 bg-black block animate-[caret-blink_1s_step-end_infinite]"></span>
          </div>
          <div className="text-xs text-(--text-secondary) mb-4">✨ Input is auto-focused</div>
          <FakeButton className="w-full">Add</FakeButton>
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden inline-flex items-center gap-2 px-3 h-8.5 rounded-md text-white bg-black pointer-events-none"
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
              className="flex-1 h-8.5 rounded-lg bg-black text-white flex items-center justify-center text-sm font-medium ring-2 ring-black ring-offset-1 dark:ring-offset-black"
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
            <XIcon size={18} className="text-(--text-secondary)" />
          </div>
          <div className="text-sm text-(--text-secondary) mb-6">
            Click anywhere outside to close.
          </div>
          <div className="w-full h-8.5 rounded-lg bg-black text-white flex items-center justify-center text-sm font-medium ring-2 ring-black ring-offset-1 dark:ring-offset-black">
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
            <XIcon size={18} className="text-(--text-secondary)" />
          </div>
          <div className="text-sm text-(--text-secondary) mb-4">Data loss prevention.</div>

          <div
            onClick={(e) => e.preventDefault()}
            className="w-full px-4 py-2 rounded-lg border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) mb-4 text-sm"
          >
            Your name...
          </div>
          <div className="w-full h-8.5 rounded-lg bg-black text-white flex items-center justify-center text-sm font-medium ring-2 ring-black ring-offset-1 dark:ring-offset-black">
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
            <XIcon size={18} className="text-(--text-secondary)" />
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

function ScrollLockDemo() {
  return (
    <AnimationDemo duration={4000} masterAnimationName="demo-scroll-cursor">
      <ScrollLockDemoContent />
    </AnimationDemo>
  );
}

function ScrollLockDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  return (
    <>
      <AnimationStage className="bg-zinc-50 dark:bg-zinc-950/50">
        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-scroll-cursor"
          rippleAnimationName="demo-scroll-ripple"
        />

        {/* The Page Content (Mock Browser) */}
        <div className="absolute inset-x-12 inset-y-8 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-(--border-color) overflow-hidden flex flex-col">
          {/* Mock Content Area */}
          <div className="relative flex-1 p-8 space-y-6">
            <div className="h-4 w-1/3 bg-(--bg-secondary) rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-2 w-full bg-(--bg-secondary) rounded" />
              <div className="h-2 w-5/6 bg-(--bg-secondary) rounded" />
              <div className="h-2 w-full bg-(--bg-secondary) rounded" />
            </div>
            <div className="space-y-3 opacity-50">
              <div className="h-2 w-full bg-(--bg-secondary) rounded" />
              <div className="h-2 w-4/5 bg-(--bg-secondary) rounded" />
              <div className="h-2 w-full bg-(--bg-secondary) rounded" />
            </div>
          </div>

          {/* The Trigger Button - Centered relative to the browser window (and thus the stage) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="pointer-events-auto">
              <FakeButton>Open Modal</FakeButton>
            </div>
          </div>

          {/* Mock Scrollbar */}
          <div
            className="absolute right-0 top-0 bottom-0 w-3 border-l border-(--border-color) bg-(--bg-secondary) p-0.5 transition-opacity"
            style={{
              ...animationStyle,
              animationName: status !== "idle" ? "demo-scroll-scrollbar" : "none",
            }}
          >
            <div className="w-full h-16 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Backdrop & Dialog inside the "browser window" */}
          {/* We use a custom backdrop here to constrain it to this 'browser' div instead of the full stage if we wanted,
              but MockBackdrop uses absolute inset-0 which is relative to the nearest positioned ancestor.
              AnimationStage has relative, but this 'browser' div also needs relative? 
              Actually, let's just put MockBackdrop inside this div so it covers the "content".
          */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* We need to selectively wrap them or style them to be hidden initially */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              style={{
                ...animationStyle,
                animationName: status !== "idle" ? "demo-scroll-dialog" : "none",
                opacity: 0, // default hidden until anim starts
              }}
            ></div>
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[240px] p-6 rounded-xl bg-(--bg-primary) border border-(--border-color)"
              style={{
                ...animationStyle,
                animationName: status !== "idle" ? "demo-scroll-dialog" : "none",
                opacity: 0,
              }}
            >
              <div className="font-semibold text-(--text-primary) mb-2 text-center">
                Scroll Locked
              </div>
              <div className="text-xs text-(--text-secondary) text-center">
                The scrollbar disappears to prevent background scrolling.
              </div>
            </div>
          </div>
        </div>
      </AnimationStage>

      <AnimationControls title="Scroll Locking">
        <p className="text-sm text-(--text-secondary)">
          Prevent page scrolling when the dialog is open.
        </p>
      </AnimationControls>
    </>
  );
}

function ResponsiveDialog({
  children,
  title,
  description,
  trigger,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  trigger: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in-0" />
          <Drawer.Content className="bg-(--bg-primary) flex flex-col rounded-t-[10px] h-auto max-h-[96%] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-(--border-color) outline-none animate-in slide-in-from-bottom-full duration-300">
            <div className="p-4 bg-(--bg-primary) rounded-t-[10px] flex-1 overflow-auto">
              {/* Handle */}
              <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700 mb-8" />
              <div className="max-w-md mx-auto pb-8">
                <Drawer.Title className="font-bold mb-2 text-(--text-primary) text-xl">
                  {title}
                </Drawer.Title>
                {description && (
                  <Drawer.Description className="text-(--text-secondary) mb-6 text-sm">
                    {description}
                  </Drawer.Description>
                )}
                {children}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger render={trigger as React.ReactElement} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-all duration-200 opacity-0 data-[state=open]:opacity-100" />
        <Dialog.Popup className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-(--border-color) bg-(--bg-primary) p-6 shadow-lg duration-200 opacity-0 scale-95 data-[state=open]:opacity-100 data-[state=open]:scale-100 rounded-xl outline-none">
          <div className="flex items-center justify-between mb-2">
            <Dialog.Title className="text-lg font-semibold text-(--text-primary)">
              {title}
            </Dialog.Title>
            <Dialog.Close className="text-(--text-secondary) hover:text-(--text-primary) p-1 rounded hover:bg-(--bg-secondary) transition-colors cursor-pointer">
              <XIcon size={18} />
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

function InteractiveDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-12 rounded-2xl squircle border border-(--border-color) bg-(--bg-secondary) flex flex-col items-center justify-center gap-6 text-center">
      <div className="max-w-md">
        <h3 className="text-2xl font-bold text-(--text-primary) mb-2">Try the Real Deal</h3>
        <p className="text-(--text-secondary)">
          Experience clear focus trap, scroll locking, and accessible interactions.
        </p>
      </div>
      <ResponsiveDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Interactive Dialog"
        description="This is a fully accessible modal dialog with scroll locking."
        trigger={
          <GlassyButton onClick={() => setIsOpen(true)} className="h-12 px-8 text-lg">
            Open Interactive Dialog <CursorIcon size={18} />
          </GlassyButton>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-(--text-primary)">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-md border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) focus:ring-2 focus:ring-zinc-500 outline-none"
              autoFocus
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-(--text-primary)">Feedback</label>
            <textarea
              placeholder="Your thoughts..."
              className="w-full px-3 py-2 rounded-md border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) focus:ring-2 focus:ring-zinc-500 outline-none h-24 resize-none"
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
              className="px-4 py-2 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Submit
            </button>
          </div>
        </div>
      </ResponsiveDialog>
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
        badge={{ icon: SpeakerHighIcon, text: "Accessibility & UX" }}
        markdownUrl="/my-views/dialog-design.md"
      />
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-(--text-primary) text-center mb-8">
          The Principles
        </h2>
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-0 pl-px pt-px"
          role="list"
          aria-label="Dialog principles"
        >
          {[
            {
              icon: CornersOutIcon,
              title: "Focus Trap",
              description: "Keep focus inside the modal.",
            },
            {
              icon: ShieldCheckIcon,
              title: "Inert Background",
              description: "Make outside content non-interactive.",
            },
            {
              icon: KeyboardIcon,
              title: "Escape to Close",
              description: "Allow dismissal with Escape key.",
            },
            {
              icon: TargetIcon,
              title: "Smart Auto-Focus",
              description: "Focus first input or primary action.",
            },
            {
              icon: WarningIcon,
              title: "No Data Loss",
              description: "Prevent accidental closing of forms.",
            },
            {
              icon: SpeakerHighIcon,
              title: "Screen Readers",
              description: "Proper ARIA roles and labels.",
            },
          ].map((principle) => (
            <div
              key={principle.title}
              className="relative flex flex-col items-center justify-center gap-3 p-6 h-auto min-h-[200px] transition-all group hover:z-10 -ml-px -mt-px
                before:pointer-events-none before:absolute before:-inset-x-2 before:top-0 before:bottom-0 before:border-t before:border-b before:border-zinc-200 dark:before:border-white/10 group-hover:before:border-(--text-secondary) before:transition-colors before:mask-[linear-gradient(to_right,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]
                after:pointer-events-none after:absolute after:-inset-y-2 after:left-0 after:right-0 after:border-l after:border-r after:border-zinc-200 dark:after:border-white/10 group-hover:after:border-(--text-secondary) after:transition-colors after:mask-[linear-gradient(to_bottom,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]"
              role="listitem"
            >
              <div
                className="w-10 h-10 flex items-center justify-center z-10 rounded-lg bg-zinc-500/10 dark:bg-zinc-500/20 text-(--text-primary)"
                aria-hidden="true"
              >
                <principle.icon size={20} />
              </div>
              <h3 className="font-semibold text-(--text-primary) text-center z-10">
                {principle.title}
              </h3>
              <p className="text-sm text-(--text-secondary) text-center leading-relaxed z-10">
                {principle.description}
              </p>
            </div>
          ))}
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
      <GuidelinePagination />
    </PageContainer>
  );
}
