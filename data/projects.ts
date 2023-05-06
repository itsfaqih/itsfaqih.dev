import fama from "@/assets/fama.png";
import phpid from "@/assets/phpid.png";
import ruineui from "@/assets/ruineui.png";
import ruinedev from "@/assets/ruinedev.png";
import schemata from "@/assets/schemata.png";
import indexkos from "@/assets/indexkos.png";

export const projects = [
  {
    title: "Schemata",
    slug: "schemata",
    description: "Developer-friendly Entity Relationship Diagram Builder",
    jobs: ["Frontend"],
    tools: ["typescript", "react"] as const,
    url: "https://schemata.ruine.app",
    thumbnail: schemata,
  },
  {
    title: "PHPID Learning",
    slug: "phpid-learning",
    description: "PHPID Learning website redesign",
    jobs: ["UI Design"],
    tools: ["figma"] as const,
    url: "https://www.figma.com/file/qNIg0A9h7PnrFdOVSBbMEH/PHPID-Online-Learning-Redesign?t=G9iKlwb4iiNlrIeR-6",
    thumbnail: phpid,
  },
  {
    title: "Fama",
    slug: "fama",
    description: "TailwindCSS based personal branding template",
    jobs: ["UI Design", "Frontend"],
    tools: ["typescript", "react", "figma"] as const,
    url: "https://github.com/itsfaqih/fama",
    thumbnail: fama,
  },
  {
    title: "ruine.dev Website",
    slug: "ruine-dev-website",
    description: "Website agency landing page",
    jobs: ["UI Design", "Frontend"],
    tools: ["typescript", "react"] as const,
    url: "https://ruine.dev",
    thumbnail: ruinedev,
  },
  {
    title: "ruine.UI Dashboard",
    slug: "ruine-ui-dashboard",
    description: "Admin dashboard template",
    jobs: ["UI Design", "Frontend"],
    tools: ["astro"] as const,
    url: "https://ruine-dashboard.pages.dev/",
    thumbnail: ruineui,
  },
  {
    title: "IndexKos App",
    slug: "indexkos-app",
    description: "Boarding house note app",
    jobs: ["UI Design"],
    tools: ["figma"] as const,
    url: "https://www.figma.com/file/ERVBkrAlNIMhZM075YA1uT/IndexKos?node-id=301%3A1073&t=zDSf0GIKzVZHO9ei-1",
    thumbnail: indexkos,
  },
];
