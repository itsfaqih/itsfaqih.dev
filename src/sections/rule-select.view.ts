import { chips } from "./chips.css";
import { cx } from "../cx";
import { styles } from "./rule-select.css";
/** A topic chip's count, brighter on the pressed chip. rule-select.astro renders it, the client updates it. */
export const countClass = (on: boolean) => cx(chips.count, on && chips.countOn);

/** The beam carries the picked rule's hue, and no light while none is picked. */
export const beamClass = (hued: boolean) => cx(styles.beam, hued && styles.beamHue);
