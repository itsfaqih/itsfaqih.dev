import { cx } from "@/stylex";
import * as React from "react";
import {
  buttonClassNames,
  type ButtonPadding,
  type ButtonVariant,
} from "./button-styles";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
  isPending?: boolean;
  variant?: ButtonVariant;
  padding?: ButtonPadding;
}

export function Button({
  className,
  children,
  variant,
  leadingIcon,
  trailingIcon,
  padding,
  isPending = false,
  ref,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={isPending || disabled}
      className={buttonClassNames({
        variant,
        className,
        padding,
        leadingIcon,
        trailingIcon,
        isPending,
      })}
      {...props}
    >
      <span className={cx("relative z-1 flex items-center gap-2")}>
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
    </button>
  );
}
