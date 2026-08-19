import { AnimationDemo } from "../../../components/animation-demo";
import { DiscardConfirmDemoContent } from "./discard-confirm-demo-content";

export function DiscardConfirmDemo() {
  return (
    <AnimationDemo duration={8000} masterAnimationName="demo-discard-cursor">
      <DiscardConfirmDemoContent />
    </AnimationDemo>
  );
}
