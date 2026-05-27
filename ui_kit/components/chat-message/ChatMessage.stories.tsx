import type { Meta, StoryObj } from "@storybook/react";

import { Avatar, AvatarFallback } from "../avatar";
import { IconButton } from "../icon-button";
import { ChatMessage } from "./index";

const meta: Meta<typeof ChatMessage> = {
  title: "Components/ChatMessage",
  component: ChatMessage,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Átomo da conversa do Isac (superfície AI-First). Compound pattern (`ChatMessage.Avatar`, `.Bubble`, `.Header`, `.Author`, `.Time`, `.Content`, `.Actions`) com 3 papéis (`user` · `assistant` · `system`) e 3 estados (`sent` · `streaming` · `error`). Apenas tokens semânticos.",
      },
    },
  },
  argTypes: {
    variant: { control: "radio", options: ["user", "assistant", "system"] },
    status: { control: "radio", options: ["sent", "streaming", "error"] },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

const IsacAvatar = () => (
  <ChatMessage.Avatar>
    <Avatar size="sm">
      <AvatarFallback color="purple">IS</AvatarFallback>
    </Avatar>
  </ChatMessage.Avatar>
);

const YouAvatar = () => (
  <ChatMessage.Avatar>
    <Avatar size="sm">
      <AvatarFallback color="gray">FS</AvatarFallback>
    </Avatar>
  </ChatMessage.Avatar>
);

export const Default: Story = {
  args: { variant: "assistant", status: "sent" },
  render: (args) => (
    <ChatMessage {...args}>
      <IsacAvatar />
      <ChatMessage.Bubble>
        <ChatMessage.Header>
          <ChatMessage.Author>Isac</ChatMessage.Author>
          <ChatMessage.Time dateTime="2026-05-27T14:32:00Z">
            14:32
          </ChatMessage.Time>
        </ChatMessage.Header>
        <ChatMessage.Content>
          Conciliei 127 lançamentos de janeiro. Restam 3 exceções para revisão.
        </ChatMessage.Content>
      </ChatMessage.Bubble>
    </ChatMessage>
  ),
};

/** Conversa completa: turno do usuário, resposta do agente e nota de sistema. */
export const Conversation: Story = {
  render: () => (
    <ul role="log" className="flex w-full max-w-xl flex-col gap-4">
      <ChatMessage as="li" variant="system">
        <ChatMessage.Bubble>
          <ChatMessage.Content>Sessão iniciada às 14:30.</ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage>

      <ChatMessage as="li" variant="user">
        <YouAvatar />
        <ChatMessage.Bubble>
          <ChatMessage.Header>
            <ChatMessage.Author>Você</ChatMessage.Author>
            <ChatMessage.Time dateTime="2026-05-27T14:31:00Z">
              14:31
            </ChatMessage.Time>
          </ChatMessage.Header>
          <ChatMessage.Content>
            Concilie os lançamentos de janeiro com o extrato bancário.
          </ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage>

      <ChatMessage as="li" variant="assistant">
        <IsacAvatar />
        <ChatMessage.Bubble>
          <ChatMessage.Header>
            <ChatMessage.Author>Isac</ChatMessage.Author>
            <ChatMessage.Time dateTime="2026-05-27T14:32:00Z">
              14:32
            </ChatMessage.Time>
          </ChatMessage.Header>
          <ChatMessage.Content>
            Conciliei 127 lançamentos. Restam 3 exceções para revisão.
          </ChatMessage.Content>
          <ChatMessage.Actions>
            <IconButton aria-label="Copiar resposta" size="sm" variant="ghost">
              ⧉
            </IconButton>
            <IconButton aria-label="Refazer" size="sm" variant="ghost">
              ↻
            </IconButton>
          </ChatMessage.Actions>
        </ChatMessage.Bubble>
      </ChatMessage>
    </ul>
  ),
};

/** Indicador de digitação — Isac está compondo a resposta (status="streaming"). */
export const Streaming: Story = {
  render: () => (
    <ChatMessage variant="assistant" status="streaming" typingLabel="Isac está digitando">
      <IsacAvatar />
      <ChatMessage.Bubble>
        <ChatMessage.Content>texto ignorado durante streaming</ChatMessage.Content>
      </ChatMessage.Bubble>
    </ChatMessage>
  ),
};

/** Falha de entrega — anel destrutivo + role="alert" + ação de retry. */
export const ErrorState: Story = {
  render: () => (
    <ChatMessage variant="assistant" status="error">
      <IsacAvatar />
      <ChatMessage.Bubble>
        <ChatMessage.Content>
          Não consegui acessar o extrato bancário. Verifique a conexão e tente
          novamente.
        </ChatMessage.Content>
        <ChatMessage.Actions>
          <IconButton aria-label="Tentar de novo" size="sm" variant="ghost">
            ↻
          </IconButton>
        </ChatMessage.Actions>
      </ChatMessage.Bubble>
    </ChatMessage>
  ),
};

/**
 * Forca o tema escuro independentemente do toggle global. Contrato visual: a
 * matriz de papéis + estados mantém WCAG AA sobre fundo Mono Black (#0E1016)
 * declarado em lex-brand-colors, usando apenas tokens semânticos.
 */
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Papéis (user · assistant · system) e estados (streaming · error) sobre fundo escuro. As bolhas trocam de paleta automaticamente via tokens (secondary/muted/destructive), com contraste WCAG AA de texto de corpo nos dois temas.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <ChatMessage variant="user">
        <YouAvatar />
        <ChatMessage.Bubble>
          <ChatMessage.Content>Mensagem do usuário.</ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage>
      <ChatMessage variant="assistant">
        <IsacAvatar />
        <ChatMessage.Bubble>
          <ChatMessage.Header>
            <ChatMessage.Author>Isac</ChatMessage.Author>
            <ChatMessage.Time dateTime="2026-05-27T14:32:00Z">
              14:32
            </ChatMessage.Time>
          </ChatMessage.Header>
          <ChatMessage.Content>Resposta do agente.</ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage>
      <ChatMessage variant="system">
        <ChatMessage.Bubble>
          <ChatMessage.Content>Nota de sistema centralizada.</ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage>
      <ChatMessage variant="assistant" status="streaming">
        <IsacAvatar />
        <ChatMessage.Bubble>
          <ChatMessage.Content>streaming</ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage>
      <ChatMessage variant="assistant" status="error">
        <IsacAvatar />
        <ChatMessage.Bubble>
          <ChatMessage.Content>Falha ao gerar resposta.</ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage>
    </div>
  ),
};
