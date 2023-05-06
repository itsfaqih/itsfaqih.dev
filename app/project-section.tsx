import { LayoutGroup, MotionDiv } from "@/components/motion";
import { SectionTitle } from "@/components/section-title";
import { projects } from "@/data/projects";
import { slideInVariants } from "@/framer-motion/slide-in";
import { ProjectItem } from "./project-item";

type ProjectSectionProps = {
  className?: string;
};

export function ProjectSection({ className }: ProjectSectionProps) {
  return (
    <section className={className}>
      <MotionDiv
        variants={slideInVariants()}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-64px" }}
      >
        <SectionTitle title="Projects" />
      </MotionDiv>
      <ul className="grid gap-8 mt-6 sm:grid-cols-2 lg:grid-cols-3">
        <LayoutGroup>
          {projects.map((project, i) => (
            <li key={project.slug}>
              <ProjectItem project={project} index={i} />
            </li>
          ))}
        </LayoutGroup>
      </ul>
    </section>
  );
}
