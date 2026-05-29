import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Bot, Clock } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge, type BadgeProps } from "../badge";

/**
 * AgentCard — cartão-resumo de um agente de IA no Control Center.
 *
 * Mostra **identidade** (ícone temático + nome + papel), **status operacional**
 * em tempo real, **métricas-chave** (até 3 KPIs) e **última execução**, sob a
 * convenção AI-First da Guardia (`lex-ai-first-experience`).
 *
 * Composição (padrão Card, Radix-style):
 *   <AgentCard accent="violet" status="active" interactive onClick={open}>
 *     <AgentCard.Header>
 *       <AgentCard.Avatar icon={<ArrowLeftRight />} />
 *       <div>
 *         <AgentCard.Name>Bia</AgentCard.Name>
 *         <AgentCard.Role>Conciliação Bancária</AgentCard.Role>
 *       </div>
 *       <AgentCard.Status label="Conciliando" />
 *     </AgentCard.Header>
 *     <AgentCard.Metrics>
 *       <AgentCard.Metric label="conciliado hoje" value="248" />
 *       <AgentCard.Metric label="taxa match" value="97%" />
 *       <AgentCard.Metric label="pendentes" value="3" />
 *     </AgentCard.Metrics>
 *     <AgentCard.Footer>
 *       <AgentCard.LastRun>há 2 min</AgentCard.LastRun>
 *       ... actions ...
 *     </AgentCard.Footer>
 *   </AgentCard>
 *
 * **API da raiz:**
 *   - `accent`: cor do acento — barra lateral + tint do avatar; `violet`
 *     (default), `orange`, `blue`, `green`. Cascateia via contexto.
 *   - `status`: estado operacional do agente; cascateia para
 *     `AgentCard.Status` (e para o ponto decorativo do avatar).
 *   - `variant`: `default` (shadow-sm) · `elevated` (shadow-md) · `outlined`.
 *   - `interactive`: foco visível + hover + ativação por `Enter`/`Espaço`
 *     (dispara `onClick`). Use quando o card todo é a ação.
 *   - `as`: elemento semântico raiz (`article` default · `section` · `div`).
 *
 * Tokens semânticos somente. Substituições do playground → projeto Guardia
 * (closest-match quando o token exato não existe na nossa escala):
 *   --violet-{500,300,50} ≈ --guardia-purple-{500,200,100}
 *   --orange-{500,700,50} ≈ --guardia-orange-{500,700,100}
 *   --gray-50             ≈ --bg-subtle
 *   --radius-pill         ≈ --radius-full
 * Demais tokens (--signal-*, --success/danger/info-soft, --surface, --border,
 * --fg, --fg-muted, --shadow-md, --radius-xl/-lg, --font-sans) existem
 * literalmente no nosso `ui_kit/styles/index.css`.
 */

/* ─── Status vocabulary ────────────────────────────────────────────── */

export type AgentStatus =
  | "idle"
  | "working"
  | "active"
  | "paused"
  | "error"
  | "offline";

/** Rótulo localizado (pt-BR) por status. Locus canônico do mapeamento. */
export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "Ocioso",
  working: "Trabalhando",
  active: "Ativo",
  paused: "Pausado",
  error: "Erro",
  offline: "Offline",
};

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

const AGENT_STATUS_BADGE_VARIANT: Record<AgentStatus, BadgeVariant> = {
  idle: "neutral",
  working: "accent",
  active: "success",
  paused: "warning",
  error: "danger",
  offline: "neutral",
};

/**
 * Helper público: mapeia um status do agente ao `variant` correspondente do
 * `Badge`. Mantido para consumers que queiram colorir Badges (ex.: tags de
 * `AgentCard.Capability`) de forma coordenada com o estado do agente.
 */
export function agentStatusToBadgeVariant(status: AgentStatus): BadgeVariant {
  return AGENT_STATUS_BADGE_VARIANT[status];
}

/* ─── Accent ──────────────────────────────────────────────────────── */

export type AgentAccent = "violet" | "orange" | "blue" | "green";

const ACCENT_STRIPE: Record<AgentAccent, string> = {
  violet: "bg-guardia-purple-500",
  orange: "bg-guardia-orange-500",
  blue: "bg-signal-blue",
  green: "bg-signal-green",
};

/**
 * Tint do avatar por accent. bg-* leve + text-* saturado fornecem o
 * contraste do ícone sobre o fundo. Substituições closest-match:
 *   violet  600 (texto) → guardia-purple-500 (brand violet)
 *   blue/green          → tokens semânticos --info-soft/--success-soft
 *
 * Contraste do ícone (graphic contrast ≥ 3:1 — WCAG 2.1 AA):
 *   - violet 500 sobre violet-100 = 8.39:1 ambos temas (palette fixa).
 *   - orange-700 sobre orange-100 = 4.69:1 ambos temas (palette fixa).
 *   - blue/green usam `text-{info|success}-fg` em vez do tom puro do sinal:
 *     o token semântico `*-fg` é tema-aware (deep tone em light, mono-white
 *     em dark) e contrasta ≥ 6.6:1 sobre o `*-soft` correspondente nos
 *     dois temas. Usar `text-signal-{green|blue}` puro reprovava ambos
 *     light (verde puro #00BF63 sobre verde claro = 2.09:1) e dark
 *     (azul puro #004AAD sobre `info-soft` escuro = 1.76:1).
 */
const ACCENT_AVATAR_TINT: Record<AgentAccent, string> = {
  violet: "bg-guardia-purple-100 text-guardia-purple-500",
  orange: "bg-guardia-orange-100 text-guardia-orange-700",
  blue: "bg-info-soft text-info-fg",
  green: "bg-success-soft text-success-fg",
};

/* ─── Context (status + accent cascade) ────────────────────────────── */

interface AgentCardContextValue {
  status: AgentStatus;
  accent: AgentAccent;
}

const AgentCardContext = React.createContext<AgentCardContextValue | null>(null);

function useAgentStatus(explicit?: AgentStatus): AgentStatus {
  const ctx = React.useContext(AgentCardContext);
  return explicit ?? ctx?.status ?? "idle";
}

function useAgentAccent(explicit?: AgentAccent): AgentAccent {
  const ctx = React.useContext(AgentCardContext);
  return explicit ?? ctx?.accent ?? "violet";
}

/* ─── Root ─────────────────────────────────────────────────────────── */

const agentCardVariants = cva(
  [
    // Layout / surface (mirror playground .grd-ag)
    "relative overflow-hidden flex flex-col gap-3 p-4 rounded-xl",
    "bg-surface text-fg font-sans",
    "transition-shadow",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border border-border shadow-sm",
        elevated: "border border-border shadow-md",
        outlined: "border-2 border-border-strong",
      },
      interactive: {
        true: [
          "cursor-pointer",
          // Hover do playground: borda em violet-300 (≈ guardia-purple-200)
          // + shadow-md. Mantemos o tom de hover constante (independe do
          // accent) por parity com a referência.
          "hover:border-guardia-purple-200 hover:shadow-md",
          "focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ].join(" "),
        false: "",
      },
    },
    defaultVariants: { variant: "default", interactive: false },
  },
);

type AgentCardElement = "article" | "section" | "div";

export interface AgentCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof agentCardVariants> {
  /** Estado operacional do agente. Cascateia via contexto. Default `idle`. */
  status?: AgentStatus;
  /** Cor do acento (barra lateral + tint do avatar). Default `violet`. */
  accent?: AgentAccent;
  /** Elemento semântico raiz. Default `article`. */
  as?: AgentCardElement;
}

const AgentCardRoot = React.forwardRef<HTMLElement, AgentCardProps>(
  (
    {
      className,
      variant,
      interactive,
      status = "idle",
      accent = "violet",
      as: Component = "article",
      onKeyDown,
      children,
      ...props
    },
    ref,
  ) => {
    const isInteractive = Boolean(interactive);
    const tabIndex =
      isInteractive && props.tabIndex === undefined ? 0 : props.tabIndex;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (!isInteractive || event.defaultPrevented) return;
      // WHY: só ativa quando a tecla foi pressionada na própria raiz —
      // evita sequestrar Enter/Espaço de filhos focáveis (botões, links).
      if (event.target !== event.currentTarget) return;
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "Spacebar"
      ) {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    return (
      <AgentCardContext.Provider value={{ status, accent }}>
        {React.createElement(
          Component,
          {
            ref,
            "data-slot": "agent-card",
            "data-variant": variant ?? "default",
            "data-status": status,
            "data-accent": accent,
            "data-interactive": isInteractive || undefined,
            tabIndex,
            onKeyDown: handleKeyDown,
            className: cn(
              agentCardVariants({ variant, interactive }),
              className,
            ),
            ...props,
          },
          // Barra de acento lateral (3px). Decorativa — aria-hidden.
          <span
            aria-hidden="true"
            data-slot="agent-card-accent"
            className={cn(
              "pointer-events-none absolute left-0 top-0 bottom-0 w-[3px]",
              ACCENT_STRIPE[accent],
            )}
          />,
          children,
        )}
      </AgentCardContext.Provider>
    );
  },
);
AgentCardRoot.displayName = "AgentCard";

/* ─── Header ───────────────────────────────────────────────────────── */

const AgentCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="agent-card-header"
    className={cn("flex items-center gap-3", className)}
    {...props}
  />
));
AgentCardHeader.displayName = "AgentCardHeader";

/* ─── Avatar (icon-only — "agentes são sistemas, use ícone temático") ── */

export interface AgentCardAvatarProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Ícone temático do agente. Default: `<Bot />`. */
  icon?: React.ReactNode;
  /** Override do accent (sobrescreve o contexto do root). */
  accent?: AgentAccent;
}

const AgentCardAvatar = React.forwardRef<HTMLSpanElement, AgentCardAvatarProps>(
  ({ className, icon, accent: explicit, ...props }, ref) => {
    const accent = useAgentAccent(explicit);
    return (
      <span
        ref={ref}
        data-slot="agent-card-avatar"
        data-accent={accent}
        // Brand: o avatar do agente é um *símbolo* (não humano). 44×44,
        // radius-xl, tint do accent. Lucide `<Bot/>` como default.
        // `[&_svg]:size-5` força tamanho consistente independente do ícone.
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
          "[&_svg]:size-5 [&_svg]:shrink-0",
          ACCENT_AVATAR_TINT[accent],
          className,
        )}
        {...props}
      >
        {icon ?? <Bot aria-hidden="true" />}
      </span>
    );
  },
);
AgentCardAvatar.displayName = "AgentCardAvatar";

/* ─── Name ─────────────────────────────────────────────────────────── */

export interface AgentCardNameProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Nível semântico do heading. Default `h3`. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const AgentCardName = React.forwardRef<HTMLHeadingElement, AgentCardNameProps>(
  ({ className, as: Component = "h3", ...props }, ref) =>
    React.createElement(Component, {
      ref,
      "data-slot": "agent-card-name",
      // 15px playground (entre text-sm 14 e text-base 16) → arbitrário.
      className: cn(
        "text-[15px] font-semibold leading-tight tracking-tight text-fg",
        className,
      ),
      ...props,
    }),
);
AgentCardName.displayName = "AgentCardName";

/* ─── Role ─────────────────────────────────────────────────────────── */

const AgentCardRole = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="agent-card-role"
    className={cn("mt-px text-[12.5px] leading-tight text-fg-muted", className)}
    {...props}
  />
));
AgentCardRole.displayName = "AgentCardRole";

/* ─── Status pill ───────────────────────────────────────────────────── */

/**
 * Classes do pill por status (playground .grd-ag-status-*). Substituições:
 *   color: color-mix(signal-green 52% black) → text-signal-green-700 (token
 *     que tem exatamente essa mistura no nosso index.css).
 *   color: color-mix(signal-red 45% black)   → text-signal-red-700.
 *   --yellow-{100,900}                       → guardia-yellow-{100,900}.
 *   --gray-100                               → guardia-gray-100.
 *
 * Overrides `dark:` por status — light usa tons soft+claros (palette fixa
 * que não acompanha o tema); dark inverte para soft escuro do mesmo
 * anchor + texto claro mantendo a identidade cromática do status.
 *
 * Contraste verificado em ambos os temas (WCAG 2.1 AA, ≥ 4.5:1 para
 * texto normal — pill text 11.5px regular):
 *   idle/offline   light 7.82:1 · dark 7.82:1 (gray-500 + fg-muted)
 *   working        light 4.69:1 · dark 6.97:1 (orange-900 + orange-200)
 *   active         light 8.65:1 · dark 12.21:1 (success-soft + fg=mono-white)
 *   paused         light 7.14:1 · dark 6.31:1 (yellow-900 + yellow-200)
 *   error          light 11.89:1 · dark 13.10:1 (danger-soft + fg=mono-white)
 *
 * Pré-condição infra: `--guardia-gray-800` (#1E1E24) declarada na palette
 * para que `--*-soft` em dark (color-mix com gray-800) resolva — antes
 * disso, `bg-success-soft` e `bg-danger-soft` caíam para transparente.
 */
const STATUS_PILL_CLASSES: Record<AgentStatus, string> = {
  idle: "bg-guardia-gray-100 text-fg-muted dark:bg-guardia-gray-500 dark:text-fg-muted",
  working:
    "bg-guardia-orange-100 text-guardia-orange-700 dark:bg-guardia-orange-900 dark:text-guardia-orange-200",
  active:
    "bg-success-soft text-signal-green-700 dark:text-fg",
  paused:
    "bg-guardia-yellow-100 text-guardia-yellow-900 dark:bg-guardia-yellow-900 dark:text-guardia-yellow-200",
  error:
    "bg-danger-soft text-signal-red-700 dark:text-fg",
  offline:
    "bg-guardia-gray-100 text-fg-muted dark:bg-guardia-gray-500 dark:text-fg-muted",
};

/**
 * Classes do ponto. Para `active`, o playground aplica um anel suave
 * (color-mix signal-green 28% transparent) que não temos como token, então
 * usamos a fórmula equivalente como valor arbitrário do Tailwind.
 */
const STATUS_DOT_CLASSES: Record<AgentStatus, string> = {
  idle: "bg-current",
  working: "bg-current",
  active:
    "bg-signal-green [box-shadow:0_0_0_3px_color-mix(in_oklab,var(--signal-green)_28%,transparent)]",
  paused: "bg-current",
  error: "bg-current",
  offline: "bg-current",
};

export interface AgentCardStatusProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Status. Herda do root quando omitido. */
  status?: AgentStatus;
  /** Sobrescreve o rótulo localizado padrão. */
  label?: React.ReactNode;
}

const AgentCardStatus = React.forwardRef<HTMLSpanElement, AgentCardStatusProps>(
  ({ className, status: explicit, label, ...props }, ref) => {
    const status = useAgentStatus(explicit);
    return (
      <span
        ref={ref}
        role="status"
        data-slot="agent-card-status"
        data-status={status}
        className={cn(
          "ml-auto inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-full",
          "px-2 py-0.5 text-[11.5px] font-semibold",
          STATUS_PILL_CLASSES[status],
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          data-slot="agent-card-status-dot"
          className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT_CLASSES[status])}
        />
        {label ?? AGENT_STATUS_LABELS[status]}
      </span>
    );
  },
);
AgentCardStatus.displayName = "AgentCardStatus";

/* ─── Description ──────────────────────────────────────────────────── */

const AgentCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="agent-card-description"
    className={cn("text-[12.5px] leading-relaxed text-fg-muted", className)}
    {...props}
  />
));
AgentCardDescription.displayName = "AgentCardDescription";

/* ─── Capabilities (slot opcional, mantido da arquitetura prévia) ──── */

const AgentCardCapabilities = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-slot="agent-card-capabilities"
    className={cn("flex flex-wrap gap-1.5", className)}
    {...props}
  />
));
AgentCardCapabilities.displayName = "AgentCardCapabilities";

export interface AgentCardCapabilityProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "color"> {
  children: React.ReactNode;
  /** Variant do Badge interno. Default `neutral`. */
  variant?: BadgeProps["variant"];
  /** Appearance do Badge interno. Default `soft`. */
  appearance?: BadgeProps["appearance"];
}

const AgentCardCapability = React.forwardRef<
  HTMLLIElement,
  AgentCardCapabilityProps
>(({ children, variant = "neutral", appearance = "soft", ...props }, ref) => (
  <li ref={ref} data-slot="agent-card-capability" {...props}>
    <Badge variant={variant} appearance={appearance}>
      {children}
    </Badge>
  </li>
));
AgentCardCapability.displayName = "AgentCardCapability";

/* ─── Metrics (KPI grid — NEW) ─────────────────────────────────────── */

const AgentCardMetrics = React.forwardRef<
  HTMLDListElement,
  React.HTMLAttributes<HTMLDListElement>
>(({ className, ...props }, ref) => (
  // `<dl>` é a estrutura semântica correta para pares term↔definition.
  // HTML5 permite `<div>` em volta de `<dt>/<dd>` dentro de `<dl>`.
  <dl
    ref={ref}
    data-slot="agent-card-metrics"
    className={cn(
      // Substituição: --gray-50 (playground) → --bg-subtle (closest tinted
      // surface). --radius-lg (8px) é literal.
      "grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-2",
      "rounded-lg bg-bg-subtle px-3 py-2.5",
      className,
    )}
    {...props}
  />
));
AgentCardMetrics.displayName = "AgentCardMetrics";

export interface AgentCardMetricProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Rótulo discreto do KPI (ex.: "conciliado hoje"). */
  label: React.ReactNode;
  /** Valor proeminente do KPI (ex.: "248" / "97%"). */
  value: React.ReactNode;
}

const AgentCardMetric = React.forwardRef<HTMLDivElement, AgentCardMetricProps>(
  ({ className, label, value, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="agent-card-metric"
      // flex-col-reverse: DOM `<dt>` (label/term) precede `<dd>` (value),
      // visual mantém o valor em destaque acima do rótulo.
      className={cn(
        "flex flex-col-reverse items-center text-center",
        className,
      )}
      {...props}
    >
      <dt
        data-slot="agent-card-metric-label"
        className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"
      >
        {label}
      </dt>
      <dd
        data-slot="agent-card-metric-value"
        className="text-lg font-semibold leading-tight tabular-nums text-fg"
      >
        {value}
      </dd>
    </div>
  ),
);
AgentCardMetric.displayName = "AgentCardMetric";

/* ─── LastRun (NEW) ───────────────────────────────────────────────── */

export interface AgentCardLastRunProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Ícone à esquerda. Default: `<Clock />`. Passe `null` para ocultar. */
  icon?: React.ReactNode | null;
}

const AgentCardLastRun = React.forwardRef<
  HTMLSpanElement,
  AgentCardLastRunProps
>(({ className, icon, children, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="agent-card-last-run"
    className={cn(
      "inline-flex items-center gap-1 text-[11.5px] text-fg-muted",
      "[&_svg]:size-3 [&_svg]:shrink-0",
      className,
    )}
    {...props}
  >
    {icon === null ? null : icon ?? <Clock aria-hidden="true" />}
    {children}
  </span>
));
AgentCardLastRun.displayName = "AgentCardLastRun";

/* ─── Footer ───────────────────────────────────────────────────────── */

const AgentCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="agent-card-footer"
    className={cn(
      // Playground: justify-between para encostar `lastRun` à esquerda
      // e `actions` à direita.
      "flex items-center justify-between gap-2",
      className,
    )}
    {...props}
  />
));
AgentCardFooter.displayName = "AgentCardFooter";

/* ─── Compound namespace ───────────────────────────────────────────── */

type AgentCardCompound = typeof AgentCardRoot & {
  Header: typeof AgentCardHeader;
  Avatar: typeof AgentCardAvatar;
  Name: typeof AgentCardName;
  Role: typeof AgentCardRole;
  Status: typeof AgentCardStatus;
  Description: typeof AgentCardDescription;
  Capabilities: typeof AgentCardCapabilities;
  Capability: typeof AgentCardCapability;
  Metrics: typeof AgentCardMetrics;
  Metric: typeof AgentCardMetric;
  LastRun: typeof AgentCardLastRun;
  Footer: typeof AgentCardFooter;
};

const AgentCard = AgentCardRoot as AgentCardCompound;
AgentCard.Header = AgentCardHeader;
AgentCard.Avatar = AgentCardAvatar;
AgentCard.Name = AgentCardName;
AgentCard.Role = AgentCardRole;
AgentCard.Status = AgentCardStatus;
AgentCard.Description = AgentCardDescription;
AgentCard.Capabilities = AgentCardCapabilities;
AgentCard.Capability = AgentCardCapability;
AgentCard.Metrics = AgentCardMetrics;
AgentCard.Metric = AgentCardMetric;
AgentCard.LastRun = AgentCardLastRun;
AgentCard.Footer = AgentCardFooter;

export {
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
  agentCardVariants,
};
