import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  colorOf,
  PUBLISHED_GUIDELINES,
  ruleNumber,
  TOPICS,
  VISIBLE_GUIDELINES,
} from "../../src/data/guidelines";
import { OG_DIR, SITE_ORIGIN } from "../../src/seo";
import { renderCard, type OgCard } from "./card";

type BuiltPage = {
  path: string;
  noindex: boolean;
  description: string;
  imagePath: string;
  videoPath?: string;
  publishedTime?: string;
  headline?: string;
};

const OG_IMAGE_BASE = `${SITE_ORIGIN}${OG_DIR}/`;

export async function writeShareAssets(outDir: string) {
  // Every page but the 404, which no one shares or indexes.
  const files = (await readdir(outDir, { recursive: true })).filter(
    (file) => file.endsWith(".html") && file !== "404.html",
  );
  const pages = await Promise.all(
    files.map(async (file) => readPage(file, await readFile(path.join(outDir, file), "utf8"))),
  );
  await Promise.all(
    pages.map(async (page) => {
      const card = cardFor(page);
      const file = path.join(outDir, page.imagePath);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, await renderCard(card));
    }),
  );
  await Promise.all(
    pages.flatMap(({ path: pagePath, videoPath }) =>
      videoPath
        ? [
            access(path.join(outDir, videoPath)).catch(() => {
              throw new Error(
                `${pagePath} shares ${videoPath}, but public${videoPath} is missing. Render it with scripts/og/video.`,
              );
            }),
          ]
        : [],
    ),
  );
  await writeFile(path.join(outDir, "sitemap.xml"), sitemap(pages));
}

function readPage(file: string, html: string): BuiltPage {
  // blog.html is /blog and index.html is /: the build writes each page as a file of its own.
  const route = file
    .split(path.sep)
    .join("/")
    .replace(/\.html$/, "");
  const pagePath = route === "index" ? "/" : `/${route}`;
  const head = html.slice(0, html.indexOf("</head>"));
  const tags = (name: string) =>
    [...head.matchAll(new RegExp(`<${name}\\s[^>]*>`, "g"))].map(([tag]) => attributes(tag));
  const meta = new Map(
    tags("meta").flatMap((attrs) => {
      const key = attrs.get("property") ?? attrs.get("name");
      const content = attrs.get("content");
      return key && content !== undefined ? [[key, content] as const] : [];
    }),
  );
  const required = (name: string, value: string | undefined) => {
    if (!value) throw new Error(`${file} has no ${name} in its head. Give its route a pageHead().`);
    return value;
  };
  const canonical = required(
    "canonical link",
    tags("link")
      .find((attrs) => attrs.get("rel") === "canonical")
      ?.get("href"),
  );
  const image = required("og:image", meta.get("og:image"));
  if (!image.startsWith(OG_IMAGE_BASE)) {
    throw new Error(
      `${file} shares ${image}, but the build draws cards only under ${OG_IMAGE_BASE}.`,
    );
  }
  const video = meta.get("og:video");
  if (video && !video.startsWith(OG_IMAGE_BASE)) {
    throw new Error(`${file} shares ${video}, but share videos live only under ${OG_IMAGE_BASE}.`);
  }
  if (canonical !== SITE_ORIGIN + pagePath) {
    throw new Error(`${file} names ${canonical} as canonical, not ${SITE_ORIGIN + pagePath}.`);
  }
  const jsonLd = head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  // SAFETY: structuredData() in src/seo.ts writes this JSON, with a string headline on articles.
  const schema = (jsonLd ? JSON.parse(jsonLd) : undefined) as { headline?: string } | undefined;
  return {
    path: pagePath,
    noindex: /\bnoindex\b/.test(meta.get("robots") ?? ""),
    description: required("og:description", meta.get("og:description")),
    imagePath: new URL(image).pathname,
    videoPath: video ? new URL(video).pathname : undefined,
    publishedTime: meta.get("article:published_time"),
    headline: schema?.headline,
  };
}

function attributes(tag: string) {
  return new Map(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, k, v]) => [k!, unescapeAttribute(v!)]),
  );
}

const ENTITIES = new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
]);

function unescapeAttribute(text: string) {
  return text.replace(/&(amp|lt|gt|quot|#\d+|#x[\da-f]+);/gi, (_, name: string) =>
    name.startsWith("#")
      ? String.fromCodePoint(Number(name[1] === "x" ? `0${name.slice(1)}` : name.slice(1)))
      : ENTITIES.get(name)!,
  );
}

function cardFor(page: BuiltPage): OgCard {
  if (page.path === "/") return { kind: "home" };

  const rule = PUBLISHED_GUIDELINES.find((candidate) => candidate.href === page.path);
  if (rule) {
    const number = ruleNumber(rule);
    const [from, to] = rule.coverTag.split("→").map((side) => side.trim());
    if (!from || !to)
      throw new Error(`${rule.id}'s coverTag "${rule.coverTag}" is not "FROM → TO"`);
    return {
      kind: "page",
      hue: colorOf(rule.label),
      eyebrow: number ? `Rule ${number} · ${rule.label}` : `Rule · ${rule.label}`,
      title: rule.title,
      lede: rule.claim,
      footer: { kind: "shift", from, to },
    };
  }

  if (page.path === "/rule-of-thumb") {
    return {
      kind: "page",
      hue: "var(--go)",
      eyebrow: `${VISIBLE_GUIDELINES.length} rules · ${TOPICS.length} topics`,
      title: "Rule of Thumb",
      lede: page.description,
      footer: { kind: "topics", topics: TOPICS.map((name) => ({ name, hue: colorOf(name) })) },
    };
  }

  if (page.path === "/cv") {
    return {
      kind: "page",
      hue: "var(--go)",
      eyebrow: "CV",
      title: "Faqih Muntashir",
      lede: page.description,
      footer: { kind: "domain" },
    };
  }

  if (page.path === "/blog") {
    return {
      kind: "page",
      hue: "var(--go)",
      eyebrow: "Blog",
      title: "Thoughts & Tutorials",
      lede: page.description,
      footer: { kind: "domain" },
    };
  }

  if (/^\/blog\/[^/]+$/.test(page.path)) {
    if (!page.publishedTime || !page.headline) {
      throw new Error(`${page.path} needs article:published_time and a JSON-LD headline`);
    }
    const date = new Date(page.publishedTime).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    return {
      kind: "page",
      hue: "var(--go)",
      eyebrow: `Blog · ${date}`,
      title: page.headline,
      lede: page.description,
      footer: { kind: "domain" },
    };
  }

  throw new Error(
    `${page.path} has no share card. Give it one in cardFor() in scripts/og/share-assets.ts.`,
  );
}

function sitemap(pages: BuiltPage[]) {
  const urls = pages
    .filter((page) => !page.noindex)
    .map((page) => SITE_ORIGIN + page.path)
    .sort();
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url.replaceAll("&", "&amp;")}</loc></url>`).join("\n")}
</urlset>
`;
}
