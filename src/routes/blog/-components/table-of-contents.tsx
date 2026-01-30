import { useEffect, useState } from "react";
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

export function TableOfContents({ className, onLinkClick }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("h2, h3"))
      .filter((element) => element.id)
      .map((element) => ({
        id: element.id,
        text: element.textContent || "",
        level: Number(element.tagName.substring(1)),
      }));

    setHeadings(elements);

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "-100px 0px -66%",
    });

    elements.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className={cn("space-y-2", className)}>
      <p className="font-medium text-sm text-foreground mb-4">On this page</p>
      <ul className="text-base lg:text-sm [&:has(a:hover)_li:not(:hover)]:opacity-50">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: (heading.level - 2) * 12 }}
            className="line-clamp-1 transition-opacity duration-250 hover:duration-0 hover:opacity-100"
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
