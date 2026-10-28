import { cx } from "@/stylex";
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
    <nav className={cx("space-y-2")}>
      <p className={cx("font-medium text-sm text-foreground mb-4")}>On this page</p>
      <ul className={cx("text-base lg:text-sm [&:has(a:hover)_li:not(:hover)]:opacity-50")}>
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: (heading.level - 2) * 12 }}
            className={cx("line-clamp-1 transition-opacity duration-250 hover:duration-0 hover:opacity-100")}
          >
            <a
              href={`#${heading.id}`}
              className={cx(
                "block py-3 lg:py-1.5 transition-colors duration-1000 hover:duration-0 hover:text-foreground",
                activeId === heading.id ? "text-foreground font-medium" : "text-muted-foreground",
              )}
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
