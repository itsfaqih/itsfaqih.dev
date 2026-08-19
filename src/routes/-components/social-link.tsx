import { cx } from "@/stylex";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { getButtonClasses } from "../../components/button-styles";

type SocialLinkProps = {
  href: string;
  icon: PhosphorIcon;
  label: string;
  isExternal?: boolean;
};

export function SocialLink({ href, icon: Icon, label, isExternal = true }: SocialLinkProps) {
  const externalProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <a
      href={href}
      {...externalProps}
      className={getButtonClasses({
        variant: "secondary-neutral",
        className: "cursor-pointer",
        hasLeadingIcon: true,
      })}
    >
      <span className={cx("relative z-1 flex items-center gap-2")}>
        <Icon size={14} />
        {label}
      </span>
    </a>
  );
}
