import { ChatMessage } from "@ds/components/chat-message";
import { Avatar, AvatarFallback } from "@ds/components/avatar";
import { IconButton } from "@ds/components/icon-button";

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

/** Anatomia: avatar + bolha com header (autor + time) + conteúdo + ações. */
export function Anatomy() {
  return (
    <ChatMessage variant="assistant" className="w-full max-w-[440px]">
      <IsacAvatar />
      <ChatMessage.Bubble>
        <ChatMessage.Header>
          <ChatMessage.Author>Isac</ChatMessage.Author>
          <ChatMessage.Time dateTime="2026-05-27T14:32:00Z">14:32</ChatMessage.Time>
        </ChatMessage.Header>
        <ChatMessage.Content>
          Conciliei 127 lançamentos de janeiro. Restam 3 exceções para revisão.
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
  );
}

/** Papéis: user (direita) · assistant (esquerda) · system (centralizado). */
export function Roles() {
  return (
    <ul role="log" className="flex w-full max-w-[440px] flex-col gap-4">
      <ChatMessage as="li" variant="system">
        <ChatMessage.Bubble>
          <ChatMessage.Content>Sessão iniciada às 14:30.</ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage>
      <ChatMessage as="li" variant="user">
        <YouAvatar />
        <ChatMessage.Bubble>
          <ChatMessage.Content>
            Concilie os lançamentos de janeiro com o extrato.
          </ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage>
      <ChatMessage as="li" variant="assistant">
        <IsacAvatar />
        <ChatMessage.Bubble>
          <ChatMessage.Content>
            Feito. 127 conciliados, 3 exceções.
          </ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage>
    </ul>
  );
}

/** Estado streaming: indicador de digitação animado (role="status"). */
export function Streaming() {
  return (
    <ChatMessage variant="assistant" status="streaming" typingLabel="Isac está digitando">
      <IsacAvatar />
      <ChatMessage.Bubble>
        <ChatMessage.Content>placeholder</ChatMessage.Content>
      </ChatMessage.Bubble>
    </ChatMessage>
  );
}

/** Estado de erro: anel destrutivo + role="alert" + retry. */
export function ErrorState() {
  return (
    <ChatMessage variant="assistant" status="error" className="w-full max-w-[440px]">
      <IsacAvatar />
      <ChatMessage.Bubble>
        <ChatMessage.Content>
          Não consegui acessar o extrato. Verifique a conexão e tente novamente.
        </ChatMessage.Content>
        <ChatMessage.Actions>
          <IconButton aria-label="Tentar de novo" size="sm" variant="ghost">
            ↻
          </IconButton>
        </ChatMessage.Actions>
      </ChatMessage.Bubble>
    </ChatMessage>
  );
}
