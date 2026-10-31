import * as stylex from "@stylexjs/stylex";
import { palette, transitions } from "../../../theme.stylex";
import { useEffect, useState, useSyncExternalStore } from "react";

type TableOfContentsProps = {
  onLinkClick?: () => void;
};

type Heading = {
  id: string;
  text: string;
  level: number;
};

const EMPTY_HEADINGS: Heading[] = [];
let cachedHeadings = EMPTY_HEADINGS;
let cachedElements: Element[] = [];
let cachedSignature = "";

function getHeadingsSnapshot(): Heading[] {
  const elements: Element[] = [];
  const nextHeadings: Heading[] = [];
  let signature = "";

  for (const element of document.querySelectorAll("h2, h3")) {
    if (!element.id) continue;

    const text = element.textContent;
    const level = Number(element.tagName.substring(1));
    elements.push(element);
    nextHeadings.push({ id: element.id, text, level });
    signature += `${element.id}\u0000${text}\u0000${level}\u0000`;
  }

  const hasSameElements =
    elements.length === cachedElements.length &&
    elements.every((element, index) => element === cachedElements[index]);

  if (signature === cachedSignature && hasSameElements) {
    return cachedHeadings;
  }

  cachedElements = elements;
  cachedSignature = signature;
  cachedHeadings = nextHeadings;
  return cachedHeadings;
}

function getServerHeadingsSnapshot() {
  return EMPTY_HEADINGS;
}

function subscribeToHeadings(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return () => observer.disconnect();
}

function observeHeadings(headings: Heading[], onActiveIdChange: (id: string) => void) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          onActiveIdChange(entry.target.id);
        }
      }
    },
    { rootMargin: "-100px 0px -66%" },
  );

  for (const heading of headings) {
    const element = document.getElementById(heading.id);
    if (element) observer.observe(element);
  }

  return () => observer.disconnect();
}

export function TableOfContents({ onLinkClick }: TableOfContentsProps) {
  const headings = useSyncExternalStore(
    subscribeToHeadings,
    getHeadingsSnapshot,
    getServerHeadingsSnapshot,
  );
  const [activeId, setActiveId] = useState("");

  useEffect(() => observeHeadings(headings, setActiveId), [headings]);

  if (headings.length === 0) return null;

  return (
    <nav>
      <p {...stylex.props(styles.title)}>On this page</p>
      <ul {...stylex.props(styles.list, stylex.defaultMarker())}>
        {headings.map((heading) => (
          <li
            key={heading.id}
            {...stylex.props(styles.item)}
            style={{ paddingLeft: (heading.level - 2) * 12 }}
          >
            <a
              href={`#${heading.id}`}
              {...stylex.props(styles.link, activeId === heading.id ? styles.active : styles.idle)}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: "smooth",
                });
                setActiveId(heading.id);
                onLinkClick?.();
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const HOVER = "@media (hover: hover) and (pointer: fine)";

const styles = stylex.create({
  title: {
    marginBottom: "1rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
  },
  list: {
    fontSize: { default: "1rem", "@media (min-width: 64rem)": "0.875rem" },
    lineHeight: { default: 1.5, "@media (min-width: 64rem)": "1.25rem" },
  },
  // While any link is hovered, the other entries dim.
  item: {
    // -webkit-box with no -webkit-line-clamp, so it clamps nothing.
    display: "-webkit-box",
    overflow: "hidden",
    opacity: {
      default: null,
      ":hover": { default: null, [HOVER]: 1 },
      [stylex.when.ancestor(":has(a:hover)")]: {
        default: null,
        ":not(:hover)": { default: null, [HOVER]: 0.5 },
      },
    },
    transitionProperty: "opacity",
    transitionTimingFunction: transitions.ease,
    transitionDuration: {
      default: "0.25s",
      ":hover": { default: null, [HOVER]: "0s" },
    },
  },
  link: {
    display: "block",
    paddingBlock: { default: "0.75rem", "@media (min-width: 64rem)": "0.375rem" },
    transitionProperty: transitions.colors,
    transitionTimingFunction: transitions.ease,
    transitionDuration: {
      default: "1s",
      ":hover": { default: null, [HOVER]: "0s" },
    },
  },
  active: {
    fontWeight: 500,
  },
  idle: {
    color: {
      default: palette["--muted-foreground"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
  },
});
