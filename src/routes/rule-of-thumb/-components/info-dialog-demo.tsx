import { AnimationDemo } from "../../../components/animation-demo";
import { InfoDialogDemoContent } from "./info-dialog-demo-content";

export function InfoDialogDemo() {
  return (
    <AnimationDemo duration={3000} masterAnimationName="demo-info-cursor">
      <InfoDialogDemoContent />
    </AnimationDemo>
  );
}
