"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog } from "@base-ui/react/dialog";
import {
  MagnifyingGlassIcon,
  HouseIcon,
  FileTextIcon,
  BookOpenIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  EnvelopeIcon,
  ArrowSquareOutIcon,
  CheckIcon,
  CommandIcon,
  CaretRightIcon,
  CaretLeftIcon,
  ArticleIcon,
} from "@phosphor-icons/react";
import { cn } from "../cn";
import { GUIDELINES } from "../data/guidelines";
import { getAllPosts } from "../routes/blog/-components/posts";

// ============================================================================
// Types
// ============================================================================

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

type NavigationLevel = "root" | "rule-of-thumb" | "blog";

// ============================================================================
// Helpers
// ============================================================================

function filterItem(item: CommandItem, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  if (item.label.toLowerCase().includes(q)) return true;
  if (item.description?.toLowerCase().includes(q)) return true;
  if (item.keywords?.some((kw) => kw.toLowerCase().includes(q))) return true;
  return false;
}

// ============================================================================
// Command Palette Component
// ============================================================================

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [navigationLevel, setNavigationLevel] = useState<NavigationLevel>("root");
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const parentItemIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get blog posts
  const blogPosts = useMemo(() => getAllPosts(), []);

  // Reset state when closing
  const closeAndReset = useCallback(() => {
    setIsOpen(false);
  }, []);

  // ── Command definitions ──────────────────────────────────────────────

  const rootCommands = useMemo<CommandItem[]>(() => {
    return [
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
        id: "blog",
        label: "Blog",
        description: "View all blog posts",
        icon: <FileTextIcon size={18} />,
        category: "navigation",
        keywords: ["posts", "articles", "writing"],
        hasSubmenu: true,
        action: () => {
          parentItemIdRef.current = "blog";
          setNavigationLevel("blog");
          setInputValue("");
          setHighlightedIndex(0);
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
          parentItemIdRef.current = "rule-of-thumb";
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
          window.open("https://github.com/itsfaqih", "_blank");
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
          window.open("https://linkedin.com/in/itsfaqih", "_blank");
          closeAndReset();
        },
      },
      {
        id: "copy-email",
        label: "Copy Email",
        description: "Copy hello@faqih.dev to clipboard",
        icon: copied ? <CheckIcon size={18} /> : <EnvelopeIcon size={18} />,
        category: "action",
        keywords: ["email", "contact", "mail", "clipboard"],
        action: () => {
          navigator.clipboard.writeText("hello@faqih.dev");
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
            closeAndReset();
          }, 1500);
        },
      },
    ];
  }, [navigate, copied, closeAndReset]);

  const blogCommands = useMemo<CommandItem[]>(() => {
    return [
      {
        id: "blog-index",
        label: "Index",
        description: "View all blog posts",
        icon: <FileTextIcon size={18} />,
        category: "navigation",
        keywords: ["all", "list", "overview"],
        action: () => {
          navigate({ to: "/blog" });
          closeAndReset();
        },
      },
      ...blogPosts.map((post) => ({
        id: `blog-${post.slug}`,
        label: post.frontmatter.title,
        description: post.frontmatter.summary || undefined,
        icon: <ArticleIcon size={18} />,
        category: "navigation" as const,
        keywords: [post.slug.replace(/-/g, " ")],
        action: () => {
          navigate({ to: `/blog/${post.slug}` });
          closeAndReset();
        },
      })),
    ];
  }, [navigate, closeAndReset, blogPosts]);

  const ruleOfThumbCommands = useMemo<CommandItem[]>(() => {
    return [
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
      ...GUIDELINES.filter((g) => !g.comingSoon && !g.hidden).map((guideline) => ({
        id: `rot-${guideline.id}`,
        label: guideline.title,
        description: `${guideline.label} • ${guideline.description}`,
        icon: <BookOpenIcon size={18} />,
        category: "navigation" as const,
        keywords: [guideline.label.toLowerCase(), guideline.id.replace(/-/g, " ")],
        action: () => {
          navigate({ to: guideline.href });
          closeAndReset();
        },
      })),
    ];
  }, [navigate, closeAndReset]);

  // ── Derived data ─────────────────────────────────────────────────────

  const currentCommands = useMemo(() => {
    switch (navigationLevel) {
      case "blog":
        return blogCommands;
      case "rule-of-thumb":
        return ruleOfThumbCommands;
      default:
        return rootCommands;
    }
  }, [navigationLevel, rootCommands, blogCommands, ruleOfThumbCommands]);

  const levelLabels: Record<NavigationLevel, string> = {
    root: "Pages",
    blog: "Blog",
    "rule-of-thumb": "Rule of Thumb",
  };

  // Group and filter commands
  const { groups, flatItems } = useMemo(() => {
    const filtered = currentCommands.filter((cmd) => filterItem(cmd, inputValue));

    const categoryMap: Record<CommandItem["category"], CommandItem[]> = {
      navigation: [],
      external: [],
      action: [],
    };
    filtered.forEach((cmd) => categoryMap[cmd.category].push(cmd));

    const groups: CommandGroup[] = [];
    if (categoryMap.navigation.length > 0) {
      groups.push({ label: levelLabels[navigationLevel], items: categoryMap.navigation });
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
  }, [currentCommands, inputValue, navigationLevel]);

  // Clamp highlighted index when items change
  useEffect(() => {
    if (flatItems.length === 0) {
      setHighlightedIndex(-1);
    } else if (highlightedIndex >= flatItems.length) {
      setHighlightedIndex(flatItems.length - 1);
    } else if (highlightedIndex < 0 && flatItems.length > 0) {
      setHighlightedIndex(0);
    }
  }, [flatItems.length, highlightedIndex]);

  // ── Navigation helpers ───────────────────────────────────────────────

  const goBack = useCallback(() => {
    const parentId = parentItemIdRef.current;
    setNavigationLevel("root");
    setInputValue("");

    // Restore highlight to the parent menu item
    if (parentId) {
      // We need to compute the index in the root flat list.
      // At root level, navigation items come first, so we can find the index directly.
      const navItems = rootCommands.filter((cmd) => cmd.category === "navigation");
      const parentIndex = navItems.findIndex((item) => item.id === parentId);
      setHighlightedIndex(parentIndex >= 0 ? parentIndex : 0);
    } else {
      setHighlightedIndex(0);
    }
  }, [rootCommands]);

  // ── Keyboard handling ────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
          const item = flatItems[highlightedIndex];
          if (item) item.action();
          break;
        }
        case "ArrowRight": {
          const item = flatItems[highlightedIndex];
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
    },
    [flatItems, highlightedIndex, inputValue, navigationLevel, goBack],
  );

  // ── Scroll highlighted item into view ────────────────────────────────

  useEffect(() => {
    if (highlightedIndex < 0) return;
    const item = flatItems[highlightedIndex];
    if (!item) return;
    const el = document.getElementById(`cmd-option-${item.id}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, flatItems]);

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

  // Reset highlight to 0 when filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [inputValue]);

  // ── A11y IDs ─────────────────────────────────────────────────────────

  const listboxId = "cmd-listbox";
  const highlightedItem = flatItems[highlightedIndex];
  const activeDescendant = highlightedItem ? `cmd-option-${highlightedItem.id}` : undefined;

  // ── Render ───────────────────────────────────────────────────────────

  // Build a running index counter for mapping group items to flat indices
  let runningIndex = 0;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-background/80 backdrop-blur-sm z-100 data-[state=open]:animate-[fade-in_150ms_ease-out] data-[state=closed]:animate-[fade-out_100ms_ease-in]" />
        <Dialog.Popup className="fixed left-1/2 top-[20%] -translate-x-1/2 z-101 w-full max-w-lg px-4 outline-none data-[state=open]:animate-[dialog-in_200ms_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[dialog-out_100ms_ease-in]">
          <div className="bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Breadcrumb / Back button for submenu */}
            {navigationLevel !== "root" && (
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <CaretLeftIcon size={14} />
                  <span>Back</span>
                </button>
                <span className="text-muted-foreground/50">/</span>
                <span className="text-sm text-foreground font-medium">
                  {levelLabels[navigationLevel]}
                </span>
              </div>
            )}

            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <MagnifyingGlassIcon size={20} className="text-muted-foreground shrink-0" />
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
                    : `Search in ${levelLabels[navigationLevel]}...`
                }
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Command List */}
            <div
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label="Commands"
              className="max-h-[320px] overflow-y-auto py-2 scroll-py-2"
            >
              {flatItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No results found for &quot;{inputValue}&quot;
                </div>
              ) : (
                groups.map((group) => {
                  const groupStartIndex = runningIndex;
                  const groupEl = (
                    <div key={group.label} role="group" aria-label={group.label} className="mb-2 last:mb-0">
                      <div
                        role="presentation"
                        className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2"
                      >
                        {group.label}
                        {group.label === "Links" && (
                          <ArrowSquareOutIcon size={12} className="text-muted-foreground" />
                        )}
                      </div>
                      {group.items.map((item, itemIdx) => {
                        const flatIdx = groupStartIndex + itemIdx;
                        const isHighlighted = flatIdx === highlightedIndex;
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
                            <span className="shrink-0 text-muted-foreground transition-colors">
                              {item.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{item.label}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {item.hasSubmenu && (
                              <CaretRightIcon size={14} className="shrink-0 text-muted-foreground" />
                            )}
                            {item.category === "external" && (
                              <ArrowSquareOutIcon
                                size={14}
                                className="shrink-0 text-muted-foreground"
                              />
                            )}
                            {item.id === "copy-email" && copied && (
                              <span className="text-xs text-green-500 font-medium">Copied!</span>
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
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]">
                    ↑
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]">
                    ↓
                  </kbd>
                  <span className="ml-1">Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]">
                    ↵
                  </kbd>
                  <span className="ml-1">Select</span>
                </span>
                {navigationLevel !== "root" && (
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]">
                      ←
                    </kbd>
                    <span className="ml-1">Back</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]">
                    Esc
                  </kbd>
                  <span className="ml-1">Close</span>
                </span>
              </div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ============================================================================
// Command Palette Trigger (for header)
// ============================================================================

export function CommandPaletteTrigger() {
  const handleClick = useCallback(() => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  }, []);

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-all duration-200 border border-transparent hover:border-border cursor-pointer"
      aria-label="Open command palette"
    >
      <MagnifyingGlassIcon size={16} />
      <span className="hidden sm:inline text-xs">Search...</span>
      <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px] text-muted-foreground">
        <CommandIcon size={10} />K
      </kbd>
    </button>
  );
}
