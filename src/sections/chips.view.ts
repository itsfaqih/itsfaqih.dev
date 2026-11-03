import { cx } from "../cx";
import { chips } from "./chips.css";

/** A topic chip's count, brighter on the pressed chip. The first frame renders it, the client updates it. */
export const countClass = (on: boolean) => cx(chips.count, on && chips.countOn);
