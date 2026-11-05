import { expect, it } from "vite-plus/test";
import { LESSONS } from "./null-vs-undefined";

const choosing = LESSONS.flatMap((lesson) => lesson.levels).flatMap((level) =>
  "choices" in level ? [level] : [],
);

it.each(choosing.map((level) => [level.name, level] as const))(
  "%s offers its answer once, and every choice says why it is or isn't it",
  (_, level) => {
    const ids = level.choices.map((choice) => choice.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(level.answer);
    for (const choice of level.choices) expect(choice.note).toMatch(/\S/);
  },
);
