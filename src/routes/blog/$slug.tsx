import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getPost } from "./-components/posts";
import { CalendarBlankIcon, ArrowLeftIcon, ClockIcon, ListIcon } from "@phosphor-icons/react";
import { Drawer } from "vaul";
import { TableOfContents } from "./-components/table-of-contents";

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
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background removed for solid design */}
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-8 sm:pt-24 pb-12 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12 items-start">
          <div>
            {/* Back */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-(--text-secondary) hover:text-(--text-primary) transition-colors group mb-8 active:scale-95"
            >
              <ArrowLeftIcon
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to Blog
            </Link>

            <article>
              {/* Header */}
              <header className="mb-8">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {post.frontmatter.publishedAt && (
                    <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                      <CalendarBlankIcon size={14} className="text-(--text-secondary)" />
                      <time>
                        {new Date(post.frontmatter.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                    <ClockIcon size={14} className="text-(--text-secondary)" />
                    <span>5 min read</span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-(--text-primary) leading-tight mb-4">
                  {post.frontmatter.title}
                </h1>

                {post.frontmatter.summary && (
                  <p className="text-lg text-(--text-secondary) leading-relaxed">
                    {post.frontmatter.summary}
                  </p>
                )}
              </header>

              {/* Divider */}
              <div className="h-px bg-(--border-color) mb-8" />

              {/* Content */}
              <div className="prose prose-invert dark:prose-invert prose-zinc dark:prose-zinc max-w-none prose-headings:text-(--text-primary) prose-p:text-(--text-secondary) prose-strong:text-(--text-primary) prose-a:text-(--text-primary) prose-a:underline hover:prose-a:text-(--text-secondary) prose-code:text-(--text-primary) prose-pre:bg-(--bg-secondary) prose-pre:border prose-pre:border-(--border-color) prose-headings:scroll-mt-24">
                <Component />
              </div>
            </article>

            {/* Footer */}
            <footer className="mt-8 pt-6 border-t border-(--border-color)">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-(--text-secondary) hover:text-(--text-primary) transition-colors group active:scale-95"
                >
                  <ArrowLeftIcon
                    size={16}
                    className="group-hover:-translate-x-1 transition-transform"
                  />
                  Back to all posts
                </Link>

                <p className="text-sm text-(--text-secondary)">Thanks for reading!</p>
              </div>
            </footer>
          </div>

          {/* Table of Contents - Desktop */}
          <div className="hidden lg:block sticky top-12">
            <TableOfContents />
          </div>
        </div>
      </div>

      {/* Mobile TOC Drawer */}
      <Drawer.Root open={isTocOpen} onOpenChange={setIsTocOpen}>
        <Drawer.Trigger asChild>
          <button
            className="fixed bottom-6 right-6 p-4 rounded-full bg-(--text-primary) text-(--bg-primary) lg:hidden z-50 hover:scale-105 active:scale-95 transition-all"
            aria-label="Table of Contents"
          >
            <ListIcon size={24} />
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="bg-(--bg-primary) flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] outline-none border-t border-(--border-color)">
            <div className="p-4 bg-(--bg-primary) rounded-t-[10px] flex-1 flex flex-col min-h-0">
              <div
                aria-hidden
                className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-(--border-color) mb-6"
              />
              <div className="max-w-md mx-auto w-full flex-1 flex flex-col min-h-0">
                <Drawer.Title className="font-bold text-lg text-(--text-primary) mb-4 shrink-0">
                  Table of Contents
                </Drawer.Title>
                <div className="overflow-y-auto flex-1">
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
