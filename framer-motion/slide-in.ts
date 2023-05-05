import { Variants } from "framer-motion";

type SlideInVariantsOptions = {
  delay?: number;
  from?: "left" | "right" | "bottom";
};

export function slideInVariants(
  options: SlideInVariantsOptions = { from: "left" }
): Variants {
  return {
    hidden: {
      opacity: 0,
      x:
        (options.from === "left" && -20) ||
        (options.from === "right" && 20) ||
        undefined,
      y: (options.from === "bottom" && 20) || undefined,
      transition: { type: "tween", duration: 0.25, delay: options.delay },
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { type: "tween", duration: 0.25, delay: options.delay },
    },
  };
}
