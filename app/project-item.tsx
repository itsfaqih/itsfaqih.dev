"use client";

import * as React from "react";
import { MotionDiv, MotionImg } from "@/components/motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { slideInVariants } from "@/framer-motion/slide-in";
import { scaleHoverVariants } from "@/framer-motion/scale-hover";

type ProjectItemProps = {
  project: any;
  index: number;
};

export function ProjectItem({ project, index }: ProjectItemProps) {
  const params = useParams();

  const hide = params.slug === `projects/${project.slug}`;

  if (hide) {
    return null;
  }

  return (
    <MotionDiv
      key={project.slug}
      variants={{
        ...slideInVariants({ from: "bottom", delay: index * 0.05 }),
        ...scaleHoverVariants(),
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-64px" }}
      whileHover="hover"
      layoutId={`${project.slug}-container`}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="block p-4 transition bg-gray-50 rounded-xl hover:bg-gray-100"
      >
        <MotionImg
          src={project.thumbnail.src}
          alt=""
          layoutId={`${project.slug}-thumbnail`}
          className="rounded-lg"
        />
        <div className="flex flex-col gap-1 mt-4">
          <p className="font-medium text-gray-700 md:text-lg">
            {project.title}
          </p>
          <p className="text-gray-500 md:text-lg">{project.jobs.join(", ")}</p>
        </div>
      </Link>
    </MotionDiv>
  );
}
