import { AnimationDemo } from "../../../../components/animation-demo";
import { InteractiveDisabledDemoContent } from "./interactive-disabled-demo-content";

export function InteractiveDisabledDemo() {
  return (
    <AnimationDemo duration={4000} masterAnimationName="disabled-demo-cursor-move">
      <InteractiveDisabledDemoContent />
    </AnimationDemo>
  );
}