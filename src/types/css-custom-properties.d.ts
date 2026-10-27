import "react";

// Lets style props carry CSS custom properties such as { "--c": "var(--ux)" }.
declare module "react" {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
