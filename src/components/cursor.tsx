import { CursorIcon } from "@phosphor-icons/react";
import { cx } from "@/stylex";

type CursorProps = {
  className?: string;
  size?: number;
};

/** A white fill with a black stroke keeps the cursor visible in light and dark modes. */
export function Cursor({ className, size = 18 }: CursorProps) {
  return (
    <CursorIcon
      className={cx("text-white stroke-black stroke-6 rotate-20", className)}
      weight="fill"
      size={size}
    />
  );
}
