import type { HTMLAttributes } from "react";
import { getButtonClasses } from "../../../components/button-styles";

export function FakeButton({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={getButtonClasses({ variant: "neutral", className })} {...props}>
      {children}
    </div>
  );
}
