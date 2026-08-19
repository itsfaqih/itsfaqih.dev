import { AnimationDemo } from "../../../components/animation-demo";
import { FocusTrapDemoContent } from "./focus-trap-demo-content";

export function FocusTrapDemo() {
  return (
    <AnimationDemo duration={4000} masterAnimationName="demo-focus-tab-press">
      <FocusTrapDemoContent />
    </AnimationDemo>
  );
}
