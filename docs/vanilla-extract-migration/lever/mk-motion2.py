import os
sp = os.path.dirname(os.path.abspath(__file__))
s = open(sp + "/motion.mjs").read()

def rep(old, new):
    global s
    assert old in s, old
    s = s.replace(old, new, 1)

rep("""  const frames = [];
  for (const a of anims) a.pause();""", """  const frames = [];
  const vals = {};
  const SKIP = new Set(["offset", "computedOffset", "easing", "composite"]);
  const propsOf = (a) => [...new Set(a.effect.getKeyframes().flatMap((k) => Object.keys(k)))].filter((p) => !SKIP.has(p));
  for (const a of anims) a.pause();""")
rep("""    frames.push(targets.map(""", """    for (const a of anims) {
      const cs = getComputedStyle(a.effect.target, a.effect.pseudoElement ?? undefined);
      for (const p of propsOf(a)) {
        const css = p.startsWith("--") ? p : p.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        vals[`${pathOf(a.effect.target)}${a.effect.pseudoElement ?? ""}|${a.constructor.name}|${css}|${f}`] = clean(cs.getPropertyValue(css));
      }
    }
    frames.push(targets.map(""")
rep("return { list, frames, canvases };", "return { list, frames, canvases, vals };")
rep("""    if (a.canvases.join() !== b.canvases.join())""", """    const NUM = /-?\\d*\\.?\\d+(?:e-?\\d+)?/g;
    const close = (x, y) => {
      if (x === y) return true;
      if (x.replace(NUM, "#") !== y.replace(NUM, "#")) return false;
      const n = x.match(NUM) ?? [], m = y.match(NUM) ?? [];
      return n.length > 0 && n.every((q, i) => Math.abs(Number(q) - Number(m[i])) <= Math.max(0.06, Math.abs(Number(q)) * 0.002));
    };
    let valuesCompared = 0;
    for (const k of Object.keys(a.vals)) {
      if (!(k in b.vals)) continue;
      valuesCompared++;
      if (!close(a.vals[k], b.vals[k]) && out.filter((o) => o.type === "value").length < 40) out.push({ label, type: "value", k, base: a.vals[k].slice(0, 160), new: b.vals[k].slice(0, 160) });
    }
    out.valuesCompared = (out.valuesCompared ?? 0) + valuesCompared;
    if (a.canvases.join() !== b.canvases.join())""")
rep("""results.push({ label, anims, diffs: out });""", """results.push({ label, anims, values: out.valuesCompared ?? 0, diffs: out });""")
rep("""const SCENES = [""", """const QUIZZES = { "data-loading": 3, "handling-timestamps": 3, "button-design": 6, "dialog-design": 7, "proximity-principle": 1, "typescript-code-writing": 3, "table-design": 5, "null-vs-undefined": 1 };
const pickSlot = (q, k) => async (page) => {
  const quiz = page.locator("rule-quiz").nth(q);
  if (!(await quiz.count())) return;
  await quiz.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
  const id = await quiz.evaluate((el, n) => {
    const slots = [...el.querySelectorAll('[data-part="slot"]')].map((s) => s.dataset.slot);
    return n === "right" ? el.dataset.answer : slots.find((s) => s !== el.dataset.answer);
  }, k);
  if (id === undefined) return;
  const piece = quiz.locator('[data-part="piece"]');
  if (await piece.count()) await piece.first().click({ force: true, timeout: 1500 }).catch(() => {});
  await quiz.locator(`[data-part="slot"][data-slot="${id}"]`).first().click({ force: true, timeout: 1500 }).catch(() => {});
};
const quizSteps = (n) => {
  const out = [];
  for (let q = 0; q < n; q++) out.push(["act", pickSlot(q, "wrong")], ["tick", 250], ["act", pickSlot(q, "right")], ["tick", 250], ["tick", 900]);
  return out;
};
const keys = (...ks) => async (p) => { for (const x of ks) await p.keyboard.press(x); };
const typed = (t) => (p) => p.keyboard.type(t);
const back = (n) => keys(...Array(n).fill("Backspace"));
const paletteSteps = () => [["load"], ["act", keys("Control+k")], ["tick", 120], ["tick", 500], ["act", typed("r")], ["tick", 200], ["act", typed("ule")], ["tick", 300], ["act", keys("ArrowDown")], ["tick", 150], ["act", keys("ArrowDown", "ArrowUp")], ["tick", 150], ["act", back(4)], ["tick", 300], ["act", typed("zzzzqq")], ["tick", 300], ["act", back(6)], ["tick", 300], ["act", typed("mail")], ["tick", 300], ["act", keys("Enter")], ["tick", 200], ["tick", 900], ["act", keys("Escape")], ["tick", 400], ["act", keys("Control+k")], ["tick", 300], ["act", keys("Escape")], ["tick", 400]];
const SCENES = [""")
rep("""].filter((s) => !opt.only || s.name.includes(opt.only));""", """  ...Object.entries(QUIZZES).map(([route, n]) => ({ name: `quiz ${route}`, route: `/rule-of-thumb/${route}`, seen: true, steps: [["load"], ...quizSteps(n)] })),
  ...["/", "/blog", "/cv", "/rule-of-thumb/button-design"].map((route) => ({ name: `palette full ${route}`, route, seen: true, steps: paletteSteps() })),
].filter((s) => (!opt.only || s.name.includes(opt.only)) && !(opt.except ?? "").split(",").some((x) => x && s.name.includes(x)));""")
rep('colorScheme: j.theme, reducedMotion: "no-preference"', 'colorScheme: j.theme, reducedMotion: opt.motion ?? "no-preference"')
open(sp + "/motion2.mjs", "w").write(s)

head = open(sp + "/motion.mjs").read()
head = head[: head.index("const snap = () => {")]
head = head.replace("Compares motion on two built sites", "Compares the dot canvas on two built sites")
d = head + r'''const tile = () => [...document.querySelectorAll("canvas")].map((c) => {
  const g = c.getContext("2d");
  const { width: w, height: h } = c;
  if (!g || !w || !h) return { w, h, tiles: [], lit: 0, sum: 0 };
  const px = g.getImageData(0, 0, w, h).data;
  const T = 48;
  const tiles = [];
  let lit = 0, sum = 0;
  for (let y = 0; y < h; y += T) for (let x = 0; x < w; x += T) {
    let t = 0x811c9dc5;
    for (let yy = y; yy < Math.min(y + T, h); yy++) for (let xx = x; xx < Math.min(x + T, w); xx++) {
      const i = (yy * w + xx) * 4;
      for (let k = 0; k < 4; k++) t = Math.imul(t ^ px[i + k], 16777619);
      if (px[i + 3]) { lit++; sum += px[i + 3]; }
    }
    tiles.push(t);
  }
  return { w, h, tiles, lit, sum };
});
const STEPS = [["load"], ["tick", 16], ["tick", 45], ["tick", 90], ["tick", 150], ["tick", 200], ["tick", 400], ["tick", 700], ["tick", 1000], ["tick", 3000], ["tick", 5600], ["press"], ["tick", 60], ["tick", 140], ["release"], ["tick", 300], ["tick", 900], ["scroll"], ["tick", 200], ["tick", 700], ["tick", 3000]];
const main = async () => {
  const [bs, ns] = await Promise.all([serve(baseDir), serve(newDir)]);
  const browser = await chromium.launch();
  const out = [];
  for (const route of (opt.routes ?? "/,/cv,/rule-of-thumb/button-design,/blog/hello-world").split(",")) for (const width of WIDTHS) for (const theme of THEMES) {
    const open = async (url) => {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: "no-preference" });
      const page = await ctx.newPage();
      await page.clock.install({ time: new Date("2026-01-15T09:30:00Z") });
      await page.clock.pauseAt(new Date("2026-01-15T09:30:01Z"));
      await page.addInitScript(init, { theme, seen: true });
      await page.goto(url + route, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready.then(() => 1));
      await page.waitForTimeout(300);
      return { ctx, page };
    };
    const sides = await Promise.all([open(bs.url), open(bs.url), open(ns.url)]);
    let i = 0;
    for (const [kind, arg] of STEPS) {
      for (const { page } of sides) {
        if (kind === "tick") await page.clock.runFor(arg);
        if (kind === "press") { await page.mouse.move(width / 2, 450); await page.mouse.down(); }
        if (kind === "release") await page.mouse.up();
        if (kind === "scroll") await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "instant" }));
        if (kind !== "tick") await page.clock.runFor(16);
        await page.waitForTimeout(30);
      }
      const [a, c, n] = await Promise.all(sides.map(({ page }) => page.evaluate(tile)));
      const cmp = (x, y) => x.map((v, k) => ({ size: v.w === y[k]?.w && v.h === y[k]?.h, tiles: v.tiles.filter((t, j) => t !== y[k]?.tiles[j]).length, of: v.tiles.length, lit: v.lit, litOther: y[k]?.lit, sum: v.sum, sumOther: y[k]?.sum }));
      out.push({ route, width, theme, step: `${i}:${kind}${arg ?? ""}`, ctl: cmp(a, c), neu: cmp(a, n) });
      i++;
    }
    await Promise.all(sides.map(({ ctx }) => ctx.close()));
  }
  await browser.close();
  bs.s.close();
  ns.s.close();
  writeFileSync(outF, JSON.stringify(out));
  const bad = (k) => out.filter((r) => r[k].some((c) => c.tiles || !c.size)).length;
  console.log("steps", out.length, "control differs", bad("ctl"), "new differs", bad("neu"), "canvases", out[0]?.neu.length, "lit steps", out.filter((r) => r.neu.some((c) => c.lit)).length);
};
main();
'''
open(sp + "/dots.mjs", "w").write(d)
