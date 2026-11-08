// The JSX runtime for the share cards. Satori reads plain `{ type, props }` trees and calls function
// components itself, so JSX only has to build those objects.

export type OgNode = OgElement | string | number | boolean | null | undefined | OgNode[];

/** What a tag or component receives; satori reads the rest (style, attributes) by name. */
type OgProps = { children?: OgNode };

export type OgElement = {
  type: string | ((props: never) => OgNode);
  props: OgProps;
  key: string | null;
};

type Style = { [property: string]: string | number };

export function jsx(type: OgElement["type"], props: OgProps, key?: string): OgElement {
  return { type, props, key: key ?? null };
}

export { jsx as jsxs };

export declare namespace JSX {
  type Element = OgElement;
  interface ElementChildrenAttribute {
    children: OgNode;
  }
  interface IntrinsicAttributes {
    key?: string;
  }
  interface IntrinsicElements {
    [tag: string]: { [attribute: string]: string | number | boolean | Style | OgNode };
  }
}
