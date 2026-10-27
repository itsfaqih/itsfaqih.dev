import { Dialog } from "@base-ui/react/dialog";
import {
  ArrowSquareOutIcon,
  CaretLeftIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
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
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="cmdk-backdrop" />
        <Dialog.Popup className="cmdk-popup">
          <div className="cmdk">
            {navigationLevel !== "root" && (
              <div className="cmdk-crumb">
                <button type="button" onClick={goBack}>
                  <CaretLeftIcon size={12} weight="bold" />
                  Back
                </button>
                <span aria-hidden="true">/</span>
                <b>{LEVEL_LABELS[navigationLevel]}</b>
              </div>
            )}

            <div className="cmdk-search">
              <MagnifyingGlassIcon size={18} weight="bold" />
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
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
              />
              <kbd>Esc</kbd>
            </div>

            <div
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label="Commands"
              className="cmdk-list"
            >
              {flatItems.length === 0 ? (
                <div className="cmdk-empty">No results for &quot;{inputValue}&quot;</div>
              ) : (
                groups.map((group) => (
                    <div key={group.label} role="group" aria-label={group.label} className="cmdk-group">
                      <div role="presentation" className="cmdk-label">
                        {group.label}
                      </div>
                      {group.items.map((item) => {
                        const flatIdx = flatItems.indexOf(item);
                        return (
                          <div
                            key={item.id}
                            id={`cmd-option-${item.id}`}
                            role="option"
                            aria-selected={flatIdx === selectedIndex}
                            onClick={item.action}
                            onPointerMove={() => setHighlightedIndex(flatIdx)}
                            className="cmdk-item"
                          >
                            <span className="cmdk-ico">{item.icon}</span>
                            <span className="cmdk-text">
                              <span className="cmdk-name">{item.label}</span>
                              {item.description && (
                                <span className="cmdk-desc">{item.description}</span>
                              )}
                            </span>
                            {item.id === "copy-email" && copied && (
                              <span className="cmdk-done">Copied!</span>
                            )}
                            {item.hasSubmenu && <CaretRightIcon size={14} weight="bold" />}
                            {item.category === "external" && (
                              <ArrowSquareOutIcon size={14} weight="bold" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
              )}
            </div>

            <div className="cmdk-foot">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                Navigate
              </span>
              <span>
                <kbd>↵</kbd>
                Select
              </span>
              {navigationLevel !== "root" && (
                <span>
                  <kbd>←</kbd>
                  Back
                </span>
              )}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
