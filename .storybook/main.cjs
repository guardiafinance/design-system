const path = require("path");

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../ui_kit/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-essentials"],
  framework: "@storybook/react-vite",
  async viteFinal(config) {
    const base = process.env.GITHUB_PAGES_BASE || "/";
    return {
      ...config,
      base,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          "@": path.resolve(__dirname, "../ui_kit"),
        },
      },
    };
  },
};

module.exports = config;
