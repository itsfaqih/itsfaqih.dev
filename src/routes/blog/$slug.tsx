import { cx } from "@/stylex";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getPost } from "./-components/posts";
import { CalendarBlankIcon, ArrowLeftIcon, ClockIcon, ListIcon } from "@phosphor-icons/react";
import { Drawer } from "vaul";
import { TableOfContents } from "./-components/table-of-contents";

const BLOG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
  loader: async ({ params }) => {
    const post = getPost(params.slug);
    if (!post) {
      throw notFound();
    }
    return {
      frontmatter: post.frontmatter,
      slug: params.slug,
    };
  },
});

function BlogPost() {
  const { slug } = Route.useLoaderData();
  const post = getPost(slug);
  if (!post) {
    // This should never happen since loader already validates
    throw new Error(`Post not found: ${slug}`);
  }
  const Component = post.default;
  const [isTocOpen, setIsTocOpen] = useState(false);

  return (
    <div className={cx("relative min-h-screen")}>
      {/* Background */}
      <div className={cx("absolute inset-0 overflow-hidden pointer-events-none")}>
        {/* Background removed for solid design */}
      </div>

      <div className={cx("relative max-w-6xl mx-auto px-6 pt-8 sm:pt-24 pb-12 animate-fade-in")}>
        <div className={cx("grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12 items-start")}>
          <div>
            {/* Back */}
            <Link
              to="/blog"
              className={cx("inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group mb-8 active:scale-95")}
            >
              <ArrowLeftIcon
                size={16}
                className={cx("group-hover:-translate-x-1 transition-transform")}
              />
              Back to Blog
            </Link>

            <article>
              {/* Header */}
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

              {/* Divider */}
              <div className={cx("h-px bg-border mb-8")} />

              {/* Content */}
              <div className={cx("prose prose-invert dark:prose-invert prose-zinc dark:prose-zinc max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-foreground prose-a:underline hover:prose-a:text-muted-foreground prose-code:text-foreground prose-pre:bg-card prose-pre:border prose-pre:border-border prose-headings:scroll-mt-24")}>
                <Component />
              </div>
            </article>

            {/* Footer */}
            <footer className={cx("mt-8 pt-6 border-t border-border")}>
              <div className={cx("flex flex-col sm:flex-row items-center justify-between gap-4")}>
                <Link
                  to="/blog"
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

          {/* Table of Contents - Desktop */}
          <div className={cx("hidden lg:block sticky top-12")}>
            <TableOfContents />
          </div>
        </div>
      </div>

      {/* Mobile TOC Drawer */}
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
