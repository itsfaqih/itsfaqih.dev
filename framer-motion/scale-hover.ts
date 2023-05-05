import { Variants } from "framer-motion";

type ScaleHoverVariantsOptions = {
  scale?: number;
};

export function scaleHoverVariants(
  options: ScaleHoverVariantsOptions = { scale: 1.05 }
): Variants {
  return {
    hover: {
      scale: options.scale,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };
}
