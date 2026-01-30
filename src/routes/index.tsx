import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllPosts } from "./blog/-components/posts";
import { PageContainer } from "../components/page-container";
import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  EnvelopeIcon,
  TwitterLogoIcon,
  ArrowUpRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretDownIcon,
  CaretUpIcon,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useState, useCallback, memo } from "react";
import { cn } from "../cn";
import { Button, getButtonClasses } from "../components/button";
import { RuleOfThumbCard } from "../components/rule-of-thumb-card";
import { GUIDELINES } from "../data/guidelines";

// ============================================================================
// Types
// ============================================================================

const TECH_ICON_MAP = {
  react: "react",
  typescript: "typescript",
  nextjs: "nextdotjs",
  tailwindcss: "tailwindcss",
  vuejs: "vuedotjs",
  nodejs: "nodedotjs",
  postgresql: "postgresql",
  aws: "amazonwebservices",
  supabase: "supabase",
  "tanstack-start": "tanstack",
  laravel: "laravel",
  php: "php",
  mysql: "mysql",
  figma: "figma",
  express: "express",
  mongodb: "mongodb",
} as const;

type TechTag = keyof typeof TECH_ICON_MAP;

type SectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
};

type SocialLinkProps = {
  href: string;
  icon: PhosphorIcon;
  label: string;
  isExternal?: boolean;
};

type ListItemProps = {
  title: string;
  subtitle?: string;
  date?: string;
  tags?: TechTag[];
  href?: string;
  isExternal?: boolean;
  description?: string;
};

type TimelineItemProps = {
  title: string;
  subtitle?: string;
  date?: string;
  tags?: TechTag[];
  isExternal?: boolean;
  description?: string[];
  isLast?: boolean;
};

function Section({ title, children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("mb-12 scroll-mt-24", className)}>
      <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
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
      className={getButtonClasses({
        variant: "secondary-neutral",
        className: "cursor-pointer",
        hasLeadingIcon: true,
      })}
    >
      <span className="relative z-1 flex items-center gap-2">
        <Icon size={14} />
        {label}
      </span>
    </a>
  );
}

// Memoized since it renders the same tag multiple times in lists (rerender-memo rule)
const TechTagComponent = memo(function TechTagComponent({ tag }: { tag: TechTag }) {
  const iconSlug = TECH_ICON_MAP[tag];
  const displayName = tag
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-background border border-border text-muted-foreground">
      <img
        src={`https://cdn.simpleicons.org/${iconSlug}`}
        alt=""
        className="size-3 opacity-60"
        style={{ filter: "var(--icon-filter, grayscale(100%))" }}
      />
      {displayName}
    </span>
  );
});

function ListItemContent({
  title,
  subtitle,
  date,
  tags,
  isExternal,
  description,
}: Omit<ListItemProps, "href">) {
  return (
    <div className="group relative grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:gap-4 items-start p-4 -mx-4 rounded-2xl squircle transition-all duration-300 border border-transparent hover:border-border hover:bg-linear-to-br hover:from-gray-500/10 hover:to-gray-500/5 hover:backdrop-blur-md">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground text-sm transition-colors">{title}</h3>
          {isExternal && (
            <ArrowUpRightIcon
              size={12}
              className="text-muted-foreground opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all"
            />
          )}
        </div>

        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}

        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{description}</p>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <TechTagComponent key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>

      {date && (
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{date}</span>
      )}
    </div>
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
  const contentProps = { title, subtitle, date, tags, isExternal, description };

  if (href) {
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          <ListItemContent {...contentProps} />
        </a>
      );
    }
    return (
      <Link to={href} className="block">
        <ListItemContent {...contentProps} />
      </Link>
    );
  }

  return <ListItemContent {...contentProps} />;
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
        <div className="size-2.5 rounded-full bg-foreground ring-4 ring-background z-10 mt-1.5" />

        {/* Connecting Line - absolutely positioned to connect perfectly */}
        {!isLast && <div className="absolute top-2.5 bottom-[-40px] w-px bg-border" />}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-10", isLast && "pb-0")}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground text-base">{title}</h3>
              {isExternal && (
                <ArrowUpRightIcon
                  size={14}
                  className="text-muted-foreground opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all"
                />
              )}
            </div>

            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>

          {date && (
            <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">
              {date}
            </span>
          )}
        </div>

        {description && description.length > 0 && (
          <ul className="text-sm text-muted-foreground leading-relaxed max-w-xl mb-3 list-disc pl-4 space-y-1">
            {description.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const displayName = tag
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
              return (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-background border border-border text-muted-foreground"
                >
                  <img
                    src={`https://cdn.simpleicons.org/${TECH_ICON_MAP[tag]}`}
                    alt=""
                    className="size-3.5 opacity-70"
                    style={{ filter: "var(--icon-filter, grayscale(100%))" }}
                  />
                  {displayName}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Experience Section Component (with expand/collapse)
// ============================================================================

type ExperienceSectionProps = {
  experience: {
    title: string;
    subtitle: string;
    date: string;
    description: string[];
    tags: TechTag[];
  }[];
};

const INITIAL_EXPERIENCE_COUNT = 3;

function ExperienceSection({ experience }: ExperienceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMore = experience.length > INITIAL_EXPERIENCE_COUNT;

  return (
    <Section title="Experience">
      <div className="relative">
        {experience.map((job, index) => {
          const isHidden = !isExpanded && index >= INITIAL_EXPERIENCE_COUNT;
          const isLastVisible = isExpanded
            ? index === experience.length - 1
            : index === INITIAL_EXPERIENCE_COUNT - 1 && !hasMore;

          return (
            <div
              key={index}
              className="grid transition-all duration-300 ease-out"
              style={{
                gridTemplateRows: isHidden ? "0fr" : "1fr",
                opacity: isHidden ? 0 : 1,
              }}
            >
              <div className="overflow-hidden">
                <TimelineItem
                  title={job.title}
                  subtitle={job.subtitle}
                  date={job.date}
                  description={job.description}
                  tags={job.tags}
                  isLast={isLastVisible}
                />
              </div>
            </div>
          );
        })}

        {/* Bottom fade gradient - visible when collapsed with more items */}
        {hasMore && (
          <div
            className={cn(
              "bg-linear-to-b from-transparent via-transparent to-background absolute bottom-0 left-0 right-0 h-24 pointer-events-none transition-opacity duration-300",
              isExpanded ? "opacity-0" : "opacity-100",
            )}
          />
        )}
      </div>

      {hasMore && (
        <Button
          variant="tertiary-neutral"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          {isExpanded ? (
            <>
              <CaretUpIcon size={14} />
              Show less
            </>
          ) : (
            <>
              <CaretDownIcon size={14} />
              Show all ({experience.length})
            </>
          )}
        </Button>
      )}
    </Section>
  );
}

function RuleOfThumbsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideCount = GUIDELINES.length;

  // Card dimensions
  const CARD_WIDTH = 288; // w-72 = 18rem = 288px
  const CARD_GAP = 32; // Gap between cards
  const VISIBLE_RANGE = 2; // How many cards visible on each side

  const scrollPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const scrollNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  // Calculate the offset from center (-2, -1, 0, 1, 2, etc.)
  const getDistanceFromCenter = useCallback(
    (index: number): number => {
      let distance = index - currentIndex;

      // Handle loop wrapping - find shortest path
      if (distance > slideCount / 2) {
        distance -= slideCount;
      } else if (distance < -slideCount / 2) {
        distance += slideCount;
      }

      return distance;
    },
    [currentIndex, slideCount],
  );

  // Calculate 3D transforms for each slide
  const getSlideStyles = useCallback(
    (index: number): React.CSSProperties => {
      const distance = getDistanceFromCenter(index);

      // Only render slides within visible range
      if (Math.abs(distance) > VISIBLE_RANGE + 1) {
        return {
          opacity: 0,
          pointerEvents: "none",
          visibility: "hidden",
        };
      }

      // 3D curve parameters
      const rotateY = distance * 20; // Rotation angle
      const translateZ = -Math.abs(distance) * 80; // Push back based on distance
      const translateY = Math.pow(Math.abs(distance), 1.5) * 15; // Vertical curve
      const translateX = distance * (CARD_WIDTH + CARD_GAP); // Horizontal spacing

      // Opacity fades for edge cards
      const opacity = Math.max(0.4, 1 - Math.abs(distance) * 0.25);

      return {
        transform: `
          translateX(${translateX}px)
          translateZ(${translateZ}px)
          translateY(${translateY}px)
          rotateY(${rotateY}deg)
        `,
        opacity,
        zIndex: 10 - Math.abs(distance),
        transition: "all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
        pointerEvents: Math.abs(distance) > 1 ? "none" : "auto",
      } as React.CSSProperties;
    },
    [getDistanceFromCenter],
  );

  return (
    <section className="mb-12 scroll-mt-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Rule of Thumb
        </h2>
        <Link
          to="/rule-of-thumb"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
        >
          View More
          <CaretRightIcon className="translate-y-[0.5px] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* 3D Curved Carousel */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: "340px", // Fixed height for the carousel area
        }}
      >
        {/* Perspective container - centers content and applies 3D */}
        <div
          className="absolute inset-0 flex items-start justify-center pt-4"
          style={{
            perspective: "1200px",
            perspectiveOrigin: "center center",
          }}
        >
          {/* Transform origin container */}
          <div
            className="relative"
            style={{
              transformStyle: "preserve-3d",
              width: `${CARD_WIDTH}px`, // Same as card width so center card aligns
            }}
          >
            {GUIDELINES.map((guideline, i) => (
              <div
                key={guideline.id}
                className="absolute top-0 left-0"
                style={{
                  ...getSlideStyles(i),
                  transformStyle: "preserve-3d",
                  width: `${CARD_WIDTH}px`,
                }}
              >
                <RuleOfThumbCard ruleOfThumb={guideline} />
              </div>
            ))}
          </div>
        </div>

        {/* Left fade gradient */}
        <div
          className="absolute inset-y-0 left-0 w-32 pointer-events-none z-10"
          style={{
            background: "linear-gradient(to right, var(--background), transparent)",
          }}
        />

        {/* Right fade gradient */}
        <div
          className="absolute inset-y-0 right-0 w-32 pointer-events-none z-10"
          style={{
            background: "linear-gradient(to left, var(--background), transparent)",
          }}
        />
      </div>

      {/* Navigation Arrows - Centered below cards */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={scrollPrev}
          className={cn(
            "size-9 rounded-full bg-card border border-border flex items-center justify-center transition-all duration-200",
            "opacity-100 hover:bg-border hover:scale-105 cursor-pointer",
          )}
          aria-label="Scroll left"
        >
          <CaretLeftIcon size={18} className="text-foreground" />
        </button>
        <button
          onClick={scrollNext}
          className={cn(
            "size-9 rounded-full bg-card border border-border flex items-center justify-center transition-all duration-200",
            "opacity-100 hover:bg-border hover:scale-105 cursor-pointer",
          )}
          aria-label="Scroll right"
        >
          <CaretRightIcon size={18} className="text-foreground" />
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
          title: "Mid Software Engineer",
          subtitle: "EvidenceCare",
          date: "Sep 2024 — Present",
          description: [
            "Authored technical documentation for scaffolding services, configuring reverse proxies, and setting up semantic release pipelines for UI applications.",
            "Built an automated PR reviewer to validate database permissions and reduce runtime errors.",
            "Modernized tooling and upgraded dependencies across all TypeScript codebases.",
            "Optimized Docker image builds, reducing image size by approximately 30%.",
          ],
          tags: [
            "react",
            "typescript",
            "tailwindcss",
            "postgresql",
            "aws",
            "express",
          ] as const satisfies TechTag[],
        },
        {
          title: "Full Stack Engineer",
          subtitle: "VESTIS LABS",
          date: "Sep 2023 — Sep 2024",
          description: [
            "Reduced API calls by caching with React Query.",
            "Created e2e tests with 70%+ coverage using Playwright.",
            "Overhauled app design with glassmorphism and micro-interactions.",
            "Built a custom drag-and-drop page builder from scratch.",
          ],
          tags: [
            "react",
            "typescript",
            "tailwindcss",
            "mongodb",
            "express",
          ] as const satisfies TechTag[],
        },
        {
          title: "Full Stack Engineer",
          subtitle: "Jatis Mobile",
          date: "Sep 2022 — Aug 2023",
          description: [
            "Built a client-side chatbot using XState and a chatbot flow builder with React Flow.",
            "Led a team of 4 developers.",
            "Recognized as top-performer of Q4 2022.",
          ],
          tags: ["react", "typescript", "tailwindcss"] as const satisfies TechTag[],
        },
        {
          title: "Founding Project Manager & Full-stack Developer",
          subtitle: "Rapidev",
          date: "Dec 2021 — Aug 2022",
          description: [
            "Managed a product team of 10 for early-stage startups.",
            "Integrated Xendit and Midtrans payment gateways.",
            "Achieved 80% load time reduction through optimization.",
          ],
          tags: ["react", "typescript", "laravel"] as const satisfies TechTag[],
        },
        {
          title: "Full Stack Engineer",
          subtitle: "Freelance",
          date: "Feb 2020 — Dec 2021",
          description: [
            "Built applications for LPP Polytechnic Yogyakarta using Laravel, React, Vue, and InertiaJS.",
            "Crafted custom WordPress/Blogger templates and translated Figma designs to pixel-perfect websites.",
          ],
          tags: ["react", "vuejs", "laravel", "php"] as const satisfies TechTag[],
        },
        {
          title: "Frontend Engineer",
          subtitle: "Mitra Integrasi Informatika",
          date: "Sep 2020 — Feb 2021",
          description: [
            "Implemented JWT authentication for multiple projects.",
            "Performed code reviews and managed repositories.",
            "Designed admin dashboard UI using Figma.",
          ],
          tags: ["react", "typescript", "figma"] as const satisfies TechTag[],
        },
      ] satisfies ExperienceSectionProps["experience"],
      projects: [
        {
          title: "Schemata",
          subtitle: "Frontend",
          description:
            "An Entity Relationship Diagram drag-and-drop builder for designing database schemas visually.",
          href: "https://schemata.ruine.app",
          tags: ["react", "typescript", "tailwindcss"] as const satisfies TechTag[],
          isExternal: true,
        },
        {
          title: "Fama",
          subtitle: "UI Design, Frontend",
          description:
            "A beautiful portfolio website template designed for developers and designers to showcase their work.",
          href: "https://old-itsfaqih.vercel.app",
          tags: ["react", "typescript", "tailwindcss"] as const satisfies TechTag[],
          isExternal: true,
        },
        {
          title: "PHPID Learning",
          subtitle: "UI Design",

          description: "Learning platform UI design for the PHP Indonesia community.",
          href: "https://learning-byphpid.netlify.app",
          tags: ["figma"] as const satisfies TechTag[],
          isExternal: true,
        },
      ] satisfies ListItemProps[],
    };
  },
});

function Index() {
  const { posts, techStack, experience, projects } = Route.useLoaderData();

  return (
    <PageContainer>
      {/* Name/Title */}
      <section className="mb-16">
        <h1 className="text-5xl font-bold text-foreground tracking-tight mb-4">Faqih Muntashir</h1>
        <p className="text-xl text-muted-foreground mb-6">Developer & Writer</p>
      </section>

      {/* About */}
      <Section title="About">
        <div className="text-muted-foreground leading-relaxed">
          <p>High-agency, ambitious, and opinionated engineer with a customer service mindset.</p>

          <div className="flex flex-wrap gap-2 mt-4">
            <SocialLink href="https://github.com" icon={GithubLogoIcon} label="GitHub" />
            <SocialLink href="https://linkedin.com" icon={LinkedinLogoIcon} label="LinkedIn" />
            <SocialLink href="https://twitter.com" icon={TwitterLogoIcon} label="X" />
            <SocialLink
              href="mailto:hello@faqih.dev"
              icon={EnvelopeIcon}
              label="Email"
              isExternal={false}
            />
          </div>
        </div>
      </Section>

      {/* Opinions */}
      <RuleOfThumbsCarousel />
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
                before:pointer-events-none before:absolute before:-inset-x-2 before:top-0 before:bottom-0 before:border-t before:border-b before:border-zinc-200 dark:before:border-white/20 group-hover:before:border-muted-foreground before:transition-colors before:mask-[linear-gradient(to_right,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]
                after:pointer-events-none after:absolute after:-inset-y-2 after:left-0 after:right-0 after:border-l after:border-r after:border-zinc-200 dark:after:border-white/20 group-hover:after:border-muted-foreground after:transition-colors after:mask-[linear-gradient(to_bottom,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]"
              role="listitem"
            >
              <div className="size-8 flex items-center justify-center z-10" aria-hidden="true">
                <img
                  src={`https://cdn.simpleicons.org/${tech.icon}`}
                  alt=""
                  className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ filter: "var(--icon-filter, grayscale(100%))" }}
                />
              </div>
              <span className="text-xs text-muted-foreground text-center leading-tight z-10 group-hover:text-foreground transition-colors">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Experience */}
      <ExperienceSection experience={experience} />

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
        {posts.map((post) => (
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

      <footer className="mt-20 pt-8 border-t border-border text-sm text-muted-foreground flex justify-center">
        <span>© 2026</span>
      </footer>
    </PageContainer>
  );
}
