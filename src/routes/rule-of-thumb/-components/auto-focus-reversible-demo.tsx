import { AnimationDemo } from "../../../components/animation-demo";
import { AutoFocusReversibleDemoContent } from "./auto-focus-reversible-demo-content";

export function AutoFocusReversibleDemo() {
  return (
    <AnimationDemo duration={5000} masterAnimationName="demo-approval-cursor">
      <AutoFocusReversibleDemoContent />
    </AnimationDemo>
  );
}
