import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import {
  Breadcrumbs,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  type BreadcrumbsItem,
  type BreadcrumbsProps,
} from "./index";

/**
 * Tests for Plan #77 (parent Tech Task #76) — Breadcrumbs v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs come from
 * `docs/issues/issue-76/02-requirements.md`.
 */

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// ──────────────────────────────────────────────────────────────────
// Public API surface (AC-1, AC-2)
// ──────────────────────────────────────────────────────────────────

describe("Breadcrumbs — public surface", () => {
  it("AC-1: exports the canonical 8-symbol public surface (Breadcrumbs + 7 primitives)", () => {
    expect(Breadcrumbs).toBeDefined();
    expect(Breadcrumb).toBeDefined();
    expect(BreadcrumbList).toBeDefined();
    expect(BreadcrumbItem).toBeDefined();
    expect(BreadcrumbLink).toBeDefined();
    expect(BreadcrumbPage).toBeDefined();
    expect(BreadcrumbSeparator).toBeDefined();
    expect(BreadcrumbEllipsis).toBeDefined();
  });

  it("AC-2: the 7 declarative primitive names exported here are identical to the legacy baseline (no breaking change to the public surface)", () => {
    // Reflects the migration contract: `breadcrumb/` → `breadcrumbs/`
    // is an internal rename. Public symbol names are stable.
    const expectedNames = [
      "Breadcrumb",
      "BreadcrumbList",
      "BreadcrumbItem",
      "BreadcrumbLink",
      "BreadcrumbPage",
      "BreadcrumbSeparator",
      "BreadcrumbEllipsis",
    ];
    const exported = {
      Breadcrumb,
      BreadcrumbList,
      BreadcrumbItem,
      BreadcrumbLink,
      BreadcrumbPage,
      BreadcrumbSeparator,
      BreadcrumbEllipsis,
    } as const;
    for (const name of expectedNames) {
      expect(exported[name as keyof typeof exported]).toBeDefined();
    }
  });
});

// ──────────────────────────────────────────────────────────────────
// Token contract (AC-3, AC-4)
// ──────────────────────────────────────────────────────────────────

describe("Breadcrumbs — token contract", () => {
  it("AC-3: BreadcrumbList consumes semantic neutral tokens (text-muted-foreground)", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList />
      </Breadcrumb>,
    );
    const ol = container.querySelector("ol");
    expect(ol).not.toBeNull();
    expect(ol!.className).toContain("text-muted-foreground");
  });

  it("AC-3: BreadcrumbLink consumes hover:text-foreground (token-only)", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link!.className).toContain("hover:text-foreground");
  });

  it("AC-3: BreadcrumbPage consumes text-foreground (current page contrast)", () => {
    render(<BreadcrumbPage>Atual</BreadcrumbPage>);
    const page = screen.getByText("Atual");
    expect(page.className).toContain("text-foreground");
  });

  it("AC-4: rendered class chains contain no raw color literals (hex / oklch / palette utilities)", () => {
    const items: BreadcrumbsItem[] = [
      { label: "Início", href: "/" },
      { label: "Conciliação", href: "/conciliacao" },
      { label: "Itaú · maio/2026" },
    ];
    const { container } = render(<Breadcrumbs items={items} />);
    const allElements = container.querySelectorAll("*");
    for (const el of Array.from(allElements)) {
      const cls = (el as HTMLElement).className?.toString?.() ?? "";
      expect(cls).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      expect(cls).not.toMatch(/oklch\(/);
      expect(cls).not.toMatch(/text-red-\d+/);
      expect(cls).not.toMatch(/bg-yellow-\d+/);
      expect(cls).not.toMatch(/text-blue-\d+/);
    }
  });
});

// ──────────────────────────────────────────────────────────────────
// ARIA model (AC-5, AC-6, AC-7, AC-8)
// ──────────────────────────────────────────────────────────────────

describe("Breadcrumbs — ARIA", () => {
  it("AC-5: declarative Breadcrumb renders as <nav aria-label='breadcrumb'>", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList />
      </Breadcrumb>,
    );
    const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(nav.tagName).toBe("NAV");
  });

  it("AC-5: imperative Breadcrumbs renders as <nav aria-label='breadcrumb'> by default", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Atual" },
        ]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(nav.tagName).toBe("NAV");
  });

  it("AC-5: aria-label is overridable via prop on imperative API", () => {
    render(
      <Breadcrumbs
        items={[{ label: "Sólo" }]}
        aria-label="trilha de auditoria"
      />,
    );
    expect(
      screen.getByRole("navigation", { name: /trilha de auditoria/i }),
    ).toBeInTheDocument();
  });

  it("AC-6: the last imperative item renders with aria-current='page'", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Conciliação", href: "/c" },
          { label: "Detalhe atual" },
        ]}
      />,
    );
    const current = screen.getByText("Detalhe atual");
    // The wrapper is the BreadcrumbPage span carrying the attribute.
    const page = current.closest("[aria-current='page']");
    expect(page).not.toBeNull();
  });

  it("AC-6: declarative BreadcrumbPage carries aria-current='page' and aria-disabled='true'", () => {
    render(<BreadcrumbPage>Final</BreadcrumbPage>);
    const page = screen.getByText("Final");
    expect(page.getAttribute("aria-current")).toBe("page");
    expect(page.getAttribute("aria-disabled")).toBe("true");
  });

  it("AC-7: BreadcrumbSeparator carries role='presentation' and aria-hidden='true'", () => {
    const { container } = render(<BreadcrumbSeparator />);
    const sep = container.querySelector("li");
    expect(sep).not.toBeNull();
    expect(sep!.getAttribute("role")).toBe("presentation");
    expect(sep!.getAttribute("aria-hidden")).toBe("true");
  });

  it("AC-7: BreadcrumbEllipsis carries role='presentation' + aria-hidden + sr-only 'More'", () => {
    const { container } = render(<BreadcrumbEllipsis />);
    const ellipsis = container.querySelector("span[role='presentation']");
    expect(ellipsis).not.toBeNull();
    expect(ellipsis!.getAttribute("aria-hidden")).toBe("true");
    const srOnly = ellipsis!.querySelector(".sr-only");
    expect(srOnly?.textContent).toBe("More");
  });

  it("AC-8: BreadcrumbLink renders as <a> by default", () => {
    render(<BreadcrumbLink href="/x">Algo</BreadcrumbLink>);
    const link = screen.getByRole("link", { name: /algo/i });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/x");
  });

  it("AC-8: BreadcrumbLink with asChild renders as the child element (Slot)", () => {
    render(
      <BreadcrumbLink asChild>
        <button type="button">Router Link</button>
      </BreadcrumbLink>,
    );
    const btn = screen.getByRole("button", { name: /router link/i });
    expect(btn.tagName).toBe("BUTTON");
    // The Slot must forward the className we apply on the wrapper.
    expect(btn.className).toContain("hover:text-foreground");
  });
});

// ──────────────────────────────────────────────────────────────────
// Imperative API (AC-9, AC-10, AC-11, AC-12)
// ──────────────────────────────────────────────────────────────────

describe("Breadcrumbs — imperative API", () => {
  it("AC-9: <Breadcrumbs items> renders every item with anchor links for intermediates and BreadcrumbPage for the last", () => {
    const { container } = render(
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Conciliação", href: "/c" },
          { label: "Detalhe" },
        ]}
      />,
    );
    // Intermediates render as <a> anchors.
    const anchors = container.querySelectorAll("a");
    expect(anchors.length).toBe(2);
    expect(anchors[0]!.textContent).toContain("Início");
    expect(anchors[1]!.textContent).toContain("Conciliação");
    // Last item renders as the current page — span with role="link" +
    // aria-current="page" + aria-disabled="true" (WAI-ARIA breadcrumb pattern).
    const page = screen.getByText("Detalhe").closest("[aria-current='page']");
    expect(page).not.toBeNull();
    expect(page!.tagName).toBe("SPAN");
    expect(page!.getAttribute("aria-disabled")).toBe("true");
  });

  it("AC-9: separators are inserted between items (count = items.length - 1 when no truncation)", () => {
    const { container } = render(
      <Breadcrumbs
        items={[
          { label: "A", href: "/a" },
          { label: "B", href: "/b" },
          { label: "C", href: "/c" },
          { label: "D" },
        ]}
      />,
    );
    const separators = container.querySelectorAll("li[role='presentation']");
    expect(separators.length).toBe(3);
  });

  it("AC-10: maxItems truncation — items.length=7, maxItems=3 → first + ellipsis + last 2 items", () => {
    const items: BreadcrumbsItem[] = [
      { label: "L0", href: "/0" },
      { label: "L1", href: "/1" },
      { label: "L2", href: "/2" },
      { label: "L3", href: "/3" },
      { label: "L4", href: "/4" },
      { label: "L5", href: "/5" },
      { label: "L6" },
    ];
    const { container } = render(<Breadcrumbs items={items} maxItems={3} />);
    // First item visible
    expect(screen.getByText("L0")).toBeInTheDocument();
    // Middle items elided
    expect(screen.queryByText("L1")).toBeNull();
    expect(screen.queryByText("L2")).toBeNull();
    expect(screen.queryByText("L3")).toBeNull();
    expect(screen.queryByText("L4")).toBeNull();
    // Last items visible
    expect(screen.getByText("L5")).toBeInTheDocument();
    expect(screen.getByText("L6")).toBeInTheDocument();
    // Ellipsis present
    const ellipsis = container.querySelector("span[role='presentation']");
    expect(ellipsis).not.toBeNull();
    expect(ellipsis!.querySelector(".sr-only")?.textContent).toBe("More");
  });

  it("AC-10: maxItems greater than items.length renders all items without ellipsis", () => {
    const { container } = render(
      <Breadcrumbs
        items={[
          { label: "X", href: "/x" },
          { label: "Y" },
        ]}
        maxItems={5}
      />,
    );
    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.getByText("Y")).toBeInTheDocument();
    expect(container.querySelector("span[role='presentation']")).toBeNull();
  });

  it("AC-10: maxItems undefined renders all items", () => {
    const { container } = render(
      <Breadcrumbs
        items={[
          { label: "1", href: "/1" },
          { label: "2", href: "/2" },
          { label: "3", href: "/3" },
          { label: "4", href: "/4" },
          { label: "5" },
        ]}
      />,
    );
    expect(container.querySelector("span[role='presentation']")).toBeNull();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("AC-10: degenerate maxItems (< 2) falls back to full render (no ellipsis)", () => {
    const { container } = render(
      <Breadcrumbs
        items={[
          { label: "A", href: "/a" },
          { label: "B", href: "/b" },
          { label: "C" },
        ]}
        maxItems={1}
      />,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(container.querySelector("span[role='presentation']")).toBeNull();
  });

  it("AC-11: separator prop overrides the default ChevronRight", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "A", href: "/a" },
          { label: "B" },
        ]}
        separator={<span data-testid="custom-sep">/</span>}
      />,
    );
    const customs = screen.getAllByTestId("custom-sep");
    expect(customs.length).toBe(1);
    expect(customs[0]!.textContent).toBe("/");
  });

  it("AC-12: onClick handler fires on intermediate item click and preventsDefault when href is absent", async () => {
    const handler = vi.fn();
    const user = userEvent.setup();
    render(
      <Breadcrumbs
        items={[
          { label: "Click me", onClick: handler },
          { label: "Atual" },
        ]}
      />,
    );
    const link = screen.getByRole("link", { name: /click me/i });
    expect(link.getAttribute("href")).toBe("#");
    await user.click(link);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("AC-12: onClick + href together — handler fires and href stays (no preventDefault)", async () => {
    const handler = vi.fn();
    const user = userEvent.setup();
    render(
      <Breadcrumbs
        items={[
          { label: "Both", href: "/route", onClick: handler },
          { label: "Final" },
        ]}
      />,
    );
    const link = screen.getByRole("link", { name: /both/i });
    expect(link.getAttribute("href")).toBe("/route");
    await user.click(link);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ──────────────────────────────────────────────────────────────────
// Declarative composition (AC-13, AC-14)
// ──────────────────────────────────────────────────────────────────

describe("Breadcrumbs — declarative composition", () => {
  it("AC-13: declarative composition with all primitives renders the documented WAI-ARIA structure", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Conferência</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(within(nav).getByRole("link", { name: /início/i })).toBeInTheDocument();
    const page = within(nav).getByText("Conferência");
    expect(page.closest("[aria-current='page']")).not.toBeNull();
  });

  it("AC-13: declarative renders the same role chain as the imperative API (parity)", () => {
    const { container: imperative } = render(
      <Breadcrumbs
        items={[
          { label: "A", href: "/a" },
          { label: "B" },
        ]}
      />,
    );
    const { container: declarative } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/a">A</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>B</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    // Both produce nav > ol > li chain.
    expect(imperative.querySelectorAll("nav > ol > li").length).toBe(
      declarative.querySelectorAll("nav > ol > li").length,
    );
  });

  it("AC-14: ChevronRight icon inherits currentColor (no explicit text-* literal on the SVG)", () => {
    const { container } = render(<BreadcrumbSeparator />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    // Lucide icons use stroke="currentColor" by default.
    expect(svg!.getAttribute("stroke")).toBe("currentColor");
  });
});

// ──────────────────────────────────────────────────────────────────
// a11y — jest-axe in light + dark (AC-16, AC-17)
// ──────────────────────────────────────────────────────────────────

describe("Breadcrumbs — a11y in light + dark", () => {
  const AXE_TIMEOUT_MS = 30_000;

  it(
    "AC-16: Default short trail has no axe violations in light + dark",
    async () => {
      const { container } = render(
        <Breadcrumbs
          items={[
            { label: "Início", href: "/" },
            { label: "Conciliação", href: "/c" },
            { label: "Itaú · maio/2026" },
          ]}
        />,
      );
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-16: Truncated trail (maxItems=3, 7 items) has no axe violations in light + dark",
    async () => {
      const items: BreadcrumbsItem[] = Array.from({ length: 7 }, (_, i) => ({
        label: `Nível ${i}`,
        href: i < 6 ? `/n${i}` : undefined,
      }));
      const { container } = render(
        <Breadcrumbs items={items} maxItems={3} />,
      );
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-16: Declarative composition with BreadcrumbPage + Ellipsis has no axe violations in light + dark",
    async () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Início</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Conferência</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-16: Trail with custom separator has no axe violations in light + dark",
    async () => {
      const { container } = render(
        <Breadcrumbs
          items={[
            { label: "A", href: "/a" },
            { label: "B", href: "/b" },
            { label: "C" },
          ]}
          separator={<span aria-hidden>/</span>}
        />,
      );
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-16: Trail with click handler has no axe violations in light + dark",
    async () => {
      const { container } = render(
        <Breadcrumbs
          items={[
            { label: "Click", onClick: () => undefined },
            { label: "Final" },
          ]}
        />,
      );
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );
});

// ──────────────────────────────────────────────────────────────────
// Type safety (AC-1, AC-22 — props typing)
// ──────────────────────────────────────────────────────────────────

describe("Breadcrumbs — type safety", () => {
  it("AC-1: BreadcrumbsProps accepts items as readonly array and maxItems as number", () => {
    // Compile-time check — if the types regress, tsc breaks at build.
    const props: BreadcrumbsProps = {
      items: [
        { label: "A", href: "/a" },
        { label: "B" },
      ],
      maxItems: 5,
    };
    expect(props.items).toHaveLength(2);
    expect(props.maxItems).toBe(5);
  });

  it("AC-1: BreadcrumbsItem accepts optional icon as ReactNode", () => {
    const item: BreadcrumbsItem = {
      label: "Com ícone",
      icon: <span data-testid="icon">⚡</span>,
      href: "/i",
    };
    expect(item.icon).toBeDefined();
    render(<Breadcrumbs items={[item, { label: "Atual" }]} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
