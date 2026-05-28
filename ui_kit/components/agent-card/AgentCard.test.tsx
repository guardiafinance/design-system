import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRef } from "react";
import { Scale } from "lucide-react";

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
  AgentCardMetrics,
  AgentCardMetric,
  AgentCardLastRun,
  AgentCardFooter,
  AGENT_STATUS_LABELS,
  agentStatusToBadgeVariant,
  type AgentStatus,
} from "./index";

/**
 * Nota (`lex-frontend-testing` §2):
 *   - O ponto colorido do status e a barra de accent são decorativos
 *     (`aria-hidden`) — sem query semântica disponível. As asserções sobre
 *     eles usam `data-slot`, conforme exceção da regra.
 *   - Ativação por teclado (Enter/Espaço) é sintetizada via `fireEvent.keyDown`
 *     que dispara o evento `keydown` nativo exatamente como o browser.
 */

/** Card completo com métricas + footer, reusado nos testes de a11y. */
function FullCard(props: React.ComponentProps<typeof AgentCard>) {
  return (
    <AgentCard {...props}>
      <AgentCard.Header>
        <AgentCard.Avatar />
        <div>
          <AgentCard.Name>Bia</AgentCard.Name>
          <AgentCard.Role>Conciliação Bancária</AgentCard.Role>
        </div>
        <AgentCard.Status />
      </AgentCard.Header>
      <AgentCard.Metrics>
        <AgentCard.Metric label="conciliado hoje" value="248" />
        <AgentCard.Metric label="taxa match" value="97%" />
        <AgentCard.Metric label="pendentes" value="3" />
      </AgentCard.Metrics>
      <AgentCard.Footer>
        <AgentCard.LastRun>há 2 min</AgentCard.LastRun>
      </AgentCard.Footer>
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
    render(<AgentCard interactive>x</AgentCard>);
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

  it("AC-3 — `interactive` ativa onClick com Enter e Espaço", () => {
    const onClick = vi.fn();
    render(
      <AgentCard interactive onClick={onClick}>
        x
      </AgentCard>,
    );
    const root = screen.getByRole("article");
    fireEvent.keyDown(root, { key: "Enter" });
    fireEvent.keyDown(root, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("AC-3 — Enter em filho focável NÃO sequestra o onClick do card", () => {
    const onCardClick = vi.fn();
    render(
      <AgentCard interactive onClick={onCardClick}>
        <AgentCard.Footer>
          <button type="button">Reativar</button>
        </AgentCard.Footer>
      </AgentCard>,
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Reativar" }), {
      key: "Enter",
    });
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it("AC-3 — sem `interactive`, Enter/Espaço NÃO disparam onClick", () => {
    const onClick = vi.fn();
    render(<AgentCard onClick={onClick}>x</AgentCard>);
    const root = screen.getByRole("article");
    fireEvent.keyDown(root, { key: "Enter" });
    fireEvent.keyDown(root, { key: " " });
    expect(onClick).not.toHaveBeenCalled();
  });

  /* ── AC-4 — accent (stripe + data-accent) ─────────────────────── */
  it("AC-4 — `accent` default é 'violet' (stripe roxa)", () => {
    const { container } = render(<AgentCard>x</AgentCard>);
    const root = screen.getByRole("article");
    expect(root).toHaveAttribute("data-accent", "violet");
    const stripe = container.querySelector('[data-slot="agent-card-accent"]');
    expect(stripe).toHaveClass("bg-guardia-purple-500");
    expect(stripe).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["orange", "bg-guardia-orange-500"],
    ["blue", "bg-signal-blue"],
    ["green", "bg-signal-green"],
  ] as const)(
    "AC-4 — `accent=%s` pinta a stripe com %s",
    (accent, stripeClass) => {
      const { container } = render(<AgentCard accent={accent}>x</AgentCard>);
      const stripe = container.querySelector(
        '[data-slot="agent-card-accent"]',
      );
      expect(stripe).toHaveClass(stripeClass);
    },
  );

  /* ── AC-5 — avatar (icon-only, no humanização) ────────────────── */
  it("AC-5 — Avatar renderiza ícone Bot por padrão (lucide)", () => {
    const { container } = render(<AgentCard.Avatar />);
    const avatar = container.querySelector('[data-slot="agent-card-avatar"]');
    expect(avatar).toBeInTheDocument();
    // Lucide injeta uma <svg> dentro — não humanização (sem <img>).
    expect(avatar?.querySelector("svg")).toBeInTheDocument();
    expect(avatar?.querySelector("img")).toBeNull();
  });

  it("AC-5 — Avatar aceita ícone customizado via prop", () => {
    const { container } = render(
      <AgentCard.Avatar icon={<Scale data-testid="custom-icon" />} />,
    );
    expect(container.querySelector('[data-testid="custom-icon"]')).toBeInTheDocument();
  });

  it("AC-5 — Avatar herda accent do root via contexto (tint correspondente)", () => {
    const { container } = render(
      <AgentCard accent="green">
        <AgentCard.Avatar />
      </AgentCard>,
    );
    const avatar = container.querySelector('[data-slot="agent-card-avatar"]');
    expect(avatar).toHaveAttribute("data-accent", "green");
    expect(avatar).toHaveClass("bg-success-soft", "text-signal-green");
  });

  it("AC-5 — Avatar com `accent` explícito sobrescreve o contexto", () => {
    const { container } = render(
      <AgentCard accent="violet">
        <AgentCard.Avatar accent="orange" />
      </AgentCard>,
    );
    const avatar = container.querySelector('[data-slot="agent-card-avatar"]');
    expect(avatar).toHaveAttribute("data-accent", "orange");
    expect(avatar).toHaveClass("bg-guardia-orange-100");
  });

  /* ── AC-6 — name ─────────────────────────────────────────────── */
  it("AC-6 — `Name` renderiza heading h3 por padrão", () => {
    render(<AgentCardName>Bia</AgentCardName>);
    const heading = screen.getByRole("heading", { name: "Bia", level: 3 });
    expect(heading).toHaveAttribute("data-slot", "agent-card-name");
  });

  it("AC-6 — `Name` aceita `as` para mudar o nível do heading", () => {
    render(<AgentCardName as="h2">Bia</AgentCardName>);
    expect(
      screen.getByRole("heading", { name: "Bia", level: 2 }),
    ).toBeInTheDocument();
  });

  /* ── AC-7 — role ─────────────────────────────────────────────── */
  it("AC-7 — `Role` é subtítulo discreto (text-fg-muted)", () => {
    render(<AgentCardRole>Conciliação Bancária</AgentCardRole>);
    const role = screen.getByText("Conciliação Bancária");
    expect(role).toHaveAttribute("data-slot", "agent-card-role");
    expect(role).toHaveClass("text-fg-muted");
  });

  /* ── AC-8 — status pill ──────────────────────────────────────── */
  it("AC-8 — `Status` é role=status com rótulo herdado do root", () => {
    render(
      <AgentCard status="working">
        <AgentCard.Status />
      </AgentCard>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Trabalhando");
  });

  it("AC-8 — `status` explícito sobrescreve o contexto", () => {
    render(
      <AgentCard status="working">
        <AgentCard.Status status="error" />
      </AgentCard>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Erro");
  });

  it("AC-8 — `label` sobrescreve o rótulo padrão", () => {
    render(<AgentCardStatus status="active" label="Conciliando" />);
    expect(screen.getByRole("status")).toHaveTextContent("Conciliando");
  });

  it("AC-8 — `Status` sem contexto cai para idle (Ocioso)", () => {
    render(<AgentCardStatus />);
    expect(screen.getByRole("status")).toHaveTextContent("Ocioso");
  });

  it("AC-8 — pill `active` aplica o anel de glow ao ponto (bg-signal-green)", () => {
    const { container } = render(<AgentCardStatus status="active" />);
    const dot = container.querySelector('[data-slot="agent-card-status-dot"]');
    expect(dot).toHaveClass("bg-signal-green");
    // anel via shadow arbitrário — basta provar que o token foi aplicado;
    // valor exato do shadow é tested visualmente (snapshots).
    expect(dot?.getAttribute("class")).toContain("box-shadow");
  });

  it("AC-8 — pill `error` aplica bg-danger-soft + texto signal-red-700", () => {
    render(<AgentCardStatus status="error" />);
    const pill = screen.getByRole("status");
    expect(pill).toHaveClass("bg-danger-soft", "text-signal-red-700");
  });

  /* ── AC-9 — status mapping (helpers públicos) ─────────────────── */
  it("AC-9 — rótulos localizados cobrem os 6 status", () => {
    expect(AGENT_STATUS_LABELS).toEqual({
      idle: "Ocioso",
      working: "Trabalhando",
      active: "Ativo",
      paused: "Pausado",
      error: "Erro",
      offline: "Offline",
    });
  });

  it("AC-9 — `agentStatusToBadgeVariant` mapeia cada status (helper público)", () => {
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

  /* ── AC-10 — description ─────────────────────────────────────── */
  it("AC-10 — `Description` renderiza parágrafo com data-slot", () => {
    render(<AgentCardDescription>Concilia lançamentos.</AgentCardDescription>);
    const desc = screen.getByText("Concilia lançamentos.");
    expect(desc.tagName).toBe("P");
    expect(desc).toHaveAttribute("data-slot", "agent-card-description");
  });

  /* ── AC-11 — capabilities ────────────────────────────────────── */
  it("AC-11 — `Capabilities` é lista (role=list) com Capability=listitem+Badge", () => {
    render(
      <AgentCardCapabilities>
        <AgentCardCapability>Conciliação</AgentCardCapability>
        <AgentCardCapability>Auditoria</AgentCardCapability>
      </AgentCardCapabilities>,
    );
    expect(screen.getByRole("list")).toHaveAttribute(
      "data-slot",
      "agent-card-capabilities",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Conciliação")).toBeInTheDocument();
  });

  /* ── AC-12 — metrics (dl/dt/dd, KPI grid) ─────────────────────── */
  it("AC-12 — `Metrics` é uma <dl> com dt (label) + dd (value)", () => {
    const { container } = render(
      <AgentCardMetrics>
        <AgentCardMetric label="conciliado hoje" value="248" />
        <AgentCardMetric label="taxa match" value="97%" />
      </AgentCardMetrics>,
    );
    const dl = container.querySelector('[data-slot="agent-card-metrics"]');
    expect(dl?.tagName).toBe("DL");
    expect(container.querySelectorAll("dt")).toHaveLength(2);
    expect(container.querySelectorAll("dd")).toHaveLength(2);
    expect(screen.getByText("248")).toBeInTheDocument();
    expect(screen.getByText("conciliado hoje")).toBeInTheDocument();
  });

  it("AC-12 — valor do KPI usa tabular-nums (alinhamento em colunas)", () => {
    const { container } = render(
      <AgentCardMetric label="conciliado hoje" value="248" />,
    );
    const value = container.querySelector(
      '[data-slot="agent-card-metric-value"]',
    );
    expect(value).toHaveClass("tabular-nums", "font-semibold");
  });

  /* ── AC-13 — lastRun ─────────────────────────────────────────── */
  it("AC-13 — `LastRun` renderiza ícone Clock por padrão + texto", () => {
    const { container } = render(
      <AgentCardLastRun>há 2 min</AgentCardLastRun>,
    );
    const lr = container.querySelector('[data-slot="agent-card-last-run"]');
    expect(lr).toHaveTextContent("há 2 min");
    expect(lr?.querySelector("svg")).toBeInTheDocument();
  });

  it("AC-13 — `LastRun` permite remover o ícone com icon={null}", () => {
    const { container } = render(
      <AgentCardLastRun icon={null}>há 2 min</AgentCardLastRun>,
    );
    expect(
      container
        .querySelector('[data-slot="agent-card-last-run"]')
        ?.querySelector("svg"),
    ).toBeNull();
  });

  /* ── AC-14 — footer ──────────────────────────────────────────── */
  it("AC-14 — `Footer` é flex justify-between (lastRun à esquerda, ações à direita)", () => {
    const { container } = render(
      <AgentCardFooter>
        <span>esquerda</span>
        <button type="button">Abrir</button>
      </AgentCardFooter>,
    );
    const footer = container.querySelector('[data-slot="agent-card-footer"]');
    expect(footer).toHaveClass("flex", "justify-between");
    expect(screen.getByRole("button", { name: "Abrir" })).toBeInTheDocument();
  });

  /* ── AC-15 — compound + named exports ────────────────────────── */
  it("AC-15 — namespace composto resolve todos os subcomponentes", () => {
    expect(AgentCard.Header).toBe(AgentCardHeader);
    expect(AgentCard.Avatar).toBe(AgentCardAvatar);
    expect(AgentCard.Name).toBe(AgentCardName);
    expect(AgentCard.Role).toBe(AgentCardRole);
    expect(AgentCard.Status).toBe(AgentCardStatus);
    expect(AgentCard.Description).toBe(AgentCardDescription);
    expect(AgentCard.Capabilities).toBe(AgentCardCapabilities);
    expect(AgentCard.Capability).toBe(AgentCardCapability);
    expect(AgentCard.Metrics).toBe(AgentCardMetrics);
    expect(AgentCard.Metric).toBe(AgentCardMetric);
    expect(AgentCard.LastRun).toBe(AgentCardLastRun);
    expect(AgentCard.Footer).toBe(AgentCardFooter);
  });

  it("AC-15 — renderiza um card completo composto (header + métricas + footer)", () => {
    render(<FullCard status="active" accent="violet" />);
    expect(screen.getByRole("heading", { name: "Bia" })).toBeInTheDocument();
    expect(screen.getByText("Conciliação Bancária")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Ativo");
    expect(screen.getByText("248")).toBeInTheDocument();
    expect(screen.getByText("há 2 min")).toBeInTheDocument();
  });

  /* ── AC-16 — ref forwarding ──────────────────────────────────── */
  it("AC-16 — encaminha ref ao nó <article> (focus via ref funciona quando interactive)", () => {
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

  /* ── AC-17 — tokens semânticos ───────────────────────────────── */
  it("AC-17 — a raiz usa tokens semânticos (bg-surface + text-fg) sem cor inline", () => {
    render(<AgentCard>x</AgentCard>);
    const root = screen.getByRole("article");
    expect(root).toHaveClass("bg-surface", "text-fg", "font-sans");
    expect(root).not.toHaveAttribute("style");
  });

  it("AC-17 — métricas usam --bg-subtle (closest match de --gray-50 do playground)", () => {
    const { container } = render(
      <AgentCardMetrics>
        <AgentCardMetric label="x" value="1" />
      </AgentCardMetrics>,
    );
    const dl = container.querySelector('[data-slot="agent-card-metrics"]');
    expect(dl).toHaveClass("bg-bg-subtle", "rounded-lg");
  });

  /* ── AC-18 — a11y (jest-axe, light + dark) ───────────────────── */
  it("AC-18 — Default sem violações a11y em light + dark", async () => {
    const { container } = render(<FullCard status="idle" />);
    await axeInThemes(container);
  });

  it("AC-18 — estado interativo (focado) sem violações em light + dark", async () => {
    const { container } = render(
      <FullCard interactive status="active" accent="orange" />,
    );
    (screen.getByRole("article") as HTMLElement).focus();
    await axeInThemes(container);
  });

  it("AC-18 — status error com métricas sem violações em light + dark", async () => {
    const { container } = render(
      <FullCard status="error" accent="green" />,
    );
    await axeInThemes(container);
  });
});
