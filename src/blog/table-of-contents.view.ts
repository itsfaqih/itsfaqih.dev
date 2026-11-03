import { marker } from "../when";
import { cx } from "../cx";
import { styles } from "./table-of-contents.css";
/** The classes table-of-contents.astro renders and table-of-contents.client.ts swaps as the active entry moves. */
export const toc = {
  host: styles.host,
  title: styles.title,
  list: cx(styles.list, marker),
  item: styles.item,
  link: (active: boolean) => cx(styles.link, active ? styles.active : styles.idle),
  label: styles.label,
  layer: styles.layer,
  ghost: cx(styles.layer, styles.ghost),
};
