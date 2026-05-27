import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { Avatar, AvatarImage, AvatarFallback, initials } from "../avatar";
import { Badge, type BadgeProps } from "../badge";

/**
 * AgentCard — cartão de identidade de um agente de IA (Guardia-specific).
 *
 * Surfaceia, em um único container coeso, três coisas que definem um agente
 * no contexto AI-First da Guardia (`lex-ai-first-experience`):
 *   1. Identidade — avatar + nome + papel.
 *   2. Status operacional — `idle · working · active · paused · error · offline`.
 *   3. Capabilities — o que o agente sabe fazer, como tags.
 *
 * Composição (padrão Card, Radix-style):
 *   <AgentCard status="working" variant="elevated" interactive onClick={open}>
 *     <AgentCard.Header>
 *       <AgentCard.Avatar name="Isac" src="/isac.png" />
 *       <div>
 *         <AgentCard.Name>Isac</AgentCard.Name>
 *         <AgentCard.Role>Assistente contábil</AgentCard.Role>
 *       </div>
 *       <AgentCard.Status />        // label + cor derivados do status
 *     </AgentCard.Header>
 *     <AgentCard.Description>Concilia lançamentos e audita movimentações.</AgentCard.Description>
 *     <AgentCard.Capabilities>
 *       <AgentCard.Capability>Conciliação</AgentCard.Capability>
 *       <AgentCard.Capability>Auditoria</AgentCard.Capability>
 *     </AgentCard.Capabilities>
 *     <AgentCard.Footer>... ações ...</AgentCard.Footer>
 *   </AgentCard>
 *
 * Os subcomponentes também são exportados nomeados (`AgentCardHeader`, etc.).
 *
 * **API da raiz:**
 *   - `status`: estado operacional do agente; cascateia para `AgentCard.Status`
 *     e `AgentCard.Avatar` via contexto (cada um pode sobrescrever localmente).
 *   - `variant`: `default` (shadow-sm) · `elevated` (shadow-md) · `outlined`.
 *   - `interactive`: liga foco visível + hover + ativação por `Enter`/`Espaço`
 *     (dispara `onClick`). Use quando o card inteiro é uma ação/link.
 *   - `as`: elemento semântico raiz (`article` default · `section` · `div`).
 *
 * Apenas tokens semânticos — zero cor hardcoded. Status usa as cores de sinal
 * (`signal-*`), reservadas pela marca a estados de sistema, e o laranja de
 * ação para `working` (energia/movimento).
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
  working: "accent", // laranja de ação — energia/movimento (Branding › Cores)
  active: "success", // verde sinal — positivo/saúde
  paused: "warning", // amarelo sinal — atenção/pendência
  error: "danger", // vermelho sinal — exceção crítica
  offline: "neutral",
};

/**
 * Cor do ponto decorativo no avatar (aria-hidden). Só tokens da paleta.
 * O ponto é redundante ao label textual do `AgentCard.Status` — a cor nunca
 * é o único indicador de estado (`lex-frontend-accessibility` §5.4).
 */
const AGENT_STATUS_DOT: Record<AgentStatus, string> = {
  idle: "bg-guardia-gray-500",
  working: "bg-guardia-orange-500",
  active: "bg-signal-green",
  paused: "bg-signal-yellow",
  error: "bg-signal-red",
  offline: "bg-guardia-gray-200",
};

/** Resolve o `variant` de `Badge` correspondente a um status do agente. */
export function agentStatusToBadgeVariant(status: AgentStatus): BadgeVariant {
  return AGENT_STATUS_BADGE_VARIANT[status];
}

/* ─── Context (status cascade) ─────────────────────────────────────── */

interface AgentCardContextValue {
  status: AgentStatus;
}

const AgentCardContext = React.createContext<AgentCardContextValue | null>(null);

/** Status explícito do subcomponente vence; senão herda do root; senão `idle`. */
function useAgentStatus(explicit?: AgentStatus): AgentStatus {
  const ctx = React.useContext(AgentCardContext);
  return explicit ?? ctx?.status ?? "idle";
}

/* ─── Root ─────────────────────────────────────────────────────────── */

const agentCardVariants = cva(
  ["flex flex-col gap-4 rounded-lg bg-card p-5 text-card-foreground", "transition-shadow"].join(
    " ",
  ),
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
          "hover:shadow-md focus-visible:outline-none",
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
      as: Component = "article",
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const isInteractive = Boolean(interactive);
    // WHY: card ativável precisa ser focável por teclado. A raiz é
    // <article>/<section>/<div> — nenhuma é focável por default.
    const tabIndex =
      isInteractive && props.tabIndex === undefined ? 0 : props.tabIndex;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (!isInteractive || event.defaultPrevented) return;
      // WHY: só ativa quando a tecla foi pressionada na própria raiz. Sem
      // isso, Enter/Espaço em um filho focável (ex.: botão no Footer) borbulha
      // até aqui e teria seu comportamento sequestrado pelo click sintético.
      if (event.target !== event.currentTarget) return;
      // WHY: <article>/<div> não têm ativação nativa por teclado como <button>.
      // Enter/Espaço sintetizam o click para paridade com mouse + a11y.
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    return (
      <AgentCardContext.Provider value={{ status }}>
        {React.createElement(Component, {
          ref,
          "data-slot": "agent-card",
          "data-variant": variant ?? "default",
          "data-status": status,
          "data-interactive": isInteractive || undefined,
          tabIndex,
          onKeyDown: handleKeyDown,
          className: cn(agentCardVariants({ variant, interactive }), className),
          ...props,
        })}
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
    className={cn("flex items-start gap-3", className)}
    {...props}
  />
));
AgentCardHeader.displayName = "AgentCardHeader";

/* ─── Avatar ───────────────────────────────────────────────────────── */

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AgentCardAvatarProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Nome do agente — gera as iniciais do fallback. */
  name?: string;
  /** URL do avatar. Sem `src`, mostra as iniciais de `name`. */
  src?: string;
  /** Texto alternativo da imagem. Default: `name`. */
  alt?: string;
  /** Tamanho do avatar. Default `lg`. */
  size?: AvatarSize;
  /** Status do ponto decorativo. Herda do root quando omitido. */
  status?: AgentStatus;
  /** Esconde o ponto de status decorativo. Default `false`. */
  hideStatusDot?: boolean;
}

const AgentCardAvatar = React.forwardRef<HTMLSpanElement, AgentCardAvatarProps>(
  (
    { className, name, src, alt, size = "lg", status: explicit, hideStatusDot = false, ...props },
    ref,
  ) => {
    const status = useAgentStatus(explicit);
    return (
      <span
        ref={ref}
        data-slot="agent-card-avatar"
        className={cn("relative inline-flex shrink-0", className)}
        {...props}
      >
        <Avatar size={size}>
          {src ? <AvatarImage src={src} alt={alt ?? name ?? ""} /> : null}
          <AvatarFallback>{initials(name ?? "")}</AvatarFallback>
        </Avatar>
        {!hideStatusDot && (
          <span
            aria-hidden="true"
            data-slot="agent-card-status-dot"
            data-status={status}
            className={cn(
              "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card",
              AGENT_STATUS_DOT[status],
            )}
          />
        )}
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
      className: cn(
        "text-base font-semibold leading-tight tracking-tight",
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
    className={cn("text-sm leading-tight text-fg-muted", className)}
    {...props}
  />
));
AgentCardRole.displayName = "AgentCardRole";

/* ─── Status ───────────────────────────────────────────────────────── */

export interface AgentCardStatusProps
  extends Omit<BadgeProps, "variant" | "children"> {
  /** Status a exibir. Herda do root quando omitido. */
  status?: AgentStatus;
  /** Sobrescreve o rótulo localizado padrão. */
  label?: string;
}

const AgentCardStatus = React.forwardRef<HTMLSpanElement, AgentCardStatusProps>(
  ({ className, status: explicit, label, dot = true, ...props }, ref) => {
    const status = useAgentStatus(explicit);
    return (
      <Badge
        ref={ref}
        role="status"
        data-slot="agent-card-status"
        data-status={status}
        variant={agentStatusToBadgeVariant(status)}
        dot={dot}
        className={cn("ml-auto self-start", className)}
        {...props}
      >
        {label ?? AGENT_STATUS_LABELS[status]}
      </Badge>
    );
  },
);
AgentCardStatus.displayName = "AgentCardStatus";

/* ─── Description ───────────────────────────────────────────────────── */

const AgentCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="agent-card-description"
    className={cn("text-sm leading-relaxed text-fg-muted", className)}
    {...props}
  />
));
AgentCardDescription.displayName = "AgentCardDescription";

/* ─── Capabilities ─────────────────────────────────────────────────── */

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
  // WHY: atributos HTML padrão (className, style, eventos) vão para o <li>
  // (o item da lista); `variant`/`appearance` customizam o Badge interno.
  <li ref={ref} data-slot="agent-card-capability" {...props}>
    <Badge variant={variant} appearance={appearance}>
      {children}
    </Badge>
  </li>
));
AgentCardCapability.displayName = "AgentCardCapability";

/* ─── Footer ───────────────────────────────────────────────────────── */

const AgentCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="agent-card-footer"
    className={cn("flex items-center gap-2 pt-1", className)}
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
  AgentCardFooter,
  agentCardVariants,
};
