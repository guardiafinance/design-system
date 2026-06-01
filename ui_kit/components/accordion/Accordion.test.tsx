import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes, setTheme, restoreTheme } from "@/test-utils/a11y";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  accordionItemVariants,
  type AccordionVariant,
} from "./index";

/**
 * Tests for Plan #75 (parent feature-request #74) — Accordion v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that
 * `lex-issue-driven` Rule 3 (bidirectional AC ↔ test traceability)
 * passes at Gate 2. ACs derived from the canonical v0.1.0 DoD
 * checklist enumerated in Issue #74 (`/Por que / O quê / Como`).
 *
 * AC catalog (1:1 com DoD do parent #74 + Plan #75):
 *   AC-1: Componente exporta 4 partes — Root, Item, Trigger, Content
 *   AC-2: Variantes CVA (bordered | plain) replicam paridade legacy
 *   AC-3: Default fechado (sem defaultValue) renderiza colapsado
 *   AC-4: Click no trigger expande / colapsa o painel
 *   AC-5: `type="multiple"` permite múltiplos abertos
 *   AC-6: `collapsible=true` em `type="single"` permite fechar o último
 *   AC-7: `disabled` no item impede interação (mouse + teclado)
 *   AC-8: ARIA roles corretos (button, region) com `aria-expanded` sincronizado
 *   AC-9: ChevronDown rotaciona 180° via `data-state=open`
 *   AC-10: Modo controlled — `value` + `onValueChange` sincronizam
 *   AC-11: Keyboard navigation (Tab, Enter, Space) abre/foca/colapsa
 *   AC-12: ArrowDown/ArrowUp navega entre triggers
 *   AC-13: Home/End pulam para primeiro/último trigger
 *   AC-14: ForwardRef passa ref pro DOM node correto
 *   AC-15: Aceita className extra sem perder defaults
 *   AC-16: Tokens semânticos (text-fg, border-border, bg-card) — sem cor hardcoded
 *   AC-17: A11y (jest-axe) sem violações em light + dark — Default
 *   AC-18: A11y (jest-axe) sem violações em light + dark — Item aberto
 *   AC-19: A11y (jest-axe) sem violações em light + dark — Item disabled
 *   AC-20: Animação accordion-down / accordion-up presente no Content
 */

// ──────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────

const FIXTURE_ITEMS = [
  {
    value: "alpha",
    trigger: "Alpha question",
    content: "Alpha answer",
  },
  {
    value: "beta",
    trigger: "Beta question",
    content: "Beta answer",
  },
  {
    value: "gamma",
    trigger: "Gamma question",
    content: "Gamma answer",
  },
] as const;

interface BasicAccordionProps
  extends Omit<React.ComponentProps<typeof Accordion>, "type" | "children"> {
  variant?: AccordionVariant;
  disabledValue?: string;
}

function BasicAccordion({
  variant = "bordered",
  disabledValue,
  ...rootProps
}: BasicAccordionProps): React.ReactElement {
  return (
    // WHY: passthrough do Radix Root mantém a discriminated union
    // (single | multiple) — aqui forçamos `single` como default fixture.
    <Accordion
      type="single"
      collapsible
      className={
        variant === "bordered"
          ? "overflow-hidden rounded-lg border border-border bg-card"
          : undefined
      }
      {...(rootProps as React.ComponentPropsWithoutRef<typeof Accordion>)}
    >
      {FIXTURE_ITEMS.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          variant={variant}
          disabled={disabledValue === item.value}
        >
          <AccordionTrigger>{item.trigger}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function MultipleAccordion({
  variant = "bordered",
  ...rootProps
}: Omit<BasicAccordionProps, "disabledValue">): React.ReactElement {
  return (
    <Accordion
      type="multiple"
      className={
        variant === "bordered"
          ? "overflow-hidden rounded-lg border border-border bg-card"
          : undefined
      }
      {...(rootProps as React.ComponentPropsWithoutRef<typeof Accordion>)}
    >
      {FIXTURE_ITEMS.map((item) => (
        <AccordionItem key={item.value} value={item.value} variant={variant}>
          <AccordionTrigger>{item.trigger}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/**
 * The visible content `<div>` Radix renders for an open item carries
 * `data-state="open"` and the animation classes. Radix wraps the
 * Content in a `[hidden]` div when closed; reading `data-state` is the
 * deterministic way to check open/closed without scraping classes.
 */
function getContentByTriggerName(name: string | RegExp): HTMLElement | null {
  const trigger = screen.getByRole("button", { name });
  // Radix wires `aria-controls="<contentId>"` on the trigger.
  const contentId = trigger.getAttribute("aria-controls");
  if (!contentId) return null;
  return document.getElementById(contentId);
}

// ──────────────────────────────────────────────────────────────────
// AC-1: Public surface — 4 exports
// ──────────────────────────────────────────────────────────────────

describe("Accordion — public surface", () => {
  it("AC-1: exporta Root, Item, Trigger e Content", () => {
    expect(Accordion).toBeDefined();
    expect(AccordionItem).toBeDefined();
    expect(AccordionTrigger).toBeDefined();
    expect(AccordionContent).toBeDefined();
  });

  it("AC-1: expõe accordionItemVariants como acessor CVA", () => {
    expect(accordionItemVariants).toBeDefined();
    expect(typeof accordionItemVariants).toBe("function");
  });

  it("AC-2: accordionItemVariants gera classes distintas para bordered vs plain", () => {
    const bordered = accordionItemVariants({ variant: "bordered" });
    const plain = accordionItemVariants({ variant: "plain" });
    expect(bordered).not.toBe(plain);
    expect(bordered).toContain("bg-card");
    expect(plain).toContain("border-b");
  });

  it("AC-2: default da variante CVA é bordered", () => {
    const fromDefault = accordionItemVariants({});
    const explicit = accordionItemVariants({ variant: "bordered" });
    expect(fromDefault).toBe(explicit);
  });
});

// ──────────────────────────────────────────────────────────────────
// AC-3 / AC-4 / AC-9: render padrão + abrir/fechar + chevron
// ──────────────────────────────────────────────────────────────────

describe("Accordion — render e interação básica", () => {
  it("AC-3: por default todos os items renderizam fechados", () => {
    render(<BasicAccordion />);
    for (const item of FIXTURE_ITEMS) {
      const trigger = screen.getByRole("button", { name: item.trigger });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("AC-4: click no trigger expande o painel correspondente", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const trigger = screen.getByRole("button", { name: "Alpha question" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByText("Alpha answer")).toBeVisible();
  });

  it("AC-4: segundo click no mesmo trigger colapsa (collapsible=true)", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const trigger = screen.getByRole("button", { name: "Alpha question" });
    await user.click(trigger);
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("AC-9: chevron rotaciona via data-state=open no trigger ancestral", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const trigger = screen.getByRole("button", { name: "Beta question" });
    // Radix expose o data-state direto no botão; o seletor CSS
    // `group-data-[state=open]:rotate-180` atua sobre o <svg> filho.
    expect(trigger).toHaveAttribute("data-state", "closed");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("data-state", "open");
    const chevron = trigger.querySelector("svg");
    expect(chevron).not.toBeNull();
    // SVGElement.className is an SVGAnimatedString — use getAttribute("class")
    // to read the literal class string for the assertion.
    const chevronClasses = chevron?.getAttribute("class") ?? "";
    expect(chevronClasses).toContain("group-data-[state=open]:rotate-180");
  });
});

// ──────────────────────────────────────────────────────────────────
// AC-5 / AC-6: type single vs multiple + collapsible semantics
// ──────────────────────────────────────────────────────────────────

describe("Accordion — type semantics", () => {
  it("AC-5: type=multiple permite múltiplos painéis abertos simultaneamente", async () => {
    const user = userEvent.setup();
    render(<MultipleAccordion />);
    const a = screen.getByRole("button", { name: "Alpha question" });
    const b = screen.getByRole("button", { name: "Beta question" });
    await user.click(a);
    await user.click(b);
    expect(a).toHaveAttribute("aria-expanded", "true");
    expect(b).toHaveAttribute("aria-expanded", "true");
  });

  it("AC-5: type=single fecha o painel anterior ao abrir novo", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const a = screen.getByRole("button", { name: "Alpha question" });
    const b = screen.getByRole("button", { name: "Beta question" });
    await user.click(a);
    expect(a).toHaveAttribute("aria-expanded", "true");
    await user.click(b);
    expect(a).toHaveAttribute("aria-expanded", "false");
    expect(b).toHaveAttribute("aria-expanded", "true");
  });

  it("AC-6: collapsible=false em single mantém um painel sempre aberto", async () => {
    const user = userEvent.setup();
    render(
      <Accordion
        type="single"
        defaultValue="alpha"
        className="overflow-hidden rounded-lg border border-border bg-card"
      >
        {FIXTURE_ITEMS.map((item) => (
          <AccordionItem key={item.value} value={item.value} variant="bordered">
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>,
    );
    const a = screen.getByRole("button", { name: "Alpha question" });
    await user.click(a);
    // Sem collapsible, o painel default permanece aberto após click
    expect(a).toHaveAttribute("aria-expanded", "true");
  });
});

// ──────────────────────────────────────────────────────────────────
// AC-7: disabled
// ──────────────────────────────────────────────────────────────────

describe("Accordion — disabled", () => {
  it("AC-7: trigger disabled não responde a click", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion disabledValue="beta" />);
    const trigger = screen.getByRole("button", { name: "Beta question" });
    expect(trigger).toHaveAttribute("data-disabled");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("AC-7: trigger disabled expõe data-disabled no atributo do botão", () => {
    render(<BasicAccordion disabledValue="gamma" />);
    const trigger = screen.getByRole("button", { name: "Gamma question" });
    expect(trigger).toHaveAttribute("data-disabled");
  });
});

// ──────────────────────────────────────────────────────────────────
// AC-8: ARIA + aria-expanded
// ──────────────────────────────────────────────────────────────────

describe("Accordion — ARIA", () => {
  it("AC-8: trigger é um <button> com aria-expanded sincronizado", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const trigger = screen.getByRole("button", { name: "Alpha question" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("AC-8: content de item aberto é um region apontado por aria-controls", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const trigger = screen.getByRole("button", { name: "Alpha question" });
    await user.click(trigger);
    const content = getContentByTriggerName("Alpha question");
    expect(content).not.toBeNull();
    expect(content).toHaveAttribute("role", "region");
    expect(within(content as HTMLElement).getByText("Alpha answer")).toBeVisible();
  });
});

// ──────────────────────────────────────────────────────────────────
// AC-10: controlled
// ──────────────────────────────────────────────────────────────────

describe("Accordion — controlled mode", () => {
  it("AC-10: value externo sincroniza estado aberto", () => {
    render(
      <Accordion
        type="single"
        collapsible
        value="beta"
        onValueChange={() => {}}
        className="overflow-hidden rounded-lg border border-border bg-card"
      >
        {FIXTURE_ITEMS.map((item) => (
          <AccordionItem key={item.value} value={item.value} variant="bordered">
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>,
    );
    expect(
      screen.getByRole("button", { name: "Beta question" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("AC-10: onValueChange dispara com o novo value no click", async () => {
    const user = userEvent.setup();
    const changes: string[] = [];
    function ControlledShell(): React.ReactElement {
      const [value, setValue] = React.useState<string>("");
      return (
        <Accordion
          type="single"
          collapsible
          value={value}
          onValueChange={(v) => {
            changes.push(v);
            setValue(v);
          }}
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          {FIXTURE_ITEMS.map((item) => (
            <AccordionItem
              key={item.value}
              value={item.value}
              variant="bordered"
            >
              <AccordionTrigger>{item.trigger}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
    }
    render(<ControlledShell />);
    await user.click(screen.getByRole("button", { name: "Gamma question" }));
    expect(changes).toContain("gamma");
  });
});

// ──────────────────────────────────────────────────────────────────
// AC-11 / AC-12 / AC-13: keyboard navigation
// ──────────────────────────────────────────────────────────────────

describe("Accordion — keyboard navigation", () => {
  it("AC-11: Tab move o foco para o primeiro trigger e Enter abre o painel", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const first = screen.getByRole("button", { name: "Alpha question" });
    await user.tab();
    expect(first).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(first).toHaveAttribute("aria-expanded", "true");
  });

  it("AC-11: Space também aciona o trigger focado", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const first = screen.getByRole("button", { name: "Alpha question" });
    first.focus();
    await user.keyboard(" ");
    expect(first).toHaveAttribute("aria-expanded", "true");
  });

  it("AC-12: ArrowDown move o foco para o próximo trigger", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const first = screen.getByRole("button", { name: "Alpha question" });
    const second = screen.getByRole("button", { name: "Beta question" });
    first.focus();
    await user.keyboard("{ArrowDown}");
    expect(second).toHaveFocus();
  });

  it("AC-12: ArrowUp move o foco para o trigger anterior", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const first = screen.getByRole("button", { name: "Alpha question" });
    const second = screen.getByRole("button", { name: "Beta question" });
    second.focus();
    await user.keyboard("{ArrowUp}");
    expect(first).toHaveFocus();
  });

  it("AC-13: Home pula para o primeiro trigger e End para o último", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const first = screen.getByRole("button", { name: "Alpha question" });
    const last = screen.getByRole("button", { name: "Gamma question" });
    first.focus();
    await user.keyboard("{End}");
    expect(last).toHaveFocus();
    await user.keyboard("{Home}");
    expect(first).toHaveFocus();
  });
});

// ──────────────────────────────────────────────────────────────────
// AC-14 / AC-15: ref + className extra
// ──────────────────────────────────────────────────────────────────

describe("Accordion — composability", () => {
  it("AC-14: AccordionItem encaminha ref para o DOM node", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem ref={ref} value="x" variant="plain">
          <AccordionTrigger>X</AccordionTrigger>
          <AccordionContent>x body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("AC-14: AccordionTrigger encaminha ref para o <button>", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="x" variant="plain">
          <AccordionTrigger ref={ref}>X</AccordionTrigger>
          <AccordionContent>x body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(ref.current?.tagName).toBe("BUTTON");
  });

  it("AC-15: className extra é mesclado com defaults sem perdê-los", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem
          value="x"
          variant="bordered"
          className="custom-marker"
          data-testid="custom-item"
        >
          <AccordionTrigger>X</AccordionTrigger>
          <AccordionContent>x body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const item = screen.getByTestId("custom-item");
    expect(item).toHaveClass("custom-marker");
    // Default da bordered preservado
    expect(item).toHaveClass("bg-card");
  });
});

// ──────────────────────────────────────────────────────────────────
// AC-16: tokens semânticos — sem cor hardcoded no surface
// ──────────────────────────────────────────────────────────────────

describe("Accordion — token contract", () => {
  it("AC-16: AccordionItem bordered usa border-border + bg-card (sem hex)", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem
          value="x"
          variant="bordered"
          data-testid="bordered-item"
        >
          <AccordionTrigger>X</AccordionTrigger>
          <AccordionContent>x body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const item = screen.getByTestId("bordered-item");
    expect(item.className).toMatch(/border-border/);
    expect(item.className).toMatch(/bg-card/);
    // Garantia explícita: nenhum legacy --violet-* nem hex
    expect(item.className).not.toMatch(/violet-/);
    expect(item.className).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });

  it("AC-16: AccordionTrigger usa text-fg e focus-visible:ring-ring", () => {
    render(<BasicAccordion />);
    const trigger = screen.getByRole("button", { name: "Alpha question" });
    expect(trigger.className).toMatch(/text-fg/);
    expect(trigger.className).toMatch(/focus-visible:ring-ring/);
  });
});

// ──────────────────────────────────────────────────────────────────
// AC-20: animação accordion-down / accordion-up no Content
// ──────────────────────────────────────────────────────────────────

describe("Accordion — animation contract", () => {
  it("AC-20: AccordionContent declara animate-accordion-down / -up via data-state", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    await user.click(screen.getByRole("button", { name: "Alpha question" }));
    const content = getContentByTriggerName("Alpha question");
    expect(content).not.toBeNull();
    expect(content?.className).toMatch(/animate-accordion-down/);
    expect(content?.className).toMatch(/animate-accordion-up/);
  });
});

// ──────────────────────────────────────────────────────────────────
// AC-17 / AC-18 / AC-19: jest-axe — light + dark (3 cenários × 2 themes)
// ──────────────────────────────────────────────────────────────────

describe("Accordion — a11y (jest-axe)", () => {
  it("AC-17: Default fechado — sem violações em light + dark", async () => {
    const { container } = render(<BasicAccordion />);
    await axeInThemes(container);
  });

  it("AC-18: Item aberto — sem violações em light + dark", async () => {
    const user = userEvent.setup();
    const previous = setTheme("light");
    try {
      const { container } = render(<BasicAccordion />);
      await user.click(screen.getByRole("button", { name: "Alpha question" }));
      // Garantia: o painel está visível antes do axe rodar
      expect(getContentByTriggerName("Alpha question")).not.toBeNull();
      await axeInThemes(container);
    } finally {
      restoreTheme(previous);
    }
  });

  it("AC-19: Item disabled — sem violações em light + dark", async () => {
    const { container } = render(<BasicAccordion disabledValue="beta" />);
    await axeInThemes(container);
  });
});
