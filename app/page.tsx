import { SectionTitle } from "@/components/section-title";
import {
  Icon,
  laravelIcon,
  reactIcon,
  tailwindcssIcon,
} from "@/components/icons";
import Image from "next/image";
import fama from "@/assets/fama.png";
import phpid from "@/assets/phpid.png";
import ruinedev from "@/assets/ruinedev.png";
import schemata from "@/assets/schemata.png";

const blogs = [
  {
    title: "Jangan Langsung Consume Data Eksternal pada Component React",
    date: "27 Februari 2023",
    url: "https://diskusi.tech/itsfaqih/jangan-langsung-consume-data-eksternal-pada-component-react-279j",
  },
  {
    title: "Membentuk Mental Model Pemrograman Yang Sebenar-benarnya",
    date: "16 Januari 2022",
    url: "https://github.com/itsfaqih/fundamental-pemrograman/blob/main/membentuk-pola-pikir/membentuk-mental-model-pemrograman-yang-sebenar-benarnya.md",
  },
  {
    title: "Miskonsepsi Kemandirian dalam Pemrograman",
    date: "8 Oktober 2021",
    url: "https://github.com/itsfaqih/fundamental-pemrograman/blob/main/membentuk-pola-pikir/miskonsepsi-kemandirian-dalam-pemrograman.md",
  },
  {
    title: "Mungkin Pemrograman Bukan Bidang yang Kamu Cari",
    date: "2 Oktober 2021",
    url: "https://github.com/itsfaqih/fundamental-pemrograman/blob/main/membentuk-pola-pikir/mungkin-pemrograman-bukan-bidang-yang-kamu-cari.md",
  },
];

const projects = [
  {
    title: "Schemata",
    description: "Developer-friendly Entity Relationship Diagram Builder",
    jobs: ["Frontend"],
    url: "https://schemata.ruine.app",
    thumbnail: schemata,
  },
  {
    title: "PHPID Learning",
    description: "PHPID Learning website redesign",
    jobs: ["UI Design"],
    url: "https://www.figma.com/file/qNIg0A9h7PnrFdOVSBbMEH/PHPID-Online-Learning-Redesign?t=G9iKlwb4iiNlrIeR-6",
    thumbnail: phpid,
  },
  {
    title: "Fama",
    description: "TailwindCSS based personal branding template",
    jobs: ["UI Design", "Frontend"],
    url: "https://github.com/itsfaqih/fama",
    thumbnail: fama,
  },
  {
    title: "ruine.dev Website",
    description: "Website agency landing page",
    jobs: ["UI Design", "Frontend"],
    url: "https://ruine.dev",
    thumbnail: ruinedev,
  },
];

export default function Home() {
  return (
    <main>
      <div className="container py-20 mx-auto">
        <section>
          <h1 className="text-3xl font-medium tracking-tight text-gray-700">
            Faqih Muntashir
          </h1>
          <div className="flex flex-col gap-3 mt-8 text-3xl text-gray-500">
            <p>
              Just your typical{" "}
              <span className="text-gray-700">10X Engineer</span> wannabe
            </p>
            <p>
              who cares about <span className="text-gray-700">developer</span>{" "}
              and <span className="text-gray-700">user experience</span>.
            </p>
          </div>
        </section>

        <section className="mt-20">
          <SectionTitle title="Projects" />
          <ul className="grid grid-cols-3 gap-8 mt-10">
            {projects.map((project) => (
              <li key={project.url}>
                <a
                  href={project.url}
                  target="_blank"
                  className="block p-4 transition bg-gray-50 rounded-xl hover:bg-gray-100"
                >
                  <Image
                    src={project.thumbnail}
                    alt=""
                    className="rounded-lg"
                  />
                  <div className="flex flex-col gap-1 mt-4">
                    <p className="text-lg font-medium text-gray-700">
                      {project.title}
                    </p>
                    <p className="text-lg text-gray-500">
                      {project.jobs.join(", ")}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20">
          <SectionTitle title="Tech Stack" />
          <ul className="flex items-center gap-12 mt-8 grayscale">
            <li>
              <Icon className="text-5xl" icon={reactIcon} />
            </li>
            <li>
              <Icon className="text-4xl" icon={tailwindcssIcon} />
            </li>
            <li>
              <Icon className="text-5xl" icon={laravelIcon} />
            </li>
          </ul>
        </section>
        <section className="mt-20">
          <SectionTitle title="Writing" />
          <ul className="flex flex-col gap-6 mt-6 text-lg">
            {blogs.map((blog) => (
              <li key={blog.title} className="flex flex-col gap-1">
                <a
                  href={blog.url}
                  target="_blank"
                  className="font-medium text-gray-500 transition hover:text-gray-700"
                >
                  {blog.title}
                </a>
                <p className="text-gray-400">{blog.date}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
