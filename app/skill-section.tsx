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

register();

export default function SkillSection() {
  return (
    <section className="mt-20">
      <SectionTitle title="Skills" />
      <div className="mt-8 [&>swiper-container>swiper-slide]:w-auto">
        <swiper-container
          slides-per-view="auto"
          grab-cursor
          free-mode
          space-between={48}
        >
          <swiper-slide>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={typescriptIcon}
            />
          </swiper-slide>
          <swiper-slide>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={reactIcon}
            />
          </swiper-slide>
          <swiper-slide>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={astroIcon}
            />
          </swiper-slide>
          <swiper-slide>
            <Icon
              className="text-4xl transition grayscale hover:grayscale-0"
              icon={tailwindcssIcon}
            />
          </swiper-slide>
          <swiper-slide>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={laravelIcon}
            />
          </swiper-slide>
          <swiper-slide>
            <Icon
              className="text-4xl transition grayscale hover:grayscale-0"
              icon={phpIcon}
            />
          </swiper-slide>
          <swiper-slide>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={mysqlIcon}
            />
          </swiper-slide>
          <swiper-slide>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={adonisJsIcon}
            />
          </swiper-slide>
          <swiper-slide>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={nextjsIcon}
            />
          </swiper-slide>
          <swiper-slide>
            <Icon
              className="text-5xl transition grayscale hover:grayscale-0"
              icon={figmaIcon}
            />
          </swiper-slide>
        </swiper-container>
      </div>
    </section>
  );
}
