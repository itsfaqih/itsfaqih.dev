import { AnimationDemo } from "../../../components/animation-demo";
import { ScrollLockDemoContent } from "./scroll-lock-demo-content";

export function ScrollLockDemo() {
  return (
    <AnimationDemo duration={4000} masterAnimationName="demo-scroll-cursor">
      <ScrollLockDemoContent />
    </AnimationDemo>
  );
}
