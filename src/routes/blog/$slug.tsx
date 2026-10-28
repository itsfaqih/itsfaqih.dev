import { cx } from "@/stylex";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { BLOG_DATE_FORMATTER, BLOG_DESCRIPTION, getPost } from "./-components/posts";
import { MarkdownCodeBlock } from "@/components/code-block";
import { CalendarBlankIcon, ArrowLeftIcon, ClockIcon, ListIcon } from "@phosphor-icons/react";
import { Drawer } from "vaul";
import { TableOfContents } from "./-components/table-of-contents";
import { pageHead } from "../../seo";

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
    <div className={cx("relative min-h-screen")}>
      <div className={cx("relative max-w-6xl mx-auto px-6 pt-8 sm:pt-24 pb-12 animate-fade-in")}>
        <div className={cx("grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12 items-start")}>
          <div>
            <Link
              to="/blog"
              preload="intent"
              className={cx("inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group mb-8 active:scale-95")}
            >
              <ArrowLeftIcon
                size={16}
                className={cx("group-hover:-translate-x-1 transition-transform")}
              />
              Back to Blog
            </Link>

            <article>
              <header className={cx("mb-8")}>
                <div className={cx("flex flex-wrap items-center gap-4 mb-6")}>
                  {post.frontmatter.publishedAt && (
                    <div className={cx("flex items-center gap-2 text-sm text-muted-foreground")}>
                      <CalendarBlankIcon size={14} className={cx("text-muted-foreground")} />
                      <time>
                        {BLOG_DATE_FORMATTER.format(new Date(post.frontmatter.publishedAt))}
                      </time>
                    </div>
                  )}
                  <div className={cx("flex items-center gap-2 text-sm text-muted-foreground")}>
                    <ClockIcon size={14} className={cx("text-muted-foreground")} />
                    <span>5 min read</span>
                  </div>
                </div>

                <h1 className={cx("text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4")}>
                  {post.frontmatter.title}
                </h1>

                {post.frontmatter.summary && (
                  <p className={cx("text-lg text-muted-foreground leading-relaxed")}>
                    {post.frontmatter.summary}
                  </p>
                )}
              </header>

              <div className={cx("h-px bg-border mb-8")} />

              <div className={cx("prose prose-invert dark:prose-invert prose-zinc dark:prose-zinc max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-foreground prose-a:underline hover:prose-a:text-muted-foreground prose-code:text-foreground prose-pre:bg-card prose-pre:border prose-pre:border-border prose-headings:scroll-mt-24")}>
                <Component components={{ pre: MarkdownCodeBlock }} />
              </div>
            </article>

            <footer className={cx("mt-8 pt-6 border-t border-border")}>
              <div className={cx("flex flex-col sm:flex-row items-center justify-between gap-4")}>
                <Link
                  to="/blog"
                  preload="intent"
                  className={cx("inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group active:scale-95")}
                >
                  <ArrowLeftIcon
                    size={16}
                    className={cx("group-hover:-translate-x-1 transition-transform")}
                  />
                  Back to all posts
                </Link>

                <p className={cx("text-sm text-muted-foreground")}>Thanks for reading!</p>
              </div>
            </footer>
          </div>

          <div className={cx("hidden lg:block sticky top-12")}>
            <TableOfContents />
          </div>
        </div>
      </div>

      <Drawer.Root open={isTocOpen} onOpenChange={setIsTocOpen}>
        <Drawer.Trigger asChild>
          <button
            className={cx("fixed bottom-6 right-6 p-4 rounded-full bg-foreground text-background lg:hidden z-50 hover:scale-105 active:scale-95 transition-all")}
            aria-label="Table of Contents"
          >
            <ListIcon size={24} />
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className={cx("fixed inset-0 bg-black/40 z-50")} />
          <Drawer.Content className={cx("bg-background flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] outline-none border-t border-border")}>
            <div className={cx("p-4 bg-background rounded-t-[10px] flex-1 flex flex-col min-h-0")}>
              <div
                aria-hidden
                className={cx("mx-auto w-12 h-1.5 shrink-0 rounded-full bg-border mb-6")}
              />
              <div className={cx("max-w-md mx-auto w-full flex-1 flex flex-col min-h-0")}>
                <Drawer.Title className={cx("font-bold text-lg text-foreground mb-4 shrink-0")}>
                  Table of Contents
                </Drawer.Title>
                <div className={cx("overflow-y-auto flex-1")}>
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
