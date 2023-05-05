import { SectionTitle } from "@/components/section-title";
import Image from "next/image";
import fama from "@/assets/fama.png";
import phpid from "@/assets/phpid.png";
import ruineui from "@/assets/ruineui.png";
import ruinedev from "@/assets/ruinedev.png";
import schemata from "@/assets/schemata.png";
import indexkos from "@/assets/indexkos.png";
import dynamic from "next/dynamic";
import {
  Icon,
  githubIcon,
  linkedinIcon,
  twitterIcon,
} from "@/components/icons";
import { slideInVariants } from "@/framer-motion/slide-in";
import { scaleHoverVariants } from "@/framer-motion/scale-hover";
import {
  MotionA,
  MotionDiv,
  MotionH1,
  MotionLi,
  MotionP,
  MotionUl,
} from "@/components/motion";

const SkillSection = dynamic(() => import("./skill-section"), {
  ssr: false,
});

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
  {
    title: "Membuat Otentikasi JWT dengan PHP Native",
    date: "16 November 2020",
    url: "https://medium.com/@itsfaqih/membuat-otentikasi-jwt-dengan-php-native-a9d080953358",
  },
  {
    title: "Apa itu JWT (JSON Web Token)?",
    date: "14 November 2020",
    url: "https://medium.com/@itsfaqih/apa-itu-jwt-json-web-token-63407936da10",
  },
  {
    title: "Penerapan Sistem Grid Responsive dengan Flexbox",
    date: "13 Juni 2020",
    url: "https://medium.com/@itsfaqih/penerapan-sistem-grid-responsive-dengan-flexbox-c479c84be129",
  },
  {
    title: "Memahami Satuan Persen (%) dalam CSS",
    date: "11 Juni 2020",
    url: "https://medium.com/@itsfaqih/memahami-satuan-persen-dalam-css-12479cba1c32",
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
  {
    title: "ruine.UI Dashboard",
    description: "Admin dashboard template",
    jobs: ["UI Design", "Frontend"],
    url: "https://ruine-dashboard.pages.dev/",
    thumbnail: ruineui,
  },
  {
    title: "IndexKos App",
    description: "Boarding house note app",
    jobs: ["UI Design"],
    url: "https://www.figma.com/file/ERVBkrAlNIMhZM075YA1uT/IndexKos?node-id=301%3A1073&t=zDSf0GIKzVZHO9ei-1",
    thumbnail: indexkos,
  },
];

export default function Home() {
  return (
    <main>
      <div className="container py-10 mx-auto lg:py-20">
        <section>
          <div className="flex items-center justify-between">
            <MotionH1
              variants={slideInVariants()}
              initial="hidden"
              animate="visible"
              className="text-xl font-medium tracking-tight text-gray-700 md:text-3xl"
            >
              Faqih Muntashir
            </MotionH1>
            <ul className="flex items-center gap-6 md:gap-8">
              <MotionLi
                variants={{
                  ...slideInVariants({ from: "right", delay: 0.1 }),
                  ...scaleHoverVariants({ scale: 1.3 }),
                }}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <a
                  href="https://twitter.com/itsfaqih_"
                  target="_blank"
                  className="transition hover:grayscale-0 grayscale"
                >
                  <Icon className="text-lg md:text-xl" icon={twitterIcon} />
                </a>
              </MotionLi>
              <MotionLi
                variants={{
                  ...slideInVariants({ from: "right", delay: 0.15 }),
                  ...scaleHoverVariants({ scale: 1.3 }),
                }}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <a
                  href="https://github.com/itsfaqih"
                  target="_blank"
                  className="transition hover:grayscale-0 grayscale"
                >
                  <Icon className="text-lg md:text-xl" icon={githubIcon} />
                </a>
              </MotionLi>
              <MotionLi
                variants={{
                  ...slideInVariants({ from: "right", delay: 0.2 }),
                  ...scaleHoverVariants({ scale: 1.3 }),
                }}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <a
                  href="https://linkedin.com/in/itsfaqih"
                  target="_blank"
                  className="transition hover:grayscale-0 grayscale"
                >
                  <Icon className="text-lg md:text-xl" icon={linkedinIcon} />
                </a>
              </MotionLi>
            </ul>
          </div>
          <MotionP
            variants={slideInVariants({ delay: 0.1 })}
            initial="hidden"
            animate="visible"
            className="mt-8 text-xl leading-relaxed text-gray-500 md:leading-relaxed md:text-3xl"
          >
            Just your typical{" "}
            <span className="text-gray-700">10X Engineer</span> wannabe{" "}
            <br className="hidden md:block" />
            who cares about <span className="text-gray-700">
              developer
            </span> and <span className="text-gray-700">user experience</span>.
          </MotionP>
        </section>

        <section className="mt-10 md:mt-20">
          <MotionDiv
            variants={slideInVariants()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "48px" }}
          >
            <SectionTitle title="Projects" />
          </MotionDiv>
          <ul className="grid gap-8 mt-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <MotionLi
                variants={{
                  ...slideInVariants({ from: "bottom", delay: i * 0.05 }),
                  ...scaleHoverVariants(),
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "48px" }}
                whileHover="hover"
                key={project.url}
              >
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
                    <p className="font-medium text-gray-700 md:text-lg">
                      {project.title}
                    </p>
                    <p className="text-gray-500 md:text-lg">
                      {project.jobs.join(", ")}
                    </p>
                  </div>
                </a>
              </MotionLi>
            ))}
          </ul>
        </section>

        <SkillSection />

        <section className="mt-24">
          <MotionDiv
            variants={slideInVariants()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "48px" }}
          >
            <SectionTitle title="Writing" />
          </MotionDiv>
          <ul className="grid gap-6 mt-6 md:text-lg lg:grid-cols-2">
            {blogs.map((blog, i) => (
              <MotionLi
                key={blog.title}
                variants={slideInVariants({ delay: i * 0.05 })}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "48px" }}
                className="flex flex-col gap-1"
              >
                <a
                  href={blog.url}
                  target="_blank"
                  className="font-medium text-gray-500 transition hover:text-gray-700"
                >
                  {blog.title}
                </a>
                <p className="text-gray-400">{blog.date}</p>
              </MotionLi>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
