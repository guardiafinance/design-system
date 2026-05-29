import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsBadge,
} from "./index";

function renderBasic(
  props?: Partial<React.ComponentProps<typeof Tabs>>,
) {
  return render(
    <Tabs defaultValue="account" {...props}>
      <TabsList>
        <TabsTrigger value="account">Conta</TabsTrigger>
        <TabsTrigger value="password">Senha</TabsTrigger>
        <TabsTrigger value="billing">Cobrança</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Painel da Conta</TabsContent>
      <TabsContent value="password">Painel da Senha</TabsContent>
      <TabsContent value="billing">Painel de Cobrança</TabsContent>
    </Tabs>,
  );
}

describe("Tabs", () => {
  /* ─── Render / ARIA (AC-3) ──────────────────────────────────────── */

  it("renderiza com role=tablist (AC-3)", () => {
    renderBasic();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("renderiza um role=tab por trigger (AC-3)", () => {
    renderBasic();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("renderiza role=tabpanel apenas para a aba ativa (AC-3)", () => {
    renderBasic();
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Painel da Conta");
  });

  it("aba ativa expõe aria-selected=true e data-state=active (AC-3)", () => {
    renderBasic();
    const active = screen.getByRole("tab", { name: "Conta" });
    expect(active).toHaveAttribute("aria-selected", "true");
    expect(active).toHaveAttribute("data-state", "active");
  });

  it("abas inativas expõem aria-selected=false e data-state=inactive (AC-3)", () => {
    renderBasic();
    const inactive = screen.getByRole("tab", { name: "Senha" });
    expect(inactive).toHaveAttribute("aria-selected", "false");
    expect(inactive).toHaveAttribute("data-state", "inactive");
  });

  /* ─── Seleção / controlled (AC-3) ───────────────────────────────── */

  it("clique troca de aba e atualiza data-state (AC-3)", async () => {
    const user = userEvent.setup();
    renderBasic();
    await user.click(screen.getByRole("tab", { name: "Senha" }));
    expect(screen.getByRole("tab", { name: "Senha" })).toHaveAttribute(
      "data-state",
      "active",
    );
    expect(screen.getByRole("tab", { name: "Conta" })).toHaveAttribute(
      "data-state",
      "inactive",
    );
  });

  it("clique troca o painel renderizado (AC-3)", async () => {
    const user = userEvent.setup();
    renderBasic();
    await user.click(screen.getByRole("tab", { name: "Cobrança" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent(
      "Painel de Cobrança",
    );
  });

  it("modo controlado respeita value externo (AC-3)", () => {
    render(
      <Tabs value="password">
        <TabsList>
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="password">Senha</TabsTrigger>
        </TabsList>
        <TabsContent value="account">A</TabsContent>
        <TabsContent value="password">B</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "Senha" })).toHaveAttribute(
      "data-state",
      "active",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("B");
  });

  /* ─── Teclado (AC-3) ────────────────────────────────────────────── */

  it("ArrowRight navega para a próxima aba (AC-3)", async () => {
    const user = userEvent.setup();
    renderBasic();
    screen.getByRole("tab", { name: "Conta" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Senha" })).toHaveAttribute(
      "data-state",
      "active",
    );
  });

  it("ArrowLeft navega para a aba anterior (AC-3)", async () => {
    const user = userEvent.setup();
    renderBasic({ defaultValue: "password" });
    screen.getByRole("tab", { name: "Senha" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Conta" })).toHaveAttribute(
      "data-state",
      "active",
    );
  });

  it("Home salta para a primeira aba (AC-3)", async () => {
    const user = userEvent.setup();
    renderBasic({ defaultValue: "billing" });
    screen.getByRole("tab", { name: "Cobrança" }).focus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Conta" })).toHaveAttribute(
      "data-state",
      "active",
    );
  });

  it("End salta para a última aba (AC-3)", async () => {
    const user = userEvent.setup();
    renderBasic();
    screen.getByRole("tab", { name: "Conta" }).focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Cobrança" })).toHaveAttribute(
      "data-state",
      "active",
    );
  });

  /* ─── Variantes (AC-1) ──────────────────────────────────────────── */

  it("variant=underline (default): list ganha border-b e gap (AC-1)", () => {
    renderBasic();
    const list = screen.getByRole("tablist");
    expect(list.className).toMatch(/\bborder-b\b/);
    expect(list.className).toMatch(/\bborder-border\b/);
  });

  it("variant=underline: aba ativa usa border-action + text-action-hover (AC-1)", () => {
    renderBasic();
    const active = screen.getByRole("tab", { name: "Conta" });
    expect(active.className).toMatch(/data-\[state=active\]:border-action/);
    expect(active.className).toMatch(/data-\[state=active\]:text-action-hover/);
  });

  it("variant=pills: list usa rounded-full + bg-muted + p-1 (AC-1)", () => {
    render(
      <Tabs variant="pills" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">x</TabsContent>
        <TabsContent value="b">y</TabsContent>
      </Tabs>,
    );
    const list = screen.getByRole("tablist");
    expect(list.className).toMatch(/\brounded-full\b/);
    expect(list.className).toMatch(/\bbg-muted\b/);
    expect(list.className).toMatch(/\bp-1\b/);
  });

  it("variant=pills: aba ativa usa bg-background + text-action-hover + shadow (AC-1)", () => {
    render(
      <Tabs variant="pills" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">x</TabsContent>
      </Tabs>,
    );
    const trigger = screen.getByRole("tab", { name: "A" });
    expect(trigger.className).toMatch(/data-\[state=active\]:bg-background/);
    expect(trigger.className).toMatch(
      /data-\[state=active\]:text-action-hover/,
    );
    expect(trigger.className).toMatch(/data-\[state=active\]:shadow-sm/);
  });

  it("variant=boxed: cada trigger tem border + bg-background no resting (AC-1)", () => {
    render(
      <Tabs variant="boxed" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">x</TabsContent>
        <TabsContent value="b">y</TabsContent>
      </Tabs>,
    );
    const inactive = screen.getByRole("tab", { name: "B" });
    expect(inactive.className).toMatch(/\bborder-border\b/);
    expect(inactive.className).toMatch(/\bbg-background\b/);
    expect(inactive.className).toMatch(/\brounded-md\b/);
  });

  it("variant=boxed: aba ativa usa bg-action + text-button-fg + border-action (AC-1)", () => {
    render(
      <Tabs variant="boxed" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">x</TabsContent>
      </Tabs>,
    );
    const trigger = screen.getByRole("tab", { name: "A" });
    expect(trigger.className).toMatch(/data-\[state=active\]:bg-action/);
    expect(trigger.className).toMatch(/data-\[state=active\]:text-button-fg/);
    expect(trigger.className).toMatch(/data-\[state=active\]:border-action/);
  });

  /* ─── Sizes (AC-1) ──────────────────────────────────────────────── */

  it("size=md (default) underline aplica px-3.5 py-2.5 + text-sm (AC-1)", () => {
    renderBasic();
    const trigger = screen.getByRole("tab", { name: "Conta" });
    expect(trigger.className).toMatch(/\bpx-3\.5\b/);
    expect(trigger.className).toMatch(/\bpy-2\.5\b/);
    expect(trigger.className).toMatch(/\btext-sm\b/);
  });

  it("size=sm reduz padding e text-size dos triggers (AC-1)", () => {
    render(
      <Tabs size="sm" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">x</TabsContent>
      </Tabs>,
    );
    const trigger = screen.getByRole("tab", { name: "A" });
    expect(trigger.className).toMatch(/\bpx-3\b/);
    expect(trigger.className).toMatch(/\bpy-2\b/);
    expect(trigger.className).toMatch(/text-\[13px\]/);
  });

  it("trigger sobrescreve size do contexto quando explicitado (AC-1)", () => {
    render(
      <Tabs size="sm" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">small</TabsTrigger>
          <TabsTrigger value="b" size="md">
            medium
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">A</TabsContent>
        <TabsContent value="b">B</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "small" }).className).toMatch(
      /text-\[13px\]/,
    );
    expect(screen.getByRole("tab", { name: "medium" }).className).toMatch(
      /\btext-sm\b/,
    );
  });

  /* ─── Estados (AC-3) ────────────────────────────────────────────── */

  it("trigger disabled não recebe seleção via clique (AC-3)", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b" disabled>
            B
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">painel A</TabsContent>
        <TabsContent value="b">painel B</TabsContent>
      </Tabs>,
    );
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute(
      "data-state",
      "active",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("painel A");
  });

  /* ─── TabsBadge (AC-1) ──────────────────────────────────────────── */

  it("TabsBadge renderiza com a classe tabs-badge e estado inativo (bg-muted + text-muted-foreground)", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">
            B <TabsBadge>11</TabsBadge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">x</TabsContent>
        <TabsContent value="b">y</TabsContent>
      </Tabs>,
    );
    const badge = within(screen.getByRole("tab", { name: /B/ })).getByText(
      "11",
    );
    expect(badge).toHaveClass("tabs-badge");
    expect(badge.className).toMatch(/\bbg-muted\b/);
    expect(badge.className).toMatch(/\btext-muted-foreground\b/);
  });

  it("TabsBadge dentro de aba ativa: trigger underline aplica override via [&_.tabs-badge]", () => {
    render(
      <Tabs defaultValue="b">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">
            B <TabsBadge>248</TabsBadge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">x</TabsContent>
        <TabsContent value="b">y</TabsContent>
      </Tabs>,
    );
    const trigger = screen.getByRole("tab", { name: /B/ });
    expect(trigger.className).toMatch(
      /data-\[state=active\]:\[&_\.tabs-badge\]:bg-bg-hover/,
    );
    expect(trigger.className).toMatch(
      /data-\[state=active\]:\[&_\.tabs-badge\]:text-action-hover/,
    );
  });

  it("TabsBadge em variant=boxed ativa: override usa button-fg translúcido", () => {
    render(
      <Tabs variant="boxed" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">
            A <TabsBadge>3</TabsBadge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">x</TabsContent>
      </Tabs>,
    );
    const trigger = screen.getByRole("tab", { name: /A/ });
    expect(trigger.className).toMatch(
      /data-\[state=active\]:\[&_\.tabs-badge\]:bg-button-fg\/25/,
    );
    expect(trigger.className).toMatch(
      /data-\[state=active\]:\[&_\.tabs-badge\]:text-button-fg/,
    );
  });

  /* ─── Brand / tokens (AC-1, AC-6) ───────────────────────────────── */

  it("focus-visible:ring laranja com offset em qualquer variant (AC-1)", () => {
    renderBasic();
    const trigger = screen.getByRole("tab", { name: "Conta" });
    expect(trigger.className).toMatch(/focus-visible:ring-2/);
    expect(trigger.className).toMatch(/focus-visible:ring-ring/);
    expect(trigger.className).toMatch(/focus-visible:ring-offset-2/);
  });

  it("zero hex hardcoded: nenhuma classe guardia-* nem white/black literal (AC-1)", () => {
    render(
      <Tabs variant="boxed" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">x</TabsContent>
      </Tabs>,
    );
    const list = screen.getByRole("tablist");
    const trigger = screen.getByRole("tab", { name: "A" });
    for (const el of [list, trigger]) {
      expect(el.className).not.toMatch(
        /\bguardia-(purple|orange|pink|yellow)-\d+\b/,
      );
      expect(el.className).not.toMatch(/\btext-white\b/);
      expect(el.className).not.toMatch(/\bbg-black\b/);
    }
  });

  /* ─── className passthrough (AC-3) ──────────────────────────────── */

  it("respeita className customizado em TabsList (AC-3)", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList className="my-list">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">x</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tablist")).toHaveClass("my-list");
  });

  it("respeita className customizado em TabsTrigger (AC-3)", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a" className="my-trigger">
            A
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">x</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "A" })).toHaveClass("my-trigger");
  });

  it("respeita className customizado em TabsContent (AC-3)", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a" className="my-panel">
          conteúdo
        </TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tabpanel")).toHaveClass("my-panel");
  });

  /* ─── A11y light + dark (AC-4) ──────────────────────────────────── */

  describe("a11y", () => {
    it("sem violações WCAG 2.1 AA em light + dark (underline default)", async () => {
      const { container } = renderBasic();
      await axeInThemes(container);
    });

    it("sem violações WCAG 2.1 AA em light + dark (pills com badge)", async () => {
      const { container } = render(
        <Tabs variant="pills" defaultValue="b">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">
              B <TabsBadge>11</TabsBadge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="a">painel A</TabsContent>
          <TabsContent value="b">painel B</TabsContent>
        </Tabs>,
      );
      await axeInThemes(container);
    });

    it("sem violações WCAG 2.1 AA em light + dark (boxed com aba desabilitada)", async () => {
      const { container } = render(
        <Tabs variant="boxed" defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
            <TabsTrigger value="c" disabled>
              C
            </TabsTrigger>
          </TabsList>
          <TabsContent value="a">painel A</TabsContent>
          <TabsContent value="b">painel B</TabsContent>
          <TabsContent value="c">painel C</TabsContent>
        </Tabs>,
      );
      await axeInThemes(container);
    });

    it("sem violações WCAG 2.1 AA em light + dark (após troca de aba)", async () => {
      const user = userEvent.setup();
      const { container } = renderBasic();
      await user.click(screen.getByRole("tab", { name: "Senha" }));
      await axeInThemes(container);
    });
  });
});
