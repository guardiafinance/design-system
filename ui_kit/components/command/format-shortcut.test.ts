import { describe, it, expect } from "vitest";

import { formatShortcut } from "./format-shortcut";

describe("formatShortcut", () => {
  describe('default "both" — Mac / non-Mac side by side', () => {
    it('AC-30: renders mod as "⌘K / Ctrl+K"', () => {
      expect(formatShortcut(["mod", "K"])).toBe("⌘K / Ctrl+K");
    });

    it("AC-30: applies Mac canonical ordering on the left side and preserves input order on the right", () => {
      expect(formatShortcut(["mod", "shift", "P"])).toBe(
        "⇧⌘P / Ctrl+Shift+P",
      );
      expect(formatShortcut(["shift", "mod", "P"])).toBe(
        "⇧⌘P / Shift+Ctrl+P",
      );
    });

    it("AC-30: maps special keys to Mac glyphs and keeps literal names on non-Mac", () => {
      expect(formatShortcut(["mod", "Backspace"])).toBe("⌘⌫ / Ctrl+Backspace");
      expect(formatShortcut(["mod", "Enter"])).toBe("⌘↵ / Ctrl+Enter");
      expect(formatShortcut(["Escape"])).toBe("⎋ / Escape");
    });

    it("AC-30: passes literal letters and symbols through untouched on both sides", () => {
      expect(formatShortcut(["mod", ","])).toBe("⌘, / Ctrl+,");
      expect(formatShortcut(["mod", "/"])).toBe("⌘/ / Ctrl+/");
    });
  });

  describe("platform: 'mac' (forced)", () => {
    const mac = (keys: string[]): string =>
      formatShortcut(keys, { platform: "mac" });

    it("AC-31: renders only the Mac side", () => {
      expect(mac(["mod", "K"])).toBe("⌘K");
    });

    it("AC-31: applies canonical modifier order ⌃⌥⇧⌘ regardless of input order", () => {
      expect(mac(["mod", "shift", "P"])).toBe("⇧⌘P");
      expect(mac(["shift", "mod", "P"])).toBe("⇧⌘P");
      expect(mac(["ctrl", "alt", "shift", "mod", "K"])).toBe("⌃⌥⇧⌘K");
    });

    it("AC-31: maps special keys to glyphs", () => {
      expect(mac(["mod", "Backspace"])).toBe("⌘⌫");
      expect(mac(["mod", "Enter"])).toBe("⌘↵");
      expect(mac(["Escape"])).toBe("⎋");
    });

    it("AC-31: token lookup is case-insensitive", () => {
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

  describe("platform: 'non-mac' (forced)", () => {
    const win = (keys: string[]): string =>
      formatShortcut(keys, { platform: "non-mac" });

    it("AC-31: renders only the non-Mac side joined with '+'", () => {
      expect(win(["mod", "K"])).toBe("Ctrl+K");
    });

    it("AC-31: preserves input order (no canonical reorder on non-Mac)", () => {
      expect(win(["mod", "shift", "P"])).toBe("Ctrl+Shift+P");
      expect(win(["shift", "mod", "P"])).toBe("Shift+Ctrl+P");
    });

    it("AC-31: keeps special key names literal", () => {
      expect(win(["mod", "Backspace"])).toBe("Ctrl+Backspace");
      expect(win(["mod", "Enter"])).toBe("Ctrl+Enter");
      expect(win(["Escape"])).toBe("Escape");
    });

    it("AC-31: meta token maps to Win label", () => {
      expect(win(["meta", "L"])).toBe("Win+L");
    });

    it("AC-31: alt/option both map to Alt label", () => {
      expect(win(["alt", "F4"])).toBe("Alt+F4");
      expect(win(["option", "Tab"])).toBe("Alt+Tab");
    });
  });
});
