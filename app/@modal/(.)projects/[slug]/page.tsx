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
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg text-gray-500">Description</h2>
            <p className="mt-1 text-lg text-gray-700">{project.description}</p>
          </div>
          <div>
            <h2 className="text-lg text-gray-500">Work Type</h2>
            <p className="mt-1 text-lg text-gray-700">
              {project.jobs.join(", ")}
            </p>
          </div>
          <div>
            <h2 className="text-lg text-gray-500">Tools Used</h2>
            <ul className="flex items-center gap-4 mt-2 text-lg text-gray-700">
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
                    className="text-2xl grayscale group-hover:grayscale-0"
                  />
                </MotionLi>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-auto">
          <a
            href={project.url}
            target="_blank"
            className="flex items-center gap-2 text-lg text-gray-700"
          >
            View Live <Icon icon="tabler:external-link" className="text-xl" />
          </a>
        </div>
      </div>
    </ProjectModal>
  );
}
