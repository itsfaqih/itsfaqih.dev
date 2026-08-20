import { cx } from "@/stylex";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { CSSProperties } from "react";
import { cn } from "../../cn";
import { RuleOfThumbCard } from "../../components/rule-of-thumb-card";
import { GUIDELINES } from "../../data/guidelines";
import { Link } from "@tanstack/react-router";

export function RuleOfThumbsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleGuidelines = GUIDELINES.filter((g) => !g.hidden);
  const slideCount = visibleGuidelines.length;

  // Card dimensions
  const CARD_WIDTH = 288; // w-72 = 18rem = 288px
  const CARD_GAP = 32; // Gap between cards
  const VISIBLE_RANGE = 2; // How many cards visible on each side

  const scrollPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const scrollNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  };

  // Calculate the offset from center (-2, -1, 0, 1, 2, etc.)
  const getDistanceFromCenter = (index: number): number => {
    let distance = index - currentIndex;

    // Handle loop wrapping - find shortest path
    if (distance > slideCount / 2) {
      distance -= slideCount;
    } else if (distance < -slideCount / 2) {
      distance += slideCount;
    }

    return distance;
  };

  // Calculate 3D transforms for each slide
  const getSlideStyles = (index: number): CSSProperties => {
    const distance = getDistanceFromCenter(index);

    // Only render slides within visible range
    if (Math.abs(distance) > VISIBLE_RANGE + 1) {
      return {
        opacity: 0,
        pointerEvents: "none",
        visibility: "hidden",
      };
    }

    // 3D curve parameters
    const rotateY = distance * 20; // Rotation angle
    const translateZ = -Math.abs(distance) * 80; // Push back based on distance
    const translateY = Math.pow(Math.abs(distance), 1.5) * 15; // Vertical curve
    const translateX = distance * (CARD_WIDTH + CARD_GAP); // Horizontal spacing

    // Opacity fades for edge cards
    const opacity = Math.max(0.4, 1 - Math.abs(distance) * 0.25);

    return {
      transform: `
          translateX(${translateX}px)
          translateZ(${translateZ}px)
          translateY(${translateY}px)
          rotateY(${rotateY}deg)
        `,
      opacity,
      zIndex: 10 - Math.abs(distance),
      transition: "all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
      pointerEvents: Math.abs(distance) > 1 ? "none" : "auto",
    };
  };

  return (
    <section className={cx("mb-12 scroll-mt-24")}>
      <div className={cx("flex items-center justify-between mb-4")}>
        <h2 className={cx("text-sm font-medium text-muted-foreground uppercase tracking-wide")}>
          Rule of Thumb
        </h2>
        <Link
          to="/rule-of-thumb"
          className={cx("text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group")}
        >
          View More
          <CaretRightIcon className={cx("translate-y-[0.5px] group-hover:translate-x-0.5 transition-transform")} />
        </Link>
      </div>

      {/* 3D Curved Carousel */}
      <div
        className={cx("relative w-full overflow-hidden")}
        style={{
          height: "340px", // Fixed height for the carousel area
        }}
      >
        {/* Perspective container - centers content and applies 3D */}
        <div
          className={cx("absolute inset-0 flex items-start justify-center pt-4")}
          style={{
            perspective: "1200px",
            perspectiveOrigin: "center center",
          }}
        >
          {/* Transform origin container */}
          <div
            className={cx("relative")}
            style={{
              transformStyle: "preserve-3d",
              width: `${CARD_WIDTH}px`, // Same as card width so center card aligns
            }}
          >
            {visibleGuidelines.map((guideline, i) => (
              <div
                key={guideline.id}
                className={cx("absolute top-0 left-0")}
                style={{
                  ...getSlideStyles(i),
                  transformStyle: "preserve-3d",
                  width: `${CARD_WIDTH}px`,
                }}
              >
                <RuleOfThumbCard ruleOfThumb={guideline} />
              </div>
            ))}
          </div>
        </div>

        {/* Left fade gradient */}
        <div
          className={cx("absolute inset-y-0 left-0 pointer-events-none z-10")}
          style={{
            width: "32px",
            background: "linear-gradient(to right, var(--background), transparent)",
          }}
        />

        {/* Right fade gradient */}
        <div
          className={cx("absolute inset-y-0 right-0 pointer-events-none z-10")}
          style={{
            width: "32px",
            background: "linear-gradient(to left, var(--background), transparent)",
          }}
        />
      </div>

      {/* Navigation Arrows - Centered below cards (hidden when less than 2 items) */}
      {slideCount >= 2 && (
        <div className={cx("flex items-center justify-center gap-2 mt-4")}>
          <button
            onClick={scrollPrev}
            className={cn(
              "size-9 rounded-full bg-card border border-border flex items-center justify-center transition-all duration-200",
              "opacity-100 hover:bg-border hover:scale-105 cursor-pointer",
            )}
            aria-label="Scroll left"
          >
            <CaretLeftIcon size={18} className={cx("text-foreground")} />
          </button>
          <button
            onClick={scrollNext}
            className={cn(
              "size-9 rounded-full bg-card border border-border flex items-center justify-center transition-all duration-200",
              "opacity-100 hover:bg-border hover:scale-105 cursor-pointer",
            )}
            aria-label="Scroll right"
          >
            <CaretRightIcon size={18} className={cx("text-foreground")} />
          </button>
        </div>
      )}
    </section>
  );
}
