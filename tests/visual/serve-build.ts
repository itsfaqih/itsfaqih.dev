import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import type { TestProject } from "vite-plus/test/node";

const root = path.resolve(import.meta.dirname, "../../.output/public");

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript"],
  [".css", "text/css"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".json", "application/json"],
  [".md", "text/markdown; charset=utf-8"],
]);

function resolveFile(urlPath: string) {
  const file = path.join(root, decodeURIComponent(urlPath));
  if (!file.startsWith(root)) return undefined;
  if (existsSync(file) && statSync(file).isFile()) return file;
  const index = path.join(file, "index.html");
  return existsSync(index) ? index : undefined;
}

export function builtRoutes() {
  if (!existsSync(path.join(root, "index.html"))) {
    throw new Error(`No build at ${root}. Run vp run build first.`);
  }
  return readdirSync(root, { recursive: true, encoding: "utf8" })
    .filter((file) => path.basename(file) === "index.html")
    .map((file) => `/${path.dirname(file)}`.replace(/\/\.$/, "/"))
    .sort();
}

export default async function setup(project: TestProject) {
  const routes = builtRoutes();

  const server = createServer((req, res) => {
    const file = resolveFile(new URL(req.url ?? "/", "http://localhost").pathname);
    if (!file) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      "content-type": contentTypes.get(path.extname(file)) ?? "application/octet-stream",
    });
    createReadStream(file).pipe(res);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  // SAFETY: a server listening on a TCP host and port reports AddressInfo, never a pipe name.
  const { port } = server.address() as AddressInfo;

  project.provide("baseURL", `http://127.0.0.1:${port}`);
  project.provide("routes", routes);

  return () => new Promise<void>((resolve) => server.close(() => resolve()));
}

declare module "vitest" {
  export interface ProvidedContext {
    baseURL: string;
    routes: string[];
  }
}
