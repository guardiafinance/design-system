import type { Preview } from "@storybook/react";
import React from "react";
import { ThemeProvider } from "../src/theme/theme-provider";
import "../src/styles/index.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light">
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
