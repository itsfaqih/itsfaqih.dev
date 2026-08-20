import { cx } from "@/stylex";
import { CommandIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { CommandPaletteView } from "./command-palette-view";
import { useCommandPalette } from "./command-palette-model";

export function CommandPalette() {
  const model = useCommandPalette();
  return <CommandPaletteView {...model} />;
}

type CommandPaletteTriggerProps = {
  showLabel?: boolean;
  onOpen?: () => void;
  className?: string;
};

export function CommandPaletteTrigger({ showLabel = false, onOpen, className }: CommandPaletteTriggerProps = {}) {
  const handleClick = () => {
    onOpen?.();
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className={cx(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200 border border-transparent hover:border-border cursor-pointer",
        showLabel && "w-full justify-start px-3 py-2.5 text-base",
        className,
      )}
      aria-label="Open command palette"
    >
      <MagnifyingGlassIcon size={16} />
      <span className={cx(showLabel ? "inline text-base" : "hidden sm:inline text-xs")}>
        {showLabel ? "Search" : "Search..."}
      </span>
      <kbd className={cx(showLabel ? "hidden" : "hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px] text-muted-foreground")}>
        <CommandIcon size={10} />K
      </kbd>
    </button>
  );
}
