import { cx } from "../cx";
import { styles } from "./rule-select.css";
/** The beam carries the picked rule's hue, and no light while none is picked. */
export const beamClass = (hued: boolean) => cx(styles.beam, hued && styles.beamHue);
