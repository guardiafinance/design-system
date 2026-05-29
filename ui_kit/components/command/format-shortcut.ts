/**
 * formatShortcut — render a keyboard shortcut showing both macOS and
 * Windows/Linux representations side by side.
 *
 *   formatShortcut(["mod", "K"])                            // → "⌘K / Ctrl+K"
 *   formatShortcut(["mod", "shift", "P"])                   // → "⇧⌘P / Ctrl+Shift+P"
 *   formatShortcut(["mod", "Backspace"])                    // → "⌘⌫ / Ctrl+Backspace"
 *   formatShortcut(["mod", "K"], { platform: "mac" })       // → "⌘K"
 *   formatShortcut(["mod", "K"], { platform: "non-mac" })   // → "Ctrl+K"
 *
 * Default `platform: "both"` renderiza os dois lados separados por ` / `.
 * O usuário lê o lado correto conforme o teclado dele — não há detecção
 * de SO, hidratação SSR é trivial (string estática), e o componente fica
 * legível tanto em Mac quanto em Windows/Linux sem ginástica de
 * baselines visuais por plataforma.
 *
 * Mac sempre re-ordena modificadores para a convenção canônica
 * `⌃ ⌥ ⇧ ⌘ key` independente da ordem do input; non-Mac preserva a
 * ordem do array com separador `+`. Letras/símbolos preservados
 * literalmente. Lookup case-insensitive.
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

function renderMac(keys: readonly string[]): string {
  const modifiers: string[] = [];
  const nonModifiers: string[] = [];
  for (const key of keys) {
    if (MODIFIER_TOKENS.has(key.toLowerCase())) {
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

function renderNonMac(keys: readonly string[]): string {
  return keys
    .map((k) => NON_MAC_LABELS[k.toLowerCase()] ?? k)
    .join("+");
}

export interface FormatShortcutOptions {
  /**
   * Pick which side(s) to render. Default `"both"` shows the Mac
   * representation and the non-Mac representation separated by ` / `.
   * Force one side via `"mac"` or `"non-mac"` when context is known
   * (e.g. environment-specific docs).
   */
  platform?: "mac" | "non-mac" | "both";
}

export function formatShortcut(
  keys: readonly string[],
  options: FormatShortcutOptions = {},
): string {
  const platform = options.platform ?? "both";
  if (platform === "mac") return renderMac(keys);
  if (platform === "non-mac") return renderNonMac(keys);
  return `${renderMac(keys)} / ${renderNonMac(keys)}`;
}
