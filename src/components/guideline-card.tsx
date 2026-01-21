import { Link } from "@tanstack/react-router";
import { CaretRightIcon } from "@phosphor-icons/react";
import { CSSProperties } from "react";
import { ButtonDesignThumbnail } from "./thumbnails/button-design-thumbnail";
import { DialogDesignThumbnail } from "./thumbnails/dialog-design-thumbnail";
import { TableDesignThumbnail } from "./thumbnails/table-design-thumbnail";
import { TypeScriptGuidelinesThumbnail } from "./thumbnails/typescript-guidelines-thumbnail";
import { ProximityPrincipleThumbnail } from "./thumbnails/proximity-principle-thumbnail";
import { DataLoadingThumbnail } from "./thumbnails/data-loading-thumbnail";
import { HandlingTimestampsThumbnail } from "./thumbnails/handling-timestamps-thumbnail";
import { NullVsUndefinedThumbnail } from "./thumbnails/null-vs-undefined-thumbnail";

export interface Guideline {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
}

interface GuidelineCardProps {
  guideline: Guideline;
  style?: CSSProperties;
}

function renderThumbnail(guidelineId: string) {
  switch (guidelineId) {
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-2xl bg-(--bg-primary)/50 border border-(--border-color)/50 flex items-center justify-center backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-(--text-secondary)/20 to-transparent border border-(--border-color)" />
          </div>
        </div>
      );
  }
}

export function GuidelineCard({ guideline, style }: GuidelineCardProps) {
  return (
    <Link
      to={guideline.href}
      className="group block"
      style={{
        width: "288px", // Fixed width - w-72 = 18rem = 288px
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Card */}
      <div className="relative h-48 rounded-xl squircle overflow-hidden bg-linear-to-br from-(--bg-secondary) to-(--bg-primary) border border-(--border-color) transition-all duration-300 group-hover:border-(--text-secondary)/30 group-hover:-translate-y-1">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-white/3 to-transparent pointer-events-none" />

        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--border-color) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Thumbnail area - custom or default */}
        {renderThumbnail(guideline.id)}
      </div>
      {/* Text content below card - constrained to card width */}
      <div className="mt-4 space-y-1 w-full overflow-hidden">
        <span className="text-xs text-(--text-secondary) uppercase tracking-wide block truncate">
          {guideline.label}
        </span>
        <h3 className="font-medium text-(--text-primary) group-hover:text-(--accent-color) transition-colors flex items-center gap-1.5">
          <span className="truncate">{guideline.title}</span>
          <CaretRightIcon
            size={14}
            className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0"
          />
        </h3>
        <p className="text-sm text-(--text-secondary) line-clamp-2">{guideline.description}</p>
      </div>
    </Link>
  );
}
