import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  colorOf,
  PUBLISHED_GUIDELINES,
  ruleNumber,
  VISIBLE_GUIDELINES,
} from "../../src/data/guidelines";
import { OG_DIR, SITE_ORIGIN } from "../../src/seo";
import { renderCard, type OgCard } from "./card";

/** What a prerendered page's final head says about sharing it. */
type BuiltPage = {
  /** "/" or a path without a trailing slash, from where the page sits in the build. */
  path: string;
  canonical: string;
  noindex: boolean;
  description: string;
  image: URL;
  publishedTime?: string;
  /** The JSON-LD headline, which only articles carry. */
  headline?: string;
};

const OG_IMAGE_BASE = `${SITE_ORIGIN}${OG_DIR}/`;

/** Draws every page's share card and writes the sitemap, from the heads the build prerendered. */
export async function writeShareAssets(outDir: string) {
  const files = (await readdir(outDir, { recursive: true })).filter(
    (file) => path.basename(file) === "index.html",
  );
  const pages = await Promise.all(
    files.map(async (file) => readPage(file, await readFile(path.join(outDir, file), "utf8"))),
  );
  await Promise.all(
    pages.map(async (page) => {
      const card = cardFor(page);
      const file = path.join(outDir, page.image.pathname);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, await renderCard(card));
    }),
  );
  await writeFile(path.join(outDir, "sitemap.xml"), sitemap(pages));
}

function readPage(file: string, html: string): BuiltPage {
  const dir = path.dirname(file).split(path.sep).join("/");
  const pagePath = dir === "." ? "/" : `/${dir}`;
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
  if (canonical !== SITE_ORIGIN + pagePath) {
    throw new Error(`${file} names ${canonical} as canonical, not ${SITE_ORIGIN + pagePath}.`);
  }
  const jsonLd = head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  // SAFETY: structuredData() in src/seo.ts writes this JSON, with a string headline on articles.
  const schema = (jsonLd ? JSON.parse(jsonLd) : undefined) as { headline?: string } | undefined;
  required("og:title", meta.get("og:title"));
  return {
    path: pagePath,
    canonical,
    noindex: /\bnoindex\b/.test(meta.get("robots") ?? ""),
    description: required("og:description", meta.get("og:description")),
    image: new URL(image),
    publishedTime: meta.get("article:published_time"),
    headline: schema?.headline,
  };
}

function attributes(tag: string) {
  return new Map([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, k, v]) => [k!, decode(v!)]));
}

const ENTITIES = new Map([
  ["&amp;", "&"],
  ["&lt;", "<"],
  ["&gt;", ">"],
  ["&quot;", '"'],
  ["&#x27;", "'"],
]);

/** Undoes the escaping React applies to attribute values. */
function decode(text: string) {
  return text.replace(/&(?:amp|lt|gt|quot|#x27);/g, (entity) => ENTITIES.get(entity)!);
}

/** The card each kind of page shares. A page none of these fit stops the build, so a new route
 * gets a card on purpose rather than a stand-in. */
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
    const topics = [...new Set(VISIBLE_GUIDELINES.map((guideline) => guideline.label))];
    return {
      kind: "page",
      hue: "var(--go)",
      eyebrow: `${VISIBLE_GUIDELINES.length} rules · ${topics.length} topics`,
      title: "Rule of Thumb",
      lede: page.description,
      footer: { kind: "topics", topics: topics.map((name) => ({ name, hue: colorOf(name) })) },
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
    .map((page) => page.canonical)
    .sort();
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url.replaceAll("&", "&amp;")}</loc></url>`).join("\n")}
</urlset>
`;
}
