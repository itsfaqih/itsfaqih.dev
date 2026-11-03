import { cx } from "../cx";
import { styles } from "./table-of-contents.css";

export const tocLink = (active: boolean) => cx(styles.link, active ? styles.active : styles.idle);
