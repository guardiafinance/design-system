import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { axeInThemes } from "@/test-utils/a11y";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./index";

describe("<Card />", () => {
  /* ─── Composição básica ──────────────────────────────────────────── */

  it("renders its children", () => {
    render(<Card>conteúdo</Card>);
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("renders as <article> by default (semantic container)", () => {
    render(<Card data-testid="c">x</Card>);
    expect(screen.getByTestId("c").tagName).toBe("ARTICLE");
  });

  it("respects `as` override (renders as section/div/button)", () => {
    const { rerender } = render(
      <Card as="section" data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId("c").tagName).toBe("SECTION");
    rerender(
      <Card as="div" data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId("c").tagName).toBe("DIV");
  });

  /* ─── Variants (defaults + variant prop) ──────────────────────────── */

  it("defaults to variant=default (border + shadow-sm)", () => {
    render(<Card data-testid="c">x</Card>);
    const el = screen.getByTestId("c");
    expect(el).toHaveAttribute("data-variant", "default");
    expect(el).toHaveClass("shadow-sm");
    expect(el).toHaveClass("border");
    expect(el).toHaveClass("border-border");
  });

  it("applies variant=elevated (shadow-md)", () => {
    render(
      <Card variant="elevated" data-testid="c">
        x
      </Card>,
    );
    const el = screen.getByTestId("c");
    expect(el).toHaveClass("shadow-md");
    expect(el).toHaveAttribute("data-variant", "elevated");
  });

  it("applies variant=outlined (no shadow, border-2 + border-strong)", () => {
    render(
      <Card variant="outlined" data-testid="c">
        x
      </Card>,
    );
    const el = screen.getByTestId("c");
    expect(el).toHaveClass("border-2");
    expect(el).toHaveClass("border-border-strong");
    expect(el).not.toHaveClass("shadow-sm");
    expect(el).not.toHaveClass("shadow-md");
  });

  /* ─── Padding ────────────────────────────────────────────────────── */

  it("defaults to padding=md (subcomponents own their own padding)", () => {
    render(<Card data-testid="c">x</Card>);
    // WHY: padding=md is the slot-default — the Card root has p-0
    // and the visual padding comes from CardHeader/CardContent/CardFooter.
    expect(screen.getByTestId("c")).toHaveClass("p-0");
  });

  it("applies padding=sm (compact card without slots)", () => {
    render(
      <Card padding="sm" data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId("c")).toHaveClass("p-4");
  });

  it("applies padding=none (consumer fully controls inner spacing)", () => {
    render(
      <Card padding="none" data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId("c")).toHaveClass("p-0");
  });

  /* ─── Tokens semânticos — zero hardcode (per #94 DoD) ──────────────── */

  it("uses semantic tokens only: bg-card + text-card-foreground (zero hardcode)", () => {
    render(<Card data-testid="c">x</Card>);
    const el = screen.getByTestId("c");
    expect(el).toHaveClass("bg-card");
    expect(el).toHaveClass("text-card-foreground");
    // Negative guard: no hex/rgb leaked into the className.
    expect(el.className).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(el.className).not.toMatch(/\brgb\(/);
  });

  /* ─── Interactive (focus + keyboard) ──────────────────────────────── */

  it("non-interactive by default (no tabindex, no role)", () => {
    render(<Card data-testid="c">x</Card>);
    const el = screen.getByTestId("c");
    expect(el).not.toHaveAttribute("tabindex");
    expect(el).not.toHaveAttribute("data-interactive");
  });

  it("interactive=true exposes tabIndex=0 + focus ring classes", () => {
    render(
      <Card interactive data-testid="c">
        x
      </Card>,
    );
    const el = screen.getByTestId("c");
    expect(el).toHaveAttribute("tabindex", "0");
    expect(el).toHaveAttribute("data-interactive", "true");
    expect(el).toHaveClass("cursor-pointer");
    expect(el.className).toMatch(/focus-visible:ring-2/);
  });

  it("interactive=true preserves caller-provided tabIndex", () => {
    render(
      <Card interactive tabIndex={-1} data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId("c")).toHaveAttribute("tabindex", "-1");
  });

  it("invokes onClick when interactive card is clicked", () => {
    const onClick = vi.fn();
    render(
      <Card interactive onClick={onClick}>
        click me
      </Card>,
    );
    fireEvent.click(screen.getByText("click me"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  /* ─── Ref forwarding ──────────────────────────────────────────────── */

  it("forwards the ref to the root element", () => {
    const ref = { current: null as HTMLElement | null };
    render(<Card ref={ref}>x</Card>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe("ARTICLE");
  });

  /* ─── Compound subcomponents ──────────────────────────────────────── */

  describe("compound subcomponents", () => {
    it("Card.Header renders a labelled flex container", () => {
      render(
        <Card>
          <Card.Header data-testid="h">header</Card.Header>
        </Card>,
      );
      const h = screen.getByTestId("h");
      expect(h).toHaveAttribute("data-slot", "card-header");
      expect(h).toHaveClass("flex", "flex-col", "p-6");
    });

    it("Card.Title renders an <h3> by default (heading level 3)", () => {
      render(<Card.Title>Título</Card.Title>);
      const t = screen.getByRole("heading", { level: 3, name: "Título" });
      expect(t).toBeInTheDocument();
      expect(t).toHaveAttribute("data-slot", "card-title");
    });

    it("Card.Title respects `as` override (h1..h6)", () => {
      render(<Card.Title as="h2">L2</Card.Title>);
      expect(
        screen.getByRole("heading", { level: 2, name: "L2" }),
      ).toBeInTheDocument();
    });

    it("Card.Description renders a <p> with muted text", () => {
      render(<Card.Description data-testid="d">desc</Card.Description>);
      const d = screen.getByTestId("d");
      expect(d.tagName).toBe("P");
      expect(d).toHaveClass("text-muted-foreground");
      expect(d).toHaveAttribute("data-slot", "card-description");
    });

    it("Card.Content + Card.Footer expose semantic data-slot attributes", () => {
      render(
        <Card>
          <Card.Content data-testid="c">corpo</Card.Content>
          <Card.Footer data-testid="f">rodapé</Card.Footer>
        </Card>,
      );
      expect(screen.getByTestId("c")).toHaveAttribute(
        "data-slot",
        "card-content",
      );
      expect(screen.getByTestId("f")).toHaveAttribute(
        "data-slot",
        "card-footer",
      );
    });

    it("named exports and Card.* namespace point to the same components", () => {
      expect(Card.Header).toBe(CardHeader);
      expect(Card.Title).toBe(CardTitle);
      expect(Card.Description).toBe(CardDescription);
      expect(Card.Content).toBe(CardContent);
      expect(Card.Footer).toBe(CardFooter);
    });
  });

  /* ─── a11y (jest-axe light + dark) ────────────────────────────────── */

  describe("a11y", () => {
    it("has no WCAG 2.1 AA violations in light + dark (default static card)", async () => {
      const { container } = render(
        <Card>
          <Card.Header>
            <Card.Title>Resumo do mês</Card.Title>
            <Card.Description>Janeiro/2026 · 127 lançamentos</Card.Description>
          </Card.Header>
          <Card.Content>
            <p>Conteúdo informativo do card.</p>
          </Card.Content>
        </Card>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (variant=elevated)", async () => {
      const { container } = render(
        <Card variant="elevated">
          <Card.Header>
            <Card.Title>Elevado</Card.Title>
            <Card.Description>shadow-md aumenta hierarquia visual.</Card.Description>
          </Card.Header>
          <Card.Content>
            <p>Conteúdo.</p>
          </Card.Content>
        </Card>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (variant=outlined)", async () => {
      const { container } = render(
        <Card variant="outlined">
          <Card.Header>
            <Card.Title>Outlined</Card.Title>
            <Card.Description>Borda forte, sem shadow.</Card.Description>
          </Card.Header>
          <Card.Content>
            <p>Conteúdo.</p>
          </Card.Content>
        </Card>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (interactive card)", async () => {
      // WHY: covers the focus-ring + cursor-pointer affordance path. The card
      // exposes role-less interactivity (it remains an <article>), so axe
      // checks both the surface contrast and the absence of nested-interactive
      // hazards.
      const { container } = render(
        <Card interactive onClick={() => {}}>
          <Card.Header>
            <Card.Title>Clicável</Card.Title>
            <Card.Description>Tab para focar, Enter para ativar via handler.</Card.Description>
          </Card.Header>
          <Card.Content>
            <p>Card como ponto-de-entrada para uma rota ou ação.</p>
          </Card.Content>
        </Card>,
      );
      await axeInThemes(container);
    });
  });

  /* ─── Backward-compat com baseline pre-#94 ───────────────────────── */

  describe("backward-compat (baseline pre-#94)", () => {
    it("named exports (CardHeader/CardTitle/CardContent/CardFooter) keep prior shape", () => {
      render(
        <Card data-testid="c">
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Desc</CardDescription>
          </CardHeader>
          <CardContent>Body</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      );
      // Baseline default look preserved: shadow-sm + border + bg-card.
      const root = screen.getByTestId("c");
      expect(root).toHaveClass("shadow-sm");
      expect(root).toHaveClass("border");
      expect(root).toHaveClass("bg-card");
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Desc")).toBeInTheDocument();
      expect(screen.getByText("Body")).toBeInTheDocument();
      expect(screen.getByText("Footer")).toBeInTheDocument();
    });
  });
});
