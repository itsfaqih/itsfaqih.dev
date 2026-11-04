import { cx } from "../cx";
import { styles } from "./button-design.css";

/** Classes the demos' elements switch between, shared by their markup and their clients. */
export const view = {
  dot: (on: boolean) => cx(styles.dot, on && styles.dotOn),
};
