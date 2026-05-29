import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
} from "./index";

/**
 * Tests for Plan #81 (parent feature Issue #80) — Pagination v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs come
 * from `docs/issues/issue-80/02-requirements.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Helpers — composition harnesses
// ──────────────────────────────────────────────────────────────────

function BasicPagination(
  props: Partial<React.ComponentProps<typeof PaginationLink>> = {},
): React.ReactElement {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive {...props}>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function ManyPagesWithEllipsis(): React.ReactElement {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">11</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            12
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">13</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">42</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function EdgesPagination(): React.ReactElement {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationFirst href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            5
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLast href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function DisabledBoundaries(): React.ReactElement {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

describe("Pagination", () => {
  // ────────────────────────────────────────────────────────────────
  // Public API surface (AC-1)
  // ────────────────────────────────────────────────────────────────

  it("AC-1: exports the canonical 9-symbol public surface", () => {
    expect(Pagination).toBeDefined();
    expect(PaginationContent).toBeDefined();
    expect(PaginationItem).toBeDefined();
    expect(PaginationLink).toBeDefined();
    expect(PaginationPrevious).toBeDefined();
    expect(PaginationNext).toBeDefined();
    expect(PaginationFirst).toBeDefined();
    expect(PaginationLast).toBeDefined();
    expect(PaginationEllipsis).toBeDefined();
  });

  // ────────────────────────────────────────────────────────────────
  // Landmark + semantic HTML (AC-2)
  // ────────────────────────────────────────────────────────────────

  it("AC-2: renders the root as a <nav> with role=navigation and aria-label", () => {
    render(<BasicPagination />);
    const nav = screen.getByRole("navigation", { name: /pagination/i });
    expect(nav.tagName).toBe("NAV");
    expect(nav).toHaveAttribute("aria-label", "pagination");
  });

  it("AC-2: PaginationContent renders as a <ul>", () => {
    render(<BasicPagination />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");
  });

  it("AC-2: PaginationItem renders as a <li>", () => {
    render(<BasicPagination />);
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBeGreaterThanOrEqual(5);
    items.forEach((item) => expect(item.tagName).toBe("LI"));
  });

  // ────────────────────────────────────────────────────────────────
  // Active state (AC-3)
  // ────────────────────────────────────────────────────────────────

  it("AC-3: PaginationLink with isActive sets aria-current=page", () => {
    render(<BasicPagination />);
    const activeLink = screen.getByRole("link", { name: "1" });
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("AC-3: PaginationLink without isActive does not set aria-current", () => {
    render(<BasicPagination />);
    const inactiveLink = screen.getByRole("link", { name: "2" });
    expect(inactiveLink).not.toHaveAttribute("aria-current");
  });

  it("AC-3: PaginationLink with isActive uses outline variant class chain", () => {
    render(<BasicPagination />);
    const activeLink = screen.getByRole("link", { name: "1" });
    // outline variant exposes border-input class via buttonVariants
    expect(activeLink.className).toContain("border");
  });

  it("AC-3: PaginationLink without isActive uses ghost variant (no border-input)", () => {
    render(<BasicPagination />);
    const inactiveLink = screen.getByRole("link", { name: "2" });
    // ghost variant does not apply the outline border-input class
    expect(inactiveLink.className).not.toContain("border-input");
  });

  // ────────────────────────────────────────────────────────────────
  // Disabled state (AC-4)
  // ────────────────────────────────────────────────────────────────

  it("AC-4: disabled PaginationLink sets aria-disabled=true and tabIndex=-1", () => {
    render(<DisabledBoundaries />);
    const prev = screen.getByRole("link", { name: /página anterior/i });
    expect(prev).toHaveAttribute("aria-disabled", "true");
    expect(prev).toHaveAttribute("tabindex", "-1");
  });

  it("AC-4: disabled PaginationLink applies the disabled visual chain", () => {
    render(<DisabledBoundaries />);
    const prev = screen.getByRole("link", { name: /página anterior/i });
    expect(prev.className).toContain("cursor-not-allowed");
    expect(prev.className).toContain("opacity-50");
  });

  it("AC-4: disabled PaginationLink suppresses onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" disabled onClick={onClick}>
              Click me
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    await user.click(screen.getByRole("link", { name: /click me/i }));
    expect(onClick).not.toHaveBeenCalled();
  });

  // ────────────────────────────────────────────────────────────────
  // Keyboard activation (AC-5)
  // ────────────────────────────────────────────────────────────────

  it("AC-5: PaginationLink without href is keyboard-operable via Enter", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink onClick={onClick}>Activate me</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const link = screen.getByRole("button", { name: /activate me/i });
    link.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("AC-5: PaginationLink without href is keyboard-operable via Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink onClick={onClick}>Press space</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const link = screen.getByRole("button", { name: /press space/i });
    link.focus();
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("AC-5: PaginationLink without href takes role=button (semantic intent)", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink onClick={() => {}}>Action</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByRole("button", { name: /action/i })).toBeInTheDocument();
  });

  it("AC-5: PaginationLink with href keeps native <a> role (no role override)", () => {
    render(<BasicPagination />);
    const link = screen.getByRole("link", { name: "2" });
    expect(link.tagName).toBe("A");
    expect(link).not.toHaveAttribute("role");
  });

  // ────────────────────────────────────────────────────────────────
  // Token contract (AC-6)
  // ────────────────────────────────────────────────────────────────

  it("AC-6: PaginationLink consumes buttonVariants class chain (no hardcoded color)", () => {
    render(<BasicPagination />);
    const link = screen.getByRole("link", { name: "2" });
    // buttonVariants emits common base utilities — focus-visible:ring tokens, etc.
    expect(link.className).toContain("focus-visible:ring");
    expect(link.className).toContain("rounded-md");
    // Sanity: nenhum hex literal entrou no className.
    expect(link.className).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });

  // ────────────────────────────────────────────────────────────────
  // Ellipsis (AC-7)
  // ────────────────────────────────────────────────────────────────

  it("AC-7: PaginationEllipsis wrapper has aria-hidden=true", () => {
    const { container } = render(<ManyPagesWithEllipsis />);
    const ellipses = container.querySelectorAll('[aria-hidden="true"]');
    // PaginationEllipsis wrappers + chevron icons; ensure at least the 2 ellipsis spans exist
    const ellipsisWrappers = Array.from(ellipses).filter(
      (el) => el.tagName === "SPAN" && el.querySelector(".sr-only"),
    );
    expect(ellipsisWrappers.length).toBe(2);
  });

  it("AC-7: PaginationEllipsis announces 'Mais páginas' via sr-only sibling", () => {
    render(<ManyPagesWithEllipsis />);
    const srOnlyTexts = screen.getAllByText(/mais páginas/i);
    expect(srOnlyTexts).toHaveLength(2);
    srOnlyTexts.forEach((el) => {
      expect(el.className).toContain("sr-only");
    });
  });

  // ────────────────────────────────────────────────────────────────
  // Explicit pt-BR aria-labels on prev/next/first/last (AC-8)
  // ────────────────────────────────────────────────────────────────

  it("AC-8: PaginationPrevious exposes aria-label 'Página anterior'", () => {
    render(<BasicPagination />);
    expect(
      screen.getByRole("link", { name: /página anterior/i }),
    ).toBeInTheDocument();
  });

  it("AC-8: PaginationNext exposes aria-label 'Próxima página'", () => {
    render(<BasicPagination />);
    expect(
      screen.getByRole("link", { name: /próxima página/i }),
    ).toBeInTheDocument();
  });

  it("AC-8: PaginationFirst exposes aria-label 'Primeira página'", () => {
    render(<EdgesPagination />);
    expect(
      screen.getByRole("link", { name: /primeira página/i }),
    ).toBeInTheDocument();
  });

  it("AC-8: PaginationLast exposes aria-label 'Última página'", () => {
    render(<EdgesPagination />);
    expect(
      screen.getByRole("link", { name: /última página/i }),
    ).toBeInTheDocument();
  });

  it("AC-8: chevron icons inside prev/next/first/last carry aria-hidden", () => {
    const { container } = render(<EdgesPagination />);
    // Each navigation control renders an SVG chevron with aria-hidden — at
    // minimum 4 (First, Previous, Next, Last). Selector pulls hidden SVGs.
    const hiddenSvgs = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(hiddenSvgs.length).toBeGreaterThanOrEqual(4);
  });

  // ────────────────────────────────────────────────────────────────
  // jest-axe — Default, Active state, Disabled state × light + dark (AC-9)
  // ────────────────────────────────────────────────────────────────

  it("AC-9: Default composition has no a11y violations in light + dark", async () => {
    const { container } = render(<BasicPagination />);
    await axeInThemes(container);
  });

  it("AC-9: ManyPagesWithEllipsis composition has no a11y violations in light + dark", async () => {
    const { container } = render(<ManyPagesWithEllipsis />);
    await axeInThemes(container);
  });

  it("AC-9: EdgesPagination composition (First/Last) has no a11y violations in light + dark", async () => {
    const { container } = render(<EdgesPagination />);
    await axeInThemes(container);
  });

  it("AC-9: DisabledBoundaries composition has no a11y violations in light + dark", async () => {
    const { container } = render(<DisabledBoundaries />);
    await axeInThemes(container);
  });

  // ────────────────────────────────────────────────────────────────
  // Behavioral — click handler wiring (AC-10)
  // ────────────────────────────────────────────────────────────────

  it("AC-10: PaginationLink fires onClick when clicked (enabled)", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" onClick={onClick}>
              Click
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    await user.click(screen.getByRole("link", { name: /click/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("AC-10: composition exposes all numbered pages as discoverable links", () => {
    render(<BasicPagination />);
    const numberedLinks = ["1", "2", "3"].map((n) =>
      screen.getByRole("link", { name: n }),
    );
    expect(numberedLinks).toHaveLength(3);
  });

  it("AC-10: composition with ellipsis exposes the correct count of numbered pages", () => {
    render(<ManyPagesWithEllipsis />);
    const list = screen.getByRole("list");
    // 5 numbered pages (1, 11, 12, 13, 42) + 2 ellipses + prev + next = 9 items
    expect(within(list).getAllByRole("listitem")).toHaveLength(9);
  });

  it("AC-10: edges composition routes First → Last via accessible labels", () => {
    render(<EdgesPagination />);
    const first = screen.getByRole("link", { name: /primeira página/i });
    const last = screen.getByRole("link", { name: /última página/i });
    expect(first).toBeInTheDocument();
    expect(last).toBeInTheDocument();
  });
});
