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
            <div className="p-2.5 rounded-xl bg-card border border-border">
              <FileTextIcon size={20} className="text-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Blog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Thoughts & Tutorials
          </h1>
          <p className="text-base text-muted-foreground max-w-xl">
            Exploring web development, design patterns, and the technologies that power modern
            applications.
          </p>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl p-12 bg-(--card-bg) border border-border text-center">
              <FileTextIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No posts yet. Check back soon!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.slug}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="block group active:scale-[0.99] transition-transform"
                >
                  <div className="rounded-2xl p-5 sm:p-6 bg-(--card-bg) border border-border hover:border-muted-foreground transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {post.frontmatter.publishedAt && (
                          <div className="flex items-center gap-2 mb-3">
                            <CalendarBlankIcon size={14} className="text-muted-foreground" />
                            <time className="text-sm text-muted-foreground">
                              {new Date(post.frontmatter.publishedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </time>
                          </div>
                        )}

                        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 transition-colors">
                          {post.frontmatter.title}
                        </h2>

                        {post.frontmatter.summary && (
                          <p className="text-muted-foreground leading-relaxed line-clamp-2">
                            {post.frontmatter.summary}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 mt-2">
                        <div className="p-3 rounded-xl bg-card transition-colors">
                          <ArrowRightIcon
                            size={20}
                            className="text-muted-foreground group-hover:translate-x-1 transition-all"
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
        <div className="mt-8 pt-6 border-t border-border">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
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
