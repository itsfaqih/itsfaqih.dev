import { useEffect, useState } from "react";
import { cn } from "../cn";

interface CodeBlockProps {
  code: string;
  lang?: string;
  className?: string;
}

export function CodeBlock({ code, lang = "tsx", className }: CodeBlockProps) {
  const [highlighted, setHighlighted] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    import("shiki").then(({ codeToHtml }) => {
      codeToHtml(code, {
        lang,
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
      }).then((html) => {
        if (mounted) {
          setHighlighted(html);
        }
      });
    });

    return () => {
      mounted = false;
    };
  }, [code, lang]);

  if (!highlighted) {
    return <div className={cn("text-sm font-mono whitespace-pre", className)}>{code}</div>;
  }

  return (
    <div
      className={cn(
        "text-sm leading-loose! [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:m-0! [&_code]:text-sm!",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}
