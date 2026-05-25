import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { ThemeProvider, useTheme } from "./theme-provider";

function Consumer() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button type="button" onClick={() => setTheme("dark")}>
        go-dark
      </button>
    </div>
  );
}

describe("<ThemeProvider />", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders during server-side rendering without reading localStorage (#153 regression)", () => {
    // WHY: useState initializer ran during static prerender (Next.js
    // `output: "export"`, RSC) crashed with `ReferenceError: localStorage
    // is not defined`. Trap any read on Storage.prototype during
    // renderToString — the deferred useEffect read MUST NOT fire on the
    // server, so the trap stays untouched and the render succeeds.
    const trap = vi.fn(() => {
      throw new Error("localStorage MUST NOT be accessed during render");
    });
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = trap;
    try {
      const html = renderToString(
        <ThemeProvider defaultTheme="light">
          <Consumer />
        </ThemeProvider>,
      );
      expect(trap).not.toHaveBeenCalled();
      expect(html).toContain("light");
    } finally {
      Storage.prototype.getItem = originalGetItem;
    }
  });

  it("uses defaultTheme on first client render", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("hydrates the persisted theme from localStorage after mount", () => {
    window.localStorage.setItem("ui-theme", "dark");
    render(
      <ThemeProvider defaultTheme="light">
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("persists the new theme to localStorage when setTheme is called", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <Consumer />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /go-dark/i }));
    expect(window.localStorage.getItem("ui-theme")).toBe("dark");
    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("falls back to defaultTheme when localStorage access throws (private browsing, strict CSP)", () => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn(() => {
      throw new Error("SecurityError: localStorage blocked");
    });
    try {
      render(
        <ThemeProvider defaultTheme="dark">
          <Consumer />
        </ThemeProvider>,
      );
      expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    } finally {
      Storage.prototype.getItem = originalGetItem;
    }
  });

  it("keeps the in-memory theme even when localStorage.setItem throws (QuotaExceededError)", () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error("QuotaExceededError");
    });
    try {
      render(
        <ThemeProvider defaultTheme="light">
          <Consumer />
        </ThemeProvider>,
      );
      fireEvent.click(screen.getByRole("button", { name: /go-dark/i }));
      expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    } finally {
      Storage.prototype.setItem = originalSetItem;
    }
  });
});
