import { SectionTitle } from "@/components/section-title";
import dynamic from "next/dynamic";
import { Icon } from "@/components/icons";
import { slideInVariants } from "@/framer-motion/slide-in";
import { scaleHoverVariants } from "@/framer-motion/scale-hover";
import { MotionDiv, MotionH1, MotionLi, MotionP } from "@/components/motion";
import { blogs } from "@/data/blogs";
import { socials } from "@/data/socials";
import { ProjectSection } from "./project-section";

const SkillSection = dynamic(() => import("./skill-section"), {
  ssr: false,
});

export default function Home({ params }: { params: any }) {
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
              {socials.map((social, index) => (
                <MotionLi
                  key={social.title}
                  variants={{
                    ...slideInVariants({ from: "right", delay: index * 0.05 }),
                    ...scaleHoverVariants({ scale: 1.3 }),
                  }}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <a
                    href={social.url}
                    target="_blank"
                    title={social.title}
                    className="transition hover:grayscale-0 grayscale"
                  >
                    <Icon className="text-lg md:text-xl" icon={social.icon} />
                  </a>
                </MotionLi>
              ))}
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

        <ProjectSection className="mt-10 md:mt-20" />

        <SkillSection />

        <section className="mt-24">
          <MotionDiv
            variants={slideInVariants()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-64px" }}
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
                viewport={{ once: true, margin: "-64px" }}
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
