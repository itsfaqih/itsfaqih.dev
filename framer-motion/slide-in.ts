import { Variants } from "framer-motion";

type SlideInVariantsOptions = {
  delay?: number;
  from?: "left" | "right" | "bottom";
  duration?: number;
};

export function slideInVariants(
  options: SlideInVariantsOptions = { from: "left", duration: 0.25 }
): Variants {
  return {
    hidden: {
      opacity: 0,
      x:
        (options.from === "left" && -40) ||
        (options.from === "right" && 40) ||
        undefined,
      y: (options.from === "bottom" && 40) || undefined,
      transition: {
        type: "tween",
        duration: options.duration,
        delay: options.delay,
      },
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "tween",
        duration: options.duration,
        delay: options.delay,
      },
    },
  };
}
