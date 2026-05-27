import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRef } from "react";

import { axeInThemes } from "@/test-utils/a11y";
import {
  AgentCard,
  AgentCardHeader,
  AgentCardAvatar,
  AgentCardName,
  AgentCardRole,
  AgentCardStatus,
  AgentCardDescription,
  AgentCardCapabilities,
  AgentCardCapability,
  AgentCardFooter,
  AGENT_STATUS_LABELS,
  agentStatusToBadgeVariant,
  type AgentStatus,
} from "./index";

/**
 * Nota sobre o ponto de status (`lex-frontend-testing` §2): o ponto colorido
 * sobre o avatar é decorativo (`aria-hidden`) e redundante ao rótulo textual
 * do `AgentCard.Status` — não tem (e não deve ter) query acessível. As poucas
 * asserções sobre ele usam `data-slot` por ser o único seletor possível para
 * um elemento sem semântica, conforme a exceção da regra.
 *
 * Ativação por teclado (Enter/Espaço) é sintetizada via `fireEvent.keyDown`,
 * que dispara o `keydown` nativo exatamente como o browser o entregaria.
 */

/** Card completo realista, reusado nos testes de a11y. */
function FullCard(props: React.ComponentProps<typeof AgentCard>) {
  return (
    <AgentCard {...props}>
      <AgentCard.Header>
        <AgentCard.Avatar name="Isac" />
        <div>
          <AgentCard.Name>Isac</AgentCard.Name>
          <AgentCard.Role>Assistente contábil</AgentCard.Role>
        </div>
        <AgentCard.Status />
      </AgentCard.Header>
      <AgentCard.Description>
        Concilia lançamentos e audita movimentações financeiras.
      </AgentCard.Description>
      <AgentCard.Capabilities>
        <AgentCard.Capability>Conciliação</AgentCard.Capability>
        <AgentCard.Capability>Auditoria</AgentCard.Capability>
      </AgentCard.Capabilities>
    </AgentCard>
  );
}

describe("AgentCard", () => {
  /* ── AC-1 — root element ─────────────────────────────────────── */
  it("AC-1 — renderiza <article data-slot='agent-card'> por padrão", () => {
    render(<AgentCard>conteúdo</AgentCard>);
    const root = screen.getByRole("article");
    expect(root.tagName).toBe("ARTICLE");
    expect(root).toHaveAttribute("data-slot", "agent-card");
  });

  it("AC-1 — `as='section'` troca o elemento semântico raiz", () => {
    const { container } = render(<AgentCard as="section">x</AgentCard>);
    const root = container.querySelector('[data-slot="agent-card"]');
    expect(root?.tagName).toBe("SECTION");
  });

  /* ── AC-2 — variant ──────────────────────────────────────────── */
  it("AC-2 — variant default aplica border + shadow-sm e expõe data-variant", () => {
    render(<AgentCard>x</AgentCard>);
    const root = screen.getByRole("article");
    expect(root).toHaveClass("border", "shadow-sm");
    expect(root).toHaveAttribute("data-variant", "default");
  });

  it("AC-2 — variant elevated aplica shadow-md", () => {
    render(<AgentCard variant="elevated">x</AgentCard>);
    expect(screen.getByRole("article")).toHaveClass("shadow-md");
  });

  it("AC-2 — variant outlined aplica border-2 + border-border-strong", () => {
    render(<AgentCard variant="outlined">x</AgentCard>);
    expect(screen.getByRole("article")).toHaveClass(
      "border-2",
      "border-border-strong",
    );
  });

  /* ── AC-3 — interactive + teclado ────────────────────────────── */
  it("AC-3 — `interactive` torna o card focável (tabindex=0)", () => {
    render(
      <AgentCard interactive>
        x
      </AgentCard>,
    );
    expect(screen.getByRole("article")).toHaveAttribute("tabindex", "0");
  });

  it("AC-3 — sem `interactive`, o card não é focável (sem tabindex)", () => {
    render(<AgentCard>x</AgentCard>);
    expect(screen.getByRole("article")).not.toHaveAttribute("tabindex");
  });

  it("AC-3 — `interactive` dispara onClick no clique do mouse", () => {
    const onClick = vi.fn();
    render(
      <AgentCard interactive onClick={onClick}>
        x
      </AgentCard>,
    );
    fireEvent.click(screen.getByRole("article"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("AC-3 — `interactive` ativa onClick com Enter", () => {
    const onClick = vi.fn();
    render(
      <AgentCard interactive onClick={onClick}>
        x
      </AgentCard>,
    );
    fireEvent.keyDown(screen.getByRole("article"), { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("AC-3 — `interactive` ativa onClick com Espaço", () => {
    const onClick = vi.fn();
    render(
      <AgentCard interactive onClick={onClick}>
        x
      </AgentCard>,
    );
    fireEvent.keyDown(screen.getByRole("article"), { key: " " });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("AC-3 — Enter em filho focável (botão no Footer) NÃO sequestra o onClick do card", () => {
    const onCardClick = vi.fn();
    const onChildClick = vi.fn();
    render(
      <AgentCard interactive onClick={onCardClick}>
        <AgentCard.Footer>
          <button type="button" onClick={onChildClick}>
            Reativar
          </button>
        </AgentCard.Footer>
      </AgentCard>,
    );
    // Enter pressionado NO botão filho borbulha até a raiz; o card não deve
    // sintetizar seu próprio click (event.target !== event.currentTarget).
    fireEvent.keyDown(screen.getByRole("button", { name: "Reativar" }), {
      key: "Enter",
    });
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it("AC-3 — sem `interactive`, Enter/Espaço NÃO disparam onClick", () => {
    const onClick = vi.fn();
    render(
      <AgentCard onClick={onClick}>
        x
      </AgentCard>,
    );
    const root = screen.getByRole("article");
    fireEvent.keyDown(root, { key: "Enter" });
    fireEvent.keyDown(root, { key: " " });
    expect(onClick).not.toHaveBeenCalled();
  });

  /* ── AC-4 — avatar ───────────────────────────────────────────── */
  it("AC-4 — com `src`, renderiza a imagem com alt acessível", () => {
    render(<AgentCard.Avatar name="Isac" src="/isac.png" alt="Isac" />);
    expect(screen.getByRole("img", { name: "Isac" })).toBeInTheDocument();
  });

  it("AC-4 — sem `src`, mostra as iniciais derivadas de `name`", () => {
    render(<AgentCard.Avatar name="Isac" />);
    expect(screen.getByText("IS")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("AC-4 — renderiza o ponto de status decorativo (aria-hidden) refletindo o status", () => {
    const { container } = render(
      <AgentCard status="error">
        <AgentCard.Avatar name="Isac" />
      </AgentCard>,
    );
    const dot = container.querySelector('[data-slot="agent-card-status-dot"]');
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(dot).toHaveAttribute("data-status", "error");
    expect(dot).toHaveClass("bg-signal-red");
  });

  it("AC-4 — `hideStatusDot` remove o ponto decorativo", () => {
    const { container } = render(<AgentCard.Avatar name="Isac" hideStatusDot />);
    expect(
      container.querySelector('[data-slot="agent-card-status-dot"]'),
    ).toBeNull();
  });

  /* ── AC-5 — name ─────────────────────────────────────────────── */
  it("AC-5 — `Name` renderiza um heading h3 por padrão", () => {
    render(<AgentCardName>Isac</AgentCardName>);
    const heading = screen.getByRole("heading", { name: "Isac", level: 3 });
    expect(heading).toHaveAttribute("data-slot", "agent-card-name");
  });

  it("AC-5 — `Name` aceita `as` para mudar o nível do heading", () => {
    render(<AgentCardName as="h2">Isac</AgentCardName>);
    expect(
      screen.getByRole("heading", { name: "Isac", level: 2 }),
    ).toBeInTheDocument();
  });

  /* ── AC-6 — role ─────────────────────────────────────────────── */
  it("AC-6 — `Role` renderiza subtítulo discreto (text-fg-muted)", () => {
    render(<AgentCardRole>Assistente contábil</AgentCardRole>);
    const role = screen.getByText("Assistente contábil");
    expect(role).toHaveAttribute("data-slot", "agent-card-role");
    expect(role).toHaveClass("text-fg-muted");
  });

  /* ── AC-7 — status ───────────────────────────────────────────── */
  it("AC-7 — `Status` é um role=status com o rótulo herdado do contexto do root", () => {
    render(
      <AgentCard status="working">
        <AgentCard.Status />
      </AgentCard>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Trabalhando");
  });

  it("AC-7 — `status` explícito no `Status` sobrescreve o contexto do root", () => {
    render(
      <AgentCard status="working">
        <AgentCard.Status status="error" />
      </AgentCard>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Erro");
  });

  it("AC-7 — `label` sobrescreve o rótulo padrão", () => {
    render(<AgentCardStatus status="active" label="Conciliando agora" />);
    expect(screen.getByRole("status")).toHaveTextContent("Conciliando agora");
  });

  it("AC-7 — `Status` sem contexto cai para `idle` (Ocioso)", () => {
    render(<AgentCardStatus />);
    expect(screen.getByRole("status")).toHaveTextContent("Ocioso");
  });

  /* ── AC-8 — status mapping ───────────────────────────────────── */
  it("AC-8 — rótulos localizados cobrem os 6 status", () => {
    expect(AGENT_STATUS_LABELS).toEqual({
      idle: "Ocioso",
      working: "Trabalhando",
      active: "Ativo",
      paused: "Pausado",
      error: "Erro",
      offline: "Offline",
    });
  });

  it("AC-8 — `agentStatusToBadgeVariant` mapeia cada status ao variant correto", () => {
    const expected: Record<AgentStatus, string> = {
      idle: "neutral",
      working: "accent",
      active: "success",
      paused: "warning",
      error: "danger",
      offline: "neutral",
    };
    (Object.keys(expected) as AgentStatus[]).forEach((status) => {
      expect(agentStatusToBadgeVariant(status)).toBe(expected[status]);
    });
  });

  /* ── AC-9 — description ──────────────────────────────────────── */
  it("AC-9 — `Description` renderiza parágrafo com data-slot", () => {
    render(<AgentCardDescription>Concilia lançamentos.</AgentCardDescription>);
    const desc = screen.getByText("Concilia lançamentos.");
    expect(desc.tagName).toBe("P");
    expect(desc).toHaveAttribute("data-slot", "agent-card-description");
  });

  /* ── AC-10 — capabilities ────────────────────────────────────── */
  it("AC-10 — `Capabilities` é uma lista (role=list) de capabilities", () => {
    render(
      <AgentCardCapabilities>
        <AgentCardCapability>Conciliação</AgentCardCapability>
        <AgentCardCapability>Auditoria</AgentCardCapability>
      </AgentCardCapabilities>,
    );
    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("data-slot", "agent-card-capabilities");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Conciliação")).toBeInTheDocument();
    expect(screen.getByText("Auditoria")).toBeInTheDocument();
  });

  /* ── AC-11 — footer ──────────────────────────────────────────── */
  it("AC-11 — `Footer` renderiza container de ações", () => {
    const { container } = render(
      <AgentCardFooter>
        <button type="button">Abrir</button>
      </AgentCardFooter>,
    );
    const footer = container.querySelector('[data-slot="agent-card-footer"]');
    expect(footer).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir" })).toBeInTheDocument();
  });

  /* ── AC-12 — compound + named exports ────────────────────────── */
  it("AC-12 — namespace composto resolve todos os subcomponentes", () => {
    expect(AgentCard.Header).toBe(AgentCardHeader);
    expect(AgentCard.Avatar).toBe(AgentCardAvatar);
    expect(AgentCard.Name).toBe(AgentCardName);
    expect(AgentCard.Role).toBe(AgentCardRole);
    expect(AgentCard.Status).toBe(AgentCardStatus);
    expect(AgentCard.Description).toBe(AgentCardDescription);
    expect(AgentCard.Capabilities).toBe(AgentCardCapabilities);
    expect(AgentCard.Capability).toBe(AgentCardCapability);
    expect(AgentCard.Footer).toBe(AgentCardFooter);
  });

  it("AC-12 — renderiza um card completo composto", () => {
    render(<FullCard />);
    expect(screen.getByRole("heading", { name: "Isac" })).toBeInTheDocument();
    expect(screen.getByText("Assistente contábil")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Ocioso");
    expect(screen.getByText("Conciliação")).toBeInTheDocument();
  });

  /* ── AC-13 — ref forwarding ──────────────────────────────────── */
  it("AC-13 — encaminha ref ao nó <article> (focus via ref funciona quando interactive)", () => {
    function Wrapper() {
      const ref = useRef<HTMLElement | null>(null);
      return (
        <>
          <AgentCard ref={ref} interactive>
            x
          </AgentCard>
          <button type="button" onClick={() => ref.current?.focus()}>
            focar
          </button>
        </>
      );
    }
    render(<Wrapper />);
    screen.getByRole("button", { name: "focar" }).click();
    expect(document.activeElement).toBe(screen.getByRole("article"));
  });

  /* ── AC-14 — tokens semânticos ───────────────────────────────── */
  it("AC-14 — a raiz usa tokens semânticos (bg-card) sem cor inline", () => {
    render(<AgentCard>x</AgentCard>);
    const root = screen.getByRole("article");
    expect(root).toHaveClass("bg-card", "text-card-foreground");
    expect(root).not.toHaveAttribute("style");
  });

  it("AC-14 — o ponto de status usa classe de token da paleta, não hex inline", () => {
    const { container } = render(
      <AgentCard status="paused">
        <AgentCard.Avatar name="Isac" />
      </AgentCard>,
    );
    const dot = container.querySelector('[data-slot="agent-card-status-dot"]');
    expect(dot).toHaveClass("bg-signal-yellow");
    expect(dot).not.toHaveAttribute("style");
  });

  /* ── AC-15 — a11y (jest-axe, light + dark) ───────────────────── */
  it("AC-15 — Default sem violações a11y em light + dark", async () => {
    const { container } = render(<FullCard />);
    await axeInThemes(container);
  });

  it("AC-15 — estado interativo (focado) sem violações em light + dark", async () => {
    const { container } = render(<FullCard interactive status="working" />);
    (screen.getByRole("article") as HTMLElement).focus();
    await axeInThemes(container);
  });

  it("AC-15 — status error sem violações em light + dark", async () => {
    const { container } = render(<FullCard status="error" />);
    await axeInThemes(container);
  });
});
