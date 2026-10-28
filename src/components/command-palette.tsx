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
    ...VISIBLE_GUIDELINES.map(
      (guideline): CommandItem => ({
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
      }),
    ),
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

            <div id={listboxId} role="listbox" aria-label="Commands" className="cmdk-list">
              {flatItems.length === 0 ? (
                <div className="cmdk-empty">No results for &quot;{inputValue}&quot;</div>
              ) : (
                groups.map((group) => (
                  <div
                    key={group.label}
                    role="group"
                    aria-label={group.label}
                    className="cmdk-group"
                  >
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
