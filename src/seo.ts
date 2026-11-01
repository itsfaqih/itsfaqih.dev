export const SITE_ORIGIN = "https://itsfaqih.dev";

export const OG_DIR = "/og";

const SITE_NAME = "Faqih Muntashir";

export const LINKS = {
  github: "https://github.com/itsfaqih",
  linkedin: "https://www.linkedin.com/in/itsfaqih",
  dribbble: "https://dribbble.com/itsfaqih",
  medium: "https://medium.com/@itsfaqih",
  email: "itsfaqih@gmail.com",
};

const AUTHOR = {
  name: "Faqih Muntashir",
  url: `${SITE_ORIGIN}/`,
  jobTitle: "Full-Stack Engineer",
  sameAs: [LINKS.github, LINKS.linkedin],
};

export type SharedPage = {
  /** "/" or a path without a trailing slash, as in "/blog/hello-world". */
  path: string;
  title: string;
  description: string;
  /** False keeps the page out of search results. Defaults to true. */
  indexable?: boolean;
} & (
  | { type: "website" }
  | {
      type: "article";
      /** The article's own title, as its heading shows it, without the site name. */
      headline: string;
      section?: string;
      /** An ISO 8601 date. */
      publishedAt?: string;
      schema: "Article" | "BlogPosting";
    }
);

export function pageHead(page: SharedPage) {
  const url = SITE_ORIGIN + page.path;
  const image = `${SITE_ORIGIN}${OG_DIR}${page.path === "/" ? "/home" : page.path}.png`;

  const meta = [
    { title: page.title },
    { name: "description", content: page.description },
    ...(page.indexable === false ? [{ name: "robots", content: "noindex" }] : []),
    { property: "og:type", content: page.type },
    { property: "og:url", content: url },
    { property: "og:title", content: page.title },
    { property: "og:description", content: page.description },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "en_US" },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:alt", content: page.title },
    ...(page.type === "article"
      ? [
          ...(page.section ? [{ property: "article:section", content: page.section }] : []),
          ...(page.publishedAt
            ? [{ property: "article:published_time", content: page.publishedAt }]
            : []),
          { property: "article:author", content: AUTHOR.url },
        ]
      : []),
    { name: "twitter:card", content: "summary_large_image" },
  ];

  const schema = structuredData(page, url, image);

  return {
    meta,
    links: [{ rel: "canonical", href: url }],
    scripts: schema ? [{ type: "application/ld+json", children: JSON.stringify(schema) }] : [],
  };
}

function structuredData(page: SharedPage, url: string, image: string) {
  if (page.type === "article") {
    return {
      "@context": "https://schema.org",
      "@type": page.schema,
      headline: page.headline,
      description: page.description,
      image,
      url,
      mainEntityOfPage: url,
      author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
      datePublished: page.publishedAt,
    };
  }
  if (page.path !== "/") return undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: SITE_NAME, url },
      {
        "@type": "Person",
        ...AUTHOR,
        worksFor: { "@type": "Organization", name: "EvidenceCare" },
        address: { "@type": "PostalAddress", addressCountry: "ID" },
      },
    ],
  };
}
