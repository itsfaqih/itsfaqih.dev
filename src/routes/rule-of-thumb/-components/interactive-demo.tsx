import { useEffect, useRef, useState } from "react";
import { cx } from "@/stylex";
import { CursorIcon } from "@phosphor-icons/react";
import { Button } from "../../../components/button";
import { ResponsiveDialog } from "./responsive-dialog";

export function InteractiveDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      emailInputRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div
      className={cx(
        "p-12 rounded-2xl squircle border border-border bg-card flex flex-col items-center justify-center gap-6 text-center",
      )}
    >
      <div className={cx("max-w-md")}>
        <h3 className={cx("text-2xl font-bold text-foreground mb-2")}>Try the Real Deal</h3>
        <p className={cx("text-muted-foreground")}>
          Experience clear focus trap, scroll locking, and accessible interactions.
        </p>
      </div>
      <ResponsiveDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Interactive Dialog"
        description="This is a fully accessible modal dialog with scroll locking."
        trigger={
          <Button onClick={() => setIsOpen(true)} className={cx("h-12 px-8 text-lg")}>
            Open Interactive Dialog <CursorIcon size={18} />
          </Button>
        }
      >
        <div className={cx("space-y-4 pt-2")}>
          <div className={cx("space-y-2 text-left")}>
            <label
              htmlFor="interactive-dialog-email"
              className={cx("text-sm font-medium text-foreground")}
            >
              Email address
            </label>
            <input
              ref={emailInputRef}
              id="interactive-dialog-email"
              type="email"
              placeholder="you@example.com"
              className={cx(
                "w-full px-3 py-2 rounded-md border border-border bg-card text-foreground focus:ring-2 focus:ring-zinc-500 outline-none",
              )}
            />
          </div>
          <div className={cx("space-y-2 text-left")}>
            <label
              htmlFor="interactive-dialog-feedback"
              className={cx("text-sm font-medium text-foreground")}
            >
              Feedback
            </label>
            <textarea
              id="interactive-dialog-feedback"
              placeholder="Your thoughts..."
              className={cx(
                "w-full px-3 py-2 rounded-md border border-border bg-card text-foreground focus:ring-2 focus:ring-zinc-500 outline-none h-24 resize-none",
              )}
            ></textarea>
          </div>
          <div className={cx("flex justify-end gap-3 pt-4")}>
            <Button variant="tertiary-neutral" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={() => setIsOpen(false)}>
              Submit
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
