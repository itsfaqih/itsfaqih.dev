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

register();

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
          <SwiperSlide index={0}>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={typescriptIcon}
            />
          </SwiperSlide>
          <SwiperSlide index={1}>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={reactIcon}
            />
          </SwiperSlide>
          <SwiperSlide index={2}>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={astroIcon}
            />
          </SwiperSlide>
          <SwiperSlide index={3}>
            <Icon
              className="text-4xl transition grayscale hover:grayscale-0"
              icon={tailwindcssIcon}
            />
          </SwiperSlide>
          <SwiperSlide index={4}>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={laravelIcon}
            />
          </SwiperSlide>
          <SwiperSlide index={5}>
            <Icon
              className="text-4xl transition grayscale hover:grayscale-0"
              icon={phpIcon}
            />
          </SwiperSlide>
          <SwiperSlide index={6}>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={mysqlIcon}
            />
          </SwiperSlide>
          <SwiperSlide index={7}>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={adonisJsIcon}
            />
          </SwiperSlide>
          <SwiperSlide index={8}>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={nextjsIcon}
            />
          </SwiperSlide>
          <SwiperSlide index={9}>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={figmaIcon}
            />
          </SwiperSlide>
        </swiper-container>
      </div>
    </section>
  );
}

type SwiperSlideProps = {
  index: number;
  children: React.ReactNode;
};

function SwiperSlide({ index, children }: SwiperSlideProps) {
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
      >
        {children}
      </MotionDiv>
    </swiper-slide>
  );
}
