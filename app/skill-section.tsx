"use client";

import { register } from "swiper/element";
import {
  Icon,
  adonisJsIcon,
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
      <div className="mt-8 grayscale [&>swiper-container>swiper-slide]:w-auto">
        <swiper-container
          slides-per-view="auto"
          free-mode={true}
          space-between={48}
        >
          <swiper-slide>
            <Icon className="text-5xl" icon={typescriptIcon} />
          </swiper-slide>
          <swiper-slide>
            <Icon className="text-5xl" icon={reactIcon} />
          </swiper-slide>
          <swiper-slide>
            <Icon className="text-4xl" icon={tailwindcssIcon} />
          </swiper-slide>
          <swiper-slide>
            <Icon className="text-5xl" icon={laravelIcon} />
          </swiper-slide>
          <swiper-slide>
            <Icon className="text-4xl" icon={phpIcon} />
          </swiper-slide>
          <swiper-slide>
            <Icon className="text-5xl" icon={mysqlIcon} />
          </swiper-slide>
          <swiper-slide>
            <Icon className="text-5xl" icon={adonisJsIcon} />
          </swiper-slide>
          <swiper-slide>
            <Icon className="text-5xl" icon={nextjsIcon} />
          </swiper-slide>
          <swiper-slide>
            <Icon className="text-5xl" icon={figmaIcon} />
          </swiper-slide>
        </swiper-container>
      </div>
    </section>
  );
}
