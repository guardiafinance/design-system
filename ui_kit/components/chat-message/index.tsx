import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * ChatMessage — átomo da conversa do Isac (superfície AI-First).
 *
 * Renderiza um turno do diálogo (usuário, agente ou sistema). Padrão compound
 * Radix-like: o `role` e o `status` da raiz propagam por contexto, então a
 * bolha se auto-estiliza e o avatar/header se alinham sem o consumer repetir o
 * papel em cada filho.
 *
 *   <ChatMessage role="assistant" status="sent">
 *     <ChatMessage.Avatar>
 *       <Avatar size="sm"><AvatarFallback color="purple">IS</AvatarFallback></Avatar>
 *     </ChatMessage.Avatar>
 *     <ChatMessage.Bubble>
 *       <ChatMessage.Header>
 *         <ChatMessage.Author>Isac</ChatMessage.Author>
 *         <ChatMessage.Time dateTime="2026-05-27T14:32:00Z">14:32</ChatMessage.Time>
 *       </ChatMessage.Header>
 *       <ChatMessage.Content>Conciliei 127 lançamentos.</ChatMessage.Content>
 *       <ChatMessage.Actions>…IconButton copiar/retry…</ChatMessage.Actions>
 *     </ChatMessage.Bubble>
 *   </ChatMessage>
 *
 * Apenas tokens semânticos — zero cor hardcoded. ChatMessage é o átomo de um
 * turno; o container rolável `role="log"`, agrupamento e virtualização são do
 * consumer.
 */

export type ChatRole = "user" | "assistant" | "system";
export type ChatStatus = "sent" | "streaming" | "error";

interface ChatMessageContextValue {
  variant: ChatRole;
  status: ChatStatus;
  /** Rótulo acessível do indicador de digitação (status="streaming"). */
  typingLabel: string;
}

const ChatMessageContext = React.createContext<ChatMessageContextValue>({
  variant: "assistant",
  status: "sent",
  typingLabel: "Digitando…",
});

function useChatMessage(): ChatMessageContextValue {
  return React.useContext(ChatMessageContext);
}

/* ─── Root ─────────────────────────────────────────────────────────── */

const chatMessageVariants = cva("flex w-full gap-2", {
  variants: {
    variant: {
      // WHY: usuário ancora à direita (flex-row-reverse empacota no fim →
      // lado direito), agente à esquerda, sistema centralizado como aviso
      // neutro de toda a largura.
      user: "flex-row-reverse items-end",
      assistant: "flex-row items-end",
      system: "flex-row justify-center",
    },
  },
  defaultVariants: {
    variant: "assistant",
  },
});

type ChatMessageElement = "div" | "li" | "article";

export interface ChatMessageProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof chatMessageVariants> {
  /**
   * Papel do autor do turno: `user` · `assistant` · `system`. Define
   * alinhamento e paleta da bolha (propagado por contexto). Default `assistant`.
   *
   * Nomeado `variant` (e não `role`) para não colidir com o atributo ARIA
   * `role` validado por `jsx-a11y` no código do consumer.
   */
  variant?: ChatRole;
  /** Estado de entrega do turno. Default `sent`. */
  status?: ChatStatus;
  /** Rótulo acessível do indicador de digitação. Default "Digitando…". */
  typingLabel?: string;
  /**
   * Elemento semântico raiz. Default `div`. Use `li` quando os turnos estão
   * dentro de uma `<ul>`/`<ol>` (semântica de lista). Para um transcript com
   * live region, use `<div role="log" aria-live="polite">` com turnos `div`
   * (default) ou `article` — `role="log"` e a semântica de lista são mutuamente
   * exclusivos, então não combine `as="li"` com `role="log"`.
   */
  as?: ChatMessageElement;
}

const ChatMessageRoot = React.forwardRef<HTMLElement, ChatMessageProps>(
  (
    {
      className,
      variant = "assistant",
      status = "sent",
      typingLabel = "Digitando…",
      as: Component = "div",
      children,
      ...props
    },
    ref,
  ) => {
    const ctx = React.useMemo<ChatMessageContextValue>(
      () => ({ variant, status, typingLabel }),
      [variant, status, typingLabel],
    );

    return (
      <ChatMessageContext.Provider value={ctx}>
        {React.createElement(
          Component,
          {
            ref,
            // WHY: props vêm primeiro — os atributos internos (data-slot,
            // data-variant, data-status, className) são autoritativos e não
            // podem ser sobrescritos por props arbitrárias do consumer.
            ...props,
            "data-slot": "chat-message",
            "data-variant": variant,
            "data-status": status,
            className: cn(chatMessageVariants({ variant }), className),
          },
          children,
        )}
      </ChatMessageContext.Provider>
    );
  },
);
ChatMessageRoot.displayName = "ChatMessage";

/* ─── Avatar slot ──────────────────────────────────────────────────── */

const ChatMessageAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="chat-message-avatar"
    className={cn("shrink-0 self-end", className)}
    {...props}
  />
));
ChatMessageAvatar.displayName = "ChatMessageAvatar";

/* ─── Bubble ───────────────────────────────────────────────────────── */

const chatBubbleVariants = cva(
  [
    "relative inline-block min-w-0 rounded-2xl px-4 py-2.5 text-sm",
    // Estado de erro: anel destrutivo tokenizado, sem cor hardcoded.
    "data-[status=error]:ring-1 data-[status=error]:ring-destructive",
  ].join(" "),
  {
    variants: {
      // WHY: paleta escolhida para contraste WCAG AA de TEXTO DE CORPO em
      // light + dark (axe roda no browser real). `bg-secondary` é violeta no
      // light / gray-700 no dark — branco sobre ambos passa AA. `bg-primary`
      // (laranja) só atinge 3.16:1 com branco no light, faixa reservada a
      // botões/badges por lex-brand-colors — inadequada para corpo. `system`
      // usa o par neutro muted/muted-foreground (AA nos dois temas).
      variant: {
        user: "max-w-[80%] rounded-br-sm bg-secondary text-secondary-foreground",
        assistant: "max-w-[80%] rounded-bl-sm bg-muted text-foreground",
        system:
          "max-w-full rounded-xl bg-muted px-3 py-1.5 text-center text-xs text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "assistant",
    },
  },
);

const ChatMessageBubble = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { variant, status } = useChatMessage();
  return (
    <div
      ref={ref}
      {...props}
      data-slot="chat-message-bubble"
      data-variant={variant}
      data-status={status}
      className={cn(chatBubbleVariants({ variant }), className)}
    />
  );
});
ChatMessageBubble.displayName = "ChatMessageBubble";

/* ─── Header ───────────────────────────────────────────────────────── */

const ChatMessageHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="chat-message-header"
    className={cn("mb-0.5 flex items-baseline gap-2", className)}
    {...props}
  />
));
ChatMessageHeader.displayName = "ChatMessageHeader";

/* ─── Author ───────────────────────────────────────────────────────── */

const ChatMessageAuthor = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="chat-message-author"
    className={cn("text-sm font-semibold leading-none", className)}
    {...props}
  />
));
ChatMessageAuthor.displayName = "ChatMessageAuthor";

/* ─── Time ─────────────────────────────────────────────────────────── */

export interface ChatMessageTimeProps
  extends React.TimeHTMLAttributes<HTMLTimeElement> {
  /** Valor ISO 8601 legível por máquina (atributo nativo `datetime`). */
  dateTime?: string;
}

const ChatMessageTime = React.forwardRef<HTMLTimeElement, ChatMessageTimeProps>(
  ({ className, dateTime, ...props }, ref) => (
    <time
      ref={ref}
      data-slot="chat-message-time"
      dateTime={dateTime}
      // WHY: sem opacity — a redução de opacidade derrubava o contraste do
      // timestamp abaixo de AA (axe no browser real). A hierarquia visual
      // vem do tamanho (text-xs) e do peso (author é font-semibold).
      className={cn("text-xs leading-none", className)}
      {...props}
    />
  ),
);
ChatMessageTime.displayName = "ChatMessageTime";

/* ─── Typing indicator ─────────────────────────────────────────────── */

export interface ChatMessageTypingProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Rótulo acessível. Default: `typingLabel` do contexto ("Digitando…"). */
  label?: string;
}

/**
 * Indicador de digitação (três pontos animados). Anuncia-se via `role="status"`
 * com rótulo acessível; os pontos são `aria-hidden`. Renderizado automaticamente
 * por `ChatMessage.Content` quando `status="streaming"`, e também exportado para
 * uso direto.
 */
const ChatMessageTyping = React.forwardRef<
  HTMLSpanElement,
  ChatMessageTypingProps
>(({ className, label, ...props }, ref) => {
  const { typingLabel } = useChatMessage();
  return (
    <span
      ref={ref}
      role="status"
      data-slot="chat-message-typing"
      aria-label={label ?? typingLabel}
      className={cn("inline-flex items-center gap-1 py-1", className)}
      {...props}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className="size-1.5 animate-bounce rounded-full bg-current opacity-60"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
});
ChatMessageTyping.displayName = "ChatMessageTyping";

/* ─── Content ──────────────────────────────────────────────────────── */

const ChatMessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { status } = useChatMessage();

  if (status === "streaming") {
    return (
      <div
        ref={ref}
        {...props}
        data-slot="chat-message-content"
        // WHY: aria-busy vem depois de props — o estado de carregamento é
        // crítico e não pode ser sobrescrito por uma prop do consumer.
        aria-busy="true"
        className={cn("leading-relaxed", className)}
      >
        <ChatMessageTyping />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      {...props}
      data-slot="chat-message-content"
      className={cn("leading-relaxed break-words", className)}
      // WHY: role vem depois de props — no estado de erro o conteúdo é a
      // mensagem de falha e `role="alert"` (AC-6) precisa vencer qualquer
      // `role` genérico passado pelo consumer; fora de erro, preserva o role
      // do consumer.
      role={status === "error" ? "alert" : props.role}
    >
      {children}
    </div>
  );
});
ChatMessageContent.displayName = "ChatMessageContent";

/* ─── Actions ──────────────────────────────────────────────────────── */

const ChatMessageActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="chat-message-actions"
    className={cn("mt-1.5 flex items-center gap-1", className)}
    {...props}
  />
));
ChatMessageActions.displayName = "ChatMessageActions";

/* ─── Compound namespace ───────────────────────────────────────────── */

type ChatMessageCompound = typeof ChatMessageRoot & {
  Avatar: typeof ChatMessageAvatar;
  Bubble: typeof ChatMessageBubble;
  Header: typeof ChatMessageHeader;
  Author: typeof ChatMessageAuthor;
  Time: typeof ChatMessageTime;
  Content: typeof ChatMessageContent;
  Actions: typeof ChatMessageActions;
  Typing: typeof ChatMessageTyping;
};

const ChatMessage = ChatMessageRoot as ChatMessageCompound;
ChatMessage.Avatar = ChatMessageAvatar;
ChatMessage.Bubble = ChatMessageBubble;
ChatMessage.Header = ChatMessageHeader;
ChatMessage.Author = ChatMessageAuthor;
ChatMessage.Time = ChatMessageTime;
ChatMessage.Content = ChatMessageContent;
ChatMessage.Actions = ChatMessageActions;
ChatMessage.Typing = ChatMessageTyping;

export {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageBubble,
  ChatMessageHeader,
  ChatMessageAuthor,
  ChatMessageTime,
  ChatMessageContent,
  ChatMessageActions,
  ChatMessageTyping,
  chatMessageVariants,
  chatBubbleVariants,
};
