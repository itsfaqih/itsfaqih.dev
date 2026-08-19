/**
 * Table Design Thumbnail
 * An animated blueprint showing table construction with looping draw effect.
 */
import { cx } from "@/stylex";
import { TableDesignGridLines } from "./table-design-grid-lines";
import { TableDesignIllustration } from "./table-design-illustration";

export function TableDesignThumbnail() {
  return (
    <div className={cx("absolute inset-0 flex items-center justify-center overflow-hidden")}>
      <svg viewBox="0 0 160 100" strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
        <TableDesignGridLines />
        <TableDesignIllustration />
      </svg>

      {/* Gradient fade overlays */}
      <div className={cx("pointer-events-none absolute inset-0")}>
        {/* Left fade */}
        <div className={cx("absolute left-0 top-0 bottom-0 w-1/4 bg-linear-to-r from-background to-transparent")} />
        {/* Right fade */}
        <div className={cx("absolute right-0 top-0 bottom-0 w-1/4 bg-linear-to-l from-background to-transparent")} />
        {/* Top fade */}
        <div className={cx("absolute top-0 left-0 right-0 h-1/4 bg-linear-to-b from-background to-transparent")} />
        {/* Bottom fade */}
        <div className={cx("absolute bottom-0 left-0 right-0 h-1/4 bg-linear-to-t from-background to-transparent")} />
      </div>
    </div>
  );
}
