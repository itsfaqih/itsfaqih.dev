import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import type { MDXComponents } from "mdx/types";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { BLOG_DATE_FORMATTER, BLOG_DESCRIPTION, getPost } from "./-components/posts";
import { MarkdownCodeBlock } from "@/components/code-block";
import { CalendarBlankIcon, ArrowLeftIcon, ClockIcon, ListIcon } from "@phosphor-icons/react";
import { Drawer } from "vaul";
import { TableOfContents } from "./-components/table-of-contents";
import { pageHead } from "../../seo";
import { motion, palette } from "../../theme.stylex";

function requirePost(slug: string) {
  const post = getPost(slug);
  if (!post) throw notFound();
  return post;
}

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
  loader: ({ params }) => {
    const post = requirePost(params.slug);
    return {
      frontmatter: post.frontmatter,
      slug: params.slug,
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead({
          path: `/blog/${loaderData.slug}`,
          title: `${loaderData.frontmatter.title} · Faqih Muntashir`,
          description: loaderData.frontmatter.summary ?? BLOG_DESCRIPTION,
          type: "article",
          headline: loaderData.frontmatter.title,
          schema: "BlogPosting",
          publishedAt: new Date(loaderData.frontmatter.publishedAt).toISOString().slice(0, 10),
        })
      : {},
});

function BlogPost() {
  const { slug } = Route.useLoaderData();
  const post = requirePost(slug);
  const Component = post.default;
  const [isTocOpen, setIsTocOpen] = useState(false);

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.shell)}>
        <div {...stylex.props(styles.layout)}>
          <div>
            <Link
              to="/blog"
              preload="intent"
              {...stylex.props(styles.backLink, styles.backLinkTop, stylex.defaultMarker())}
            >
              <ArrowLeftIcon size={16} {...stylex.props(styles.backArrow)} />
              Back to Blog
            </Link>

            <article>
              <header {...stylex.props(styles.header)}>
                <div {...stylex.props(styles.meta)}>
                  {post.frontmatter.publishedAt && (
                    <div {...stylex.props(styles.metaItem, styles.small, styles.muted)}>
                      <CalendarBlankIcon size={14} />
                      <time>
                        {BLOG_DATE_FORMATTER.format(new Date(post.frontmatter.publishedAt))}
                      </time>
                    </div>
                  )}
                  <div {...stylex.props(styles.metaItem, styles.small, styles.muted)}>
                    <ClockIcon size={14} />
                    <span>5 min read</span>
                  </div>
                </div>

                <h1 {...stylex.props(styles.title)}>{post.frontmatter.title}</h1>

                {post.frontmatter.summary && (
                  <p {...stylex.props(styles.summary)}>{post.frontmatter.summary}</p>
                )}
              </header>

              <div {...stylex.props(styles.rule)} />

              <div {...stylex.props(styles.body)}>
                <Component components={components} />
              </div>
            </article>

            <footer {...stylex.props(styles.footer)}>
              <div {...stylex.props(styles.footerRow)}>
                <Link
                  to="/blog"
                  preload="intent"
                  {...stylex.props(styles.backLink, stylex.defaultMarker())}
                >
                  <ArrowLeftIcon size={16} {...stylex.props(styles.backArrow)} />
                  Back to all posts
                </Link>

                <p {...stylex.props(styles.small, styles.muted)}>Thanks for reading!</p>
              </div>
            </footer>
          </div>

          <div {...stylex.props(styles.tocRail)}>
            <TableOfContents />
          </div>
        </div>
      </div>

      <Drawer.Root open={isTocOpen} onOpenChange={setIsTocOpen}>
        <Drawer.Trigger asChild>
          <button {...stylex.props(styles.tocButton)} aria-label="Table of Contents">
            <ListIcon size={24} />
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay {...stylex.props(styles.overlay)} />
          <Drawer.Content {...stylex.props(styles.drawer)}>
            <div {...stylex.props(styles.drawerPanel)}>
              <div aria-hidden {...stylex.props(styles.handle)} />
              <div {...stylex.props(styles.drawerBody)}>
                <Drawer.Title {...stylex.props(styles.drawerTitle)}>Table of Contents</Drawer.Title>
                <div {...stylex.props(styles.drawerScroll)}>
                  <TableOfContents onLinkClick={() => setIsTocOpen(false)} />
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

// The tags the posts render. Values follow Tailwind Typography's prose-zinc.
const components: MDXComponents = {
  p: (props: ComponentProps<"p">) => <p {...props} {...stylex.props(prose.p)} />,
  h2: (props: ComponentProps<"h2">) => <h2 {...props} {...stylex.props(prose.h2)} />,
  pre: MarkdownCodeBlock,
};

const HOVER = "@media (hover: hover) and (pointer: fine)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";

const prose = stylex.create({
  p: {
    marginTop: { default: "1.25em", ":first-child": 0, ":is(h2 + *)": 0 },
    marginBottom: { default: "1.25em", ":last-child": 0 },
    color: palette["--muted-foreground"],
  },
  h2: {
    marginTop: "2em",
    marginBottom: "1em",
    scrollMarginTop: "6rem",
    fontSize: "1.5em",
    lineHeight: "calc(32 / 24)",
    fontWeight: 700,
    color: palette["--text"],
  },
});

const styles = stylex.create({
  page: {
    position: "relative",
    minHeight: "100svh",
  },
  shell: {
    position: "relative",
    maxWidth: "72rem",
    marginInline: "auto",
    paddingInline: "1.5rem",
    paddingTop: "2rem",
    paddingBottom: "3rem",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(1, minmax(0, 1fr))",
      "@media (min-width: 64rem)": "1fr 250px",
    },
    alignItems: "flex-start",
    gap: "3rem",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    color: {
      default: palette["--muted-foreground"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
    },
    scale: { default: null, ":active": { default: "95% 95%", [REDUCE]: null } },
    transitionProperty: "color, scale",
    transitionDuration: {
      default: motion["--t-moderate-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-moderate"] },
      ":active": motion["--t-moderate"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--moderate"] },
      ":active": motion["--moderate"],
    },
  },
  backLinkTop: {
    marginBottom: "2rem",
  },
  backArrow: {
    translate: {
      default: null,
      [stylex.when.ancestor(":hover")]: {
        default: null,
        [HOVER]: { default: "-0.25rem 0", [REDUCE]: null },
      },
    },
    transitionProperty: "translate",
    transitionDuration: {
      default: motion["--t-moderate-exit"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: motion["--t-moderate"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: motion["--moderate"] },
    },
  },
  header: {
    marginBottom: "2rem",
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  muted: {
    color: palette["--muted-foreground"],
  },
  small: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  title: {
    marginBottom: "1rem",
    fontSize: { default: "1.875rem", "@media (min-width: 40rem)": "2.25rem" },
    lineHeight: 1.25,
    fontWeight: 700,
  },
  summary: {
    fontSize: "1.125rem",
    lineHeight: 1.625,
    color: palette["--muted-foreground"],
  },
  rule: {
    height: 1,
    marginBottom: "2rem",
    backgroundColor: palette["--border"],
  },
  body: {
    lineHeight: 1.75,
    color: "oklch(87.1% .006 286.286)",
  },
  footer: {
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderColor: palette["--border"],
  },
  footerRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  tocRail: {
    display: { default: "none", "@media (min-width: 64rem)": "block" },
    position: "sticky",
    top: "3rem",
  },
  tocButton: {
    position: "fixed",
    right: "calc(1.5rem + env(safe-area-inset-right, 0px))",
    bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
    zIndex: 50,
    display: { default: null, "@media (min-width: 64rem)": "none" },
    padding: "1rem",
    borderRadius: "2147483647px",
    color: palette["--bg"],
    backgroundColor: palette["--text"],
    scale: {
      default: null,
      ":hover": { default: null, [HOVER]: { default: "105% 105%", [REDUCE]: null } },
      // Repeated under the media query, which would otherwise let hovering outrank pressing.
      ":active": {
        default: "95% 95%",
        [HOVER]: { default: "95% 95%", [REDUCE]: null },
        [REDUCE]: null,
      },
    },
    transitionProperty: "scale",
    transitionDuration: {
      default: motion["--t-moderate-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-moderate"] },
      ":active": motion["--t-moderate"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--moderate"] },
      ":active": motion["--moderate"],
    },
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    backgroundColor: "rgb(0 0 0 / 0.4)",
  },
  drawer: {
    position: "fixed",
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    maxHeight: "85dvh",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderColor: palette["--border"],
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    outlineStyle: "none",
    backgroundColor: palette["--bg"],
  },
  drawerPanel: {
    display: "flex",
    flex: "1",
    flexDirection: "column",
    minHeight: 0,
    paddingTop: "1rem",
    paddingInline: "1rem",
    paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: palette["--bg"],
  },
  handle: {
    flexShrink: 0,
    width: "3rem",
    height: "0.375rem",
    marginInline: "auto",
    marginBottom: "1.5rem",
    borderRadius: "2147483647px",
    backgroundColor: palette["--border"],
  },
  drawerBody: {
    display: "flex",
    flex: "1",
    flexDirection: "column",
    width: "100%",
    maxWidth: "28rem",
    minHeight: 0,
    marginInline: "auto",
  },
  drawerTitle: {
    flexShrink: 0,
    marginBottom: "1rem",
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    fontWeight: 700,
  },
  drawerScroll: {
    flex: "1",
    overflowY: "auto",
    overscrollBehavior: "contain",
  },
});
