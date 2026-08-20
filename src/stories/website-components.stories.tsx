import { GithubLogoIcon, LinkedinLogoIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Counter } from "../content/blog/counter";
import { ExternalLink } from "../routes/-components/external-link";
import { ExperienceSection } from "../routes/-components/experience-section";
import { ListItem } from "../routes/-components/list-item";
import { ListItemContent } from "../routes/-components/list-item-content";
import { RuleOfThumbsCarousel } from "../routes/-components/rule-of-thumbs-carousel";
import { Section } from "../routes/-components/section";
import { SocialLink } from "../routes/-components/social-link";
import { TechTagComponent } from "../routes/-components/tech-tag";
import { TimelineItem } from "../routes/-components/timeline-item";
import { TableOfContents } from "../routes/blog/-components/table-of-contents";
import { Showcase, tanstackRouterParameters } from "./story-support";

const meta = {
  title: "Website Components",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SectionHeading: Story = {
  render: () => (
    <Showcase style={{ width: 520 }}>
      <Section title="Selected work">
        <p style={{ color: "var(--muted-foreground)" }}>
          Sections provide consistent spacing and heading treatment across the homepage.
        </p>
      </Section>
    </Showcase>
  ),
};

export const Timeline: Story = {
  render: () => (
    <Showcase style={{ width: 640 }}>
      <TimelineItem
        title="Frontend Engineer"
        subtitle="Vestis Labs"
        date="2023 — 2024"
        description={["Improved the product UI and reduced unnecessary API calls."]}
        tags={["react", "typescript", "tanstack-start"]}
      />
      <TimelineItem
        title="Web Designer"
        subtitle="Aster Studio"
        date="2022 — 2023"
        description={["Designed and shipped a conversational flow builder."]}
        tags={["figma", "reactflow"]}
        isLast
      />
    </Showcase>
  ),
};

export const ListItemContentStory: Story = {
  name: "List item content",
  render: () => (
    <Showcase style={{ width: 640 }}>
      <ListItemContent
        title="Personal website"
        subtitle="A living portfolio and rule-of-thumb library"
        date="2026"
        tags={["react", "typescript", "vite"]}
        isExternal
        description="A compact example of the content-first list layout."
      />
    </Showcase>
  ),
};

export const ListItemStory: Story = {
  name: "List item",
  parameters: {
    ...tanstackRouterParameters,
  },
  render: () => (
    <Showcase style={{ width: 640 }}>
      <ListItem
        title="Read the project notes"
        subtitle="Internal navigation example"
        href="/rule-of-thumb"
        tags={["tanstack-start", "react"]}
      />
    </Showcase>
  ),
};

export const Experience: Story = {
  render: () => (
    <Showcase style={{ width: 680 }}>
      <ExperienceSection
        experiences={[
          {
            id: "vestis",
            title: "Frontend Engineer",
            subtitle: "Vestis Labs",
            date: "Sep 2023 — Sep 2024",
            description: ["Overhauled the website UI and designed the digital ID data model."],
            tags: ["react", "typescript", "reactflow"],
          },
          {
            id: "aster",
            title: "Full Stack Engineer",
            subtitle: "Aster Studio",
            date: "2022 — 2023",
            description: ["Built and led delivery of a WhatsApp-style chatbot flow builder."],
            tags: ["react", "xstate", "adonisjs"],
          },
          {
            id: "internship",
            title: "Frontend Intern",
            subtitle: "Product team",
            date: "2021 — 2022",
            description: ["Learned product development through small, focused releases."],
            tags: ["vue", "typescript"],
          },
          {
            id: "community",
            title: "Open source contributor",
            subtitle: "Independent",
            date: "2020 — 2021",
            description: ["Contributed fixes and documentation to projects I used daily."],
            tags: ["react", "typescript"],
          },
        ]}
      />
    </Showcase>
  ),
};

export const TechTag: Story = {
  render: () => (
    <Showcase>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <TechTagComponent tag="react" />
        <TechTagComponent tag="typescript" />
        <TechTagComponent tag="tanstack-start" />
        <TechTagComponent tag="figma" />
      </div>
    </Showcase>
  ),
};

export const SocialLinks: Story = {
  render: () => (
    <Showcase>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <SocialLink href="https://github.com/itsfaqih" icon={GithubLogoIcon} label="GitHub" />
        <SocialLink
          href="https://www.linkedin.com/in/itsfaqih"
          icon={LinkedinLogoIcon}
          label="LinkedIn"
        />
      </div>
    </Showcase>
  ),
};

export const ExternalLinks: Story = {
  render: () => (
    <Showcase>
      <p>
        Read the <ExternalLink href="https://react.dev">React documentation</ExternalLink> for more
        details.
      </p>
    </Showcase>
  ),
};

export const RuleOfThumbCarousel: Story = {
  name: "Rule of thumb carousel",
  parameters: {
    ...tanstackRouterParameters,
    layout: "fullscreen",
  },
  render: () => (
    <Showcase style={{ minHeight: 500, overflow: "hidden", padding: "32px 0", width: "100%" }}>
      <RuleOfThumbsCarousel />
    </Showcase>
  ),
};

export const TableOfContentsStory: Story = {
  name: "Table of contents",
  render: () => (
    <Showcase style={{ display: "grid", gap: 32, gridTemplateColumns: "180px 1fr", width: 680 }}>
      <TableOfContents />
      <article>
        <h2 id="overview">Overview</h2>
        <p style={{ color: "var(--muted-foreground)", margin: "8px 0 32px" }}>
          A page outline is discovered from the headings in the current document.
        </p>
        <h3 id="details">Details</h3>
        <p style={{ color: "var(--muted-foreground)", marginTop: 8 }}>
          Selecting a heading updates the active item.
        </p>
      </article>
    </Showcase>
  ),
};

export const CounterStory: Story = {
  name: "Blog counter",
  render: () => (
    <Showcase>
      <Counter />
    </Showcase>
  ),
};
