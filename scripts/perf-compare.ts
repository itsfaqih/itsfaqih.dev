import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "playwright";
import { builtRoutes, serveSite } from "../tests/visual/serve-build.ts";

const { values } = parseArgs({
  options: {
    site: { type: "string", multiple: true },
    runs: { type: "string", default: "5" },
    profile: { type: "string", default: "mobile-4g" },
    out: { type: "string" },
    route: { type: "string", multiple: true },
  },
});

// Network numbers are DevTools' own presets as Lighthouse applies them with its "devtools"
// throttling method: request latency already scaled for packet-level loss.
const PROFILES = {
  "mobile-4g": {
    viewport: { width: 390, height: 844 },
    latency: 562.5,
    download: (1474.6 * 1000) / 8,
    upload: (675 * 1000) / 8,
    cpu: 4,
  },
  "desktop-3g": {
    viewport: { width: 1440, height: 900 },
    latency: 400 * 5,
    download: ((500 * 1000) / 8) * 0.8,
    upload: ((500 * 1000) / 8) * 0.8,
    cpu: 1,
  },
} as const;

function isProfile(name: string): name is keyof typeof PROFILES {
  return Object.hasOwn(PROFILES, name);
}

if (!isProfile(values.profile)) {
  throw new Error(`--profile must be one of ${Object.keys(PROFILES).join(", ")}`);
}
const profile = PROFILES[values.profile];

const sites = (values.site ?? []).map((spec) => {
  const [label, dir] = spec.split("=");
  if (!label || !dir) throw new Error(`--site takes label=directory, got ${spec}`);
  return { label, dir: path.resolve(dir) };
});
if (!sites.length) throw new Error("Pass at least one --site label=directory");

const routes = values.route ?? builtRoutes(sites[0]!.dir);
for (const site of sites) {
  const missing = routes.filter((route) => !builtRoutes(site.dir).includes(route));
  if (missing.length) throw new Error(`${site.label} has no page for ${missing.join(", ")}`);
}

declare global {
  interface Window {
    __perf: {
      lcp: { time: number; element: string }[];
      longTasks: { start: number; duration: number }[];
      interactive?: number;
    };
  }
}

type Run = {
  fcp: number;
  lcp: number;
  load: number;
  interactive: number;
  tbt: number;
  bytes: number;
  jsBytes: number;
  htmlBytes: number;
  requests: number;
  errors: string[];
  lcpElement: string;
};

const servers = await Promise.all(sites.map((site) => serveSite(site.dir, { brotli: true })));
const browser = await chromium.launch({ channel: "chrome" });
const results = new Map<string, Run[]>();
if (values.out) mkdirSync(values.out, { recursive: true });

async function measure(base: string, route: string): Promise<Run & { requestLog: object[] }> {
  const context = await browser.newContext({ viewport: profile.viewport });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.__perf = { lcp: [], longTasks: [] };
    // The page can be used once the header answers input: its bar carries a React fiber, or the
    // custom element that hosts it is defined.
    const poll = setInterval(() => {
      const bar = document.querySelector(".arc-bar");
      if (!bar) return;
      let host = bar.parentElement;
      while (host && (!host.localName.includes("-") || host.localName === "astro-island")) {
        host = host.parentElement;
      }
      const reactRoot = Object.keys(bar).some((key) => key.startsWith("__reactFiber"));
      if (!reactRoot && !(host && customElements.get(host.localName))) return;
      window.__perf.interactive = performance.now();
      clearInterval(poll);
    }, 20);
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry instanceof LargestContentfulPaint)) continue;
        const element = entry.element;
        window.__perf.lcp.push({
          time: entry.startTime,
          element: element
            ? `${element.tagName.toLowerCase()} "${(element.textContent ?? "").trim().slice(0, 40)}"`
            : entry.url,
        });
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__perf.longTasks.push({ start: entry.startTime, duration: entry.duration });
      }
    }).observe({ type: "longtask", buffered: true });
  });

  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: profile.latency,
    downloadThroughput: profile.download,
    uploadThroughput: profile.upload,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });

  type Request = {
    url: string;
    type?: string;
    status?: number;
    bytes?: number;
    done: boolean;
    failed?: string;
  };
  const requests = new Map<string, Request>();
  cdp.on("Network.requestWillBeSent", (event) => {
    if (event.request.url.startsWith("data:")) return;
    requests.set(event.requestId, { url: event.request.url, type: event.type, done: false });
  });
  cdp.on("Network.responseReceived", (event) => {
    const request = requests.get(event.requestId);
    if (request) request.status = event.response.status;
  });
  cdp.on("Network.loadingFinished", (event) => {
    const request = requests.get(event.requestId);
    if (!request) return;
    request.done = true;
    request.bytes = event.encodedDataLength;
  });
  cdp.on("Network.loadingFailed", (event) => {
    const request = requests.get(event.requestId);
    if (!request) return;
    request.done = true;
    request.failed = event.errorText;
  });

  await page.goto(new URL(route, base).href, { waitUntil: "load", timeout: 180_000 });
  // Lazy chunks and idle-time work land after load; wait until the network has been quiet for 3s.
  let quietSince = Date.now();
  for (const deadline = Date.now() + 60_000; Date.now() < deadline;) {
    await page.waitForTimeout(250);
    if ([...requests.values()].some((request) => !request.done)) quietSince = Date.now();
    else if (Date.now() - quietSince > 3000) break;
  }

  const timings = await page.evaluate(() => {
    const [nav] = performance.getEntriesByType("navigation");
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? NaN;
    return {
      fcp,
      load: nav instanceof PerformanceNavigationTiming ? nav.loadEventEnd : NaN,
      lcp: window.__perf.lcp.at(-1),
      interactive: window.__perf.interactive ?? NaN,
      tbt: window.__perf.longTasks
        .filter((task) => task.start + task.duration > fcp)
        .reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0),
    };
  });
  await context.close();

  const list = [...requests.values()];
  const sum = (filter: (request: Request) => boolean) =>
    list.filter(filter).reduce((total, request) => total + (request.bytes ?? 0), 0);
  errors.push(
    ...list
      .filter((request) => request.failed || (request.status ?? 200) >= 400)
      .map((request) => `${request.status ?? request.failed} ${request.url}`),
  );
  return {
    fcp: timings.fcp,
    lcp: timings.lcp?.time ?? NaN,
    load: timings.load,
    interactive: timings.interactive,
    tbt: timings.tbt,
    bytes: sum(() => true),
    jsBytes: sum((request) => request.type === "Script"),
    htmlBytes: sum((request) => request.type === "Document"),
    requests: list.length,
    errors,
    lcpElement: timings.lcp?.element ?? "none",
    requestLog: list.map(({ url, type, status, bytes }) => ({ url, type, status, bytes })),
  };
}

for (let run = 0; run < Number(values.runs); run++) {
  for (const route of routes) {
    // Alternate which build goes first, so warm-up and drift favour neither.
    const order = sites.map((site, index) => ({ site, server: servers[index]! }));
    if (run % 2) order.reverse();
    for (const { site, server } of order) {
      const { requestLog, ...result } = await measure(server.url, route);
      const key = `${site.label} ${route}`;
      results.set(key, [...(results.get(key) ?? []), result]);
      console.error(
        `run ${run + 1} ${key}: fcp ${result.fcp.toFixed(0)} lcp ${result.lcp.toFixed(0)} interactive ${result.interactive.toFixed(0)} load ${result.load.toFixed(0)} tbt ${result.tbt.toFixed(0)} ms, ${(result.bytes / 1024).toFixed(1)} KB (${(result.jsBytes / 1024).toFixed(1)} KB JS) ${result.requests} req${result.errors.length ? ` ERRORS: ${result.errors.join(" | ")}` : ""}`,
      );
      if (values.out) {
        const slug = route === "/" ? "home" : route.slice(1).replaceAll("/", "__");
        writeFileSync(
          path.join(values.out, `${values.profile}--${site.label}--${slug}--run${run + 1}.json`),
          JSON.stringify({ site: site.label, route, ...result, requestLog }, null, 2),
        );
      }
    }
  }
}
await browser.close();
await Promise.all(servers.map((server) => server.close()));

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? NaN;
const ms = (xs: number[]) =>
  `${median(xs).toFixed(0)} (${Math.min(...xs).toFixed(0)}–${Math.max(...xs).toFixed(0)})`;
const kb = (xs: number[]) => (median(xs) / 1024).toFixed(1);

const summary = [
  `Profile ${values.profile}: ${profile.viewport.width}x${profile.viewport.height}, ${((profile.download * 8) / 1000).toFixed(0)} kbit/s down, ${profile.latency} ms latency, ${profile.cpu}x CPU slowdown. ${values.runs} cold runs per page and build, alternating order. Brotli, no browser cache. Median (min–max), times in ms.`,
  "",
  "| Page | Build | FCP | LCP | Interactive | Load | TBT | Transferred KB | JS KB | HTML KB | Requests | Errors |",
  "|---|---|---|---|---|---|---|---|---|---|---|---|",
  ...routes.flatMap((route) =>
    sites.map(({ label }) => {
      const runs = results.get(`${label} ${route}`) ?? [];
      const pick = (key: keyof Omit<Run, "errors" | "lcpElement">) => runs.map((r) => r[key]);
      return `| ${route} | ${label} | ${ms(pick("fcp"))} | ${ms(pick("lcp"))} | ${ms(pick("interactive"))} | ${ms(pick("load"))} | ${ms(pick("tbt"))} | ${kb(pick("bytes"))} | ${kb(pick("jsBytes"))} | ${kb(pick("htmlBytes"))} | ${median(pick("requests"))} | ${runs.reduce((n, r) => n + r.errors.length, 0)} |`;
    }),
  ),
].join("\n");
console.log(summary);
if (values.out) writeFileSync(path.join(values.out, `${values.profile}--summary.md`), summary);
