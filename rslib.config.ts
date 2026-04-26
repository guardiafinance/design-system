import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: ['./ui_kit/**/*.{ts,tsx}', '!./ui_kit/**/*.{test,stories}.{ts,tsx}'],
    },
  },
  lib: [
    {
      bundle: false,
      dts: true,
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
    copy: [
      {
        from: 'ui_kit/styles/index.css',
        to: 'styles/index.css',
      },
    ],
  },
  plugins: [pluginReact()],
});
