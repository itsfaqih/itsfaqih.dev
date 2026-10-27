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

export type NavigationLevel = "root" | "rule-of-thumb";

export const LEVEL_LABELS: Record<NavigationLevel, string> = {
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

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [navigationLevel, setNavigationLevel] = useState<NavigationLevel>("root");
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [parentItemId, setParentItemId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
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
        window.open("https://linkedin.com/in/itsfaqih", "_blank", "noopener,noreferrer");
        setIsOpen(false);
      },
    },
    {
      id: "copy-email",
      label: "Copy Email",
      description: "Copy itsfaqih@gmail.com to clipboard",
      icon: copied ? <CheckIcon size={18} /> : <EnvelopeIcon size={18} />,
      category: "action",
      keywords: ["email", "contact", "mail", "clipboard"],
      action: async () => {
        try {
          await navigator.clipboard.writeText("itsfaqih@gmail.com");
          setCopied(true);
          copiedResetTimerRef.current = window.setTimeout(() => {
            copiedResetTimerRef.current = undefined;
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
    ...GUIDELINES.filter((guideline) => !guideline.comingSoon && !guideline.hidden).map(
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
  const filtered = currentCommands.filter((cmd) => filterItem(cmd, inputValue));
  const inCategory = (category: CommandItem["category"]) =>
    filtered.filter((cmd) => cmd.category === category);
  const groups: CommandGroup[] = [
    { label: LEVEL_LABELS[navigationLevel], items: inCategory("navigation") },
    { label: "Links", items: inCategory("external") },
    { label: "Actions", items: inCategory("action") },
  ].filter((group) => group.items.length > 0);
  const flatItems = groups.flatMap((group) => group.items);

  const selectedIndex =
    flatItems.length === 0 ? -1 : Math.min(Math.max(highlightedIndex, 0), flatItems.length - 1);
  const highlightedItem = flatItems[selectedIndex];

  const goBack = () => {
    setNavigationLevel("root");
    setInputValue("");
    // Navigation commands lead the root list, so the parent's place among them is its index.
    const navItems = rootCommands.filter((cmd) => cmd.category === "navigation");
    setHighlightedIndex(
      Math.max(
        navItems.findIndex((item) => item.id === parentItemId),
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
    copiedResetTimerRef.current = undefined;
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
