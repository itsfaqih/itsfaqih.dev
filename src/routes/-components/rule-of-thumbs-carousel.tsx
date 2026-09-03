import { cx } from "@/stylex";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { RuleOfThumbCard } from "../../components/rule-of-thumb-card";
import { GUIDELINES } from "../../data/guidelines";
import { Link } from "@tanstack/react-router";

const getWrappedIndex = (index: number, count: number): number =>
  ((index % count) + count) % count;

const ORBIT_SLOT_ANGLE = (28 * Math.PI) / 180;
const ORBIT_CURVE_RADIUS = 128;

export function RuleOfThumbsCarousel() {
  const visibleGuidelines = GUIDELINES.filter((g) => !g.hidden);
  const slideCount = visibleGuidelines.length;
  const measurementGuidelines =
    slideCount === 0
      ? []
      : Array.from(
          { length: slideCount * 3 },
          (_, index) => visibleGuidelines[index % slideCount]!,
        );
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    duration: 16,
    loop: slideCount > 1,
    startIndex: slideCount,
  });
  const CARD_WIDTH = 288;
  const CARD_GAP = 32;
  const DEFAULT_SLOT_DISTANCE = CARD_WIDTH + CARD_GAP;
  const [motionPosition, setMotionPosition] = useState(0);
  const motionPositionRef = useRef(0);
  const lastLocationRef = useRef<number | null>(null);
  const slotDistanceRef = useRef(DEFAULT_SLOT_DISTANCE);
  const [slotDistance, setSlotDistance] = useState(DEFAULT_SLOT_DISTANCE);
  const VISIBLE_RANGE = 1;
  const VISUAL_BUFFER = 2;
  useEffect(() => {
    if (!emblaApi) return;

    const syncMetrics = () => {
      const engine = emblaApi.internalEngine();
      const snapDistances = engine.scrollSnaps
        .slice(1)
        .map((snap, index) => Math.abs(snap - engine.scrollSnaps[index]!))
        .filter((distance) => distance > 0.5);
      const nextSlotDistance = snapDistances[0] ?? DEFAULT_SLOT_DISTANCE;

      slotDistanceRef.current = nextSlotDistance;
      setSlotDistance(nextSlotDistance);
      lastLocationRef.current = engine.location.get();
    };

    const syncScroll = () => {
      const engine = emblaApi.internalEngine();
      const currentLocation = engine.location.get();
      const previousLocation = lastLocationRef.current;

      lastLocationRef.current = currentLocation;

      if (previousLocation === null || slotDistanceRef.current === 0) return;

      let delta = -(currentLocation - previousLocation) / slotDistanceRef.current;
      const snapCount = engine.scrollSnaps.length;

      // Embla repositions its repeated measurement track at loop boundaries.
      // Normalize that physical jump back to the single logical slot traveled.
      if (snapCount > 1) {
        while (delta > snapCount / 2) delta -= snapCount;
        while (delta < -snapCount / 2) delta += snapCount;
      }

      if (Math.abs(delta) < 0.0001) return;

      motionPositionRef.current += delta;
      setMotionPosition(motionPositionRef.current);
    };

    const syncSettled = () => {
      motionPositionRef.current = Math.round(motionPositionRef.current);
      setMotionPosition(motionPositionRef.current);
      lastLocationRef.current = emblaApi.internalEngine().location.get();
    };

    syncMetrics();
    emblaApi.on("scroll", syncScroll);
    emblaApi.on("select", syncScroll);
    emblaApi.on("settle", syncSettled);
    emblaApi.on("reInit", syncMetrics);

    return () => {
      emblaApi.off("scroll", syncScroll);
      emblaApi.off("select", syncScroll);
      emblaApi.off("settle", syncSettled);
      emblaApi.off("reInit", syncMetrics);
    };
  }, [DEFAULT_SLOT_DISTANCE, emblaApi]);

  const getSlideStyles = (distance: number): CSSProperties => {
    const absoluteDistance = Math.abs(distance);
    const angle = distance * ORBIT_SLOT_ANGLE;
    const orbitRadius = slotDistance / Math.sin(ORBIT_SLOT_ANGLE);
    const translateX = Math.sin(angle) * orbitRadius;
    const translateZ = (Math.cos(angle) - 1) * orbitRadius;
    const translateY = (1 - Math.cos(angle)) * ORBIT_CURVE_RADIUS;
    const rotateY = (angle * 180) / Math.PI;
    const isVisible = absoluteDistance <= VISIBLE_RANGE;
    const opacity =
      isVisible
        ? Math.max(0.4, 1 - absoluteDistance * 0.25)
        : Math.max(0, 1 - (absoluteDistance - VISIBLE_RANGE) / (VISUAL_BUFFER - VISIBLE_RANGE)) * 0.75;

    return {
      transform: `
        translateX(${translateX}px)
        translateZ(${translateZ}px)
        translateY(${translateY}px)
        rotateY(${rotateY}deg)
      `,
      opacity,
      visibility: absoluteDistance <= VISUAL_BUFFER ? "visible" : "hidden",
      zIndex: isVisible ? Math.round(10 - absoluteDistance) : 0,
      pointerEvents: isVisible ? "auto" : "none",
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
    };
  };

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

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

      {/* Embla carousel */}
      <div
        className={cx("relative w-full overflow-hidden rule-of-thumbs-carousel-viewport")}
        ref={emblaRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Rule of Thumb"
        style={{
          height: "340px", // Fixed height for the carousel area
          perspective: "1200px",
          perspectiveOrigin: "center center",
        }}
      >
        <div className={cx("rule-of-thumbs-carousel-container")} aria-hidden="true">
          {measurementGuidelines.map((guideline, index) => (
            <div
              key={`${guideline.id}-measure-${index}`}
              className={cx("rule-of-thumbs-carousel-measure-slide")}
            />
          ))}
        </div>

        <div
          className={cx("rule-of-thumbs-carousel-3d-layer")}
          style={{ transformStyle: "preserve-3d" }}
        >
          {slideCount > 0 &&
            Array.from({ length: VISUAL_BUFFER * 2 + 1 }, (_, offsetIndex) => {
              const renderAnchor = Math.trunc(motionPosition);
              const logicalIndex = renderAnchor + offsetIndex - VISUAL_BUFFER;
              const distance = logicalIndex - motionPosition;
              const guideline =
                visibleGuidelines[getWrappedIndex(logicalIndex, slideCount)]!;

              return (
                <div
                  key={`${guideline.id}-${logicalIndex}`}
                  className={cx("rule-of-thumbs-carousel-3d-slide")}
                  style={getSlideStyles(distance)}
                >
                  <RuleOfThumbCard
                    ruleOfThumb={guideline}
                    style={{ width: "100%" }}
                    preload="viewport"
                  />
                </div>
              );
            })}
        </div>

        {/* Left fade gradient */}
        <div
          className={cx("absolute inset-y-0 left-0 pointer-events-none z-10 rule-of-thumbs-carousel-fade")}
          style={{
            width: "32px",
            background: "linear-gradient(to right, var(--background), transparent)",
          }}
        />

        {/* Right fade gradient */}
        <div
          className={cx("absolute inset-y-0 right-0 pointer-events-none z-10 rule-of-thumbs-carousel-fade")}
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
            type="button"
            onClick={scrollPrev}
            className={cx("rule-of-thumbs-carousel-control")}
            aria-label="Scroll left"
          >
            <CaretLeftIcon size={20} className={cx("text-foreground")} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className={cx("rule-of-thumbs-carousel-control")}
            aria-label="Scroll right"
          >
            <CaretRightIcon size={20} className={cx("text-foreground")} />
          </button>
        </div>
      )}
    </section>
  );
}
