// Starts `astro dev` on the LAN and prints the URL a phone on the same Wi-Fi opens. Astro keeps one
// dev server per checkout, so when this checkout already runs one, this prints its URL and reuses it.
import { spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { networkInterfaces } from "node:os";

const args = process.argv.slice(2);

// A physical interface's private IPv4 address. Docker and VPN bridges also list addresses, which a
// phone cannot reach, so only Ethernet and Wi-Fi names count.
const lan =
  Object.entries(networkInterfaces())
    .filter(([name]) => /^(en|eth|wlan|wlp|enp)\d/.test(name))
    .flatMap(([, addresses]) => addresses ?? [])
    .find((address) => address.family === "IPv4" && !address.internal)?.address ?? "127.0.0.1";

const say = (port: string, note: string) =>
  console.log(`\n  LAN: http://${lan}:${port}/  (${note}; stop it with vp run dev:stop)\n`);

const status = spawnSync("astro", ["dev", "status"], { encoding: "utf8" });
const running = /running at http:\/\/[^:]+:(\d+)/.exec(`${status.stdout}${status.stderr}`)?.[1];
if (running) {
  say(running, "this checkout's dev server is already running");
  process.exit(0);
}

/** The first port from `from` up that nothing listens on, so the printed URL is the one Astro uses. */
async function freePort(from: number): Promise<number> {
  const free = await new Promise<boolean>((resolve) => {
    const probe = createServer()
      .once("error", () => resolve(false))
      .listen(from, () => probe.close(() => resolve(true)));
  });
  return free ? from : freePort(from + 1);
}

const asked = args.indexOf("--port");
const port = asked >= 0 ? (args.splice(asked, 2)[1] ?? "5173") : String(await freePort(5173));
say(port, "open this on a phone");
const dev = spawnSync("astro", ["dev", "--host", "--port", port, ...args], { stdio: "inherit" });
process.exit(dev.status ?? 1);
