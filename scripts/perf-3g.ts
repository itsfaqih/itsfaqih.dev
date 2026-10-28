import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium, type Page } from "playwright";

const { values } = parseArgs({
  options: {
    base: { type: "string", default: "http://127.0.0.1:4317" },
    runs: { type: "string", default: "3" },
    cpu: { type: "string", default: "1" },
    out: { type: "string" },
    route: { type: "string", multiple: true },
  },
});

// DevTools' "3G" preset (formerly "Slow 3G"): 500 kbit/s * 0.8 each way, 400 ms * 5 latency.
await fetch(values.base).catch(() => {
  throw new Error(
    `Nothing serves ${values.base}. Start a production preview: vp run build && vp run preview --port 4317`,
  );
});

const profile = { throughput: ((500 * 1000) / 8) * 0.8, latency: 400 * 5 };

const rules = [
  "proximity-principle",
  "button-design",
  "data-loading",
  "null-vs-undefined",
  "typescript-code-writing",
  "table-design",
  "dialog-design",
  "handling-timestamps",
];
const routes = values.route ?? [
  "/",
  "/blog",
  "/blog/hello-world",
  "/rule-of-thumb",
  ...rules.map((rule) => `/rule-of-thumb/${rule}`),
];

declare global {
  interface Window {
    __lcp: { time: number; element: string }[];
    __hydrated?: number;
  }
}

type Request = {
  url: string;
  type?: string;
  priority?: string;
  start: number;
  response?: number;
  end?: number;
  bytes?: number;
  status?: number;
  failed?: string;
};

if (values.out) mkdirSync(values.out, { recursive: true });
async function waitForNetworkQuiet(
  page: Page,
  requests: Map<string, Request>,
  { quietMs, timeoutMs }: { quietMs: number; timeoutMs: number },
) {
  let quietSince = Date.now();
  for (const deadline = Date.now() + timeoutMs; Date.now() < deadline;) {
    await page.waitForTimeout(250);
    const inFlight = [...requests.values()].some((r) => r.end === undefined && !r.failed);
    if (inFlight) quietSince = Date.now();
    else if (Date.now() - quietSince > quietMs) return;
  }
}

const browser = await chromium.launch({ channel: "chrome" });
const results: Record<
  string,
  { load: number; lcp: number; hydrated: number; bytes: number; lcpElement: string }[]
> = {};

for (let run = 0; run < Number(values.runs); run++) {
  for (const route of routes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.__lcp = [];
      const poll = setInterval(() => {
        const bar = document.querySelector(".arc-bar");
        if (!bar || !Object.keys(bar).some((key) => key.startsWith("__reactFiber"))) return;
        window.__hydrated = performance.now();
        clearInterval(poll);
      }, 20);
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry instanceof LargestContentfulPaint)) continue;
          const element = entry.element;
          window.__lcp.push({
            time: entry.startTime,
            element: element
              ? `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).split(" ")[0]}` : ""} "${(element.textContent ?? "").trim().slice(0, 40)}"`
              : entry.url,
          });
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });

    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: profile.latency,
      downloadThroughput: profile.throughput,
      uploadThroughput: profile.throughput,
      connectionType: "cellular3g",
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(values.cpu) });

    const requests = new Map<string, Request>();
    let origin = 0;
    cdp.on("Network.requestWillBeSent", (event) => {
      if (!origin) origin = event.timestamp;
      requests.set(event.requestId, {
        url: event.request.url,
        type: event.type,
        priority: event.request.initialPriority,
        start: event.timestamp,
      });
    });
    cdp.on("Network.responseReceived", (event) => {
      const request = requests.get(event.requestId);
      if (!request) return;
      request.response = event.timestamp;
      request.status = event.response.status;
    });
    cdp.on("Network.loadingFinished", (event) => {
      const request = requests.get(event.requestId);
      if (!request) return;
      request.end = event.timestamp;
      request.bytes = event.encodedDataLength;
    });
    cdp.on("Network.loadingFailed", (event) => {
      const request = requests.get(event.requestId);
      if (request) request.failed = event.errorText;
    });

    await page.goto(new URL(route, values.base).href, { waitUntil: "load", timeout: 120_000 });
    await waitForNetworkQuiet(page, requests, { quietMs: 3000, timeoutMs: 30_000 });

    const { load, lcp, hydrated } = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType("navigation");
      const load = nav instanceof PerformanceNavigationTiming ? nav.loadEventEnd : NaN;
      return { load, lcp: window.__lcp.at(-1), hydrated: window.__hydrated ?? NaN };
    });
    const list = [...requests.values()];
    const bytes = list.reduce((sum, r) => sum + (r.bytes ?? 0), 0);
    const failed = list.filter((r) => r.failed || (r.status ?? 200) >= 400);
    if (failed.length) errors.push(...failed.map((r) => `${r.status ?? r.failed} ${r.url}`));

    (results[route] ??= []).push({
      load,
      lcp: lcp?.time ?? NaN,
      hydrated,
      bytes,
      lcpElement: lcp?.element ?? "none",
    });
    console.error(
      `run ${run + 1} ${route}: load ${(load / 1000).toFixed(2)}s lcp ${((lcp?.time ?? NaN) / 1000).toFixed(2)}s hydrated ${(hydrated / 1000).toFixed(2)}s ${(bytes / 1024).toFixed(1)} KB ${list.length} req${errors.length ? ` ERRORS: ${errors.join(" | ")}` : ""}`,
    );

    if (values.out) {
      const slug = route === "/" ? "home" : route.slice(1).replaceAll("/", "__");
      writeFileSync(
        path.join(values.out, `${slug}--run${run + 1}.json`),
        JSON.stringify(
          {
            route,
            load,
            lcp,
            hydrated,
            bytes,
            errors,
            requests: list.map((r) => ({
              ...r,
              start: Math.round((r.start - origin) * 1000),
              response: r.response && Math.round((r.response - origin) * 1000),
              end: r.end && Math.round((r.end - origin) * 1000),
            })),
          },
          null,
          2,
        ),
      );
    }
    await context.close();
  }
}
await browser.close();

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? NaN;
const range = (xs: number[]) =>
  `${(Math.min(...xs) / 1000).toFixed(2)}-${(Math.max(...xs) / 1000).toFixed(2)}`;
console.log(
  `3G profile: download and upload ${(profile.throughput * 8) / 1000} kbit/s, RTT ${profile.latency} ms, CPU ${values.cpu}x, ${values.runs} cold runs per route (median, range)`,
);
console.log("| Route | Load (s) | LCP (s) | Hydrated (s) | Transferred (KB) | LCP element |");
console.log("|---|---|---|---|---|---|");
for (const route of routes) {
  const runs = results[route] ?? [];
  const loads = runs.map((r) => r.load);
  const lcps = runs.map((r) => r.lcp);
  const hydrated = runs.map((r) => r.hydrated);
  const bytes = runs.map((r) => r.bytes);
  console.log(
    `| ${route} | ${(median(loads) / 1000).toFixed(2)} (${range(loads)}) | ${(median(lcps) / 1000).toFixed(2)} (${range(lcps)}) | ${(median(hydrated) / 1000).toFixed(2)} | ${(median(bytes) / 1024).toFixed(1)} | ${runs.at(-1)?.lcpElement} |`,
  );
}
