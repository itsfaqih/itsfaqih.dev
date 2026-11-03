import { cx } from "../cx";
import { styles } from "./table-of-contents.css";

/** The class of a table-of-contents link, which the client swaps as the active entry moves. */
export const tocLink = (active: boolean) => cx(styles.link, active ? styles.active : styles.idle);
