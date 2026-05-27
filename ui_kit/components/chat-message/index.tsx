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
   * Elemento semântico raiz. Default `div`. Use `li` quando o log do consumer
   * é uma `<ul role="log">`; `article` para um turno autocontido.
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
            "data-slot": "chat-message",
            "data-variant": variant,
            "data-status": status,
            className: cn(chatMessageVariants({ variant }), className),
            ...props,
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
      variant: {
        user: "max-w-[80%] rounded-br-sm bg-primary text-primary-foreground",
        assistant: "max-w-[80%] rounded-bl-sm bg-muted text-foreground",
        system:
          "max-w-full rounded-xl bg-accent px-3 py-1.5 text-center text-xs text-accent-foreground",
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
      data-slot="chat-message-bubble"
      data-variant={variant}
      data-status={status}
      className={cn(chatBubbleVariants({ variant }), className)}
      {...props}
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
      className={cn("text-xs leading-none opacity-70", className)}
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
        data-slot="chat-message-content"
        aria-busy="true"
        className={cn("leading-relaxed", className)}
        {...props}
      >
        <ChatMessageTyping />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-slot="chat-message-content"
      // WHY: no estado de erro o conteúdo é a mensagem de falha — `role="alert"`
      // garante que a tecnologia assistiva anuncie o erro (AC-6).
      role={status === "error" ? "alert" : undefined}
      className={cn("leading-relaxed [overflow-wrap:anywhere]", className)}
      {...props}
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
