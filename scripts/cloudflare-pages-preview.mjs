import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const args = process.argv.slice(2).map((arg) => {
  if (arg === "--host") return "--ip";
  if (arg.startsWith("--host=")) return `--ip=${arg.slice("--host=".length)}`;
  return arg;
});

const wrangler = resolve(
  process.cwd(),
  process.platform === "win32"
    ? "node_modules/.bin/wrangler.cmd"
    : "node_modules/.bin/wrangler",
);

if (!existsSync(wrangler)) {
  console.error(
    "Wrangler is required for the Cloudflare Pages preview. Install the project dependencies first.",
  );
  process.exit(1);
}

const child = spawn(wrangler, ["--cwd", "./", "pages", "dev", ...args], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

let shuttingDown = false;

for (const signal of ["SIGINT", "SIGHUP", "SIGTERM"]) {
  process.once(signal, () => {
    shuttingDown = true;
    child.kill(signal);
  });
}

child.once("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.once("exit", (code, signal) => {
  if (shuttingDown) {
    process.exit(0);
  }
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(code ?? 1);
});
