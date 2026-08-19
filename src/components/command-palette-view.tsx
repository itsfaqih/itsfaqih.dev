import { cx } from "@/stylex";
import { Dialog } from "@base-ui/react/dialog";
import {
  ArrowSquareOutIcon,
  CaretLeftIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { cn } from "../cn";
import { LEVEL_LABELS, type CommandPaletteModel } from "./command-palette-model";

type CommandPaletteViewProps = CommandPaletteModel;

export function CommandPaletteView({
  isOpen,
  setIsOpen,
  navigationLevel,
  inputValue,
  setInputValue,
  handleKeyDown,
  inputRef,
  listRef,
  listboxId,
  activeDescendant,
  groups,
  flatItems,
  selectedIndex,
  setHighlightedIndex,
  goBack,
  copied,
}: CommandPaletteViewProps) {
  let runningIndex = 0;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className={cx("fixed inset-0 bg-background/80 backdrop-blur-sm z-100 data-[state=open]:animate-[fade-in_150ms_ease-out] data-[state=closed]:animate-[fade-out_100ms_ease-in]")} />
        <Dialog.Popup className={cx("fixed left-1/2 top-[20%] -translate-x-1/2 z-101 w-full max-w-lg px-4 outline-none data-[state=open]:animate-[dialog-in_200ms_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[dialog-out_100ms_ease-in]")}>
          <div className={cx("bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden")}>
            {/* Breadcrumb / Back button for submenu */}
            {navigationLevel !== "root" && (
              <div className={cx("flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30")}>
                <button
                  onClick={goBack}
                  className={cx("flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer")}
                >
                  <CaretLeftIcon size={14} />
                  <span>Back</span>
                </button>
                <span className={cx("text-muted-foreground/50")}>/</span>
                <span className={cx("text-sm text-foreground font-medium")}>
                  {LEVEL_LABELS[navigationLevel]}
                </span>
              </div>
            )}

            {/* Search Input */}
            <div className={cx("flex items-center gap-3 px-4 py-3 border-b border-border")}>
              <MagnifyingGlassIcon size={20} className={cx("text-muted-foreground shrink-0")} />
              <input
                ref={inputRef}
                role="combobox"
                aria-expanded={true}
                aria-controls={listboxId}
                aria-activedescendant={activeDescendant}
                aria-autocomplete="list"
                aria-label="Search commands"
                placeholder={
                  navigationLevel === "root"
                    ? "Search pages, links, or actions..."
                    : `Search in ${LEVEL_LABELS[navigationLevel]}...`
                }
                className={cx("flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none")}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Command List */}
            <div
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label="Commands"
              className={cx("max-h-[320px] overflow-y-auto py-2 scroll-py-2")}
            >
              {flatItems.length === 0 ? (
                <div className={cx("px-4 py-8 text-center text-muted-foreground text-sm")}>
                  No results found for &quot;{inputValue}&quot;
                </div>
              ) : (
                groups.map((group) => {
                  const groupStartIndex = runningIndex;
                  const groupEl = (
                    <div
                      key={group.label}
                      role="group"
                      aria-label={group.label}
                      className={cx("mb-2 last:mb-0")}
                    >
                      <div
                        role="presentation"
                        className={cx("px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2")}
                      >
                        {group.label}
                        {group.label === "Links" && (
                          <ArrowSquareOutIcon size={12} className={cx("text-muted-foreground")} />
                        )}
                      </div>
                      {group.items.map((item, itemIdx) => {
                        const flatIdx = groupStartIndex + itemIdx;
                        const isHighlighted = flatIdx === selectedIndex;
                        return (
                          <div
                            key={item.id}
                            id={`cmd-option-${item.id}`}
                            role="option"
                            aria-selected={isHighlighted}
                            onClick={item.action}
                            onPointerMove={() => setHighlightedIndex(flatIdx)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer",
                              isHighlighted
                                ? "bg-accent text-foreground"
                                : "text-foreground/80 hover:bg-accent/50",
                            )}
                          >
                            <span className={cx("shrink-0 text-muted-foreground transition-colors")}>
                              {item.icon}
                            </span>
                            <div className={cx("flex-1 min-w-0")}>
                              <div className={cx("text-sm font-medium truncate")}>{item.label}</div>
                              {item.description && (
                                <div className={cx("text-xs text-muted-foreground truncate")}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {item.hasSubmenu && (
                              <CaretRightIcon
                                size={14}
                                className={cx("shrink-0 text-muted-foreground")}
                              />
                            )}
                            {item.category === "external" && (
                              <ArrowSquareOutIcon
                                size={14}
                                className={cx("shrink-0 text-muted-foreground")}
                              />
                            )}
                            {item.id === "copy-email" && copied && (
                              <span className={cx("text-xs text-green-500 font-medium")}>Copied!</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                  runningIndex += group.items.length;
                  return groupEl;
                })
              )}
            </div>

            {/* Footer */}
            <div className={cx("flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30 text-xs text-muted-foreground")}>
              <div className={cx("flex items-center gap-4")}>
                <span className={cx("flex items-center gap-1")}>
                  <kbd className={cx("px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]")}>
                    ↑
                  </kbd>
                  <kbd className={cx("px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]")}>
                    ↓
                  </kbd>
                  <span className={cx("ml-1")}>Navigate</span>
                </span>
                <span className={cx("flex items-center gap-1")}>
                  <kbd className={cx("px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]")}>
                    ↵
                  </kbd>
                  <span className={cx("ml-1")}>Select</span>
                </span>
                {navigationLevel !== "root" && (
                  <span className={cx("flex items-center gap-1")}>
                    <kbd className={cx("px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]")}>
                      ←
                    </kbd>
                    <span className={cx("ml-1")}>Back</span>
                  </span>
                )}
                <span className={cx("flex items-center gap-1")}>
                  <kbd className={cx("px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]")}>
                    Esc
                  </kbd>
                  <span className={cx("ml-1")}>Close</span>
                </span>
              </div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
