import { cx } from "@/stylex";
import { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "../../../cn";

type TableOfContentsProps = {
  className?: string;
  onLinkClick?: () => void;
};

type Heading = {
  id: string;
  text: string;
  level: number;
};

const EMPTY_HEADINGS: Heading[] = [];
let cachedHeadings = EMPTY_HEADINGS;
let cachedDocument: Document | undefined;
let cachedElements: Element[] = [];
let cachedSignature = "";

function getHeadingsSnapshot(): Heading[] {
  if (typeof document === "undefined") return EMPTY_HEADINGS;

  const elements: Element[] = [];
  const nextHeadings: Heading[] = [];
  let signature = "";

  for (const element of document.querySelectorAll("h2, h3")) {
    if (!element.id) continue;

    const text = element.textContent ?? "";
    const level = Number(element.tagName.substring(1));
    elements.push(element);
    nextHeadings.push({ id: element.id, text, level });
    signature += `${element.id}\u0000${text}\u0000${level}\u0000`;
  }

  const hasSameElements =
    elements.length === cachedElements.length &&
    elements.every((element, index) => element === cachedElements[index]);

  if (document === cachedDocument && signature === cachedSignature && hasSameElements) {
    return cachedHeadings;
  }

  cachedDocument = document;
  cachedElements = elements;
  cachedSignature = signature;
  cachedHeadings = nextHeadings;
  return cachedHeadings;
}

function getServerHeadingsSnapshot() {
  return EMPTY_HEADINGS;
}

function subscribeToHeadings(onStoreChange: () => void) {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
    return () => {};
  }

  const root = document.documentElement;
  if (!root) return () => {};

  const observer = new MutationObserver(onStoreChange);
  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return () => observer.disconnect();
}

function observeHeadings(headings: Heading[], onActiveIdChange: (id: string) => void) {
  const elements: Element[] = [];
  for (const heading of headings) {
    const element = document.getElementById(heading.id);
    if (element) elements.push(element);
  }

  if (elements.length === 0) return;

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

  for (const element of elements) {
    observer.observe(element);
  }

  return () => {
    for (const element of elements) {
      observer.unobserve(element);
    }
    observer.disconnect();
  };
}

export function TableOfContents({ className, onLinkClick }: TableOfContentsProps) {
  const headings = useSyncExternalStore(
    subscribeToHeadings,
    getHeadingsSnapshot,
    getServerHeadingsSnapshot,
  );
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const cleanup = observeHeadings(headings, setActiveId);
    return () => {
      cleanup?.();
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className={cn("space-y-2", className)}>
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
              className={cn(
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
