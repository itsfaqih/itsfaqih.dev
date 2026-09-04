import { cx } from "@/stylex";
import { createFileRoute } from "@tanstack/react-router";
import { getAllPosts } from "./blog/-components/posts";
import { PageContainer } from "../components/page-container";
import { ExternalLink } from "./-components/external-link";
import { ExperienceSection } from "./-components/experience-section";
import type { ExperienceSectionProps } from "./-components/experience-section";
import { ListItem } from "./-components/list-item";
import type { ProjectListItem } from "./-components/list-item-types";
import { RuleOfThumbsCarousel } from "./-components/rule-of-thumbs-carousel";
import { Section } from "./-components/section";
import { SocialLink } from "./-components/social-link";
import type { TechTag } from "./-components/tech-tag";
import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  MediumLogoIcon,
  DribbbleLogoIcon,
  EnvelopeIcon,
} from "@phosphor-icons/react";

// ============================================================================
// Route
// ============================================================================

export const Route = createFileRoute("/")({
  component: Index,
  loader: () => {
    return {
      posts: getAllPosts().slice(0, 5), // Only show latest 5 posts
      skills: ["Front-end", "Back-end", "Full-stack", "DevOps", "UI Design", "Design Engineering"],
      toolGroups: [
        {
          label: "Languages",
          items: ["TypeScript", "PHP", "HTML", "CSS"],
        },
        {
          label: "Core Libraries and Frameworks",
          items: [
            "Effect",
            "React",
            "Vue",
            "Next.js",
            "TanStack Start",
            "TanStack Router",
            "TanStack Query",
            "Tailwind CSS",
            "PostCSS",
            "Base UI",
            "Radix UI",
            "Shadcn UI",
            "Phosphor Icons",
            "InertiaJS",
            "Redux",
            "XState",
            "Zustand",
          ],
        },
        {
          label: "Backend and Data",
          items: [
            "Node.js",
            "Express",
            "Laravel",
            "AdonisJS",
            "Prisma",
            "Drizzle",
            "WebSocket",
            "MySQL",
            "MariaDB",
            "PostgreSQL",
            "MongoDB",
            "Redis",
            "tRPC",
            "Trigger.dev",
          ],
        },
        {
          label: "Testing and Quality",
          items: ["Vitest", "Jest", "Playwright", "MSW", "Biome", "Oxlint", "Oxfmt", "Storybook"],
        },
        {
          label: "DevOps and Infrastructure",
          items: [
            "Docker",
            "Git",
            "Vite",
            "Bun",
            "Apache",
            "NGINX",
            "IIS",
            "Amazon Route 53",
            "Amazon CodeBuild",
            "Amazon CodePipeline",
            "Elastic Container Registry",
            "Amazon Web Application Firewall",
            "Amazon Simple Storage Service",
          ],
        },
        {
          label: "Design",
          items: ["Figma"],
        },
        {
          label: "Email and Templating Tools",
          items: [
            "Mailjet",
            "Maizzle",
            "EJS",
            "Amazon Simple Email Service",
            "Amazon Simple Notification Service",
          ],
        },
        {
          label: "AI tools",
          items: ["Claude Code", "OpenAI Codex", "OpenRouter", "Hermes", "OpenCode"],
        },
      ],
      experience: [
        {
          id: "evidencecare-software-engineer",
          title: "Software Engineer",
          subtitle: "EvidenceCare",
          date: "Sep 2024 — Present",
          description: [
            "Spearheaded the design and development of an MCP and a linter; the MCP cut development time for a single project component by 66%, and the broader project is projected to save approximately $15K per month.",
            "Reduced deployment time from several hours to minutes by collaborating on database migration optimization for both fresh environments and existing databases.",
            "Standardized modern tooling across TypeScript codebases, improving startup time (ts-node to tsx), build performance (CRA to Vite), linting and formatting (Prettier/ESLint to Biome), testing (Jest to Vitest), type safety (Joi to Zod), install size, and bundle size.",
            "Reduced Docker image size by 30% for select projects by introducing an optimized image build process.",
            "Architected solutions to support multi-tenancy on a single RDS instance and to enable PHI-safe logging.",
            "Reduced runtime issues by building an automated PR reviewer that validates database permissions before merge.",
          ],
          tags: [
            "typescript",
            "docker",
            "vite",
            "biome",
            "vitest",
            "zod",
            "snowflake",
            "express",
            "react-router",
            "postgresql",
            "tailwindcss",
          ] as const satisfies TechTag[],
        },
        {
          id: "vestis-labs-full-stack-engineer",
          title: "Full Stack Engineer",
          subtitle: "Vestis Labs",
          date: "Sep 2023 — Sep 2024",
          description: [
            "Overhauled the website's UI design to improve consistency and clarity.",
            "Designed the data model for the digital ID website and its drag-and-drop builder.",
            "Reduced API calls and improved page load times by implementing in-memory caching with React Query and HTTP caching.",
            "Simplified more than 80% of the code structure by co-locating related code and removing unnecessary abstractions.",
            "Improved image annotator performance and UX by moving rendering from React to direct DOM manipulation and adding mobile compatibility.",
          ],
          tags: [
            "react",
            "typescript",
            "mongodb",
            "express",
            "nextjs",
            "tanstack-router",
            "tailwindcss",
          ] as const satisfies TechTag[],
        },
        {
          id: "jatis-mobile-full-stack-engineer",
          title: "Full Stack Engineer",
          subtitle: "Jatis Mobile",
          date: "Sep 2022 — Aug 2023",
          description: [
            "Joined as a Web Designer and grew into a Full Stack Engineer role by taking on broader product and engineering responsibilities.",
            "Eliminated potential server-side chatbot costs by building a client-side chatbot from scratch with XState to simulate a WhatsApp-style experience.",
            "Designed the entire UI and built the chatbot flow builder from scratch through deployment using React Flow, Tailwind CSS, and AdonisJS.",
            "Led a team of 4 developers to deliver one of the company's main products.",
            "Recognized as one of the top performers in Q4 2022 among hundreds of colleagues.",
          ],
          tags: [
            "react",
            "typescript",
            "tailwindcss",
            "xstate",
            "reactflow",
            "adonisjs",
            "figma",
          ] as const satisfies TechTag[],
        },
        {
          id: "rapidev-project-manager",
          title: "Founding Project Manager",
          subtitle: "PT Rapidev Inovasi Nusantara",
          date: "Jan 2022 — Aug 2022",
          description: [
            "Improved team workflow by creating centralized, detailed documentation.",
            "Managed a 10-person product team delivering projects for 3 early-stage startups.",
            "Designed user journeys, dashboards, and database structures for each application developed by the company.",
            "Mentored developers and designers through code and design review feedback to improve delivery quality.",
          ],
          tags: ["figma"] as const satisfies TechTag[],
        },
        {
          id: "rapidev-full-stack-engineer",
          title: "Founding Full Stack Engineer",
          subtitle: "PT Rapidev Inovasi Nusantara",
          date: "Dec 2021 — Aug 2022",
          description: [
            "Enabled payment processing by integrating Xendit and Midtrans payment gateways.",
            "Reduced dashboard load time by 80% by implementing eager loading to solve N+1 queries and moving pagination from client side to server side.",
            "Improved user experience by reducing the steps required to update hotel availability and pricing data by 66%.",
          ],
          tags: ["react", "typescript", "laravel", "mysql"] as const satisfies TechTag[],
        },
        {
          id: "mitra-integrasi-informatika-frontend-engineer",
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
      ] satisfies ExperienceSectionProps["experiences"],
      projects: [
        {
          id: "schemata",
          title: "Schemata — Developer-Friendly Entity Relationship Diagram Builder",
          subtitle: "Front End Engineer",
          description:
            "Visual tool for creating and managing entity relationship diagrams with a drag-and-drop interface.",
          href: "https://schemata.ruine.app/",
          tags: ["react", "tailwindcss"] as const satisfies TechTag[],
          isExternal: true,
        },
        {
          id: "ruine-ui-dashboard",
          title: "ruine UI Dashboard — Admin Dashboard Template",
          subtitle: "Front End Engineer, UI Designer",
          description:
            "Responsive and accessible admin dashboard template built for modern product interfaces.",
          href: "https://github.com/ruine-dev/ruine-ui-dashboard",
          tags: ["astro", "tailwindcss"] as const satisfies TechTag[],
          isExternal: true,
        },
        {
          id: "fama",
          title: "Fama",
          subtitle: "Front End Engineer, UI Designer",
          description:
            "Open source personal branding and portfolio template focused on polished presentation and reuse.",
          href: "https://github.com/itsfaqih/fama",
          tags: ["react", "framer", "tailwindcss"] as const satisfies TechTag[],
          isExternal: true,
        },
        {
          id: "phpid-learning-web-design",
          title: "PHPID Learning Web Design",
          subtitle: "UI Designer",
          description:
            "Web design for the Indonesian PHP community's online learning platform, with the design implemented in production.",
          href: "https://www.figma.com/design/qNIg0A9h7PnrFdOVSBbMEH/PHPID-Online-Learning-Redesign?node-id=0-1&t=PcPvOnrKzLginYqa-1",
          tags: ["figma"] as const satisfies TechTag[],
          isExternal: true,
        },
        {
          id: "indonesian-reactjs-community-landing-page-design",
          title: "Indonesian ReactJS Community Landing Page Design",
          subtitle: "UI Designer",
          description: "Landing page design concept for the Indonesian ReactJS community.",
          href: "https://www.figma.com/design/i7F9VnroI83Hl01tO0k1t3/React-ID-Website-Revamp?node-id=1-3&t=s6x8aMBAQS10l8d3-1",
          tags: ["figma"] as const satisfies TechTag[],
          isExternal: true,
        },
      ] satisfies ProjectListItem[],
      achievements: [
        "3rd Place, LKS Klaten 2016 (Regency Level) - Jul 2016",
        "2nd Place, Central Java OlympicAD Pentasbora 2017 (Province Level) - Aug 2017",
        "1st Place, LKS Klaten 2017 (Regency Level) - Sep 2017",
        "1st Place, OlympicAD V 2017 (National Level) - Oct 2017",
        "3rd Place, CODE 2020 (National Level) - Jul 2020",
        '2nd Place, "Keep Being Creative from Home" Web Design Contest (National Level) - Dec 2020',
      ],
      languages: ["Indonesian (Native)", "English (B2)"],
    };
  },
});

function Index() {
  const { skills, toolGroups, experience, projects, achievements, languages } =
    Route.useLoaderData();

  return (
    <PageContainer className="home-page-container">
      {/* Name/Title */}
      <section className={cx("mb-4")}>
        <h1 className={cx("text-5xl font-bold text-foreground tracking-tight mb-4")}>
          Faqih Muntashir
        </h1>
        <p className={cx("text-xl text-muted-foreground mb-4")}>Full Stack Engineer</p>
      </section>

      {/* About */}
      <Section title="About" hideTitle>
        <div className={cx("text-muted-foreground leading-relaxed space-y-3")}>
          <p>
            Full-stack engineer based in Yogyakarta, Indonesia with 5+ years of professional
            experience building web products across healthcare, SaaS, and internal tooling.
            Currently building healthcare software at{" "}
            <ExternalLink href="https://evidence.care">EvidenceCare</ExternalLink> for the US
            market.
          </p>

          <div className={cx("flex flex-wrap gap-2 mt-4")}>
            <SocialLink href="https://medium.com/@itsfaqih" icon={MediumLogoIcon} label="Medium" />
            <SocialLink
              href="https://dribbble.com/itsfaqih"
              icon={DribbbleLogoIcon}
              label="Dribbble"
            />
            <SocialLink href="https://github.com/itsfaqih" icon={GithubLogoIcon} label="GitHub" />
            <SocialLink
              href="https://www.linkedin.com/in/itsfaqih"
              icon={LinkedinLogoIcon}
              label="LinkedIn"
            />
            <SocialLink
              href="mailto:itsfaqih@gmail.com"
              icon={EnvelopeIcon}
              label="Email"
              isExternal={false}
            />
          </div>
        </div>
      </Section>

      {/* Opinions */}
      <RuleOfThumbsCarousel />

      {/* Skills and Competencies */}
      <Section title="Skills & Competencies">
        <div className={cx("flex flex-wrap gap-2")}>
          {skills.map((skill) => (
            <span
              key={skill}
              className={cx("inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground")}
            >
              {skill}
            </span>
          ))}
        </div>
      </Section>

      {/* Tech Stack and Tools */}
      <Section title="Tech Stack & Tools">
        <ul className={cx("grid gap-6 sm:grid-cols-2")} aria-label="Technologies and tools">
          {toolGroups.map((group) => (
            <li key={group.label} className={cx("space-y-2")}>
              <h3 className={cx("text-sm font-medium text-foreground")}>{group.label}</h3>
              <p className={cx("text-sm leading-relaxed text-muted-foreground")}>
                {group.items.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Experience */}
      <ExperienceSection experiences={experience} />

      {/* Projects */}
      <Section title="Projects">
        {projects.map((project) => (
          <ListItem
            key={project.id}
            title={project.title}
            subtitle={project.subtitle}
            description={project.description}
            href={project.href}
            tags={project.tags}
            isExternal={project.isExternal}
          />
        ))}
      </Section>

      {/* Achievements */}
      <Section title="Achievements">
        <ul className={cx("space-y-2 text-sm leading-relaxed text-muted-foreground")}>
          {achievements.map((achievement) => (
            <li key={achievement} className={cx("flex gap-3")}>
              <span aria-hidden="true">•</span>
              <span>{achievement}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Languages */}
      <Section title="Languages">
        <div className={cx("flex flex-wrap gap-2")}>
          {languages.map((language) => (
            <span
              key={language}
              className={cx("inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground")}
            >
              {language}
            </span>
          ))}
        </div>
      </Section>

      {/* Hidden Writing section - uncomment to show
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
      */}

      <footer className={cx("mt-20 pt-8 border-t border-border text-sm text-muted-foreground flex justify-center")}>
        <span>© 2026</span>
      </footer>
    </PageContainer>
  );
}
