import { AnimationDemo } from "../../../components/animation-demo";
import { FormDialogDemoContent } from "./form-dialog-demo-content";

export function FormDialogDemo() {
  return (
    <AnimationDemo duration={3000} masterAnimationName="demo-form-cursor">
      <FormDialogDemoContent />
    </AnimationDemo>
  );
}
