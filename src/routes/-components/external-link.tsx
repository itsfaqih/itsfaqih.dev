import { cx } from "@/stylex";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

type ExternalLinkProps = {
  href: string;
  children: ReactNode;
};

export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx("inline-flex items-center gap-0.5 text-foreground hover:underline")}
    >
      {children}
      <ArrowUpRightIcon size={12} className={cx("opacity-60")} />
    </a>
  );
}
