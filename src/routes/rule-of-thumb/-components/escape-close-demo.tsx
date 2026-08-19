import { AnimationDemo } from "../../../components/animation-demo";
import { EscapeCloseDemoContent } from "./escape-close-demo-content";

export function EscapeCloseDemo() {
  return (
    <AnimationDemo duration={2500} masterAnimationName="demo-esc-key">
      <EscapeCloseDemoContent />
    </AnimationDemo>
  );
}
