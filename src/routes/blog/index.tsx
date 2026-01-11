import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllPosts } from "./components/posts";
import { PageContainer } from "../../components/page-container";
import { Calendar, ArrowRight, FileText } from "lucide-react";

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
            <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <FileText size={20} className="text-[var(--text-primary)]" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">Blog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Thoughts & Tutorials
          </h1>
          <p className="text-base text-[var(--text-secondary)] max-w-xl">
            Exploring web development, design patterns, and the technologies that power modern
            applications.
          </p>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl p-12 bg-[var(--card-bg)] border border-[var(--border-color)] text-center">
              <FileText size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
              <p className="text-[var(--text-secondary)] text-lg">No posts yet. Check back soon!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.slug}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="block group active:scale-[0.99] transition-transform"
                >
                  <div className="rounded-2xl p-5 sm:p-6 bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-all duration-300 shadow-sm dark:shadow-none">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {post.frontmatter.publishedAt && (
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar size={14} className="text-[var(--text-secondary)]" />
                            <time className="text-sm text-[var(--text-secondary)]">
                              {new Date(post.frontmatter.publishedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </time>
                          </div>
                        )}

                        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2 transition-colors">
                          {post.frontmatter.title}
                        </h2>

                        {post.frontmatter.summary && (
                          <p className="text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                            {post.frontmatter.summary}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 mt-2">
                        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] transition-colors">
                          <ArrowRight
                            size={20}
                            className="text-[var(--text-secondary)] group-hover:translate-x-1 transition-all"
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
        <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
          >
            <ArrowRight
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
