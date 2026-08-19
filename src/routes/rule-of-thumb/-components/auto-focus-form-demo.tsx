import { AnimationDemo } from "../../../components/animation-demo";
import { AutoFocusFormDemoContent } from "./auto-focus-form-demo-content";

export function AutoFocusFormDemo() {
  return (
    <AnimationDemo duration={5000} masterAnimationName="demo-cursor-move">
      <AutoFocusFormDemoContent />
    </AnimationDemo>
  );
}
