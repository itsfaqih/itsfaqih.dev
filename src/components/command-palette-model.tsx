import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpenIcon,
  CheckIcon,
  EnvelopeIcon,
  GithubLogoIcon,
  HouseIcon,
  LinkedinLogoIcon,
} from "@phosphor-icons/react";
import { GUIDELINES } from "../data/guidelines";

export type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: "navigation" | "external" | "action";
  keywords?: string[];
  action: () => void;
  hasSubmenu?: boolean;
};

export type CommandGroup = {
  label: string;
  items: CommandItem[];
};

export type NavigationLevel = "root" | "rule-of-thumb";

export const LEVEL_LABELS: Record<NavigationLevel, string> = {
  root: "Pages",
  "rule-of-thumb": "Rule of Thumb",
};

function filterItem(item: CommandItem, query: string): boolean {
  if (!query.trim()) return true;
  const normalizedQuery = query.toLowerCase();
  if (item.label.toLowerCase().includes(normalizedQuery)) return true;
  if (item.description?.toLowerCase().includes(normalizedQuery)) return true;
  if (item.keywords?.some((keyword) => keyword.toLowerCase().includes(normalizedQuery))) return true;
  return false;
}

export function useCommandPalette() {

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [navigationLevel, setNavigationLevel] = useState<NavigationLevel>("root");
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [parentItemId, setParentItemId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();


  // Reset state when closing
  const closeAndReset = () => {
    setIsOpen(false);
  };

  // ── Command definitions ──────────────────────────────────────────────

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
          closeAndReset();
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
          setParentItemId("rule-of-thumb");
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
          window.open("https://github.com/itsfaqih", "_blank", "noopener,noreferrer");
          closeAndReset();
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
          window.open("https://linkedin.com/in/itsfaqih", "_blank", "noopener,noreferrer");
          closeAndReset();
        },
      },
      {
        id: "copy-email",
        label: "Copy Email",
        description: "Copy itsfaqih@gmail.com to clipboard",
        icon: copied ? <CheckIcon size={18} /> : <EnvelopeIcon size={18} />,
        category: "action",
        keywords: ["email", "contact", "mail", "clipboard"],
        action: () => {
          navigator.clipboard.writeText("itsfaqih@gmail.com");
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
            closeAndReset();
          }, 1500);
        },
      },
  ];


  const ruleOfThumbCommands: CommandItem[] = (() => {
    const commands: CommandItem[] = [
      {
        id: "rot-index",
        label: "Index",
        description: "View all rules of thumb",
        icon: <BookOpenIcon size={18} />,
        category: "navigation",
        keywords: ["all", "list", "overview"],
        action: () => {
          navigate({ to: "/rule-of-thumb" });
          closeAndReset();
        },
      },
    ];

    for (const guideline of GUIDELINES) {
      if (guideline.comingSoon || guideline.hidden) continue;
      commands.push({
        id: `rot-${guideline.id}`,
        label: guideline.title,
        description: `${guideline.label} • ${guideline.description}`,
        icon: <BookOpenIcon size={18} />,
        category: "navigation",
        keywords: [guideline.label.toLowerCase(), guideline.id.replace(/-/g, " ")],
        action: () => {
          navigate({ to: guideline.href });
          closeAndReset();
        },
      });
    }

    return commands;
  })();

  // ── Derived data ─────────────────────────────────────────────────────

  const currentCommands = (() => {
    switch (navigationLevel) {
      case "rule-of-thumb":
        return ruleOfThumbCommands;
      default:
        return rootCommands;
    }
  })();

  // Group and filter commands
  const { groups, flatItems } = (() => {
    const filtered = currentCommands.filter((cmd) => filterItem(cmd, inputValue));

    const categoryMap: Record<CommandItem["category"], CommandItem[]> = {
      navigation: [],
      external: [],
      action: [],
    };
    filtered.forEach((cmd) => categoryMap[cmd.category].push(cmd));

    const groups: CommandGroup[] = [];
    if (categoryMap.navigation.length > 0) {
      groups.push({ label: LEVEL_LABELS[navigationLevel], items: categoryMap.navigation });
    }
    if (categoryMap.external.length > 0) {
      groups.push({ label: "Links", items: categoryMap.external });
    }
    if (categoryMap.action.length > 0) {
      groups.push({ label: "Actions", items: categoryMap.action });
    }

    // Flat list of all visible items for index-based navigation
    const flatItems = groups.flatMap((g) => g.items);
    return { groups, flatItems };
  })();

  const selectedIndex =
    flatItems.length === 0 ? -1 : Math.min(Math.max(highlightedIndex, 0), flatItems.length - 1);

  // ── Navigation helpers ───────────────────────────────────────────────

  const goBack = () => {
    setNavigationLevel("root");
    setInputValue("");

    // Restore highlight to the parent menu item
    if (parentItemId) {
      // We need to compute the index in the root flat list.
      // At root level, navigation items come first, so we can find the index directly.
      const navItems = rootCommands.filter((cmd) => cmd.category === "navigation");
      const parentIndex = navItems.findIndex((item) => item.id === parentItemId);
      setHighlightedIndex(parentIndex >= 0 ? parentIndex : 0);
    } else {
      setHighlightedIndex(0);
    }
  };

  // ── Keyboard handling ────────────────────────────────────────────────

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
          const item = flatItems[selectedIndex];
          if (item) item.action();
          break;
        }
        case "ArrowRight": {
          const item = flatItems[selectedIndex];
          if (item?.hasSubmenu) {
            e.preventDefault();
            item.action();
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

  // ── Scroll highlighted item into view ────────────────────────────────

  useEffect(() => {
    if (selectedIndex < 0) return;
    const item = flatItems[selectedIndex];
    if (!item) return;
    const el = document.getElementById(`cmd-option-${item.id}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, flatItems]);

  // ── Global keyboard shortcut ─────────────────────────────────────────

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

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setNavigationLevel("root");
        setInputValue("");
        setHighlightedIndex(0);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-focus input when opening or changing level
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready after Dialog opens
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen, navigationLevel]);

  // ── A11y IDs ─────────────────────────────────────────────────────────

  const listboxId = "cmd-listbox";
  const highlightedItem = flatItems[selectedIndex];
  const activeDescendant = highlightedItem ? `cmd-option-${highlightedItem.id}` : undefined;


  return {
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
  };
}

export type CommandPaletteModel = ReturnType<typeof useCommandPalette>;
