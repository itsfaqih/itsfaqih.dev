import { cx } from "@/stylex";
import { Link } from "@tanstack/react-router";
import { CaretRightIcon } from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import { ButtonDesignThumbnail } from "./thumbnails/button-design-thumbnail";
import { DialogDesignThumbnail } from "./thumbnails/dialog-design-thumbnail";
import { TableDesignThumbnail } from "./thumbnails/table-design-thumbnail";
import { TypeScriptGuidelinesThumbnail } from "./thumbnails/typescript-guidelines-thumbnail";
import { ProximityPrincipleThumbnail } from "./thumbnails/proximity-principle-thumbnail";
import { DataLoadingThumbnail } from "./thumbnails/data-loading-thumbnail";
import { HandlingTimestampsThumbnail } from "./thumbnails/handling-timestamps-thumbnail";
import { NullVsUndefinedThumbnail } from "./thumbnails/null-vs-undefined-thumbnail";

export type RuleOfThumb = {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  comingSoon?: boolean;
};

type RuleOfThumbCardProps = {
  ruleOfThumb: RuleOfThumb;
  style?: CSSProperties;
};

function renderThumbnail(ruleOfThumbId: string) {
  switch (ruleOfThumbId) {
    case "button-design":
      return <ButtonDesignThumbnail />;
    case "dialog-design":
      return <DialogDesignThumbnail />;
    case "table-design":
      return <TableDesignThumbnail />;
    case "typescript-code-writing":
      return <TypeScriptGuidelinesThumbnail />;
    case "proximity-principle":
      return <ProximityPrincipleThumbnail />;
    case "data-loading":
      return <DataLoadingThumbnail />;
    case "handling-timestamps":
      return <HandlingTimestampsThumbnail />;
    case "null-vs-undefined":
      return <NullVsUndefinedThumbnail />;

    default:
      return (
        <div className={cx("absolute inset-0 flex items-center justify-center")}>
          <div className={cx("size-24 rounded-2xl bg-background/50 border border-border/50 flex items-center justify-center backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3")}>
            <div className={cx("size-10 rounded-lg bg-linear-to-br from-muted-foreground/20 to-transparent border border-border")} />
          </div>
        </div>
      );
  }
}

export function RuleOfThumbCard({ ruleOfThumb, style }: RuleOfThumbCardProps) {
  const cardContent = (
    <>
      {/* Card */}
      <div
        className={cx(`relative h-48 rounded-xl squircle overflow-hidden bg-linear-to-br from-card to-background border border-border transition-all duration-300 ${!ruleOfThumb.comingSoon ? "group-hover:border-muted-foreground/30 group-hover:-translate-y-1" : "opacity-60"}`)}
      >
        {/* Decorative gradient overlay */}
        <div className={cx("absolute inset-0 bg-linear-to-br from-white/3 to-transparent pointer-events-none")} />

        {/* Subtle pattern */}
        <div
          className={cx("absolute inset-0 opacity-20")}
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Thumbnail area - custom or default */}
        {renderThumbnail(ruleOfThumb.id)}

        {/* Coming Soon Badge */}
        {ruleOfThumb.comingSoon && (
          <div className={cx("absolute top-3 right-3 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border text-xs font-medium text-muted-foreground")}>
            Coming Soon
          </div>
        )}
      </div>
      {/* Text content below card - constrained to card width */}
      <div className={cx("mt-4 space-y-1 w-full overflow-hidden")}>
        <span className={cx("text-xs text-muted-foreground uppercase tracking-wide block truncate")}>
          {ruleOfThumb.label}
        </span>
        <h3
          className={cx(`font-medium transition-colors flex items-center gap-1.5 ${ruleOfThumb.comingSoon ? "text-muted-foreground" : "text-foreground group-hover:text-(--accent-color)"}`)}
        >
          <span className={cx("truncate")}>{ruleOfThumb.title}</span>
          {!ruleOfThumb.comingSoon && (
            <CaretRightIcon
              size={14}
              className={cx("opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0")}
            />
          )}
        </h3>
        <p className={cx("text-sm text-muted-foreground line-clamp-2")}>{ruleOfThumb.description}</p>
      </div>
    </>
  );

  if (ruleOfThumb.comingSoon) {
    return (
      <div
        className={cx("block")}
        style={{
          width: "288px", // Fixed width - w-72 = 18rem = 288px
          flexShrink: 0,
          ...style,
        }}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      to={ruleOfThumb.href}
      className={cx("group block")}
      style={{
        width: "288px", // Fixed width - w-72 = 18rem = 288px
        flexShrink: 0,
        ...style,
      }}
    >
      {cardContent}
    </Link>
  );
}
