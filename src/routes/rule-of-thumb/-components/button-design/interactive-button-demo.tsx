import { AnimationDemo } from "../../../../components/animation-demo";
import { InteractiveButtonDemoContent } from "./interactive-button-demo-content";

export function InteractiveButtonDemo() {
  return (
    <AnimationDemo duration={6000} masterAnimationName="button-demo-cursor-move">
      <InteractiveButtonDemoContent />
    </AnimationDemo>
  );
}