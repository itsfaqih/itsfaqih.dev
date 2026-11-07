import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { brotliCompressSync } from "node:zlib";
import type { TestProject } from "vite-plus/test/node";

export const SITE_ROOT = path.resolve(import.meta.dirname, "../..", process.env.SITE_DIR ?? "dist");

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript"],
  [".css", "text/css"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".mp3", "audio/mpeg"],
  [".json", "application/json"],
  [".md", "text/markdown; charset=utf-8"],
  [".xml", "application/xml"],
  [".txt", "text/plain; charset=utf-8"],
]);

const compressible = new Set([".html", ".js", ".css", ".svg", ".json", ".md", ".xml", ".txt"]);

function resolveFile(root: string, urlPath: string) {
  const file = path.join(root, urlPath);
  const inside = path.relative(root, file);
  if (inside === ".." || inside.startsWith(`..${path.sep}`) || path.isAbsolute(inside))
    return undefined;
  // Both page layouts a static host serves: `blog/index.html` and `blog.html` answer `/blog`.
  return [file, `${file.replace(/\/$/, "")}.html`, path.join(file, "index.html")].find(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
  );
}

/** Every prerendered page of a build as a route, whichever of the two page layouts it uses. */
export function builtRoutes(root = SITE_ROOT) {
  if (!existsSync(path.join(root, "index.html"))) {
    throw new Error(`No build at ${root}. Run vp run build first.`);
  }
  const routes = readdirSync(root, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".html") && path.basename(file) !== "404.html")
    .map((file) => `/${file.replace(/(?:^|\/)index\.html$/, "").replace(/\.html$/, "")}`);
  return [...new Set(routes)].sort();
}

/** A route as a file name: `home`, or its path with `__` for each slash. */
export function routeSlug(route: string) {
  return route === "/" ? "home" : route.slice(1).replaceAll("/", "__");
}

/**
 * Serves a build the way a CDN would: Brotli for text, nothing cached by the browser. The
 * compressed bodies are kept in memory so compression time never lands inside a measurement.
 */
export async function serveSite(root: string, { brotli = false } = {}) {
  const compressed = new Map<string, Buffer>();
  const server = createServer((req, res) => {
    let urlPath: string;
    try {
      urlPath = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    const file = resolveFile(root, urlPath);
    if (!file) {
      res.writeHead(404).end();
      return;
    }
    const headers = {
      "content-type": contentTypes.get(path.extname(file)) ?? "application/octet-stream",
      "cache-control": "no-store",
    };
    if (brotli && compressible.has(path.extname(file))) {
      let body = compressed.get(file);
      if (!body) {
        body = brotliCompressSync(readFileSync(file));
        compressed.set(file, body);
      }
      res.writeHead(200, { ...headers, "content-encoding": "br" }).end(body);
      return;
    }
    res.writeHead(200, headers);
    createReadStream(file).pipe(res);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  // SAFETY: a server listening on a TCP host and port reports AddressInfo, never a pipe name.
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

export default async function setup(project: TestProject) {
  const routes = builtRoutes();
  const site = await serveSite(SITE_ROOT);
  project.provide("baseURL", site.url);
  project.provide("routes", routes);
  return site.close;
}

declare module "vitest" {
  export interface ProvidedContext {
    baseURL: string;
    routes: string[];
  }
}
