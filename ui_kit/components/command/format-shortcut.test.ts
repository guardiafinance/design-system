import { describe, it, expect } from "vitest";

import { formatShortcut } from "./format-shortcut";

describe("formatShortcut", () => {
  describe("Mac (forced via options)", () => {
    const mac = (keys: string[]): string =>
      formatShortcut(keys, { platform: "mac" });

    it("AC-31: renders `mod` as ⌘ glyph", () => {
      expect(mac(["mod", "K"])).toBe("⌘K");
    });

    it("AC-31: composes modifiers in canonical order ⌃⌥⇧⌘ regardless of input order", () => {
      expect(mac(["mod", "shift", "P"])).toBe("⇧⌘P");
      expect(mac(["shift", "mod", "P"])).toBe("⇧⌘P");
      expect(mac(["ctrl", "alt", "shift", "mod", "K"])).toBe("⌃⌥⇧⌘K");
    });

    it("AC-31: maps special keys to glyphs (Backspace → ⌫, Enter → ↵, Escape → ⎋)", () => {
      expect(mac(["mod", "Backspace"])).toBe("⌘⌫");
      expect(mac(["mod", "Enter"])).toBe("⌘↵");
      expect(mac(["Escape"])).toBe("⎋");
    });

    it("AC-31: preserves literal letters, digits, and symbols", () => {
      expect(mac(["mod", "K"])).toBe("⌘K");
      expect(mac(["mod", ","])).toBe("⌘,");
      expect(mac(["mod", "1"])).toBe("⌘1");
      expect(mac(["mod", "/"])).toBe("⌘/");
    });

    it("AC-31: token lookup is case-insensitive (MOD/mod/Mod produce the same glyph)", () => {
      expect(mac(["MOD", "k"])).toBe("⌘k");
      expect(mac(["Mod", "Shift", "p"])).toBe("⇧⌘p");
    });

    it("AC-31: maps arrow tokens to ↑↓←→", () => {
      expect(mac(["mod", "ArrowUp"])).toBe("⌘↑");
      expect(mac(["mod", "ArrowDown"])).toBe("⌘↓");
      expect(mac(["mod", "ArrowLeft"])).toBe("⌘←");
      expect(mac(["mod", "ArrowRight"])).toBe("⌘→");
    });
  });

  describe("Non-Mac (forced via options)", () => {
    const win = (keys: string[]): string =>
      formatShortcut(keys, { platform: "non-mac" });

    it("AC-31: renders `mod` as Ctrl and joins with `+`", () => {
      expect(win(["mod", "K"])).toBe("Ctrl+K");
    });

    it("AC-31: preserves input order (Shift+Ctrl+P stays Shift+Ctrl+P)", () => {
      expect(win(["mod", "shift", "P"])).toBe("Ctrl+Shift+P");
      expect(win(["shift", "mod", "P"])).toBe("Shift+Ctrl+P");
    });

    it("AC-31: keeps special key names literal (Backspace, Enter, Escape)", () => {
      expect(win(["mod", "Backspace"])).toBe("Ctrl+Backspace");
      expect(win(["mod", "Enter"])).toBe("Ctrl+Enter");
      expect(win(["Escape"])).toBe("Escape");
    });

    it("AC-31: meta token maps to Win label (not Ctrl)", () => {
      expect(win(["meta", "L"])).toBe("Win+L");
    });

    it("AC-31: alt/option both map to Alt label", () => {
      expect(win(["alt", "F4"])).toBe("Alt+F4");
      expect(win(["option", "Tab"])).toBe("Alt+Tab");
    });

    it("AC-31: preserves literal letters and symbols", () => {
      expect(win(["mod", ","])).toBe("Ctrl+,");
      expect(win(["mod", "/"])).toBe("Ctrl+/");
    });
  });

  describe("AC-30: auto detection (uses navigator)", () => {
    it("returns a non-empty string for the current platform", () => {
      const out = formatShortcut(["mod", "K"]);
      expect(out.length).toBeGreaterThan(0);
      // Either Mac glyph "⌘K" or non-Mac label "Ctrl+K" — both valid.
      expect(out === "⌘K" || out === "Ctrl+K").toBe(true);
    });

    it("respects the explicit override even when auto detection would disagree", () => {
      const macForced = formatShortcut(["mod", "K"], { platform: "mac" });
      const winForced = formatShortcut(["mod", "K"], { platform: "non-mac" });
      expect(macForced).toBe("⌘K");
      expect(winForced).toBe("Ctrl+K");
    });
  });
});
