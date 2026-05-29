/**
 * formatShortcut — render a keyboard shortcut for the current platform.
 *
 * Mantém a API `shortcut: string` em `CommandPaletteEntry` intacta —
 * o consumidor escolhe entre passar literal (`"⌘K"`) ou usar este helper
 * para detectar SO automaticamente:
 *
 *   formatShortcut(["mod", "K"])              // → "⌘K"  (Mac) | "Ctrl+K" (non-Mac)
 *   formatShortcut(["mod", "shift", "P"])     // → "⇧⌘P" (Mac) | "Ctrl+Shift+P"
 *   formatShortcut(["mod", "Backspace"])      // → "⌘⌫"  | "Ctrl+Backspace"
 *
 * Modificadores no Mac são re-ordenados para a convenção canônica
 * `⌃ ⌥ ⇧ ⌘ key` independente da ordem do input. Non-Mac preserva a
 * ordem do array com separador `+`.
 *
 * Detecção SSR-safe: tenta `navigator.platform`, cai em `navigator.userAgent`;
 * quando `navigator` indisponível (SSR, jsdom sem stub) default Mac.
 *
 * Decisão de API registrada em
 * `docs/adr/ADR-017-command-v0.1.0-dod-migration.md` (Addendum
 * "Cross-platform shortcuts").
 */

const MODIFIER_TOKENS = new Set([
  "mod",
  "cmd",
  "shift",
  "alt",
  "option",
  "ctrl",
  "control",
  "meta",
]);

const MAC_GLYPHS: Record<string, string> = {
  mod: "⌘",
  cmd: "⌘",
  meta: "⌘",
  shift: "⇧",
  alt: "⌥",
  option: "⌥",
  ctrl: "⌃",
  control: "⌃",
  backspace: "⌫",
  enter: "↵",
  return: "↵",
  tab: "⇥",
  escape: "⎋",
  esc: "⎋",
  space: "␣",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
};

const NON_MAC_LABELS: Record<string, string> = {
  mod: "Ctrl",
  cmd: "Ctrl",
  shift: "Shift",
  alt: "Alt",
  option: "Alt",
  ctrl: "Ctrl",
  control: "Ctrl",
  meta: "Win",
};

// Canonical Mac modifier order: ⌃ ⌥ ⇧ ⌘
const MAC_MODIFIER_RANK: Record<string, number> = {
  ctrl: 0,
  control: 0,
  alt: 1,
  option: 1,
  shift: 2,
  mod: 3,
  cmd: 3,
  meta: 3,
};

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return true;
  const platform = (navigator.platform ?? "").toUpperCase();
  if (platform) {
    return (
      platform.includes("MAC") ||
      platform.includes("IPHONE") ||
      platform.includes("IPAD")
    );
  }
  const userAgent = (navigator.userAgent ?? "").toUpperCase();
  return userAgent.includes("MAC") || userAgent.includes("IPHONE") || userAgent.includes("IPAD");
}

export interface FormatShortcutOptions {
  /**
   * Force a specific platform. Useful for Storybook stories that demo
   * both renderings side-by-side and for deterministic snapshot tests.
   */
  platform?: "mac" | "non-mac";
}

export function formatShortcut(
  keys: readonly string[],
  options: FormatShortcutOptions = {},
): string {
  const mac = options.platform
    ? options.platform === "mac"
    : isMacPlatform();

  if (mac) {
    // Mac: sort modifiers into canonical order, then concat (no separator).
    const modifiers: string[] = [];
    const nonModifiers: string[] = [];
    for (const key of keys) {
      const lower = key.toLowerCase();
      if (MODIFIER_TOKENS.has(lower)) {
        modifiers.push(key);
      } else {
        nonModifiers.push(key);
      }
    }
    modifiers.sort((a, b) => {
      const ra = MAC_MODIFIER_RANK[a.toLowerCase()] ?? 99;
      const rb = MAC_MODIFIER_RANK[b.toLowerCase()] ?? 99;
      return ra - rb;
    });
    return [...modifiers, ...nonModifiers]
      .map((k) => MAC_GLYPHS[k.toLowerCase()] ?? k)
      .join("");
  }

  // Non-Mac: preserve input order, join with `+`.
  return keys
    .map((k) => NON_MAC_LABELS[k.toLowerCase()] ?? k)
    .join("+");
}
