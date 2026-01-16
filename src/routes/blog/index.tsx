import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllPosts } from "./-components/posts";
import { PageContainer } from "../../components/page-container";
import { CalendarBlankIcon, ArrowRightIcon, FileTextIcon } from "@phosphor-icons/react";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  loader: () => {
    return {
      posts: getAllPosts(),
    };
  },
});

function BlogIndex() {
  const { posts } = Route.useLoaderData();

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background removed for solid design */}
      </div>

      <PageContainer maxWidth="3xl" className="relative pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-(--bg-secondary) border border-(--border-color)">
              <FileTextIcon size={20} className="text-(--text-primary)" />
            </div>
            <span className="text-sm font-medium text-(--text-primary)">Blog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-(--text-primary) mb-3">
            Thoughts & Tutorials
          </h1>
          <p className="text-base text-(--text-secondary) max-w-xl">
            Exploring web development, design patterns, and the technologies that power modern
            applications.
          </p>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl p-12 bg-(--card-bg) border border-(--border-color) text-center">
              <FileTextIcon size={48} className="mx-auto mb-4 text-(--text-secondary)" />
              <p className="text-(--text-secondary) text-lg">No posts yet. Check back soon!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.slug}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="block group active:scale-[0.99] transition-transform"
                >
                  <div className="rounded-2xl p-5 sm:p-6 bg-(--card-bg) border border-(--border-color) hover:border-(--text-secondary) transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {post.frontmatter.publishedAt && (
                          <div className="flex items-center gap-2 mb-3">
                            <CalendarBlankIcon size={14} className="text-(--text-secondary)" />
                            <time className="text-sm text-(--text-secondary)">
                              {new Date(post.frontmatter.publishedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </time>
                          </div>
                        )}

                        <h2 className="text-lg sm:text-xl font-bold text-(--text-primary) mb-2 transition-colors">
                          {post.frontmatter.title}
                        </h2>

                        {post.frontmatter.summary && (
                          <p className="text-(--text-secondary) leading-relaxed line-clamp-2">
                            {post.frontmatter.summary}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 mt-2">
                        <div className="p-3 rounded-xl bg-(--bg-secondary) transition-colors">
                          <ArrowRightIcon
                            size={20}
                            className="text-(--text-secondary) group-hover:translate-x-1 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>

        {/* Back */}
        <div className="mt-8 pt-6 border-t border-(--border-color)">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-(--text-secondary) hover:text-(--text-primary) transition-colors group"
          >
            <ArrowRightIcon
              size={16}
              className="rotate-180 group-hover:-translate-x-1 transition-transform"
            />
            Back to Home
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
