/**
 * Canonical kebab-case and path derivation for visual snapshots.
 *
 * Consumed by:
 *   - .storybook/test-runner.ts    (per-story snapshot dir during CI/local runs)
 *   - scripts/migrate-visual-baselines.mjs (one-shot rename from flat layout)
 *
 * Both consumers MUST resolve a story's baseline to the same path; keeping
 * the logic in a single locus removes the divergence risk that surfaced in
 * Plan #132 review.
 */

/**
 * Kebab-case compatible with Storybook's `@storybook/csf` toId, restricted
 * to the cases we use in this design system (PascalCase identifiers,
 * sequences of capitals followed by digits, ASCII whitespace separators).
 *
 *   "MultiSelect"        -> "multi-select"
 *   "ThemeProviderDemo"  -> "theme-provider-demo"
 *   "VariantH1"          -> "variant-h-1"
 *   "Components"         -> "components"
 */
export function toKebab(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Subdirectory for a story's baseline (or diff) given a base root, the
 * Storybook title, and the theme. The title is split on "/" and each
 * segment is kebab-cased; theme is appended as the leaf directory:
 *
 *   snapshotDirForStory("/snaps", "Components/MultiSelect", "dark")
 *     -> "/snaps/components/multi-select/dark"
 */
export function snapshotDirForStory(rootDir, title, theme) {
  const segments = title.split("/").map(toKebab).filter(Boolean);
  return [rootDir, ...segments, theme].join("/");
}
