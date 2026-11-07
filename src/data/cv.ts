import { LINKS, SITE_ORIGIN } from "../seo";

/** The PDFs /cv offers, which the build prints from the page itself (scripts/cv/export-pdf.ts). */
export const CV_PDF = {
  design: { href: "/faqih-muntashir-cv.pdf", fileName: "CV - Faqih Muntashir.pdf" },
  ats: { href: "/faqih-muntashir-cv-ats.pdf", fileName: "CV - Faqih Muntashir (ATS).pdf" },
};

/** The CV shown at /cv. Its projects are off the page for now. */

export const CV = {
  name: "Muhammad Faqih Muntashir",
  headline: "Full Stack Engineer",
  location: "Yogyakarta, Indonesia",
  email: LINKS.email,
  links: [
    { label: "Portfolio", href: `${SITE_ORIGIN}/` },
    { label: "Medium", href: LINKS.medium },
    { label: "Dribbble", href: LINKS.dribbble },
    { label: "GitHub", href: LINKS.github },
    { label: "LinkedIn", href: LINKS.linkedin },
  ],
  summary: [
    "Full-stack engineer based in Yogyakarta, Indonesia with 5+ years of professional experience building web products across healthcare, SaaS, and internal tooling. Currently building healthcare software at EvidenceCare for the US market.",
    "At EvidenceCare, spearheaded an MCP and a linter that cut component development time by 66%, helped reduce deployment times from hours to minutes, standardized TypeScript tooling, reduced Docker image size by 30% for select projects, and automated database permission checks.",
    "Creator of Fama, an open source portfolio template with 230+ GitHub stars and 48 forks, and builder of Schemata, a drag-and-drop ERD builder for visual database schema design. Experience also includes leading cross-functional product teams of up to 10 engineers and designers, recognition as a top performer at Jatis Mobile in Q4 2022, and contributing to the Indonesian PHP community through UI design work for PHPID Learning.",
  ],
  experience: [
    {
      title: "Software Engineer at EvidenceCare, Sep 2024 - Present",
      points: [
        "Spearheaded the design and development of an MCP and a linter; the MCP cut development time for a single project component by 66%, and the broader project is projected to save approximately $15K per month.",
        "Reduced deployment time from several hours to minutes by collaborating on database migration optimization for both fresh environments and existing databases.",
        "Standardized modern tooling across TypeScript codebases, improving startup time (ts-node to tsx), build performance (CRA to Vite), linting and formatting (Prettier/ESLint to Biome), testing (Jest to Vitest), type safety (Joi to Zod), install size, and bundle size.",
        "Reduced Docker image size by 30% for select projects by introducing an optimized image build process.",
        "Architected solutions to support multi-tenancy on a single RDS instance and to enable PHI-safe logging.",
        "Reduced runtime issues by building an automated PR reviewer that validates database permissions before merge.",
      ],
    },
    {
      title: "Full Stack Engineer at Vestis Labs, Sep 2023 - Sep 2024",
      points: [
        "Overhauled the website's UI design to improve consistency and clarity.",
        "Designed the data model for the digital ID website and its drag-and-drop builder.",
        "Reduced API calls and improved page load times by implementing in-memory caching with React Query and HTTP caching.",
        "Simplified more than 80% of the code structure by co-locating related code and removing unnecessary abstractions.",
        "Improved image annotator performance and UX by moving rendering from React to direct DOM manipulation and adding mobile compatibility.",
      ],
    },
    {
      title: "Full Stack Engineer at Jatis Mobile, Sep 2022 - Aug 2023",
      points: [
        "Joined as a Web Designer and grew into a Full Stack Engineer role by taking on broader product and engineering responsibilities.",
        "Eliminated potential server-side chatbot costs by building a client-side chatbot from scratch with XState to simulate a WhatsApp-style experience.",
        "Designed the entire UI and built the chatbot flow builder from scratch through deployment using React Flow, Tailwind CSS, and AdonisJS.",
        "Led a team of 4 developers to deliver one of the company's main products.",
        "Recognized as one of the top performers in Q4 2022 among hundreds of colleagues.",
      ],
    },
    {
      title: "Founding Project Manager at PT Rapidev Inovasi Nusantara, Jan 2022 - Aug 2022",
      points: [
        "Improved team workflow by creating centralized, detailed documentation.",
        "Managed a 10-person product team delivering projects for 3 early-stage startups.",
        "Designed user journeys, dashboards, and database structures for each application developed by the company.",
        "Mentored developers and designers through code and design review feedback to improve delivery quality.",
      ],
    },
    {
      title: "Founding Full Stack Engineer at PT Rapidev Inovasi Nusantara, Dec 2021 - Aug 2022",
      points: [
        "Enabled payment processing by integrating Xendit and Midtrans payment gateways.",
        "Reduced dashboard load time by 80% by implementing eager loading to solve N+1 queries and moving pagination from client side to server side.",
        "Improved user experience by reducing the steps required to update hotel availability and pricing data by 66%.",
      ],
    },
    {
      title: "Frontend Engineer at Mitra Integrasi Informatika, Sep 2020 - Feb 2021",
      points: [
        "Implemented JWT authentication for multiple projects.",
        "Performed code reviews and managed repositories.",
        "Designed admin dashboard UI using Figma.",
      ],
    },
  ],
  projects: [
    {
      title: "Schemata - Developer-Friendly Entity Relationship Diagram Builder",
      details: [
        {
          label: "Description",
          text: "Visual tool for creating and managing entity relationship diagrams with a drag-and-drop interface.",
        },
        {
          label: "Role",
          text: "Front End Engineer",
        },
        {
          label: "Tech",
          text: "React, Tailwind CSS",
        },
      ],
      link: "https://schemata.ruine.app/",
    },
    {
      title: "ruine UI Dashboard - Admin Dashboard Template",
      details: [
        {
          label: "Description",
          text: "Responsive and accessible admin dashboard template built for modern product interfaces.",
        },
        {
          label: "Role",
          text: "Front End Engineer, UI Designer",
        },
        {
          label: "Tech",
          text: "Astro, Tailwind CSS",
        },
      ],
      link: "https://github.com/ruine-dev/ruine-ui-dashboard",
    },
    {
      title: "Fama",
      details: [
        {
          label: "Description",
          text: "Open source personal branding and portfolio template focused on polished presentation and reuse.",
        },
        {
          label: "Role",
          text: "Front End Engineer, UI Designer",
        },
        {
          label: "Tech",
          text: "React, Framer Motion, Tailwind CSS",
        },
      ],
      link: "https://github.com/itsfaqih/fama",
    },
    {
      title: "PHPID Learning Web Design",
      details: [
        {
          label: "Description",
          text: "Web design for the Indonesian PHP community's online learning platform, with the design implemented in production.",
        },
        {
          label: "Role",
          text: "UI Designer",
        },
        {
          label: "Tech",
          text: "Figma",
        },
      ],
      link: "https://www.figma.com/design/qNIg0A9h7PnrFdOVSBbMEH/PHPID-Online-Learning-Redesign?node-id=0-1&t=PcPvOnrKzLginYqa-1",
    },
    {
      title: "Indonesian ReactJS Community Landing Page Design",
      details: [
        {
          label: "Description",
          text: "Landing page design concept for the Indonesian ReactJS community.",
        },
        {
          label: "Role",
          text: "UI Designer",
        },
        {
          label: "Tech",
          text: "Figma",
        },
      ],
      link: "https://www.figma.com/design/i7F9VnroI83Hl01tO0k1t3/React-ID-Website-Revamp?node-id=1-3&t=s6x8aMBAQS10l8d3-1",
    },
  ],
  skills: "Front-end, Back-end, Full-stack, DevOps, UI Design, Design Engineering",
  stack: [
    {
      label: "Languages",
      text: "TypeScript, PHP, HTML, CSS",
    },
    {
      label: "Core Libraries and Frameworks",
      text: "Effect, React, Vue, Next.js, TanStack Start, TanStack Router, TanStack Query, Tailwind CSS, PostCSS, Base UI, Radix UI, Shadcn UI, Phosphor Icons, InertiaJS, Redux, XState, Zustand",
    },
    {
      label: "Backend and Data",
      text: "Node.js, Express, Laravel, AdonisJS, Prisma, Drizzle, WebSocket, MySQL, MariaDB, PostgreSQL, MongoDB, Redis, tRPC, Trigger.dev",
    },
    {
      label: "Testing and Quality",
      text: "Vitest, Jest, Playwright, MSW, Biome, Oxlint, Oxfmt, Storybook",
    },
    {
      label: "DevOps and Infrastructure",
      text: "Docker, Git, Vite, Bun, Apache, NGINX, IIS, Amazon Route 53, Amazon CodeBuild, Amazon CodePipeline, Elastic Container Registry, Amazon Web Application Firewall, Amazon Simple Storage Service",
    },
    {
      label: "Design",
      text: "Figma",
    },
    {
      label: "Email and Templating Tools",
      text: "Mailjet, Maizzle, EJS, Amazon Simple Email Service, Amazon Simple Notification Service",
    },
    {
      label: "AI tools",
      text: "Claude Code, OpenAI Codex, OpenRouter, Hermes, OpenCode",
    },
  ],
  education: {
    title: "University of AMIKOM Yogyakarta, 2018 - 2021",
    detail: "Associate Degree in Informatics - GPA 3.97/4.00",
  },
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
