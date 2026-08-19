import { AnimationDemo } from "../../../components/animation-demo";
import { AutoFocusIrreversibleDemoContent } from "./auto-focus-irreversible-demo-content";

export function AutoFocusIrreversibleDemo() {
  return (
    <AnimationDemo duration={5000} masterAnimationName="demo-deletion-cursor">
      <AutoFocusIrreversibleDemoContent />
    </AnimationDemo>
  );
}
