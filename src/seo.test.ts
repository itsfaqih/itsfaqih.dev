import { describe, expect, it } from "vite-plus/test";
import { pageHead, type SharedPage } from "./seo";

const home: SharedPage = {
  path: "/",
  title: "Home",
  description: "The home page.",
  type: "website",
};

const rule: SharedPage = {
  path: "/rule-of-thumb/button-design",
  title: "Button Design",
  description: "How buttons work.",
  type: "article",
  headline: "Button Design",
  schema: "Article",
  section: "UX Design",
};

function canonical(head: ReturnType<typeof pageHead>) {
  return head.links.filter((link) => link.rel === "canonical").map((link) => link.href);
}

function metaContent(head: ReturnType<typeof pageHead>, key: string) {
  return head.meta
    .filter(
      (tag) => ("name" in tag && tag.name === key) || ("property" in tag && tag.property === key),
    )
    .map((tag) => ("content" in tag ? tag.content : undefined));
}

function jsonLd(head: ReturnType<typeof pageHead>) {
  return head.scripts
    .filter((script) => script.type === "application/ld+json")
    .map((script) => JSON.parse(script.children));
}

describe("pageHead", () => {
  it("points the canonical and og:url at the absolute page URL", () => {
    expect(canonical(pageHead(home))).toEqual(["https://itsfaqih.dev/"]);
    expect(metaContent(pageHead(home), "og:url")).toEqual(["https://itsfaqih.dev/"]);
    expect(canonical(pageHead(rule))).toEqual(["https://itsfaqih.dev/rule-of-thumb/button-design"]);
    expect(metaContent(pageHead(rule), "og:url")).toEqual([
      "https://itsfaqih.dev/rule-of-thumb/button-design",
    ]);
  });

  it("maps each page to its own share image", () => {
    expect(metaContent(pageHead(home), "og:image")).toEqual(["https://itsfaqih.dev/og/home.png"]);
    expect(metaContent(pageHead(rule), "og:image")).toEqual([
      "https://itsfaqih.dev/og/rule-of-thumb/button-design.png",
    ]);
  });

  it("sets one title and one description", () => {
    const head = pageHead(rule);
    expect(head.meta.filter((tag) => "title" in tag)).toEqual([{ title: "Button Design" }]);
    expect(metaContent(head, "description")).toEqual(["How buttons work."]);
  });

  it("adds noindex only when the page is not indexable", () => {
    expect(metaContent(pageHead(rule), "robots")).toEqual([]);
    expect(metaContent(pageHead({ ...rule, indexable: true }), "robots")).toEqual([]);
    expect(metaContent(pageHead({ ...rule, indexable: false }), "robots")).toEqual(["noindex"]);
  });

  it("describes the home page as a website run by a person", () => {
    const [graph] = jsonLd(pageHead(home));
    const types = graph["@graph"].map((node: { "@type": string }) => node["@type"]);
    expect(types).toEqual(["WebSite", "Person"]);
  });

  it("describes an article with its own headline, author, and publish date", () => {
    const [article] = jsonLd(
      pageHead({
        path: "/blog/hello-world",
        title: "Hello · Faqih Muntashir",
        description: "A post.",
        type: "article",
        headline: "Hello",
        schema: "BlogPosting",
        publishedAt: "2023-01-01",
      }),
    );
    expect(article).toMatchObject({
      "@type": "BlogPosting",
      headline: "Hello",
      url: "https://itsfaqih.dev/blog/hello-world",
      image: "https://itsfaqih.dev/og/blog/hello-world.png",
      author: { "@type": "Person", name: "Faqih Muntashir" },
      datePublished: "2023-01-01",
    });
  });

  it("leaves structured data off section index pages", () => {
    expect(jsonLd(pageHead({ ...home, path: "/blog" }))).toEqual([]);
  });
});
