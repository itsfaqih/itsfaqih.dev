import { expect, it } from "vite-plus/test";
import {
  FIXES,
  LESSONS,
  type Load,
  QUERY,
  SKELETON,
  searches,
  shownAt,
  shownSearch,
  skeletonChoice,
  skeletonSays,
} from "./data-loading";

// The playhead's path across quiz 4's track, and the marker's spots along it.
const STEPS = Array.from({ length: 101 }, (_, i) => i / 100);
const showsSkeleton = (load: Load, at: number) =>
  STEPS.some((t) => shownAt(load, at, t) === "skeleton");

// What each zone's note promises the preview plays.
const PLAYS = {
  early: { fastFlashes: true, slowBlankUntilLate: false },
  wait: { fastFlashes: false, slowBlankUntilLate: false },
  late: { fastFlashes: false, slowBlankUntilLate: true },
};

it.each(STEPS)("a skeleton set at %s plays what its zone's note says", (at) => {
  expect({
    fastFlashes: showsSkeleton("fast", at),
    slowBlankUntilLate: STEPS.filter((t) => t < SKELETON.late).every(
      (t) => shownAt("slow", at, t) === "typed",
    ),
  }).toEqual(PLAYS[skeletonChoice(at)]);
  expect(shownAt("fast", at, 1)).toBe("data");
  expect(shownAt("slow", at, 1)).toBe("data");
  expect(skeletonSays("fast", at).startsWith("No skeleton")).toBe(!showsSkeleton("fast", at));
  expect(skeletonSays("slow", at).startsWith("No skeleton")).toBe(!showsSkeleton("slow", at));
});

it("offers one choice per zone, and waits for the answer", () => {
  const level = LESSONS.flatMap((lesson) => lesson.levels).find((l) => l.name === "As you type");
  expect(level && "choices" in level && level.choices.map((choice) => choice.id)).toEqual(
    Object.keys(PLAYS),
  );
  expect(level?.answer).toBe("wait");
});

// What quiz 5's box shows after typing lamp, for each fix: a request per letter, and stale results.
it.each([
  ["none", FIXES.none, { floods: true, stale: true }],
  ["pause", FIXES.pause, { floods: false, stale: true }],
  ["cancel", FIXES.cancel, { floods: true, stale: false }],
  ["both", FIXES.both, { floods: false, stale: false }],
] as const)("the box with fix %s leaves what quiz 5 says", (_, fix, leaves) => {
  expect({
    floods: searches(fix).length === QUERY.length,
    stale: shownSearch(fix)?.q !== QUERY,
  }).toEqual(leaves);
});

it("offers each fix, and waits for the one that fixes both", () => {
  const level = LESSONS.flatMap((lesson) => lesson.levels).find((l) => l.name === "Typing lamp");
  expect(level && "choices" in level && level.choices.map((choice) => choice.id)).toEqual(
    Object.keys(FIXES).filter((id) => id !== "none"),
  );
  expect(level?.answer).toBe("both");
});
