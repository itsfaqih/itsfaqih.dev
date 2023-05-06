"use client";

import { register } from "swiper/element";
import {
  Icon,
  adonisJsIcon,
  astroIcon,
  figmaIcon,
  laravelIcon,
  mysqlIcon,
  nextjsIcon,
  phpIcon,
  reactIcon,
  tailwindcssIcon,
  typescriptIcon,
} from "@/components/icons";
import { SectionTitle } from "@/components/section-title";
import { MotionDiv } from "@/components/motion";
import { scaleHoverVariants } from "@/framer-motion/scale-hover";
import { slideInVariants } from "@/framer-motion/slide-in";
import { cn } from "@/libs/cn.lib";

register();

const skills = [
  {
    title: "TypeScript",
    icon: typescriptIcon,
  },
  {
    title: "React",
    icon: reactIcon,
  },
  {
    title: "Astro",
    icon: astroIcon,
  },
  {
    title: "Tailwind CSS",
    icon: tailwindcssIcon,
  },
  {
    title: "Laravel",
    icon: laravelIcon,
  },
  {
    title: "MySQL",
    icon: mysqlIcon,
  },
  {
    title: "PHP",
    icon: phpIcon,
  },
  {
    title: "AdonisJS",
    icon: adonisJsIcon,
  },
  {
    title: "Figma",
    icon: figmaIcon,
  },
  {
    title: "Next.js",
    icon: nextjsIcon,
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
