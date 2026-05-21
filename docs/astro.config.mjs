// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

/**
 * Guardia Design System — docs site (Astro).
 *
 * Serves:
 *  - Static HTML pages mirrored from wip/preview/ (in docs/public/preview/)
 *  - React component previews hydrated from ../ui_kit/ (the live package source)
 */
export default defineConfig({
  site: "https://guardiafinance.github.io",
  base: "/design-system",
  integrations: [react(), mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: "github-dark-dimmed",
      wrap: true,
    },
  },
  output: "static",
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        // Import the live design-system source (no build step between docs and ui_kit)
        "@ds": fileURLToPath(new URL("../ui_kit", import.meta.url)),
        "@": fileURLToPath(new URL("../ui_kit", import.meta.url)),
      },
      preserveSymlinks: true,
    },
  },
});
