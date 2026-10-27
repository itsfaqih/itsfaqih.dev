import { cx } from "@/stylex";
import { createFileRoute } from "@tanstack/react-router";
import { RuleOfThumbPagination } from "./-components/rule-of-thumb-pagination";
import { BestPractice, FeatureTiles, RuleOfThumbHero, RulePage } from "./-components";
import { AutoFocusFormDemo } from "./-components/auto-focus-form-demo";
import { AutoFocusIrreversibleDemo } from "./-components/auto-focus-irreversible-demo";
import { AutoFocusReversibleDemo } from "./-components/auto-focus-reversible-demo";
import { DiscardConfirmDemo } from "./-components/discard-confirm-demo";
import { EscapeCloseDemo } from "./-components/escape-close-demo";
import { FocusTrapDemo } from "./-components/focus-trap-demo";
import { FormDialogDemo } from "./-components/form-dialog-demo";
import { InfoDialogDemo } from "./-components/info-dialog-demo";
import { InteractiveDemo } from "./-components/interactive-demo";
import { ScrollLockDemo } from "./-components/scroll-lock-demo";
import {
  CornersOutIcon,
  KeyboardIcon,
  ShieldCheckIcon,
  SpeakerHighIcon,
  TargetIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import "./dialog-design.css";

const DIALOG_PRINCIPLES = [
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
] as const;

export const Route = createFileRoute("/rule-of-thumb/dialog-design")({
  component: DialogDesign,
});

function DialogDesign() {
  return (
    <RulePage>
      <RuleOfThumbHero
        title="Dialog Design Guidelines"
        description={
          <>
            Accessible, intuitive modal dialogs.
            <br />
            <span className={cx("text-foreground font-medium")}>
              Focus management, keyboard navigation, and data safety.
            </span>
          </>
        }
        badge={{ text: "UX Design" }}
        markdownUrl="/rule-of-thumb/dialog-design.md"
      />
      <div className={cx("mb-16")}>
        <InteractiveDemo />
      </div>
      <div className={cx("mb-16")}>
        <h2 className={cx("text-2xl font-bold text-foreground mb-8")}>The Principles</h2>
        <FeatureTiles items={DIALOG_PRINCIPLES} columns={3} label="Dialog principles" />
      </div>
      <div className={cx("mb-16")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>Focus Trap</h2>
        <p className={cx("text-muted-foreground mb-6")}>
          Focus should cycle within the modal only.
        </p>
        <FocusTrapDemo />
      </div>
      <div className={cx("mb-16")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>Escape Key to Close</h2>
        <p className={cx("text-muted-foreground mb-6")}>Always allow closing with Escape.</p>
        <EscapeCloseDemo />
      </div>
      <div className={cx("mb-16")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>Smart Auto-Focus</h2>
        <p className={cx("text-muted-foreground mb-6")}>Focus the most relevant element on open.</p>
        <div className={cx("space-y-12")}>
          <div>
            <h3 className={cx("text-lg font-semibold text-foreground mb-4")}>Form Dialogs</h3>
            <p className={cx("text-muted-foreground mb-4")}>
              For forms, focus the first interactive input field. This allows users to start typing
              immediately.
            </p>
            <AutoFocusFormDemo />
          </div>
          <div>
            <h3 className={cx("text-lg font-semibold text-foreground mb-4")}>
              Confirmation Dialogs
            </h3>
            <p className={cx("text-muted-foreground mb-4")}>
              Focus strategy depends on <strong>reversibility</strong>. For{" "}
              <strong>reversible actions</strong>, focus the primary CTA for efficiency. For{" "}
              <strong>irreversible actions</strong>, focus the Cancel button to prevent accidents.
            </p>
            <div className={cx("space-y-6")}>
              <AutoFocusIrreversibleDemo />
              <AutoFocusReversibleDemo />
            </div>
          </div>
        </div>
      </div>

      <div className={cx("mb-16")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>Backdrop Click Behavior</h2>
        <p className={cx("text-muted-foreground mb-6")}>
          Disable backdrop close for forms to prevent data loss. Info dialogs can be dismissed by
          clicking outside.
        </p>
        <div className={cx("grid grid-cols-1 gap-8")}>
          <InfoDialogDemo />
          <FormDialogDemo />
        </div>
      </div>
      <div className={cx("mb-16")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>Discard Confirmation</h2>
        <p className={cx("text-muted-foreground mb-6")}>
          Confirm before discarding unsaved changes.
        </p>
        <DiscardConfirmDemo />
      </div>
      <div className={cx("mb-16")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>Scroll Locking</h2>
        <p className={cx("text-muted-foreground mb-6")}>
          Dialogs should prevent the page from scrolling while open. Ideally, use{" "}
          <code className={cx("px-1 py-0.5 rounded bg-card text-foreground")}>
            overflow: hidden
          </code>{" "}
          on the body and compensate for the missing scrollbar to avoid layout shifts.
        </p>
        <ScrollLockDemo />
      </div>
      <div className={cx("mb-20")}>
        <h2 className={cx("text-2xl font-bold text-foreground mb-8")}>
          Best Practices
        </h2>
        <div className={cx("space-y-4")}>
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
      <RuleOfThumbPagination />
    </RulePage>
  );
}
