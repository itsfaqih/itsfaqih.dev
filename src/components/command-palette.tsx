import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog } from "@base-ui/react/dialog";
import {
  ArrowSquareOutIcon,
  BookOpenIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
  EnvelopeIcon,
  GithubLogoIcon,
  HouseIcon,
  LinkedinLogoIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { VISIBLE_GUIDELINES } from "../data/guidelines";
import { LINKS } from "../seo";
import { cursors, fonts, motion, palette } from "../theme.stylex";

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: "navigation" | "external" | "action";
  keywords?: string[];
  action: () => void;
  hasSubmenu?: boolean;
};

type CommandGroup = {
  label: string;
  items: CommandItem[];
};

type NavigationLevel = "root" | "rule-of-thumb";

const LEVEL_LABELS: Record<NavigationLevel, string> = {
  root: "Pages",
  "rule-of-thumb": "Rule of Thumb",
};

function filterItem(item: CommandItem, query: string): boolean {
  if (!query.trim()) return true;
  const normalizedQuery = query.toLowerCase();
  return [item.label, item.description, ...(item.keywords ?? [])].some((text) =>
    text?.toLowerCase().includes(normalizedQuery),
  );
}

function groupCommands(
  commands: CommandItem[],
  level: NavigationLevel,
  query: string,
): CommandGroup[] {
  const filtered = commands.filter((cmd) => filterItem(cmd, query));
  const inCategory = (category: CommandItem["category"]) =>
    filtered.filter((cmd) => cmd.category === category);
  return [
    { label: LEVEL_LABELS[level], items: inCategory("navigation") },
    { label: "Links", items: inCategory("external") },
    { label: "Actions", items: inCategory("action") },
  ].filter((group) => group.items.length > 0);
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [navigationLevel, setNavigationLevel] = useState<NavigationLevel>("root");
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const copiedResetTimerRef = useRef<number>(undefined);
  const navigate = useNavigate();

  const rootCommands: CommandItem[] = [
    {
      id: "home",
      label: "Home",
      description: "Go to homepage",
      icon: <HouseIcon size={18} />,
      category: "navigation",
      keywords: ["index", "main", "start"],
      action: () => {
        navigate({ to: "/" });
        setIsOpen(false);
      },
    },
    {
      id: "rule-of-thumb",
      label: "Rule of Thumb",
      description: "Browse design and code guidelines",
      icon: <BookOpenIcon size={18} />,
      category: "navigation",
      keywords: ["guidelines", "principles", "best practices"],
      hasSubmenu: true,
      action: () => {
        setNavigationLevel("rule-of-thumb");
        setInputValue("");
        setHighlightedIndex(0);
      },
    },
    {
      id: "github",
      label: "GitHub",
      description: "Open GitHub profile in new tab",
      icon: <GithubLogoIcon size={18} />,
      category: "external",
      keywords: ["code", "repository", "repo", "source"],
      action: () => {
        window.open(LINKS.github, "_blank", "noopener,noreferrer");
        setIsOpen(false);
      },
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      description: "Open LinkedIn profile in new tab",
      icon: <LinkedinLogoIcon size={18} />,
      category: "external",
      keywords: ["profile", "professional", "connect", "network"],
      action: () => {
        window.open(LINKS.linkedin, "_blank", "noopener,noreferrer");
        setIsOpen(false);
      },
    },
    {
      id: "copy-email",
      label: "Copy Email",
      description: `Copy ${LINKS.email} to clipboard`,
      icon: copied ? <CheckIcon size={18} /> : <EnvelopeIcon size={18} />,
      category: "action",
      keywords: ["email", "contact", "mail", "clipboard"],
      action: async () => {
        try {
          await navigator.clipboard.writeText(LINKS.email);
          setCopied(true);
          copiedResetTimerRef.current = window.setTimeout(() => {
            setCopied(false);
            setIsOpen(false);
          }, 1500);
        } catch (error) {
          console.warn("Could not copy the email address.", error);
        }
      },
    },
  ];

  const ruleOfThumbCommands: CommandItem[] = [
    {
      id: "rot-index",
      label: "Index",
      description: "View all rules of thumb",
      icon: <BookOpenIcon size={18} />,
      category: "navigation",
      keywords: ["all", "list", "overview"],
      action: () => {
        navigate({ to: "/rule-of-thumb" });
        setIsOpen(false);
      },
    },
    ...VISIBLE_GUIDELINES.map((guideline): CommandItem => ({
      id: `rot-${guideline.id}`,
      label: guideline.title,
      description: `${guideline.label} • ${guideline.description}`,
      icon: <BookOpenIcon size={18} />,
      category: "navigation",
      keywords: [guideline.label.toLowerCase(), guideline.id.replace(/-/g, " ")],
      action: () => {
        navigate({ to: guideline.href });
        setIsOpen(false);
      },
    })),
  ];

  const currentCommands = navigationLevel === "rule-of-thumb" ? ruleOfThumbCommands : rootCommands;
  const groups = groupCommands(currentCommands, navigationLevel, inputValue);
  const flatItems = groups.flatMap((group) => group.items);

  const selectedIndex =
    flatItems.length === 0 ? -1 : Math.min(highlightedIndex, flatItems.length - 1);
  const highlightedItem = flatItems[selectedIndex];

  const goBack = () => {
    setNavigationLevel("root");
    setInputValue("");
    const rootItems = groupCommands(rootCommands, "root", "").flatMap((group) => group.items);
    setHighlightedIndex(
      Math.max(
        rootItems.findIndex((item) => item.id === navigationLevel),
        0,
      ),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const total = flatItems.length;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (total === 0) return;
        setHighlightedIndex((prev) => (prev + 1) % total);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (total === 0) return;
        setHighlightedIndex((prev) => (prev - 1 + total) % total);
        break;
      }
      case "Enter": {
        e.preventDefault();
        highlightedItem?.action();
        break;
      }
      case "ArrowRight": {
        if (highlightedItem?.hasSubmenu) {
          e.preventDefault();
          highlightedItem.action();
        }
        break;
      }
      case "ArrowLeft":
      case "Backspace": {
        if (inputValue === "" && navigationLevel !== "root") {
          e.preventDefault();
          goBack();
        }
        break;
      }
    }
  };

  useEffect(() => {
    if (!highlightedItem) return;
    document
      .getElementById(`cmd-option-${highlightedItem.id}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlightedItem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) return;
    window.clearTimeout(copiedResetTimerRef.current);
    setCopied(false);
    const resetTimer = window.setTimeout(() => {
      setNavigationLevel("root");
      setInputValue("");
      setHighlightedIndex(0);
    }, 150);
    return () => window.clearTimeout(resetTimer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen, navigationLevel]);

  const listboxId = "cmd-listbox";
  const activeDescendant = highlightedItem ? `cmd-option-${highlightedItem.id}` : undefined;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop {...stylex.props(styles.backdrop)} />
        <Dialog.Popup {...stylex.props(styles.popup)}>
          <div {...stylex.props(styles.panel)}>
            {navigationLevel !== "root" && (
              <div {...stylex.props(styles.crumb)}>
                <button type="button" onClick={goBack} {...stylex.props(styles.crumbBack)}>
                  <CaretLeftIcon size={12} weight="bold" />
                  Back
                </button>
                <span aria-hidden="true" {...stylex.props(styles.crumbSlash)}>
                  /
                </span>
                <b {...stylex.props(styles.crumbLevel)}>{LEVEL_LABELS[navigationLevel]}</b>
              </div>
            )}

            <div {...stylex.props(styles.search)}>
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
                {...stylex.props(styles.input)}
              />
              <kbd {...stylex.props(styles.kbd)}>Esc</kbd>
            </div>

            <div id={listboxId} role="listbox" aria-label="Commands" {...stylex.props(styles.list)}>
              {flatItems.length === 0 ? (
                <div {...stylex.props(styles.empty)}>No results for &quot;{inputValue}&quot;</div>
              ) : (
                groups.map((group, groupIndex) => (
                  <div
                    key={group.label}
                    role="group"
                    aria-label={group.label}
                    {...stylex.props(groupIndex > 0 && styles.laterGroup)}
                  >
                    <div role="presentation" {...stylex.props(styles.label)}>
                      {group.label}
                    </div>
                    {group.items.map((item) => {
                      const flatIdx = flatItems.indexOf(item);
                      const selected = flatIdx === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          id={`cmd-option-${item.id}`}
                          role="option"
                          aria-selected={selected}
                          onClick={item.action}
                          onPointerMove={() => setHighlightedIndex(flatIdx)}
                          {...stylex.props(styles.item, selected && styles.itemSelected)}
                        >
                          <span {...stylex.props(styles.icon, selected && styles.iconSelected)}>
                            {item.icon}
                          </span>
                          <span {...stylex.props(styles.text)}>
                            <span className={`cmdk-name ${stylex.props(styles.name).className}`}>
                              {item.label}
                            </span>
                            {item.description && (
                              <span {...stylex.props(styles.description)}>{item.description}</span>
                            )}
                          </span>
                          {item.id === "copy-email" && copied && (
                            <span {...stylex.props(styles.done)}>Copied!</span>
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

            <div {...stylex.props(styles.foot)}>
              <span {...stylex.props(styles.hint)}>
                <kbd {...stylex.props(styles.kbd)}>↑</kbd>
                <kbd {...stylex.props(styles.kbd, styles.lastKey)}>↓</kbd>
                Navigate
              </span>
              <span {...stylex.props(styles.hint)}>
                <kbd {...stylex.props(styles.kbd, styles.lastKey)}>↵</kbd>
                Select
              </span>
              {navigationLevel !== "root" && (
                <span {...stylex.props(styles.hint)}>
                  <kbd {...stylex.props(styles.kbd, styles.lastKey)}>←</kbd>
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

// Base UI sets these on the backdrop and popup while they enter and leave.
const STARTING = ":is([data-starting-style])";
const LEAVING = ":is([data-ending-style])";

// The arcade panel: 2px hairline, hard bottom edge, display-font labels. Opened by keyboard, so the
// entrance stays short and the highlight follows the cursor instantly.
const styles = stylex.create({
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    backgroundColor: `color-mix(in srgb, ${palette["--bg"]} 72%, transparent)`,
    backdropFilter: "blur(6px)",
    opacity: { default: null, [STARTING]: 0, [LEAVING]: 0 },
    transition: "opacity 150ms ease",
  },
  popup: {
    position: "fixed",
    top: "16vh",
    left: "50%",
    zIndex: 101,
    width: "min(560px, calc(100vw - 24px))",
    translate: "-50% 0",
    outline: "none",
    opacity: { default: null, [STARTING]: 0, [LEAVING]: 0 },
    transform: {
      default: null,
      [STARTING]: {
        default: "translateY(-6px) scale(0.98)",
        "@media (prefers-reduced-motion: reduce)": "none",
      },
    },
    transition: `opacity 160ms ${motion["--out"]}, transform 160ms ${motion["--out"]}`,
    transitionDuration: { default: null, [LEAVING]: "100ms" },
  },
  panel: {
    overflow: "hidden",
    borderRadius: "20px",
    backgroundColor: palette["--panel"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    boxShadow: `0 6px 0 ${palette["--drop-ink"]}, 0 30px 80px ${palette["--lift"]}`,
    color: palette["--dim"],
    font: `400 14px/1.4 ${fonts["--sans"]}`,
  },
  kbd: {
    display: "inline-grid",
    placeItems: "center",
    minWidth: "20px",
    padding: "1px 6px",
    borderRadius: "6px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    backgroundColor: palette["--panel-2"],
    color: palette["--dim"],
    font: `500 11px ${fonts["--display"]}`,
  },
  lastKey: {
    marginRight: "4px",
  },
  crumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
    font: `500 12px ${fonts["--display"]}`,
  },
  crumbBack: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    margin: "-4px -8px",
    padding: "4px 8px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "8px",
    // Keeps the 0 0 position that `background: none` minified to in the plain sheet this replaced.
    backgroundPosition: {
      default: "0 0",
      ":hover": { default: null, "@media (hover: hover)": "0% 0%" },
    },
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, "@media (hover: hover)": palette["--panel-2"] },
    },
    color: {
      default: palette["--dim"],
      ":hover": { default: null, "@media (hover: hover)": palette["--text"] },
    },
    font: "inherit",
    cursor: cursors["--cursor-point"],
    outline: {
      default: null,
      ":focus-visible": `3px solid ${palette["--focus"]}`,
    },
    outlineOffset: { default: null, ":focus-visible": "2px" },
    transition: "background-color 120ms ease, color 120ms ease",
  },
  crumbSlash: {
    color: palette["--mute"],
  },
  crumbLevel: {
    fontWeight: 700,
    color: palette["--text"],
  },
  search: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    height: "58px",
    padding: "0 18px",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
    color: palette["--mute"],
  },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    outline: "none",
    backgroundColor: "transparent",
    backgroundPosition: "0 0",
    color: palette["--text"],
    font: `400 15px ${fonts["--sans"]}`,
    "::placeholder": {
      color: palette["--mute"],
    },
  },
  list: {
    maxHeight: "min(340px, 50vh)",
    overflowY: "auto",
    overscrollBehavior: "contain",
    padding: "6px 8px 8px",
    scrollPadding: "8px",
  },
  laterGroup: {
    marginTop: "4px",
  },
  label: {
    padding: "10px 10px 6px",
    font: `700 11px ${fonts["--display"]}`,
    color: palette["--go-ink"],
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 10px",
    borderRadius: "12px",
    color: palette["--mute"],
    cursor: cursors["--cursor-point"],
  },
  itemSelected: {
    backgroundColor: palette["--panel-2"],
    color: palette["--dim"],
  },
  icon: {
    flex: "none",
    display: "grid",
    placeItems: "center",
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    backgroundColor: palette["--panel-2"],
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    color: palette["--dim"],
  },
  iconSelected: {
    backgroundColor: palette["--go"],
    borderColor: palette["--go"],
    color: palette["--on-accent"],
    boxShadow: `0 2px 0 ${palette["--go-shadow"]}`,
  },
  text: {
    flex: 1,
    minWidth: 0,
    display: "grid",
  },
  name: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    font: `700 13px ${fonts["--display"]}`,
    color: palette["--text"],
  },
  description: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    fontSize: "12px",
    color: palette["--mute"],
  },
  done: {
    font: `700 11px ${fonts["--display"]}`,
    color: `color-mix(in oklab, ${palette["--ts"]} ${palette["--ink-mix"]}, #000)`,
  },
  empty: {
    padding: "32px 16px",
    textAlign: "center",
    color: palette["--mute"],
  },
  foot: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "10px 18px",
    borderTopWidth: "2px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
    backgroundColor: palette["--bg"],
    font: `500 11px ${fonts["--display"]}`,
    color: palette["--mute"],
  },
  hint: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
});
