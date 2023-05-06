"use client";

import { register } from "swiper/element";
import { Icon } from "@/components/icons";
import { SectionTitle } from "@/components/section-title";
import { MotionDiv } from "@/components/motion";
import { scaleHoverVariants } from "@/framer-motion/scale-hover";
import { slideInVariants } from "@/framer-motion/slide-in";

register();

const skills = [
  {
    title: "TypeScript",
    icon: "logos:typescript-icon",
  },
  {
    title: "React",
    icon: "logos:react",
  },
  {
    title: "Astro",
    icon: "logos:astro-icon",
  },
  {
    title: "Tailwind CSS",
    icon: "logos:tailwindcss-icon",
  },
  {
    title: "Laravel",
    icon: "logos:laravel",
  },
  {
    title: "MySQL",
    icon: "logos:mysql",
  },
  {
    title: "PHP",
    icon: "logos:php",
  },
  {
    title: "AdonisJS",
    icon: "logos:adonisjs-icon",
  },
  {
    title: "Figma",
    icon: "logos:figma",
  },
  {
    title: "Next.js",
    icon: "logos:nextjs-icon",
  },
];

export default function SkillSection() {
  return (
    <section className="mt-20">
      <MotionDiv
        variants={slideInVariants()}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-64px" }}
      >
        <SectionTitle title="Skills" />
      </MotionDiv>
      <div className="mt-8 [&>swiper-container>swiper-slide]:w-auto">
        <swiper-container
          slides-per-view="auto"
          grab-cursor
          free-mode
          space-between={48}
          class="p-4 -m-4"
        >
          {skills.map((skill, index) => (
            <SwiperSlide key={skill.title} title={skill.title} index={index}>
              <Icon
                icon={skill.icon}
                className="text-5xl transition grayscale group-hover:grayscale-0"
              />
            </SwiperSlide>
          ))}
        </swiper-container>
      </div>
    </section>
  );
}

type SwiperSlideProps = {
  index: number;
  title: string;
  children: React.ReactNode;
};

function SwiperSlide({ index, title, children }: SwiperSlideProps) {
  return (
    <swiper-slide>
      <MotionDiv
        variants={{
          ...slideInVariants({ from: "bottom", delay: index * 0.05 }),
          ...scaleHoverVariants({ scale: 1.3 }),
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-64px" }}
        whileHover="hover"
        title={title}
        className="flex items-center justify-center w-14 h-14 group"
      >
        {children}
      </MotionDiv>
    </swiper-slide>
  );
}
