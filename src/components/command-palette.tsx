import * as stylex from "@stylexjs/stylex";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { colorOf, VISIBLE_GUIDELINES } from "../data/guidelines";
import { LINKS } from "../seo";
import { RuleIcon } from "./rule-icon";
import { BoxScrollbar, boxScrollbarHost } from "./box-scrollbar";
import { fluidHover, placeHighlight } from "./fluid-hover";
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
  /** Overrides the group's hue, as a rule takes its topic's. */
  hue?: string;
};

type CommandGroup = {
  label: string;
  hue: string;
  items: CommandItem[];
};

type NavigationLevel = "root" | "rule-of-thumb";

const LEVEL_LABELS: Record<NavigationLevel, string> = {
  root: "Pages",
  "rule-of-thumb": "Rule of Thumb",
};

// Each section wears its own hue on its label and on the highlighted item's icon.
const CATEGORY_HUE: Record<CommandItem["category"], string> = {
  navigation: "var(--cw)",
  external: "var(--ux)",
  action: "var(--ts)",
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
  const inCategory = (category: CommandItem["category"]) => ({
    hue: CATEGORY_HUE[category],
    items: filtered.filter((cmd) => cmd.category === category),
  });
  return [
    { label: LEVEL_LABELS[level], ...inCategory("navigation") },
    { label: "Links", ...inCategory("external") },
    { label: "Actions", ...inCategory("action") },
  ].filter((group) => group.items.length > 0);
}

function assignLocation(href: string) {
  location.assign(href);
}

export function CommandPalette({
  navigate = assignLocation,
}: {
  /** Leaves for a page. A test swaps it, since jsdom cannot navigate. */
  navigate?: (href: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Every open pours the header island into the palette and every close pours it back, however
  // it was opened or left. This tracks whether a close has an island to pour back to yet.
  const opened = useRef(false);
  const [copied, setCopied] = useState(false);
  const [navigationLevel, setNavigationLevel] = useState<NavigationLevel>("root");
  // Which way the last level change went, so the new list slides in from that side. Null on a
  // fresh open, where the pour already brings the list in.
  const [step, setStep] = useState<"in" | "out" | null>(null);
  // The submenu the crumb names, kept through going back so the crumb folds away still reading it.
  const [crumbLevel, setCrumbLevel] = useState<Exclude<NavigationLevel, "root">>("rule-of-thumb");
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const copiedResetTimerRef = useRef<number>(undefined);

  const close = () => setIsOpen(false);

  // The level being left slides out the other way as the new one slides in. It leaves as a copy of
  // its last frame, so the live list can switch levels at once.
  const levelRef = useRef<HTMLDivElement>(null);
  const ghostsRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const slideAway = (toward: "left" | "right") => {
    const level = levelRef.current;
    const ghosts = ghostsRef.current;
    const list = level?.parentElement;
    if (!level || !ghosts || !list) return;
    const ghost = level.cloneNode(true);
    if (!(ghost instanceof HTMLElement)) return;
    for (const element of ghost.querySelectorAll("[id]")) element.removeAttribute("id");
    ghost.className =
      stylex.props(fluidHover.group, toward === "left" ? styles.toLeft : styles.toRight)
        .className ?? "";
    ghost.style.cssText = `position: absolute; top: ${level.offsetTop - list.scrollTop}px; left: ${level.offsetLeft}px; width: ${level.offsetWidth}px`;
    ghost.addEventListener("animationend", () => ghost.remove(), { once: true });
    ghosts.replaceChildren(ghost);
    list.scrollTop = 0;
  };

  const rootCommands: CommandItem[] = [
    {
      id: "home",
      label: "Home",
      description: "Go to homepage",
      icon: <HouseIcon size={18} />,
      category: "navigation",
      keywords: ["index", "main", "start"],
      action: () => {
        navigate("/");
        close();
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
        slideAway("left");
        setNavigationLevel("rule-of-thumb");
        setCrumbLevel("rule-of-thumb");
        setStep("in");
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
        close();
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
        close();
      },
    },
    {
      id: "copy-email",
      label: "Copy Email",
      description: `Copy ${LINKS.email} to clipboard`,
      icon: (
        <>
          <span {...stylex.props(styles.glyph, copied && styles.glyphOff)}>
            <EnvelopeIcon size={18} />
          </span>
          <span {...stylex.props(styles.glyph, !copied && styles.glyphOff)}>
            <CheckIcon size={18} />
          </span>
        </>
      ),
      category: "action",
      keywords: ["email", "contact", "mail", "clipboard"],
      action: async () => {
        try {
          await navigator.clipboard.writeText(LINKS.email);
          setCopied(true);
          copiedResetTimerRef.current = window.setTimeout(() => {
            setCopied(false);
            close();
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
        navigate("/rule-of-thumb");
        close();
      },
    },
    ...VISIBLE_GUIDELINES.map((guideline): CommandItem => ({
      id: `rot-${guideline.id}`,
      label: guideline.title,
      description: `${guideline.label} • ${guideline.description}`,
      icon: <RuleIcon id={guideline.id} />,
      category: "navigation",
      keywords: [guideline.label.toLowerCase(), guideline.id.replace(/-/g, " ")],
      hue: colorOf(guideline.label),
      action: () => {
        navigate(guideline.href);
        close();
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
    slideAway("right");
    setNavigationLevel("root");
    setStep("out");
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

  // One fill follows the highlighted option, whether the pointer or the arrow keys moved it, and
  // springs between options instead of blinking (fluid-hover.ts). Rows can shift on any render, so
  // it is placed after every one. A fresh fill fades in where it lands instead of sliding there.
  const highlightRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const highlight = highlightRef.current;
    if (!highlight) return;
    const option = highlightedItem && document.getElementById(`cmd-option-${highlightedItem.id}`);
    if (!option) {
      highlight.removeAttribute("data-on");
      return;
    }
    placeHighlight(highlight, { y: option.offsetTop, h: option.offsetHeight });
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // The header's search button opens the palette with a synthetic ⌘K, the only untrusted one.
        setIsOpen((prev) => !e.isTrusted || !prev);
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
      setStep(null);
      setInputValue("");
      setHighlightedIndex(0);
    }, 300);
    return () => window.clearTimeout(resetTimer);
  }, [isOpen]);

  // The island hides while it is out being the palette. On the way home it shows again as the drop
  // reaches it, so the two cross-fade instead of the island popping in after the drop is gone.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (isOpen) {
      opened.current = true;
      root.toggleAttribute("data-island-away", true);
      return;
    }
    if (!opened.current) return;
    root.toggleAttribute("data-island-away", true);
    const home = window.setTimeout(() => root.removeAttribute("data-island-away"), ISLAND_HOME_MS);
    return () => window.clearTimeout(home);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen, navigationLevel]);

  // Sizes the list to its level's content, so a level change can ease the height between levels.
  // The height eases only while the new level slides in; filtering as you type resizes at once.
  const fitLevel = useCallback(
    (level: HTMLDivElement | null) => {
      levelRef.current = level;
      const list = level?.parentElement;
      if (!level || !list) return;
      level.toggleAttribute("data-shifting", step !== null);
      const settle = () => level.removeAttribute("data-shifting");
      level.addEventListener("animationend", settle, { once: true });
      const fit = () => {
        // Capped here rather than by max-height alone, so an ease from a capped level starts moving
        // at once instead of sitting at the cap.
        const cap = parseFloat(getComputedStyle(list).maxHeight) || Infinity;
        list.style.height = `${Math.min(level.offsetHeight + LIST_PADDING, cap)}px`;
      };
      fit();
      const resize = new ResizeObserver(fit);
      resize.observe(level);
      return () => {
        resize.disconnect();
        level.removeEventListener("animationend", settle);
      };
    },
    [step],
  );

  const listboxId = "cmd-listbox";
  const activeDescendant = highlightedItem ? `cmd-option-${highlightedItem.id}` : undefined;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop data-pour {...stylex.props(styles.backdrop)} />
        <Dialog.Popup ref={attachStage} data-pour {...stylex.props(styles.stage)}>
          <div aria-hidden="true" {...stylex.props(styles.drop)} />
          <div data-cmd-panel {...stylex.props(styles.panel)}>
            <div {...stylex.props(styles.surface)}>
              <div {...stylex.props(styles.body)}>
                <div
                  inert={navigationLevel === "root"}
                  {...stylex.props(
                    styles.crumbFold,
                    navigationLevel !== "root" && styles.crumbOpen,
                  )}
                >
                  <div {...stylex.props(styles.crumbClip)}>
                    <div {...stylex.props(styles.crumb)}>
                      <button type="button" onClick={goBack} {...stylex.props(styles.crumbBack)}>
                        <CaretLeftIcon size={12} weight="bold" />
                        Back
                      </button>
                      <span aria-hidden="true" {...stylex.props(styles.crumbSlash)}>
                        /
                      </span>
                      <b {...stylex.props(styles.crumbLevel)}>{LEVEL_LABELS[crumbLevel]}</b>
                    </div>
                  </div>
                </div>

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
                    enterKeyHint="search"
                    autoCapitalize="none"
                    autoCorrect="off"
                    {...stylex.props(styles.input)}
                  />
                  <kbd {...stylex.props(styles.kbd)}>Esc</kbd>
                </div>

                <div {...stylex.props(styles.listFrame)}>
                  <div
                    ref={listRef}
                    id={listboxId}
                    role="listbox"
                    aria-label="Commands"
                    {...stylex.props(styles.list, boxScrollbarHost.box)}
                  >
                    <div
                      ref={ghostsRef}
                      aria-hidden="true"
                      inert
                      {...stylex.props(styles.ghosts)}
                    />
                    <div
                      key={navigationLevel}
                      ref={fitLevel}
                      role="presentation"
                      {...stylex.props(
                        fluidHover.group,
                        step && styles.level,
                        step === "in" && styles.fromRight,
                        step === "out" && styles.fromLeft,
                      )}
                    >
                      <span
                        ref={highlightRef}
                        aria-hidden="true"
                        {...stylex.props(fluidHover.highlight, styles.highlight)}
                      />
                      {flatItems.length === 0 ? (
                        <div {...stylex.props(styles.empty)}>
                          No results for &quot;{inputValue}&quot;
                        </div>
                      ) : (
                        groups.map((group, groupIndex) => (
                          <div
                            key={group.label}
                            role="group"
                            aria-label={group.label}
                            {...stylex.props(groupIndex > 0 && styles.laterGroup)}
                            style={{ "--c": group.hue }}
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
                                  style={item.hue ? { "--c": item.hue } : undefined}
                                >
                                  <span
                                    {...stylex.props(styles.icon, selected && styles.iconSelected)}
                                  >
                                    {item.icon}
                                  </span>
                                  <span {...stylex.props(styles.text)}>
                                    <span
                                      className={`cmdk-name ${stylex.props(styles.name).className}`}
                                    >
                                      {item.label}
                                    </span>
                                    {item.description && (
                                      <span {...stylex.props(styles.description)}>
                                        {item.description}
                                      </span>
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
                  </div>
                  <BoxScrollbar box={listRef} />
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
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const box = (stage: HTMLElement, name: string, rect: DOMRect) => {
  stage.style.setProperty(`--${name}-x`, `${rect.left}px`);
  stage.style.setProperty(`--${name}-y`, `${rect.top}px`);
  stage.style.setProperty(`--${name}-w`, `${rect.width}px`);
  stage.style.setProperty(`--${name}-h`, `${rect.height}px`);
};

// Reads the header island the palette pours out of, and the panel's own box (again on every resize),
// before the first frame paints. While closing it reads the island every frame, since picking a page
// can resize the island under the drop on its way home. It also marks html for as long as the palette is mounted, closing
// included, to lift the island over the backdrop so the pour lands back on a sharp island.
function attachStage(stage: HTMLDivElement | null) {
  const panel = stage?.querySelector<HTMLElement>("[data-cmd-panel]");
  if (!stage || !panel) return;
  const root = document.documentElement;
  root.toggleAttribute("data-palette", true);
  const measure = () => {
    const island = document.querySelector(".island")?.getBoundingClientRect();
    box(stage, "anchor", island ?? new DOMRect(innerWidth / 2 - 24, 12, 48, 48));
    box(stage, "to", panel.getBoundingClientRect());
  };
  measure();
  const resize = new ResizeObserver(measure);
  resize.observe(panel);
  addEventListener("resize", measure);
  let frame = 0;
  const follow = () => {
    measure();
    frame = requestAnimationFrame(follow);
  };
  const leaving = new MutationObserver(() => {
    if (stage.hasAttribute("data-ending-style") && !frame) follow();
  });
  leaving.observe(stage, { attributes: true, attributeFilter: ["data-ending-style"] });
  return () => {
    cancelAnimationFrame(frame);
    leaving.disconnect();
    resize.disconnect();
    removeEventListener("resize", measure);
    root.removeAttribute("data-palette");
  };
}

// Base UI sets these on the backdrop and the stage while they enter and leave.
const STARTING = ":is([data-starting-style])";
const LEAVING = ":is([data-ending-style])";
const IN_STARTING = ":is([data-starting-style] *)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const TOUCH = "@media (pointer: coarse)";
const DARK = ":is(.dark *)";
// The island's ground, black over the light theme and white over the dark one.
const ISLAND = "#0a0a0c";
const ISLAND_DARK = "#fff";
// A hue as text on that ground: full strength on black, inked down on white.
const HUE_INK = { default: "var(--c)", [DARK]: "color-mix(in oklab, var(--c) 62%, #000)" };

// The pour, on one full-screen layer of the island's ink, shaped by clip-path. The island gathers
// into a drop, the drop falls to the panel's top, stretching as it speeds up and squashing as it
// lands, then splashes wide and runs down into the panel. Closing draws it back up the same way.
// Each stage hands its speed to the next: the gather settles, the fall accelerates into the landing,
// and the splash leaves fast, so the shape never parks between stages.
const POURING_IN = ":is([data-pour]:not([data-ending-style]) *)";
const POURING_OUT = ":is([data-ending-style] *)";
const IN_ISLAND = {
  clipPath:
    "inset(var(--anchor-y) calc(100% - var(--anchor-x) - var(--anchor-w)) calc(100% - var(--anchor-y) - var(--anchor-h)) var(--anchor-x) round calc(var(--anchor-h) / 2))",
};
const DROP_UP = {
  clipPath:
    "inset(calc((var(--anchor-y) + var(--anchor-h) / 2) - 44px / 2) calc(100% - (var(--anchor-x) + var(--anchor-w) / 2) - 44px / 2) calc(100% - (var(--anchor-y) + var(--anchor-h) / 2) - 44px / 2) calc((var(--anchor-x) + var(--anchor-w) / 2) - 44px / 2) round 22px)",
};
const FALLING = {
  clipPath:
    "inset(calc(((var(--anchor-y) + var(--anchor-h) / 2) * 0.3 + (var(--to-y) + 22px) * 0.7) - 60px / 2) calc(100% - ((var(--anchor-x) + var(--anchor-w) / 2) * 0.3 + (var(--to-x) + var(--to-w) / 2) * 0.7) - 34px / 2) calc(100% - ((var(--anchor-y) + var(--anchor-h) / 2) * 0.3 + (var(--to-y) + 22px) * 0.7) - 60px / 2) calc(((var(--anchor-x) + var(--anchor-w) / 2) * 0.3 + (var(--to-x) + var(--to-w) / 2) * 0.7) - 34px / 2) round 17px)",
};
const RISING = {
  clipPath:
    "inset(calc(((var(--anchor-y) + var(--anchor-h) / 2) * 0.55 + (var(--to-y) + 22px) * 0.45) - 58px / 2) calc(100% - ((var(--anchor-x) + var(--anchor-w) / 2) * 0.55 + (var(--to-x) + var(--to-w) / 2) * 0.45) - 34px / 2) calc(100% - ((var(--anchor-y) + var(--anchor-h) / 2) * 0.55 + (var(--to-y) + 22px) * 0.45) - 58px / 2) calc(((var(--anchor-x) + var(--anchor-w) / 2) * 0.55 + (var(--to-x) + var(--to-w) / 2) * 0.45) - 34px / 2) round 17px)",
};
const DROP_DOWN = {
  clipPath:
    "inset(calc((var(--to-y) + 22px) - 44px / 2) calc(100% - (var(--to-x) + var(--to-w) / 2) - 44px / 2) calc(100% - (var(--to-y) + 22px) - 44px / 2) calc((var(--to-x) + var(--to-w) / 2) - 44px / 2) round 22px)",
};
const SQUASHED = {
  clipPath:
    "inset(calc((var(--to-y) + 19px) - 38px / 2) calc(100% - (var(--to-x) + var(--to-w) / 2) - 58px / 2) calc(100% - (var(--to-y) + 19px) - 38px / 2) calc((var(--to-x) + var(--to-w) / 2) - 58px / 2) round 19px)",
};
const SPLASH = {
  clipPath:
    "inset(calc((var(--to-y) + max(44px, var(--to-h) * 0.32) / 2) - max(44px, var(--to-h) * 0.32) / 2) calc(100% - (var(--to-x) + var(--to-w) / 2) - (var(--to-w) * 0.66) / 2) calc(100% - (var(--to-y) + max(44px, var(--to-h) * 0.32) / 2) - max(44px, var(--to-h) * 0.32) / 2) calc((var(--to-x) + var(--to-w) / 2) - (var(--to-w) * 0.66) / 2) round 28px)",
};
const PANEL = {
  clipPath:
    "inset(var(--to-y) calc(100% - var(--to-x) - var(--to-w)) calc(100% - var(--to-y) - var(--to-h)) var(--to-x) round 28px)",
};
const SETTLE = "cubic-bezier(0.3, 0, 0.2, 1)";
const DROP = "cubic-bezier(0.55, 0, 0.9, 0.45)";
const SPREAD = "cubic-bezier(0.15, 0.85, 0.3, 1)";
// The splash runs down into the panel on a spring (damping 0.66) that leaves at the splash's speed,
// spills about 7% past the panel's edges and draws back.
const SPILL =
  "linear(0, 0.156, 0.326, 0.492, 0.642, 0.77, 0.873, 0.951, 1.007, 1.043, 1.064, 1.072, 1.072, 1.066, 1.057, 1.047, 1.036, 1.026, 1.017, 1.01, 1.005, 1.001, 0.998, 0.996, 0.996, 0.995, 0.996, 0.996, 0.997, 0.997, 0.998, 0.999, 1)";
// Stages at 8, 16, 30, 35 and 49% of T_IN, leaving the spill the rest.
const pourIn = stylex.keyframes({
  "0%": { ...IN_ISLAND, opacity: 0, animationTimingFunction: SETTLE },
  "8.18%": { opacity: 1 },
  "16.36%": { ...DROP_UP, animationTimingFunction: DROP },
  "30%": { ...FALLING, animationTimingFunction: "linear" },
  "35.45%": { ...SQUASHED, animationTimingFunction: SPREAD },
  "49.09%": { ...SPLASH, animationTimingFunction: SPILL },
  "99.9%": { ...PANEL, opacity: 1 },
  "100%": { ...PANEL, opacity: 0 },
});
const pourOut = stylex.keyframes({
  "0%": { ...PANEL, opacity: 1, animationTimingFunction: "cubic-bezier(0.5, 0, 0.3, 1)" },
  "38%": { ...DROP_DOWN, animationTimingFunction: "cubic-bezier(0.45, 0, 0.8, 0.5)" },
  "52%": { ...RISING, animationTimingFunction: "linear" },
  "70%": { ...DROP_UP, animationTimingFunction: SPREAD },
  "84%": { opacity: 1 },
  "100%": { ...IN_ISLAND, opacity: 0 },
});
const T_IN = "440ms";
const T_OUT = "240ms";
// When the closing drop reaches the island (70% of T_OUT) and starts filling it out.
const ISLAND_HOME_MS = 170;
// The content and then the shadow come in as the drop nears the panel's full size.
const CONTENT_IN = `calc(${T_IN} * 0.45)`;
const SHADOW_IN = `calc(${T_IN} * 0.73)`;
const FAST_IN = `${motion["--t-fast"]} ${motion["--fast"]}`;
const FAST_OUT = `${motion["--t-fast-exit"]} ${motion["--exit"]}`;
// The panel itself wears the drop's shape from the splash on, in its own coordinates, so the
// content fading in never shows past the drop's edge. Its ground stays clear while the drop shapes
// it, and fills in on the last frame, where the drop is exactly the panel and gives way.
const fill = stylex.keyframes({
  "0%": {
    clipPath: "inset(0 50% 100% 50% round 28px)",
    backgroundColor: "transparent",
    boxShadow: "none",
  },
  "49%": { clipPath: "inset(0 50% 100% 50% round 28px)" },
  "49.09%": {
    clipPath: "inset(0 17% calc(100% - max(44px, 32%)) 17% round 28px)",
    animationTimingFunction: SPILL,
  },
  "99.9%": { clipPath: "inset(0 round 28px)", backgroundColor: "transparent", boxShadow: "none" },
});
const drain = stylex.keyframes({
  "0%": {
    clipPath: "inset(0 round 28px)",
    animationTimingFunction: "cubic-bezier(0.5, 0, 0.3, 1)",
  },
  "38%": { clipPath: "inset(0 calc(50% - 22px) calc(100% - 44px) calc(50% - 22px) round 22px)" },
  "100%": { clipPath: "inset(0 calc(50% - 22px) calc(100% - 44px) calc(50% - 22px) round 22px)" },
});

// How far a level slides as the palette moves between levels.
const SLIDE = "30%";

// The list's own vertical padding, added to its level's height. Kept in step with styles.list.
const LIST_PADDING = 12;

const shiftIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateX(var(--shift))", filter: "blur(2px)" },
});
const shiftOut = stylex.keyframes({
  to: { opacity: 0, transform: "translateX(var(--shift))", filter: "blur(2px)" },
});

// The palette wears the header island: one black capsule (white over the dark theme) with the
// island's own text tokens, hairlines and pill highlights.
const styles = stylex.create({
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: `color-mix(in srgb, ${palette["--bg"]} 72%, transparent)`,
    backdropFilter: "blur(6px)",
    zIndex: 100,
    opacity: { default: null, [STARTING]: 0, [LEAVING]: 0 },
    transition: {
      default: `opacity ${motion["--t-slow"]} ${motion["--slow"]}`,
      [LEAVING]: `opacity ${motion["--t-slow-exit"]} ${motion["--exit"]}`,
    },
  },
  // Base UI unmounts the palette once the stage's own transitions end, so a pour out holds the
  // stage until the drop is back in the island.
  stage: {
    position: "fixed",
    inset: 0,
    zIndex: 102,
    pointerEvents: "none",
    outline: "none",
    opacity: { default: null, [STARTING]: { default: null, [REDUCE]: 0 }, [LEAVING]: 0 },
    transition: {
      default: null,
      ":not([data-ending-style])": {
        default: null,
        [REDUCE]: `opacity ${motion["--t-slow"]} ${motion["--slow"]}`,
      },
      [LEAVING]: {
        default: `opacity 1ms linear ${T_OUT}`,
        [REDUCE]: `opacity ${motion["--t-slow-exit"]} ${motion["--exit"]}`,
      },
    },
  },
  drop: {
    position: "absolute",
    inset: 0,
    backgroundColor: { default: ISLAND, [DARK]: ISLAND_DARK },
    opacity: 0,
    display: { default: null, [REDUCE]: "none" },
    animationName: { default: null, [POURING_IN]: pourIn, [POURING_OUT]: pourOut },
    animationDuration: { default: null, [POURING_IN]: T_IN, [POURING_OUT]: T_OUT },
    animationFillMode: "both",
  },
  // Positions the palette and carries its shadow, which fades in once the pour has filled it.
  panel: {
    position: "absolute",
    top: "16dvh",
    left: "50%",
    width: "min(560px, calc(100vw - 24px))",
    translate: "-50% 0",
    pointerEvents: "auto",
    "::before": {
      content: "''",
      position: "absolute",
      inset: 0,
      borderRadius: "28px",
      boxShadow: {
        default: "0 24px 60px -20px rgb(0 0 0 / 0.6)",
        [DARK]: "0 24px 60px -20px rgb(0 0 0 / 0.7)",
      },
      opacity: { default: null, [IN_STARTING]: 0, [POURING_OUT]: 0 },
      transition: {
        default: null,
        [POURING_IN]: { default: `opacity ${FAST_IN} ${SHADOW_IN}`, [REDUCE]: null },
        [POURING_OUT]: `opacity ${FAST_OUT}`,
      },
    },
  },
  surface: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "28px",
    boxShadow: {
      default: "inset 0 0 0 1px rgb(255 255 255 / 0.08)",
      [DARK]: "inset 0 0 0 1px rgb(0 0 0 / 0.06)",
      [POURING_OUT]: { default: "none", [REDUCE]: null },
    },
    animationName: {
      default: null,
      [POURING_IN]: { default: fill, [REDUCE]: null },
      [POURING_OUT]: { default: drain, [REDUCE]: null },
    },
    animationDuration: { default: null, [POURING_IN]: T_IN, [POURING_OUT]: T_OUT },
    animationFillMode: { default: null, [POURING_OUT]: "both" },
    // Clear for the whole pour out, where the drop is the ground from the first frame.
    backgroundColor: {
      default: ISLAND,
      [DARK]: ISLAND_DARK,
      [POURING_OUT]: { default: "transparent", [REDUCE]: null },
    },
    "--text": { default: "#fff", [DARK]: "#0a0a0c" },
    "--dim": { default: "rgb(255 255 255 / 0.66)", [DARK]: "rgb(10 10 12 / 0.68)" },
    "--mute": { default: "rgb(255 255 255 / 0.46)", [DARK]: "rgb(10 10 12 / 0.5)" },
    "--hair": { default: "rgb(255 255 255 / 0.12)", [DARK]: "rgb(10 10 12 / 0.1)" },
    "--panel-2": { default: "rgb(255 255 255 / 0.1)", [DARK]: "rgb(10 10 12 / 0.07)" },
    "--focus": {
      default: palette["--go"],
      [DARK]: `color-mix(in oklab, ${palette["--go"]} 45%, #000)`,
    },
    color: palette["--dim"],
    font: `400 14px/1.4 ${fonts["--sans"]}`,
  },
  // The content resolves out of a light blur as the surface nears full size, and goes first on the
  // way back, so the clip never slices through text.
  body: {
    opacity: { default: null, [IN_STARTING]: 0, [POURING_OUT]: 0 },
    filter: {
      default: null,
      [IN_STARTING]: { default: "blur(4px)", [REDUCE]: null },
      [POURING_OUT]: { default: "blur(4px)", [REDUCE]: null },
    },
    transition: {
      default: null,
      [POURING_IN]: {
        default: `opacity ${FAST_IN} ${CONTENT_IN}, filter ${FAST_IN} ${CONTENT_IN}`,
        [REDUCE]: null,
      },
      [POURING_OUT]: `opacity ${FAST_OUT}, filter ${FAST_OUT}`,
    },
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
    color: palette["--dim"],
    font: `500 11px ${fonts["--display"]}`,
  },
  lastKey: {
    marginRight: "4px",
  },
  // Grows the crumb row open (and shut) so the panel eases taller instead of jumping a row.
  crumbFold: {
    display: "grid",
    gridTemplateRows: "0fr",
    opacity: 0,
    transition: {
      default: `grid-template-rows ${motion["--t-moderate-exit"]} ${motion["--exit"]}, opacity ${FAST_OUT}`,
      [REDUCE]: `opacity ${FAST_OUT}`,
    },
  },
  crumbOpen: {
    gridTemplateRows: "1fr",
    opacity: 1,
    transition: {
      default: `grid-template-rows ${motion["--t-moderate"]} ${motion["--moderate"]}, opacity ${FAST_IN}`,
      [REDUCE]: `opacity ${FAST_IN}`,
    },
  },
  crumbClip: {
    minHeight: 0,
    overflow: "hidden",
  },
  // Levels push sideways like pages: a submenu comes in from the right as the list it replaces
  // leaves to the left, and going back runs the other way. A light blur blends the two mid-pass.
  level: {
    animationName: shiftIn,
    animationDuration: motion["--t-moderate"],
    animationTimingFunction: motion["--moderate"],
    animationFillMode: "backwards",
  },
  fromRight: {
    "--shift": { default: SLIDE, [REDUCE]: "0px" },
  },
  fromLeft: {
    "--shift": { default: `-${SLIDE}`, [REDUCE]: "0px" },
  },
  toLeft: {
    "--shift": { default: `-${SLIDE}`, [REDUCE]: "0px" },
    animationName: shiftOut,
    animationDuration: motion["--t-moderate-exit"],
    animationTimingFunction: motion["--exit"],
    animationFillMode: "forwards",
  },
  toRight: {
    "--shift": { default: SLIDE, [REDUCE]: "0px" },
    animationName: shiftOut,
    animationDuration: motion["--t-moderate-exit"],
    animationTimingFunction: motion["--exit"],
    animationFillMode: "forwards",
  },
  // Holds the leaving level, clipped to the list so it never adds scroll.
  ghosts: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  crumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    // The fold clips this row, so the Back pill's hover fill takes real room rather than spilling
    // past the row on negative margins.
    padding: "8px 20px 0",
    font: `500 12px ${fonts["--display"]}`,
  },
  crumbBack: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginInline: "-10px",
    padding: "4px 10px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "999px",
    // `background: none` minifies to a 0 0 position at rest, and the hover's background shorthand
    // resets it to 0% 0%. StyleX would minify a literal 0% 0% back to 0 0, so hover sets initial.
    backgroundPosition: {
      default: "0 0",
      ":hover": { default: null, [HOVER]: "initial" },
      ":active": "initial",
    },
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [HOVER]: palette["--panel-2"] },
      ":active": palette["--panel-2"],
    },
    color: {
      default: palette["--dim"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
    font: "inherit",
    cursor: cursors["--cursor-point"],
    outline: {
      default: null,
      ":focus-visible": `2px solid ${palette["--focus"]}`,
    },
    outlineOffset: { default: null, ":focus-visible": "-2px" },
    transitionProperty: "background-color, color",
    transitionDuration: {
      default: motion["--t-fast-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-fast"] },
      ":active": motion["--t-fast"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--fast"] },
      ":active": motion["--fast"],
    },
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
    height: "56px",
    padding: "0 20px",
    borderBottomWidth: "1px",
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
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    font: { default: `500 15px ${fonts["--display"]}`, [TOUCH]: `500 16px ${fonts["--display"]}` },
    "::placeholder": {
      color: palette["--mute"],
    },
  },
  // Holds the list and its scrollbar, which sits over the list's edge without scrolling with it.
  listFrame: {
    position: "relative",
  },
  list: {
    position: "relative",
    maxHeight: "min(340px, 50dvh)",
    overflowX: "hidden",
    transition: {
      default: null,
      ":has(> [data-shifting])": {
        default: `height ${motion["--t-moderate"]} ${motion["--moderate"]}`,
        [REDUCE]: null,
      },
    },
    overflowY: "auto",
    overscrollBehavior: "contain",
    padding: "4px 8px 8px",
    scrollPadding: "8px",
  },
  laterGroup: {
    marginTop: "4px",
  },
  label: {
    padding: "10px 16px 6px",
    font: `700 11px ${fonts["--display"]}`,
    color: HUE_INK,
  },
  highlight: {
    "--w": "100%",
    borderRadius: "999px",
    backgroundColor: palette["--panel-2"],
  },
  // A pill as tall as its icon plus 8px a side, so the highlight's ends run concentric with it.
  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 18px 8px 8px",
    borderRadius: "999px",
    color: palette["--mute"],
    cursor: cursors["--cursor-point"],
    transition: `color ${FAST_OUT}`,
  },
  itemSelected: {
    color: palette["--dim"],
    transition: `color ${FAST_IN}`,
  },
  icon: {
    flex: "none",
    display: "grid",
    placeItems: "center",
    width: "32px",
    height: "32px",
    borderRadius: "999px",
    backgroundColor: palette["--panel-2"],
    color: palette["--dim"],
    transition: `background-color ${FAST_OUT}, color ${FAST_OUT}`,
  },
  iconSelected: {
    backgroundColor: "var(--c)",
    color: "var(--on-c)",
    transition: `background-color ${FAST_IN}, color ${FAST_IN}`,
  },
  // Envelope and check share the icon's cell and cross-fade: the arriving glyph on the fast tier,
  // the leaving one on its quicker exit.
  glyph: {
    gridArea: "1 / 1",
    display: "grid",
    transitionProperty: "opacity, transform, filter",
    transitionDuration: motion["--t-fast"],
    transitionTimingFunction: "ease-out",
  },
  glyphOff: {
    opacity: 0,
    transform: { default: "scale(0.6)", [REDUCE]: "none" },
    filter: "blur(4px)",
    transitionDuration: motion["--t-fast-exit"],
    transitionTimingFunction: "ease-in",
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
    font: `600 13px ${fonts["--display"]}`,
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
    color: HUE_INK,
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
    padding: "10px 20px 12px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
    font: `500 11px ${fonts["--display"]}`,
    color: palette["--mute"],
  },
  hint: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
});
