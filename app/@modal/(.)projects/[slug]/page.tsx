import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { ProjectModal } from "@/components/project-modal";
import { Icon } from "@/components/icons";
import { toolToIcon } from "@/utils/project.util";
import { MotionLi } from "@/components/motion";
import { scaleHoverVariants } from "@/framer-motion/scale-hover";

type ProjectModalProps = {
  params: {
    slug: string;
  };
};

export default function ProjectModalPage({ params }: ProjectModalProps) {
  const project = projects.find((p) => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <ProjectModal
      title={project.title}
      slug={project.slug}
      thumbnail={project.thumbnail}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-gray-500 md:text-lg">Description</h2>
            <p className="mt-1 text-gray-700 md:text-lg">
              {project.description}
            </p>
          </div>
          <div>
            <h2 className="text-gray-500 md:text-lg">Work Type</h2>
            <p className="mt-1 text-gray-700 md:text-lg">
              {project.jobs.join(", ")}
            </p>
          </div>
          <div>
            <h2 className="text-gray-500 md:text-lg">Tools Used</h2>
            <ul className="flex items-center gap-4 mt-2 text-gray-700 md:text-lg">
              {project.tools.map((tool) => (
                <MotionLi
                  key={tool}
                  variants={scaleHoverVariants({ scale: 1.3 })}
                  whileHover="hover"
                  title={tool}
                  className="group"
                >
                  <Icon
                    icon={toolToIcon(tool)}
                    className="text-xl md:text-2xl grayscale group-hover:grayscale-0"
                  />
                </MotionLi>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-16">
          <a
            href={project.url}
            target="_blank"
            className="flex items-center gap-2 text-gray-700 md:text-lg"
          >
            View Live{" "}
            <Icon icon="tabler:external-link" className="text-lg md:text-xl" />
          </a>
        </div>
      </div>
    </ProjectModal>
  );
}
