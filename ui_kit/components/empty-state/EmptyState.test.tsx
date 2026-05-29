import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { axeInThemes } from "@/test-utils/a11y";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateIllustration,
  EmptyStateTitle,
} from "./index";

/**
 * Tests for Plan #253 (parent Tech Task #64) — EmptyState v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2.
 * ACs referenced come from `docs/issues/issue-64/02-requirements.md`.
 */

describe("<EmptyState />", () => {
  // ────────────────────────────────────────────────────────────────
  // API surface (AC-1..4)
  // ────────────────────────────────────────────────────────────────

  it("AC-1: exposes compound subcomponents via `EmptyState.X`", () => {
    expect(EmptyState.Icon).toBeDefined();
    expect(EmptyState.Illustration).toBeDefined();
    expect(EmptyState.Title).toBeDefined();
    expect(EmptyState.Description).toBeDefined();
    expect(EmptyState.Actions).toBeDefined();
  });

  it("AC-2: compound and flat exports are identity-equal", () => {
    expect(EmptyState.Icon).toBe(EmptyStateIcon);
    expect(EmptyState.Illustration).toBe(EmptyStateIllustration);
    expect(EmptyState.Title).toBe(EmptyStateTitle);
    expect(EmptyState.Description).toBe(EmptyStateDescription);
    expect(EmptyState.Actions).toBe(EmptyStateActions);
  });

  it("AC-3: defaults to size='md' (CVA defaultVariants) when no size prop is supplied", () => {
    render(
      <EmptyState data-testid="root">
        <EmptyStateTitle>Nada por aqui</EmptyStateTitle>
      </EmptyState>,
    );
    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveClass("py-10");
    expect(root).toHaveClass("px-6");
  });

  it("AC-4: forwards ref to the root HTMLDivElement", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <EmptyState ref={ref as React.Ref<HTMLElement>} data-testid="root">
        <EmptyStateTitle>Nada por aqui</EmptyStateTitle>
      </EmptyState>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId("root"));
  });

  it("AC-4 (continued): forwards ref on Title to the heading element", () => {
    const ref = React.createRef<HTMLHeadingElement>();
    render(
      <EmptyState>
        <EmptyStateTitle ref={ref}>Sem resultados</EmptyStateTitle>
      </EmptyState>,
    );
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    expect(ref.current?.tagName).toBe("H3");
  });

  // ────────────────────────────────────────────────────────────────
  // Semantic markup and accessibility (AC-5..8)
  // ────────────────────────────────────────────────────────────────

  it("AC-5: renders `role='status'` with `aria-live='polite'` and `aria-atomic='true'` by default", () => {
    render(
      <EmptyState>
        <EmptyStateTitle>Sem resultados</EmptyStateTitle>
      </EmptyState>,
    );
    const root = screen.getByRole("status");
    expect(root).toHaveAttribute("aria-live", "polite");
    expect(root).toHaveAttribute("aria-atomic", "true");
  });

  it("AC-5: honors consumer `role` override (e.g., 'region')", () => {
    render(
      <EmptyState role="region" aria-label="Empty inbox">
        <EmptyStateTitle>Sem mensagens</EmptyStateTitle>
      </EmptyState>,
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /empty inbox/i }),
    ).toBeInTheDocument();
  });

  it("AC-5: honors `as='section'` to render a `<section>` element", () => {
    render(
      <EmptyState as="section" data-testid="root">
        <EmptyStateTitle>Sem resultados</EmptyStateTitle>
      </EmptyState>,
    );
    expect(screen.getByTestId("root").tagName).toBe("SECTION");
  });

  it("AC-6: Title renders as `<h3>` by default and supports `as` override", () => {
    const { rerender } = render(
      <EmptyState>
        <EmptyStateTitle>Sem resultados</EmptyStateTitle>
      </EmptyState>,
    );
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    rerender(
      <EmptyState>
        <EmptyStateTitle as="h2">Sem resultados</EmptyStateTitle>
      </EmptyState>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("AC-7: root injects stable id pair `{rootId}-title` and `{rootId}-description` consumed by Title and Description", () => {
    render(
      <EmptyState id="my-empty">
        <EmptyStateTitle>Sem resultados</EmptyStateTitle>
        <EmptyStateDescription>Tente ajustar os filtros.</EmptyStateDescription>
      </EmptyState>,
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveAttribute(
      "id",
      "my-empty-title",
    );
    expect(screen.getByText(/tente ajustar/i)).toHaveAttribute(
      "id",
      "my-empty-description",
    );
  });

  it("AC-8: Icon slot carries `aria-hidden='true'` and `data-slot='empty-state-icon'`", () => {
    render(
      <EmptyState>
        <EmptyStateIcon data-testid="icon-slot">
          <svg width="24" height="24" />
        </EmptyStateIcon>
        <EmptyStateTitle>Sem dados</EmptyStateTitle>
      </EmptyState>,
    );
    const iconSlot = screen.getByTestId("icon-slot");
    expect(iconSlot).toHaveAttribute("aria-hidden", "true");
    expect(iconSlot).toHaveAttribute("data-slot", "empty-state-icon");
  });

  // ────────────────────────────────────────────────────────────────
  // Token contract (AC-9, AC-10)
  // ────────────────────────────────────────────────────────────────

  it("AC-9: composed root class list uses only semantic Tailwind utilities (no hex, no oklch, no rgb)", () => {
    render(
      <EmptyState data-testid="root">
        <EmptyStateTitle>X</EmptyStateTitle>
      </EmptyState>,
    );
    const classes = screen.getByTestId("root").className;
    expect(classes).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    expect(classes).not.toContain("oklch(");
    expect(classes).not.toContain("rgb(");
    expect(classes).not.toContain("violet");
    expect(classes).toContain("text-foreground");
  });

  it("AC-10: Icon slot renders with `bg-muted` background and `text-foreground` color", () => {
    render(
      <EmptyState>
        <EmptyStateIcon data-testid="icon-slot">
          <svg width="24" height="24" />
        </EmptyStateIcon>
        <EmptyStateTitle>Sem dados</EmptyStateTitle>
      </EmptyState>,
    );
    const iconSlot = screen.getByTestId("icon-slot");
    expect(iconSlot).toHaveClass("bg-muted");
    expect(iconSlot).toHaveClass("text-foreground");
  });

  // ────────────────────────────────────────────────────────────────
  // Visual variants (AC-11..14)
  // ────────────────────────────────────────────────────────────────

  it("AC-11: size='sm' applies py-6 / px-4 padding and `h-[42px]` icon container", () => {
    render(
      <EmptyState size="sm" data-testid="root">
        <EmptyStateIcon data-testid="icon-slot">
          <svg width="22" height="22" />
        </EmptyStateIcon>
        <EmptyStateTitle>X</EmptyStateTitle>
      </EmptyState>,
    );
    const root = screen.getByTestId("root");
    expect(root).toHaveClass("py-6");
    expect(root).toHaveClass("px-4");
    expect(screen.getByTestId("icon-slot")).toHaveClass("h-[42px]");
    expect(screen.getByTestId("icon-slot")).toHaveClass("rounded-xl");
  });

  it("AC-12: size='md' (default) applies py-10 / px-6 padding and `h-14` icon container", () => {
    render(
      <EmptyState data-testid="root">
        <EmptyStateIcon data-testid="icon-slot">
          <svg width="28" height="28" />
        </EmptyStateIcon>
        <EmptyStateTitle>X</EmptyStateTitle>
      </EmptyState>,
    );
    const root = screen.getByTestId("root");
    expect(root).toHaveClass("py-10");
    expect(root).toHaveClass("px-6");
    expect(screen.getByTestId("icon-slot")).toHaveClass("h-14");
    expect(screen.getByTestId("icon-slot")).toHaveClass("rounded-2xl");
  });

  it("AC-13: size='lg' applies py-16 / px-8 padding and `h-[72px]` icon container", () => {
    render(
      <EmptyState size="lg" data-testid="root">
        <EmptyStateIcon data-testid="icon-slot">
          <svg width="36" height="36" />
        </EmptyStateIcon>
        <EmptyStateTitle>X</EmptyStateTitle>
      </EmptyState>,
    );
    const root = screen.getByTestId("root");
    expect(root).toHaveClass("py-16");
    expect(root).toHaveClass("px-8");
    expect(screen.getByTestId("icon-slot")).toHaveClass("h-[72px]");
    expect(screen.getByTestId("icon-slot")).toHaveClass("rounded-2xl");
  });

  it("AC-14: Actions slot stacks vertically on size='sm' and horizontally on size='md'/'lg'", () => {
    const { rerender } = render(
      <EmptyState size="sm">
        <EmptyStateTitle>X</EmptyStateTitle>
        <EmptyStateActions data-testid="actions">
          <button type="button">A</button>
          <button type="button">B</button>
        </EmptyStateActions>
      </EmptyState>,
    );
    expect(screen.getByTestId("actions")).toHaveClass("flex-col");
    expect(screen.getByTestId("actions")).not.toHaveClass("flex-row");

    rerender(
      <EmptyState size="md">
        <EmptyStateTitle>X</EmptyStateTitle>
        <EmptyStateActions data-testid="actions">
          <button type="button">A</button>
          <button type="button">B</button>
        </EmptyStateActions>
      </EmptyState>,
    );
    expect(screen.getByTestId("actions")).toHaveClass("flex-row");

    rerender(
      <EmptyState size="lg">
        <EmptyStateTitle>X</EmptyStateTitle>
        <EmptyStateActions data-testid="actions">
          <button type="button">A</button>
          <button type="button">B</button>
        </EmptyStateActions>
      </EmptyState>,
    );
    expect(screen.getByTestId("actions")).toHaveClass("flex-row");
  });

  // ────────────────────────────────────────────────────────────────
  // Behavior (AC-15..17)
  // ────────────────────────────────────────────────────────────────

  it("AC-15: renders correctly with only a Title (no Icon/Illustration/Description/Actions)", () => {
    render(
      <EmptyState data-testid="root">
        <EmptyStateTitle>Nada por aqui</EmptyStateTitle>
      </EmptyState>,
    );
    const root = screen.getByTestId("root");
    expect(root).toHaveClass("flex");
    expect(root).toHaveClass("flex-col");
    expect(root).toHaveClass("items-center");
    expect(root).toHaveClass("text-center");
    expect(
      screen.getByRole("heading", { name: /nada por aqui/i }),
    ).toBeInTheDocument();
  });

  it("AC-16: supports Illustration slot as an alternative to Icon (slots are distinct surfaces)", () => {
    render(
      <EmptyState>
        <EmptyStateIllustration data-testid="illustration-slot">
          <svg width="120" height="100" />
        </EmptyStateIllustration>
        <EmptyStateTitle>Sem dados</EmptyStateTitle>
      </EmptyState>,
    );
    const slot = screen.getByTestId("illustration-slot");
    expect(slot).toHaveAttribute("data-slot", "empty-state-illustration");
    expect(slot).toHaveAttribute("aria-hidden", "true");
    // Illustration does NOT carry the icon-container background — it is a
    // free slot for consumer-supplied images/SVG.
    expect(slot).not.toHaveClass("bg-muted");
  });

  it("AC-17: Actions slot renders arbitrary ReactNode children without imposing button styling", () => {
    render(
      <EmptyState>
        <EmptyStateTitle>Sem dados</EmptyStateTitle>
        <EmptyStateActions>
          <button type="button">Conectar banco</button>
          <button type="button">Importar CSV</button>
        </EmptyStateActions>
      </EmptyState>,
    );
    expect(
      screen.getByRole("button", { name: /conectar banco/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /importar csv/i }),
    ).toBeInTheDocument();
  });

  // ────────────────────────────────────────────────────────────────
  // Subcomponent contract (slot markers + standalone-render error)
  // ────────────────────────────────────────────────────────────────

  it("subcomponents carry `data-slot` markers for styling and testing", () => {
    render(
      <EmptyState>
        <EmptyStateIcon data-testid="icon">
          <svg />
        </EmptyStateIcon>
        <EmptyStateTitle data-testid="title">X</EmptyStateTitle>
        <EmptyStateDescription data-testid="desc">Y</EmptyStateDescription>
        <EmptyStateActions data-testid="actions">
          <button type="button">Z</button>
        </EmptyStateActions>
      </EmptyState>,
    );
    expect(screen.getByTestId("icon")).toHaveAttribute(
      "data-slot",
      "empty-state-icon",
    );
    expect(screen.getByTestId("title")).toHaveAttribute(
      "data-slot",
      "empty-state-title",
    );
    expect(screen.getByTestId("desc")).toHaveAttribute(
      "data-slot",
      "empty-state-description",
    );
    expect(screen.getByTestId("actions")).toHaveAttribute(
      "data-slot",
      "empty-state-actions",
    );
  });

  it("subcomponents throw a helpful error when rendered outside <EmptyState>", () => {
    // Silence the React error boundary noise for this assertion.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() =>
      render(<EmptyStateTitle>Standalone</EmptyStateTitle>),
    ).toThrow(/<EmptyState\.Title>/);
    consoleError.mockRestore();
  });

  // ────────────────────────────────────────────────────────────────
  // Accessibility — jest-axe in light + dark via axeInThemes (AC-22)
  // ────────────────────────────────────────────────────────────────

  describe("a11y (axe in light + dark)", () => {
    it("AC-22: Default — title only — has no a11y violations in light + dark", async () => {
      const { container } = render(
        <EmptyState>
          <EmptyStateTitle>Nada por aqui</EmptyStateTitle>
        </EmptyState>,
      );
      await axeInThemes(container);
    });

    it("AC-22: WithIcon + Description + Actions — no a11y violations in light + dark", async () => {
      const { container } = render(
        <EmptyState>
          <EmptyStateIcon>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Inbox"
            >
              <rect width="24" height="24" rx="4" />
            </svg>
          </EmptyStateIcon>
          <EmptyStateTitle>Nenhum lançamento</EmptyStateTitle>
          <EmptyStateDescription>
            Conecte um banco para começar a conciliar.
          </EmptyStateDescription>
          <EmptyStateActions>
            <button
              type="button"
              className="rounded-md border border-border-strong bg-primary px-3 py-2 text-sm text-primary-foreground"
            >
              Conectar banco
            </button>
          </EmptyStateActions>
        </EmptyState>,
      );
      await axeInThemes(container);
    });

    it("AC-22: WithIllustration + Description + Actions — no a11y violations in light + dark", async () => {
      const { container } = render(
        <EmptyState size="lg">
          <EmptyStateIllustration>
            <svg width="120" height="100" role="img" aria-label="Empty box">
              <rect width="120" height="100" rx="6" />
            </svg>
          </EmptyStateIllustration>
          <EmptyStateTitle>Sem dados ainda</EmptyStateTitle>
          <EmptyStateDescription>
            Importe sua primeira planilha para visualizar os lançamentos.
          </EmptyStateDescription>
          <EmptyStateActions>
            <button
              type="button"
              className="rounded-md border border-border-strong bg-primary px-3 py-2 text-sm text-primary-foreground"
            >
              Importar CSV
            </button>
          </EmptyStateActions>
        </EmptyState>,
      );
      await axeInThemes(container);
    });
  });
});
