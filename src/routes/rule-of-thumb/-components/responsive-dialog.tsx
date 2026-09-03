import type { ReactElement, ReactNode } from "react";
import { Dialog } from "@base-ui/react";
import { cx } from "@/stylex";
import { XIcon } from "@phosphor-icons/react";
import { useMediaQuery } from "../../../hooks/use-media-query";
import { Drawer } from "vaul";

export function ResponsiveDialog({
  children,
  title,
  description,
  trigger,
  open,
  onOpenChange,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  trigger: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay
            className={cx("fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in-0")}
          />
          <Drawer.Content
            className={cx(
              "bg-background flex flex-col rounded-t-[10px] h-auto max-h-[96%] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-border outline-none animate-in slide-in-from-bottom-full duration-300",
            )}
          >
            <div className={cx("p-4 bg-background rounded-t-[10px] flex-1 overflow-auto")}>
              {/* Handle */}
              <div
                className={cx(
                  "mx-auto w-12 h-1.5 shrink-0 rounded-full bg-muted mb-8",
                )}
              />
              <div className={cx("max-w-md mx-auto pb-8")}>
                <Drawer.Title className={cx("font-bold mb-2 text-foreground text-xl")}>
                  {title}
                </Drawer.Title>
                {description && (
                  <Drawer.Description className={cx("text-muted-foreground mb-6 text-sm")}>
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
      <Dialog.Trigger render={trigger as ReactElement} />
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cx(
            "responsive-dialog-backdrop fixed inset-0 z-50 bg-black/40 backdrop-blur-sm opacity-0 data-[state=open]:opacity-100",
          )}
        />
        <Dialog.Popup
          className={cx(
            "responsive-dialog-popup fixed left-[50%] top-[50%] z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-background p-6 shadow-lg opacity-0 scale-95 data-[state=open]:opacity-100 data-[state=open]:scale-100 rounded-xl outline-none",
          )}
        >
          <div className={cx("flex items-center justify-between mb-2")}>
            <Dialog.Title className={cx("text-lg font-semibold text-foreground")}>
              {title}
            </Dialog.Title>
            <Dialog.Close
              className={cx(
                "text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent transition-colors cursor-pointer",
              )}
            >
              <XIcon size={18} />
            </Dialog.Close>
          </div>
          {description && (
            <Dialog.Description className={cx("text-sm text-muted-foreground mb-4")}>
              {description}
            </Dialog.Description>
          )}
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
