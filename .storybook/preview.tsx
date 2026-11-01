import "../src/styles.css";
// StyleX emits the theme vars only from modules in the graph, and no story imports them.
import "../src/theme.stylex";

import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
  },
};

export default preview;
