import * as stylex from "@stylexjs/stylex";
import { transitions } from "../../theme.stylex";
import { useState } from "react";
import { PlusIcon, MinusIcon } from "@phosphor-icons/react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div {...stylex.props(styles.counter)}>
      <button
        onClick={() => setCount(count - 1)}
        {...stylex.props(styles.button, styles.decrease)}
        aria-label="Decrease count"
      >
        <MinusIcon size={18} />
      </button>

      <div {...stylex.props(styles.display)}>
        <span {...stylex.props(styles.count)}>{count}</span>
      </div>

      <button
        onClick={() => setCount(count + 1)}
        {...stylex.props(styles.button, styles.increase)}
        aria-label="Increase count"
      >
        <PlusIcon size={18} />
      </button>
    </div>
  );
}

// Tailwind's zinc greys. 700, 600 and 400 keep the lab() form the old build compiled them to.
const zinc700 = "lab(26.8019% 1.35387 -4.68303)";
const zinc600 = "lab(35.1166% 1.78212 -6.1173)";
const zinc400 = "lab(65.6464% 1.53497 -5.42429)";

const styles = stylex.create({
  counter: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBlock: "1rem",
    padding: "0.25rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: zinc700,
    borderRadius: "0.75rem",
    backgroundColor: "color-mix(in oklab, oklch(27.4% .006 286.033) 50%, transparent)",
  },
  button: {
    padding: "0.5rem",
    borderRadius: "0.375rem",
    scale: { default: null, ":active": "95% 95%" },
    transitionProperty: "all",
    transitionTimingFunction: transitions.ease,
    transitionDuration: "0.2s",
  },
  decrease: {
    color: {
      default: zinc400,
      ":hover": { default: null, "@media (hover: hover)": "#fff" },
    },
    backgroundColor: {
      default: null,
      ":hover": { default: null, "@media (hover: hover)": zinc700 },
    },
  },
  increase: {
    color: "#fff",
    backgroundColor: {
      default: zinc700,
      ":hover": { default: null, "@media (hover: hover)": zinc600 },
    },
  },
  display: {
    minWidth: 80,
    textAlign: "center",
  },
  count: {
    fontSize: "1.5rem",
    lineHeight: "2rem",
    fontWeight: 700,
    color: "#fff",
  },
});
