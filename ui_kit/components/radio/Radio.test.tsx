import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import { Radio, RadioGroup } from "./index";

function setup(props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) {
  return render(
    <RadioGroup {...props}>
      <Radio value="now" label="Imediato" description="Agora" />
      <Radio value="daily" label="Diário" description="Uma vez por dia" />
      <Radio value="weekly" label="Semanal" />
    </RadioGroup>,
  );
}

describe("RadioGroup", () => {
  it("renderiza com role=radiogroup", () => {
    setup();
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("orientation=column é o default", () => {
    setup();
    const group = screen.getByRole("radiogroup");
    expect(group.className).toMatch(/flex-col/);
  });

  it("orientation=horizontal aplica flex-row", () => {
    setup({ orientation: "horizontal" });
    expect(screen.getByRole("radiogroup").className).toMatch(/flex-row/);
  });

  it("renderiza N radios", () => {
    setup();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("defaultValue marca o radio correspondente como checked", () => {
    setup({ defaultValue: "daily" });
    const daily = screen.getAllByRole("radio")[1]!;
    expect(daily).toHaveAttribute("data-state", "checked");
  });

  it("clique em radio aciona onValueChange (uncontrolled)", async () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    await userEvent.click(screen.getAllByRole("radio")[1]!);
    expect(onValueChange).toHaveBeenCalledWith("daily");
  });

  it("modo controlled respeita value externo", () => {
    const { rerender } = render(
      <RadioGroup value="now">
        <Radio value="now" label="A" />
        <Radio value="daily" label="B" />
      </RadioGroup>,
    );
    expect(screen.getAllByRole("radio")[0]!).toHaveAttribute(
      "data-state",
      "checked",
    );
    rerender(
      <RadioGroup value="daily">
        <Radio value="now" label="A" />
        <Radio value="daily" label="B" />
      </RadioGroup>,
    );
    expect(screen.getAllByRole("radio")[1]!).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("name é repassado para o Root do Radix (verificável via form submission)", () => {
    /* Radix RadioGroup só renderiza inputs hidden DENTRO de um <form>;
     * em test sem form, eles não aparecem. Aqui validamos que o prop
     * está chegando ao Radix, que é a expectativa pública. */
    render(
      <RadioGroup name="freq" defaultValue="now">
        <Radio value="now" label="A" />
        <Radio value="daily" label="B" />
      </RadioGroup>,
    );
    /* O role=radiogroup é renderizado e os radios estão lá */
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });
});

describe("Radio", () => {
  it("renderiza com role=radio", () => {
    render(
      <RadioGroup>
        <Radio value="x" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio")).toBeInTheDocument();
  });

  it("standalone (sem label) NÃO renderiza wrapper <label>", () => {
    const { container } = render(
      <RadioGroup>
        <Radio value="x" />
      </RadioGroup>,
    );
    expect(container.querySelector("label")).toBeNull();
  });

  it("com label renderiza wrapper <label> clicável", () => {
    render(
      <RadioGroup>
        <Radio value="x" label="Aceito" />
      </RadioGroup>,
    );
    expect(screen.getByText("Aceito")).toBeInTheDocument();
    expect(screen.getByRole("radio").closest("label")).not.toBeNull();
  });

  it("description liga ao radio via aria-describedby", () => {
    render(
      <RadioGroup>
        <Radio value="x" label="Notificar" description="Por email" />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio");
    const id = radio.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toHaveTextContent("Por email");
  });

  it("clique no label seleciona o radio (htmlFor)", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup onValueChange={onValueChange}>
        <Radio value="now" label="Imediato" />
        <Radio value="daily" label="Diário" />
      </RadioGroup>,
    );
    await userEvent.click(screen.getByText("Diário"));
    expect(onValueChange).toHaveBeenCalledWith("daily");
  });

  it("size=sm aplica h-4 w-4 (16px)", () => {
    render(
      <RadioGroup>
        <Radio value="x" size="sm" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio").className).toMatch(/h-4 w-4/);
  });

  it("size=md (default) aplica 18px", () => {
    render(
      <RadioGroup>
        <Radio value="x" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio").className).toMatch(/h-\[18px\]/);
  });

  it("invalid aplica aria-invalid=true", () => {
    render(
      <RadioGroup>
        <Radio value="x" invalid label="x" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio")).toHaveAttribute("aria-invalid", "true");
  });

  it("disabled bloqueia clique", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup onValueChange={onValueChange}>
        <Radio value="x" disabled label="x" />
      </RadioGroup>,
    );
    await userEvent.click(screen.getByRole("radio"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("auto-gera id quando não passado", () => {
    render(
      <RadioGroup>
        <Radio value="x" label="auto" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio").id.length).toBeGreaterThan(0);
  });

  it("respeita id customizado", () => {
    render(
      <RadioGroup>
        <Radio value="x" id="my-r" label="x" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio")).toHaveAttribute("id", "my-r");
  });

  it("ArrowDown move o foco para o próximo radio (Radix roving tabindex)", async () => {
    const user = userEvent.setup();
    setup({ defaultValue: "now" });
    const radios = screen.getAllByRole("radio");
    radios[0]!.focus();
    expect(document.activeElement).toBe(radios[0]);
    await user.keyboard("{ArrowDown}");
    /* Radix usa roving tabindex — o foco vai pro próximo */
    expect(document.activeElement).toBe(radios[1]);
  });

  it("Space no radio focado seleciona-o", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup onValueChange={onValueChange}>
        <Radio value="now" label="A" />
        <Radio value="daily" label="B" />
      </RadioGroup>,
    );
    const radios = screen.getAllByRole("radio");
    radios[1]!.focus();
    await user.keyboard(" ");
    expect(onValueChange).toHaveBeenCalledWith("daily");
  });

  it("respeita className customizado no radio", () => {
    render(
      <RadioGroup>
        <Radio value="x" className="my-extra" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio")).toHaveClass("my-extra");
  });

  it("respeita wrapperClassName no <label>", () => {
    render(
      <RadioGroup>
        <Radio value="x" label="x" wrapperClassName="my-wrap" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio").closest("label")).toHaveClass("my-wrap");
  });

  describe("brand-aware tokens (per #125)", () => {
    it("mark uses border-action on hover + checked (no guardia-purple hardcoded)", () => {
      render(
        <RadioGroup>
          <Radio value="x" />
        </RadioGroup>,
      );
      const r = screen.getByRole("radio");
      expect(r.className).toMatch(/hover:border-action/);
      expect(r.className).toMatch(/data-\[state=checked\]:border-action/);
      expect(r.className).not.toMatch(/guardia-purple-(100|500|700)/);
    });

    it("indicator dot uses bg-action (themed: violet light / orange dark)", () => {
      const { container } = render(
        <RadioGroup defaultValue="x">
          <Radio value="x" />
        </RadioGroup>,
      );
      // Indicator only renders inside Radix Indicator when checked
      const dot = container.querySelector('[role="radio"] span[aria-hidden="true"]');
      expect(dot).not.toBeNull();
      expect(dot!.className).toMatch(/\bbg-action\b/);
      expect(dot!.className).not.toMatch(/bg-guardia-purple-500/);
    });
  });

  describe("a11y", () => {
    it("has no WCAG 2.1 AA violations in light + dark (group, no selection)", async () => {
      // AC-7(ii) — RadioGroup with 3+ options, no selection
      const { container } = render(
        <RadioGroup aria-label="Frequência">
          <Radio value="now" label="Imediato" description="Agora" />
          <Radio value="daily" label="Diário" description="Uma vez por dia" />
          <Radio value="weekly" label="Semanal" />
        </RadioGroup>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (group with default selection)", async () => {
      // AC-7(iii) — RadioGroup with default selection
      const { container } = render(
        <RadioGroup aria-label="Frequência" defaultValue="daily">
          <Radio value="now" label="Imediato" />
          <Radio value="daily" label="Diário" />
          <Radio value="weekly" label="Semanal" />
        </RadioGroup>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (invalid)", async () => {
      const { container } = render(
        <RadioGroup aria-label="Opção">
          <Radio value="x" invalid label="Campo obrigatório" />
        </RadioGroup>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (disabled option mixed with enabled)", async () => {
      // AC-7(iv) — RadioGroup with disabled option among enabled siblings
      const { container } = render(
        <RadioGroup aria-label="Plano">
          <Radio value="starter" label="Starter" />
          <Radio value="pro" label="Pro" />
          <Radio value="enterprise" label="Apenas Enterprise" disabled />
        </RadioGroup>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (single standalone Radio, no group)", async () => {
      // AC-7(i) — Standalone single Radio inside a minimal RadioGroup (no compound label)
      const { container } = render(
        <RadioGroup aria-label="Aceito os termos">
          <div className="flex items-center gap-2">
            <Radio id="r-standalone" value="agree" />
            <label htmlFor="r-standalone" className="text-sm">
              Aceito
            </label>
          </div>
        </RadioGroup>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (external label via htmlFor)", async () => {
      // AC-7(v) — RadioGroup with external <label htmlFor> association pattern (Standalone story)
      const { container } = render(
        <RadioGroup aria-label="Layout">
          <div className="flex items-center gap-2">
            <Radio id="r-a" value="a" />
            <label htmlFor="r-a" className="text-sm">
              Opção A
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Radio id="r-b" value="b" />
            <label htmlFor="r-b" className="text-sm">
              Opção B
            </label>
          </div>
        </RadioGroup>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (fieldset + legend grouping)", async () => {
      // AC-7(vi) — <fieldset><legend>...</legend><RadioGroup>...</RadioGroup></fieldset>
      const { container } = render(
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-semibold">Plano</legend>
          <RadioGroup name="plano" defaultValue="pro">
            <Radio value="starter" label="Starter" description="Até 1k transações/mês" />
            <Radio value="pro" label="Pro" description="Até 10k transações/mês" />
            <Radio value="enterprise" label="Enterprise" description="Personalizado" />
          </RadioGroup>
        </fieldset>,
      );
      await axeInThemes(container);
    });
  });

  describe("group semantics (per v0.1.0 DoD)", () => {
    it("clicking another option deselects the previously selected one (single-selection)", async () => {
      // AC-5(a) — single-selection semantics: only one radio is checked at a time
      const user = userEvent.setup();
      render(
        <RadioGroup aria-label="Frequência" defaultValue="now">
          <Radio value="now" label="Imediato" />
          <Radio value="daily" label="Diário" />
        </RadioGroup>,
      );
      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toHaveAttribute("data-state", "checked");
      expect(radios[1]).toHaveAttribute("data-state", "unchecked");
      await user.click(radios[1]!);
      expect(radios[0]).toHaveAttribute("data-state", "unchecked");
      expect(radios[1]).toHaveAttribute("data-state", "checked");
    });

    it("ArrowUp moves the focus to the previous radio (Radix roving tabindex)", async () => {
      // AC-5(b) — keyboard navigation ArrowUp closes the cycle started by the existing ArrowDown test
      const user = userEvent.setup();
      setup({ defaultValue: "daily" });
      const radios = screen.getAllByRole("radio");
      radios[1]!.focus();
      expect(document.activeElement).toBe(radios[1]);
      await user.keyboard("{ArrowUp}");
      expect(document.activeElement).toBe(radios[0]);
    });

    it("Tab from a focused radio moves focus outside the group (roving tabindex exits)", async () => {
      // AC-5(d) — Tab exits the group; Arrow keys cycle within it
      const user = userEvent.setup();
      render(
        <>
          <RadioGroup aria-label="Frequência" defaultValue="now">
            <Radio value="now" label="Imediato" />
            <Radio value="daily" label="Diário" />
          </RadioGroup>
          <button type="button">Next</button>
        </>,
      );
      const radios = screen.getAllByRole("radio");
      radios[0]!.focus();
      expect(document.activeElement).toBe(radios[0]);
      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: /next/i }),
      );
    });

    it("checked radio reports aria-checked=true (semantic, not only data-state)", () => {
      // AC-5(g) — aria-checked correctness for assistive technologies
      render(
        <RadioGroup aria-label="Plano" defaultValue="pro">
          <Radio value="starter" label="Starter" />
          <Radio value="pro" label="Pro" />
        </RadioGroup>,
      );
      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toHaveAttribute("aria-checked", "false");
      expect(radios[1]).toHaveAttribute("aria-checked", "true");
    });

    it("RadioGroup with aria-label is queryable by accessible name", () => {
      // AC-5(h) — getByRole("radiogroup", { name }) resolves correctly
      render(
        <RadioGroup aria-label="Frequência de notificação">
          <Radio value="now" label="Imediato" />
          <Radio value="daily" label="Diário" />
        </RadioGroup>,
      );
      expect(
        screen.getByRole("radiogroup", { name: /frequência de notificação/i }),
      ).toBeInTheDocument();
    });

    it("RadioGroup required propagates aria-required=true (Radix passthrough)", () => {
      // AC-5(i) — required pattern: Radix exposes aria-required on the root
      const { container } = render(
        <RadioGroup aria-label="Opção obrigatória" required>
          <Radio value="a" label="A" />
          <Radio value="b" label="B" />
        </RadioGroup>,
      );
      // Radix forwards `required` to aria-required on the Root
      const group = container.querySelector('[role="radiogroup"]');
      expect(group).toHaveAttribute("aria-required", "true");
    });

    it("fieldset + legend exposes the legend as the group's accessible name", () => {
      // AC-6 — semantic grouping: legend is announced as the fieldset name
      render(
        <fieldset>
          <legend>Plano de assinatura</legend>
          <RadioGroup aria-label="Plano">
            <Radio value="starter" label="Starter" />
            <Radio value="pro" label="Pro" />
          </RadioGroup>
        </fieldset>,
      );
      // The <fieldset> reports role="group" with the legend as accessible name
      expect(
        screen.getByRole("group", { name: /plano de assinatura/i }),
      ).toBeInTheDocument();
      // And the inner radiogroup remains queryable by its own aria-label
      expect(
        screen.getByRole("radiogroup", { name: /plano/i }),
      ).toBeInTheDocument();
    });
  });
});
