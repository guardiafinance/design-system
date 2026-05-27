import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { Skeleton } from "./index";
import { axeInThemes } from "@/test-utils/a11y";

/**
 * Skeleton — testes de unidade.
 *
 * Plan #33 (review Skeleton para v0.1.0 DoD). Mapeamento AC ↔ test
 * documentado no nome de cada `it`. Skeleton é decorativo por default
 * (`aria-hidden="true"`), portanto a maioria das asserções DOM cai em
 * `getByTestId` — única exceção justificada por `lex-frontend-testing`
 * §2 (último recurso quando não há role/label). O caminho "loading
 * anunciado" (consumer envolve em `role="status" aria-busy="true"` com
 * SR-only label) usa `getByRole("status")` — query acessível.
 *
 * jest-axe roda em LIGHT + DARK via `axeInThemes(container)` em três
 * cenários (default decorativo, loading anunciado, composição realista).
 */
describe("<Skeleton />", () => {
  /* ── AC-5: shape variants + default element ────────────────── */

  it("AC-5: renderiza como <span> por default (não-focusável, fora do tab order)", () => {
    render(<Skeleton data-testid="sk" />);
    const el = screen.getByTestId("sk");
    expect(el.tagName).toBe("SPAN");
    expect(el).not.toHaveAttribute("tabindex");
    expect(el).not.toHaveAttribute("role");
  });

  it("AC-5: variant=text (default) aplica h-3.5 (linha 14px)", () => {
    render(<Skeleton data-testid="sk" />);
    expect(screen.getByTestId("sk").className).toMatch(/h-3\.5/);
  });

  it("AC-5: variant=title aplica h-[22px] (linha 22px)", () => {
    render(<Skeleton variant="title" data-testid="sk" />);
    expect(screen.getByTestId("sk").className).toMatch(/h-\[22px\]/);
  });

  it("AC-5: variant=rect aplica h-20 (bloco 80px)", () => {
    render(<Skeleton variant="rect" data-testid="sk" />);
    expect(screen.getByTestId("sk").className).toMatch(/h-20/);
  });

  it("AC-5: variant=circle aplica rounded-full + dimensão 10×10", () => {
    render(<Skeleton variant="circle" data-testid="sk" />);
    const el = screen.getByTestId("sk");
    expect(el.className).toMatch(/rounded-full/);
    expect(el.className).toMatch(/h-10/);
    expect(el.className).toMatch(/w-10/);
  });

  /* ── AC-5 continuação: dimensões custom ───────────────────── */

  it("AC-5: aceita width/height numéricos (px implícito)", () => {
    render(<Skeleton width={240} height={16} data-testid="sk" />);
    const el = screen.getByTestId("sk");
    expect(el.style.width).toBe("240px");
    expect(el.style.height).toBe("16px");
  });

  it("AC-5: aceita width/height como string (rem, %)", () => {
    render(<Skeleton width="80%" height="2rem" data-testid="sk" />);
    const el = screen.getByTestId("sk");
    expect(el.style.width).toBe("80%");
    expect(el.style.height).toBe("2rem");
  });

  it("AC-5: preserva inline style adicional do consumidor", () => {
    render(
      <Skeleton
        width={120}
        style={{ marginTop: "8px" }}
        data-testid="sk"
      />,
    );
    const el = screen.getByTestId("sk");
    expect(el.style.width).toBe("120px");
    expect(el.style.marginTop).toBe("8px");
  });

  /* ── AC-6: lines (parágrafo) ───────────────────────────────── */

  it("AC-6: lines=3 com text gera 3 placeholders dentro do wrapper", () => {
    render(<Skeleton variant="text" lines={3} data-testid="sk" />);
    const wrapper = screen.getByTestId("sk");
    expect(wrapper.children.length).toBe(3);
  });

  it("AC-6: última linha cai em 70% (default sem width custom)", () => {
    render(<Skeleton variant="text" lines={3} data-testid="sk" />);
    const wrapper = screen.getByTestId("sk");
    const last = wrapper.children[2] as HTMLElement;
    expect(last.style.width).toBe("70%");
  });

  it("AC-6: linhas anteriores ocupam 100% (default sem width custom)", () => {
    render(<Skeleton variant="text" lines={3} data-testid="sk" />);
    const wrapper = screen.getByTestId("sk");
    const first = wrapper.children[0] as HTMLElement;
    expect(first.style.width).toBe("100%");
  });

  it("AC-6: width custom propaga para TODAS as linhas (inclusive a última)", () => {
    render(
      <Skeleton variant="text" lines={3} width={200} data-testid="sk" />,
    );
    const wrapper = screen.getByTestId("sk");
    Array.from(wrapper.children).forEach((child) => {
      expect((child as HTMLElement).style.width).toBe("200px");
    });
  });

  it("AC-6: lines=1 não renderiza wrapper extra (mantém span único)", () => {
    render(<Skeleton variant="text" lines={1} data-testid="sk" />);
    const el = screen.getByTestId("sk");
    expect(el.children.length).toBe(0);
  });

  /* ── AC-7: animação respeita prefers-reduced-motion ────────── */

  it("AC-7: aplica skeleton-shimmer-bg + motion-safe animation utility", () => {
    render(<Skeleton data-testid="sk" />);
    const el = screen.getByTestId("sk");
    // Background gradient SEMPRE presente (visibilidade preservada mesmo
    // sob prefers-reduced-motion — só o shimmer some).
    expect(el.className).toMatch(/skeleton-shimmer-bg/);
    // Animation com prefix motion-safe — automaticamente desliga sob
    // prefers-reduced-motion (Tailwind v4 modifier).
    expect(el.className).toMatch(/motion-safe:animate-\[skeleton-shimmer/);
  });

  /* ── AC-3: atributos a11y ──────────────────────────────────── */

  it("AC-3: aria-hidden=true por default (Skeleton é decorativo)", () => {
    render(<Skeleton data-testid="sk" />);
    expect(screen.getByTestId("sk")).toHaveAttribute("aria-hidden", "true");
  });

  it("AC-3: permite override de aria-hidden quando consumidor anuncia loading", () => {
    render(<Skeleton aria-hidden={false} data-testid="sk" />);
    expect(screen.getByTestId("sk")).toHaveAttribute("aria-hidden", "false");
  });

  it("AC-3: por ser aria-hidden, fica fora da árvore acessível (nenhum role implícito)", () => {
    render(<Skeleton width={240} />);
    // Skeleton decorativo NÃO é alcançável por queries acessíveis.
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  /* ── AC-3: padrão consumer "loading anunciado" (accessible query) */

  it("AC-3: padrão consumer com role=status expõe nome acessível ao SR", () => {
    render(
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label="Carregando perfil"
      >
        <Skeleton variant="circle" />
        <Skeleton variant="text" width="60%" />
      </div>,
    );
    const status = screen.getByRole("status", { name: /carregando perfil/i });
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  /* ── className / ref / props passthrough ──────────────────── */

  it("AC-3: respeita className customizado (composição)", () => {
    render(<Skeleton className="my-extra" data-testid="sk" />);
    expect(screen.getByTestId("sk")).toHaveClass("my-extra");
  });

  it("AC-3: encaminha ref para o <span>", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  /* ── AC-4: jest-axe LIGHT + DARK ──────────────────────────── */

  it("AC-4: jest-axe — Default decorativo é WCAG AA clean em light + dark", async () => {
    const { container } = render(<Skeleton width={240} />);
    await axeInThemes(container);
  });

  it("AC-4: jest-axe — Loading anunciado (role=status + aria-busy) é WCAG AA clean em light + dark", async () => {
    const { container } = render(
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label="Carregando conteúdo"
      >
        <Skeleton variant="text" />
        <Skeleton variant="title" />
        <Skeleton variant="rect" />
      </div>,
    );
    await axeInThemes(container);
  });

  it("AC-4: jest-axe — Composição realista (avatar + linhas) é WCAG AA clean em light + dark", async () => {
    const { container } = render(
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="70%" />
        </div>
      </div>,
    );
    await axeInThemes(container);
  });

  /* ── AC-3: regressão estrutural extra ─────────────────────── */

  it("AC-3: encaminha atributos adicionais (como data-testid) corretamente para todas as variantes", () => {
    const variants = ["text", "title", "rect", "circle"] as const;
    variants.forEach((v) => {
      const { unmount } = render(
        <Skeleton variant={v} data-testid={`sk-${v}`} />,
      );
      expect(screen.getByTestId(`sk-${v}`)).toBeInTheDocument();
      unmount();
    });
  });

  it("AC-3: dentro de container acessível, Skeleton segue invisível para SR (aria-hidden propaga)", () => {
    render(
      <div role="status" aria-busy="true" aria-label="Carregando">
        <Skeleton data-testid="inner" />
      </div>,
    );
    const status = screen.getByRole("status", { name: "Carregando" });
    const inner = within(status).getByTestId("inner");
    expect(inner).toHaveAttribute("aria-hidden", "true");
  });
});
