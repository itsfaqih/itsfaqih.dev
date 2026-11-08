import { tipped } from "./table-design.markers";
import { cx } from "../cx";
import { styles } from "./table-design.css";
/** Class strings for what the demos' elements toggle, shared by the first frame and the client. */
export const view = {
  segKey: (on: boolean) => cx(styles.segButton, on && styles.segOn, styles.ring),
  dot: (on: boolean) => cx(styles.dot, on && styles.dotOn),
  saidTitle: (error: boolean) => cx(styles.saidTitle, error && styles.saidError),
  saidButton: (go: boolean) => cx(styles.btn, go && styles.go, styles.saidButton, styles.ring),
  nameCell: (editing: boolean) => cx(styles.td, editing && styles.editing),
  roleCell: (editing: boolean) => cx(styles.td, styles.dim, editing && styles.editing),
  actsCell: (editing: boolean) =>
    cx(styles.td, styles.num, styles.overflowing, editing && styles.editing),
  iconKey: (danger: boolean, pressed: boolean) =>
    cx(styles.icon, danger && styles.iconDanger, pressed && styles.iconPressed, styles.ring),
  pageKey: (on: boolean) => cx(styles.page, on && styles.pageOn, styles.ring),
  body: (reloading: boolean) => cx(styles.body, reloading && styles.reloading),
  tipped: cx(styles.tipped, tipped),
};
