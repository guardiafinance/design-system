import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import {
  ChatMessage,
  ChatMessageActions,
  ChatMessageAuthor,
  ChatMessageAvatar,
  ChatMessageBubble,
  ChatMessageContent,
  ChatMessageHeader,
  ChatMessageTime,
  ChatMessageTyping,
} from "./index";

/** Bolha completa de agente — reaproveitada por vários casos. */
function AssistantSample({
  status,
}: {
  status?: "sent" | "streaming" | "error";
} = {}) {
  return (
    <ChatMessage variant="assistant" status={status}>
      <ChatMessage.Avatar data-testid="avatar">IS</ChatMessage.Avatar>
      <ChatMessage.Bubble>
        <ChatMessage.Header>
          <ChatMessage.Author>Isac</ChatMessage.Author>
          <ChatMessage.Time dateTime="2026-05-27T14:32:00Z">
            14:32
          </ChatMessage.Time>
        </ChatMessage.Header>
        <ChatMessage.Content>Conciliei 127 lançamentos.</ChatMessage.Content>
      </ChatMessage.Bubble>
    </ChatMessage>
  );
}

describe("<ChatMessage /> — composition (AC-3)", () => {
  it("renders its composed children", () => {
    render(<AssistantSample />);
    expect(screen.getByText("Isac")).toBeInTheDocument();
    expect(screen.getByText("Conciliei 127 lançamentos.")).toBeInTheDocument();
  });

  it("renders the Avatar slot children", () => {
    render(<AssistantSample />);
    expect(screen.getByTestId("avatar")).toHaveTextContent("IS");
  });

  it("exposes a data-slot on every subcomponent", () => {
    const { container } = render(<AssistantSample />);
    const slots = Array.from(container.querySelectorAll("[data-slot]")).map(
      (el) => el.getAttribute("data-slot"),
    );
    expect(slots).toEqual(
      expect.arrayContaining([
        "chat-message",
        "chat-message-avatar",
        "chat-message-bubble",
        "chat-message-header",
        "chat-message-author",
        "chat-message-time",
        "chat-message-content",
      ]),
    );
  });

  it("namespace members point to the same components as named exports", () => {
    expect(ChatMessage.Avatar).toBe(ChatMessageAvatar);
    expect(ChatMessage.Bubble).toBe(ChatMessageBubble);
    expect(ChatMessage.Header).toBe(ChatMessageHeader);
    expect(ChatMessage.Author).toBe(ChatMessageAuthor);
    expect(ChatMessage.Time).toBe(ChatMessageTime);
    expect(ChatMessage.Content).toBe(ChatMessageContent);
    expect(ChatMessage.Actions).toBe(ChatMessageActions);
    expect(ChatMessage.Typing).toBe(ChatMessageTyping);
  });
});

describe("<ChatMessage /> — role-driven rendering (AC-1)", () => {
  it("defaults to role=assistant (left-aligned)", () => {
    render(
      <ChatMessage data-testid="m">
        <ChatMessageBubble>oi</ChatMessageBubble>
      </ChatMessage>,
    );
    const root = screen.getByTestId("m");
    expect(root).toHaveAttribute("data-variant", "assistant");
    expect(root).toHaveClass("flex-row");
  });

  it("role=user reverses the row (right-anchored)", () => {
    render(
      <ChatMessage variant="user" data-testid="m">
        <ChatMessageBubble>oi</ChatMessageBubble>
      </ChatMessage>,
    );
    const root = screen.getByTestId("m");
    expect(root).toHaveAttribute("data-variant", "user");
    expect(root).toHaveClass("flex-row-reverse");
  });

  it("role=system uses left-aligned row (distinction is the bubble's dashed border + muted palette)", () => {
    render(
      <ChatMessage variant="system" data-testid="m">
        <ChatMessageBubble>sessão iniciada</ChatMessageBubble>
      </ChatMessage>,
    );
    const root = screen.getByTestId("m");
    expect(root).toHaveAttribute("data-variant", "system");
    expect(root).toHaveClass("flex-row");
    expect(root).not.toHaveClass("justify-center");
  });

  it("renders as <div> by default and respects `as` (li/article)", () => {
    const { rerender } = render(
      <ChatMessage data-testid="m">x</ChatMessage>,
    );
    expect(screen.getByTestId("m").tagName).toBe("DIV");
    rerender(
      <ChatMessage as="li" data-testid="m">
        x
      </ChatMessage>,
    );
    expect(screen.getByTestId("m").tagName).toBe("LI");
    rerender(
      <ChatMessage as="article" data-testid="m">
        x
      </ChatMessage>,
    );
    expect(screen.getByTestId("m").tagName).toBe("ARTICLE");
  });

  it("forwards the ref to the root element (AC-8)", () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <ChatMessage ref={ref} data-testid="m">
        x
      </ChatMessage>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("chat-message");
  });

  it("spreads native html attributes onto the root (AC-8)", () => {
    render(
      <ChatMessage data-testid="m" id="turn-1" aria-label="Turno de Isac">
        x
      </ChatMessage>,
    );
    const root = screen.getByTestId("m");
    expect(root).toHaveAttribute("id", "turn-1");
    expect(root).toHaveAttribute("aria-label", "Turno de Isac");
  });
});

describe("<ChatMessageBubble /> — palette by role (AC-2)", () => {
  function bubbleFor(role: "user" | "assistant" | "system") {
    const { container } = render(
      <ChatMessage variant={role}>
        <ChatMessageBubble data-testid="b">corpo</ChatMessageBubble>
      </ChatMessage>,
    );
    return container.querySelector("[data-testid='b']") as HTMLElement;
  }

  it("assistant → bg-card + text-card-foreground (surface)", () => {
    const b = bubbleFor("assistant");
    expect(b).toHaveClass("bg-card");
    expect(b).toHaveClass("text-card-foreground");
    expect(b).toHaveClass("border-border");
  });

  it("user → bg-guardia-purple-500 + text-white (brand violet, ~12:1 AA)", () => {
    const b = bubbleFor("user");
    expect(b).toHaveClass("bg-guardia-purple-500");
    expect(b).toHaveClass("text-white");
    expect(b).toHaveClass("border-transparent");
  });

  it("system → bg-muted + text-muted-foreground + dashed border (neutral notice)", () => {
    const b = bubbleFor("system");
    expect(b).toHaveClass("bg-muted");
    expect(b).toHaveClass("text-muted-foreground");
    expect(b).toHaveClass("border-dashed");
  });

  it("uses semantic tokens only — no hex/rgb leaked into className", () => {
    (["user", "assistant", "system"] as const).forEach((role) => {
      const b = bubbleFor(role);
      expect(b.className).not.toMatch(/#[0-9a-fA-F]{3,6}/);
      expect(b.className).not.toMatch(/\brgb\(/);
    });
  });

  it("mirrors role + status onto data-attributes", () => {
    render(
      <ChatMessage variant="user" status="error">
        <ChatMessageBubble data-testid="b">x</ChatMessageBubble>
      </ChatMessage>,
    );
    const b = screen.getByTestId("b");
    expect(b).toHaveAttribute("data-variant", "user");
    expect(b).toHaveAttribute("data-status", "error");
  });
});

describe("<ChatMessageTime /> — accessible timestamp (AC-4)", () => {
  it("renders a native <time> with the machine-readable dateTime", () => {
    render(
      <ChatMessageTime dateTime="2026-05-27T14:32:00Z">14:32</ChatMessageTime>,
    );
    const t = screen.getByText("14:32");
    expect(t.tagName).toBe("TIME");
    expect(t).toHaveAttribute("datetime", "2026-05-27T14:32:00Z");
  });

  it("preserves the human-readable children", () => {
    render(<ChatMessageTime dateTime="2026-05-27">há 2 min</ChatMessageTime>);
    expect(screen.getByText("há 2 min")).toBeInTheDocument();
  });
});

describe("status=streaming (AC-5)", () => {
  it("renders a typing indicator with role=status and the default label", () => {
    render(<AssistantSample status="streaming" />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Digitando…");
  });

  it("marks the content region aria-busy=true and hides the prose", () => {
    const { container } = render(<AssistantSample status="streaming" />);
    const content = container.querySelector(
      "[data-slot='chat-message-content']",
    ) as HTMLElement;
    expect(content).toHaveAttribute("aria-busy", "true");
    expect(content).not.toHaveTextContent("Conciliei 127 lançamentos.");
  });

  it("propagates a custom typingLabel from the root to the indicator", () => {
    render(
      <ChatMessage variant="assistant" status="streaming" typingLabel="Isac está digitando">
        <ChatMessageBubble>
          <ChatMessageContent>x</ChatMessageContent>
        </ChatMessageBubble>
      </ChatMessage>,
    );
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Isac está digitando",
    );
  });

  it("ChatMessageTyping `label` prop overrides the context label", () => {
    render(
      <ChatMessage variant="assistant" status="streaming" typingLabel="ctx">
        <ChatMessageTyping label="explícito" />
      </ChatMessage>,
    );
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "explícito");
  });
});

describe("status=error (AC-6)", () => {
  it("applies the destructive ring on the bubble", () => {
    const { container } = render(<AssistantSample status="error" />);
    const bubble = container.querySelector(
      "[data-slot='chat-message-bubble']",
    ) as HTMLElement;
    expect(bubble).toHaveAttribute("data-status", "error");
    expect(bubble.className).toMatch(/ring-destructive/);
  });

  it("announces the content via role=alert", () => {
    render(<AssistantSample status="error" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Conciliei 127 lançamentos.");
  });

  it("role=alert wins over a consumer-supplied role on error content", () => {
    render(
      <ChatMessage variant="assistant" status="error">
        <ChatMessageContent role="region">Falha</ChatMessageContent>
      </ChatMessage>,
    );
    // The critical a11y role must not be overridable by the consumer.
    expect(screen.getByRole("alert")).toHaveTextContent("Falha");
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("preserves a consumer role on content outside the error state", () => {
    render(
      <ChatMessage variant="assistant" status="sent">
        <ChatMessageContent role="note">Nota</ChatMessageContent>
      </ChatMessage>,
    );
    expect(screen.getByRole("note")).toHaveTextContent("Nota");
  });
});

describe("internal attributes are authoritative (review hardening)", () => {
  it("consumer cannot override data-* / data-variant on the root", () => {
    render(
      <ChatMessage
        variant="user"
        data-testid="m"
        data-slot="hacked"
        data-variant="hacked"
      >
        x
      </ChatMessage>,
    );
    const root = screen.getByTestId("m");
    expect(root).toHaveAttribute("data-slot", "chat-message");
    expect(root).toHaveAttribute("data-variant", "user");
  });

  it("consumer cannot override aria-busy on streaming content", () => {
    const { container } = render(
      <ChatMessage variant="assistant" status="streaming">
        <ChatMessageContent aria-busy={false}>x</ChatMessageContent>
      </ChatMessage>,
    );
    const content = container.querySelector(
      "[data-slot='chat-message-content']",
    ) as HTMLElement;
    expect(content).toHaveAttribute("aria-busy", "true");
  });
});

describe("status=sent (default)", () => {
  it("renders the prose without alert/status roles", () => {
    render(<AssistantSample />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("Conciliei 127 lançamentos.")).toBeInTheDocument();
  });
});

describe("<ChatMessageActions /> — keyboard-operable (AC-7)", () => {
  it("interactive children remain focusable and operable via keyboard", async () => {
    const onCopy = vi.fn();
    const user = userEvent.setup();
    render(
      <ChatMessage variant="assistant">
        <ChatMessageBubble>
          <ChatMessageContent>Resposta</ChatMessageContent>
          <ChatMessageActions>
            <button type="button" onClick={onCopy}>
              Copiar
            </button>
          </ChatMessageActions>
        </ChatMessageBubble>
      </ChatMessage>,
    );
    const button = screen.getByRole("button", { name: "Copiar" });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("does not intercept clicks on its children", () => {
    const onClick = vi.fn();
    render(
      <ChatMessageActions>
        <button type="button" onClick={onClick}>
          Tentar de novo
        </button>
      </ChatMessageActions>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("a11y — no WCAG 2.1 AA violations in light + dark (AC-9)", () => {
  it("assistant Default", async () => {
    const { container } = render(<AssistantSample />);
    await axeInThemes(container);
  });

  it("user message", async () => {
    const { container } = render(
      <ChatMessage variant="user">
        <ChatMessage.Bubble>
          <ChatMessage.Header>
            <ChatMessage.Author>Você</ChatMessage.Author>
            <ChatMessage.Time dateTime="2026-05-27T14:33:00Z">
              14:33
            </ChatMessage.Time>
          </ChatMessage.Header>
          <ChatMessage.Content>Concilie janeiro, por favor.</ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage>,
    );
    await axeInThemes(container);
  });

  it("system message", async () => {
    const { container } = render(
      <ChatMessage variant="system">
        <ChatMessage.Bubble>
          <ChatMessage.Content>Sessão iniciada às 14:30.</ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage>,
    );
    await axeInThemes(container);
  });

  it("streaming state", async () => {
    const { container } = render(<AssistantSample status="streaming" />);
    await axeInThemes(container);
  });

  it("error state", async () => {
    const { container } = render(
      <ChatMessage variant="assistant" status="error">
        <ChatMessage.Bubble>
          <ChatMessage.Content>
            Não consegui acessar o extrato. Tente novamente.
          </ChatMessage.Content>
          <ChatMessage.Actions>
            <button type="button">Tentar de novo</button>
          </ChatMessage.Actions>
        </ChatMessage.Bubble>
      </ChatMessage>,
    );
    await axeInThemes(container);
  });
});
