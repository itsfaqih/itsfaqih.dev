import { expect, it } from "vite-plus/test";
import { arrived, DEMOS, LESSONS, TITLE, verdictOf, type Way } from "./null-vs-undefined";

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

const tags = (name: keyof typeof DEMOS, way: Way) => {
  const demo = DEMOS[name];
  const title = `${TITLE} edited`;
  const after = { ...demo.before, ...arrived(demo.body(way, title)) };
  return Object.fromEntries(
    demo.fields.map((field) => [field, verdictOf(field, demo.before, after, demo.intent(title))]),
  );
};

it("tags each save demo's fields with what became of them", () => {
  expect(tags("clear", "bad")).toEqual({ title: "kept", reviewer: "not cleared" });
  expect(tags("clear", "good")).toEqual({ title: "kept", reviewer: "saved" });
  expect(tags("rename", "bad")).toEqual({ title: "saved", assignee: "wiped", due: "wiped" });
  expect(tags("rename", "good")).toEqual({ title: "saved", assignee: "kept", due: "kept" });
});
