import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllPosts } from "./blog/components/posts";
import { PageContainer } from "../components/page-container";
import {
  Github,
  Linkedin,
  Mail,
  Twitter,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ReactNode, useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "../cn";

// ============================================================================
// Types
// ============================================================================

interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

interface SocialLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isExternal?: boolean;
}

interface ListItemProps {
  title: string;
  subtitle?: string;
  date?: string;
  tags?: string[];
  href?: string;
  isExternal?: boolean;
  description?: string;
}

interface TimelineItemProps {
  title: string;
  subtitle?: string;
  date?: string;
  tags?: string[];
  isExternal?: boolean;
  description?: string;
  isLast?: boolean;
}

// ============================================================================
// Icon Map (shared between ListItem and TimelineItem)
// ============================================================================

const TECH_ICON_MAP: Record<string, string> = {
  React: "react",
  TypeScript: "typescript",
  "Next.js": "nextdotjs",
  Tailwind: "tailwindcss",
  TailwindCSS: "tailwindcss",
  "Tailwind CSS": "tailwindcss",
  "Vue.js": "vuedotjs",
  "Node.js": "nodedotjs",
  PostgreSQL: "postgresql",
  AWS: "amazonwebservices",
  Supabase: "supabase",
  "D3.js": "d3dotjs",
  "TanStack Start": "tanstack",
};

// ============================================================================
// Components
// ============================================================================

function Section({ title, children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("mb-12 scroll-mt-24", className)}>
      <h2 className="text-sm font-medium text-(--text-secondary) mb-4 uppercase tracking-wide">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SocialLink({ href, icon: Icon, label, isExternal = true }: SocialLinkProps) {
  const externalProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <a
      href={href}
      {...externalProps}
      className="relative overflow-hidden inline-flex items-center gap-2 px-3 h-8.5 rounded-md text-(--text-primary) transition-all text-sm backdrop-blur-md border border-gray-500/20 bg-linear-to-b from-gray-500/5 to-gray-500/0 hover:from-gray-500/10 hover:to-gray-500/5 before:absolute before:inset-0 before:bg-current before:opacity-0 before:scale-0 before:rounded-full before:transition-all active:before:duration-300 before:duration-0 active:before:scale-150 active:before:opacity-10 active:shadow-lg"
    >
      <Icon size={14} />
      {label}
    </a>
  );
}

function TechTag({ tag }: { tag: string }) {
  const iconSlug = TECH_ICON_MAP[tag];

  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-(--bg-primary) border border-(--border-color) text-(--text-secondary)">
      {iconSlug && (
        <img
          src={`https://cdn.simpleicons.org/${iconSlug}`}
          alt=""
          className="w-3 h-3 opacity-60"
          style={{ filter: "var(--icon-filter, grayscale(100%))" }}
        />
      )}
      {tag}
    </span>
  );
}

function ListItem({
  title,
  subtitle,
  date,
  tags,
  href,
  isExternal = false,
  description,
}: ListItemProps) {
  const Content = () => (
    <div className="group relative grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:gap-4 items-start p-4 -mx-4 rounded-2xl transition-all duration-300 border border-transparent hover:border-(--border-color) hover:bg-linear-to-br hover:from-gray-500/10 hover:to-gray-500/5 hover:backdrop-blur-md">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-(--text-primary) text-sm transition-colors">{title}</h3>
          {isExternal && (
            <ArrowUpRight
              size={12}
              className="text-(--text-secondary) opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all"
            />
          )}
        </div>

        {subtitle && <p className="text-sm text-(--text-secondary)">{subtitle}</p>}

        {description && (
          <p className="text-sm text-(--text-secondary) leading-relaxed max-w-xl">{description}</p>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <TechTag key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>

      {date && (
        <span className="text-xs text-(--text-secondary) tabular-nums whitespace-nowrap">
          {date}
        </span>
      )}
    </div>
  );

  if (href) {
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          <Content />
        </a>
      );
    }
    return (
      <Link to={href} className="block">
        <Content />
      </Link>
    );
  }

  return <Content />;
}

function TimelineItem({
  title,
  subtitle,
  date,
  tags,
  isExternal = false,
  description,
  isLast = false,
}: TimelineItemProps) {
  return (
    <div className="group relative flex gap-6">
      {/* Timeline line and dot */}
      <div className="relative flex flex-col items-center">
        {/* Dot */}
        <div className="w-2.5 h-2.5 rounded-full bg-(--text-primary) ring-4 ring-(--bg-primary) z-10 mt-1.5" />

        {/* Connecting Line - absolutely positioned to connect perfectly */}
        {!isLast && <div className="absolute top-2.5 bottom-[-40px] w-px bg-(--border-color)" />}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-10", isLast && "pb-0")}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-(--text-primary) text-base">{title}</h3>
              {isExternal && (
                <ArrowUpRight
                  size={14}
                  className="text-(--text-secondary) opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all"
                />
              )}
            </div>

            {subtitle && <p className="text-sm text-(--text-secondary) mt-1">{subtitle}</p>}
          </div>

          {date && (
            <span className="text-sm text-(--text-secondary) tabular-nums whitespace-nowrap">
              {date}
            </span>
          )}
        </div>

        {description && (
          <p className="text-sm text-(--text-secondary) leading-relaxed max-w-xl mb-3">
            {description}
          </p>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-(--bg-primary) border border-(--border-color) text-(--text-secondary)"
              >
                {TECH_ICON_MAP[tag] && (
                  <img
                    src={`https://cdn.simpleicons.org/${TECH_ICON_MAP[tag]}`}
                    alt=""
                    className="w-3.5 h-3.5 opacity-70"
                    style={{ filter: "var(--icon-filter, grayscale(100%))" }}
                  />
                )}
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Guidelines Carousel Component
// ============================================================================

const GUIDELINES = [
  {
    id: "proximity-principle",
    label: "Code Structure",
    title: "Proximity Principle",
    description: "How code writings and files should be structured",
    href: "/my-views/proximity-principle",
  },
  {
    id: "typescript-code-writing",
    label: "Code Quality",
    title: "TypeScript Guidelines",
    description: "Rules for writing clean and maintainable TypeScript",
    href: "/my-views/typescript-code-writing",
  },
  {
    id: "button-design",
    label: "Components",
    title: "Button Design",
    description: "States, hover, variants, and icon alignment",
    href: "/my-views/button-design",
  },
  {
    id: "table-design",
    label: "Components",
    title: "Table Design",
    description: "States, pagination, actions, and numbers",
    href: "/my-views/table-design",
  },
  {
    id: "dialog-design",
    label: "Components",
    title: "Dialog Design",
    description: "Focus trap, inert background, and data safety patterns",
    href: "/my-views/dialog-design",
  },
  {
    id: "data-loading",
    label: "Architecture",
    title: "Data Loading",
    description: "SSR, loaders, SWR, and error handling",
    href: "/my-views/data-loading",
  },
  {
    id: "handling-timestamps",
    label: "Best Practices",
    title: "Handling Timestamps",
    description: "Store UTC, display local",
    href: "/my-views/handling-timestamps",
  },
  {
    id: "null-vs-undefined",
    label: "JavaScript",
    title: "Null vs Undefined",
    description: "The difference between empty and missing values",
    href: "/my-views/null-vs-undefined",
  },
];

function MyGuidelinesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="mb-12 scroll-mt-24">
      <h2 className="text-sm font-medium text-(--text-secondary) mb-4 uppercase tracking-wide">
        My Views
      </h2>

      {/* Embla Carousel - Full Bleed */}
      <div className="w-screen ml-[calc(50%-50vw)] relative left-0 right-0">
        <div className="overflow-hidden" ref={emblaRef}>
          <div
            className="flex gap-4"
            style={{
              paddingLeft: "max(1.5rem, calc((100vw - 42rem) / 2 + 1.5rem))",
              paddingRight: 0,
            }}
          >
            {GUIDELINES.map((guideline, i) => (
              <Link
                key={guideline.id}
                to={guideline.href}
                className="group shrink-0 w-64"
                style={{
                  marginRight:
                    i === GUIDELINES.length - 1
                      ? "max(1.5rem, calc((100vw - 42rem) / 2 + 1.5rem))"
                      : undefined,
                }}
              >
                {" "}
                {/* Card */}
                <div className="relative h-48 rounded-xl overflow-hidden bg-linear-to-br from-(--bg-secondary) to-(--bg-primary) border border-(--border-color) transition-all duration-300 group-hover:border-(--text-secondary)/30 group-hover:shadow-lg group-hover:shadow-black/10 group-hover:-translate-y-1">
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-br from-white/3 to-transparent pointer-events-none" />

                  {/* Subtle pattern */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, var(--border-color) 1px, transparent 0)`,
                      backgroundSize: "24px 24px",
                    }}
                  />

                  {/* Icon/Visual area - abstract shapes */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-2xl bg-(--bg-primary)/50 border border-(--border-color)/50 flex items-center justify-center backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-(--text-secondary)/20 to-transparent border border-(--border-color)" />
                    </div>
                  </div>
                </div>
                {/* Text content below card */}
                <div className="mt-4 space-y-1">
                  <span className="text-xs text-(--text-secondary) uppercase tracking-wide">
                    {guideline.label}
                  </span>
                  <h3 className="font-medium text-(--text-primary) group-hover:text-(--accent-color) transition-colors flex items-center gap-1.5">
                    {guideline.title}
                    <ChevronRight
                      size={14}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                    />
                  </h3>
                  <p className="text-sm text-(--text-secondary) line-clamp-2">
                    {guideline.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Below cards */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className={cn(
            "w-9 h-9 rounded-full bg-(--bg-secondary) border border-(--border-color) flex items-center justify-center transition-all duration-200",
            canScrollPrev
              ? "opacity-100 hover:bg-(--border-color) hover:scale-105 cursor-pointer"
              : "opacity-40 cursor-not-allowed",
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} className="text-(--text-primary)" />
        </button>
        <button
          onClick={scrollNext}
          disabled={!canScrollNext}
          className={cn(
            "w-9 h-9 rounded-full bg-(--bg-secondary) border border-(--border-color) flex items-center justify-center transition-all duration-200",
            canScrollNext
              ? "opacity-100 hover:bg-(--border-color) hover:scale-105 cursor-pointer"
              : "opacity-40 cursor-not-allowed",
          )}
          aria-label="Scroll right"
        >
          <ChevronRight size={18} className="text-(--text-primary)" />
        </button>
      </div>
    </section>
  );
}

// ============================================================================
// Route
// ============================================================================

export const Route = createFileRoute("/")({
  component: Index,
  loader: () => {
    return {
      posts: getAllPosts().slice(0, 5), // Only show latest 5 posts
      techStack: [
        { name: "TypeScript", icon: "typescript", color: "#3178C6" },
        { name: "React", icon: "react", color: "#61DAFB" },
        { name: "Astro", icon: "astro", color: "#FF5D01" },
        { name: "Tailwind CSS", icon: "tailwindcss", color: "#06B6D4" },
        { name: "Laravel", icon: "laravel", color: "#FF2D20" },
        { name: "MySQL", icon: "mysql", color: "#4479A1" },
        { name: "PHP", icon: "php", color: "#777BB4" },
        { name: "PostgreSQL", icon: "postgresql", color: "#4169E1" },
        { name: "Node.js", icon: "nodedotjs", color: "#339933" },
        { name: "Figma", icon: "figma", color: "#F24E1E" },
      ],
      experience: [
        {
          title: "Senior Frontend Developer",
          subtitle: "TechCorp Inc.",
          date: "2023 — Present",
          description:
            "Leading the frontend migration to Next.js and building a comprehensive design system.",
          tags: ["React", "TypeScript", "Next.js", "Tailwind"],
        },
        {
          title: "Full Stack Developer",
          subtitle: "StartUp Studio",
          date: "2021 — 2023",
          description:
            "Built and shipped multiple MVPs for early-stage startups using modern web stack.",
          tags: ["Vue.js", "Node.js", "PostgreSQL", "AWS"],
        },
      ],
      projects: [
        {
          title: "Personal Website",
          subtitle: "Digital Garden",
          description:
            "A digital garden built with TanStack Start, React, and Tailwind CSS. Features light/dark mode, MDX blog, and a clean minimalist aesthetic.",
          href: "https://github.com/yourusername/personal-website",
          tags: ["TanStack Start", "React", "TypeScript", "Tailwind"],
          isExternal: true,
        },
        {
          title: "Project Meteor",
          subtitle: "SaaS Dashboard",
          description:
            "Real-time analytics dashboard for monitoring server health and application metrics.",
          href: "#",
          tags: ["React", "D3.js", "Supabase"],
          isExternal: true,
        },
      ],
    };
  },
});

function Index() {
  const { posts, techStack, experience, projects } = Route.useLoaderData();

  return (
    <PageContainer>
      {/* Name/Title */}
      <section className="mb-16">
        <h1 className="text-5xl font-bold text-(--text-primary) tracking-tight mb-4">
          Faqih Muntashir
        </h1>
        <p className="text-xl text-(--text-secondary) mb-6">Developer & Writer</p>
      </section>

      {/* About */}
      <Section title="About">
        <div className="text-(--text-secondary) leading-relaxed">
          <p>High-agency, ambitious, and opinionated engineer with a customer service mindset.</p>

          <div className="flex flex-wrap gap-2 mt-4">
            <SocialLink href="https://github.com" icon={Github} label="GitHub" />
            <SocialLink href="https://linkedin.com" icon={Linkedin} label="LinkedIn" />
            <SocialLink href="https://twitter.com" icon={Twitter} label="X" />
            <SocialLink
              href="mailto:hello@faqih.dev"
              icon={Mail}
              label="Email"
              isExternal={false}
            />
          </div>
        </div>
      </Section>

      {/* Opinions */}
      <MyGuidelinesCarousel />
      {/* Tech Stack and Tools */}
      <Section title="Tech Stack & Tools">
        <div
          className="grid grid-cols-3 sm:grid-cols-5 gap-0 pl-px pt-px"
          role="list"
          aria-label="Technologies and tools"
        >
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="relative flex flex-col items-center justify-center gap-3 p-4 h-32 transition-all group hover:z-10 -ml-px -mt-px
                before:pointer-events-none before:absolute before:-inset-x-2 before:top-0 before:bottom-0 before:border-t before:border-b before:border-zinc-200 dark:before:border-white/20 group-hover:before:border-(--text-secondary) before:transition-colors before:mask-[linear-gradient(to_right,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]
                after:pointer-events-none after:absolute after:-inset-y-2 after:left-0 after:right-0 after:border-l after:border-r after:border-zinc-200 dark:after:border-white/20 group-hover:after:border-(--text-secondary) after:transition-colors after:mask-[linear-gradient(to_bottom,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]"
              role="listitem"
            >
              <div className="w-8 h-8 flex items-center justify-center z-10" aria-hidden="true">
                <img
                  src={`https://cdn.simpleicons.org/${tech.icon}`}
                  alt=""
                  className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ filter: "var(--icon-filter, grayscale(100%))" }}
                />
              </div>
              <span className="text-xs text-(--text-secondary) text-center leading-tight z-10 group-hover:text-(--text-primary) transition-colors">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Experience */}
      <Section title="Experience">
        {experience.map((job, index) => (
          <TimelineItem
            key={index}
            title={job.title}
            subtitle={job.subtitle}
            date={job.date}
            description={job.description}
            tags={job.tags}
            isLast={index === experience.length - 1}
          />
        ))}
      </Section>

      {/* Projects */}
      <Section title="Projects">
        {projects.map((project, index) => (
          <ListItem
            key={index}
            title={project.title}
            subtitle={project.subtitle}
            description={project.description}
            href={project.href}
            tags={project.tags}
            isExternal={project.isExternal}
          />
        ))}
      </Section>

      {/* Writing */}
      <Section title="Writing">
        {posts.map((post: any) => (
          <ListItem
            key={post.slug}
            title={post.frontmatter.title}
            date={
              post.frontmatter.publishedAt
                ? new Date(post.frontmatter.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })
                : undefined
            }
            subtitle={post.frontmatter.summary}
            href={`/blog/${post.slug}`}
          />
        ))}
      </Section>

      <footer className="mt-20 pt-8 border-t border-(--border-color) text-sm text-(--text-secondary) flex justify-between">
        <span>© 2026 Faqih Muntashir</span>
        <span>Built with TanStack Start</span>
      </footer>
    </PageContainer>
  );
}
