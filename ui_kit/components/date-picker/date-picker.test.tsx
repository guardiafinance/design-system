import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import {
  DatePicker,
  formatDateBR,
  formatRangeBR,
  type DateRange,
} from "./index";

/**
 * Plan #41 — DatePicker v0.1.0 DoD closeout.
 *
 * AC-1   component readiness: frozen public surface (verified at Gate 2 by
 *        `git diff` on index.tsx).
 * AC-2   Storybook coverage in light + dark, including new `OpenInDialog`
 *        and `DarkTheme` stories (visual, owned by Storybook build).
 * AC-3   playground side-by-side (manual at /componentes/date-picker).
 * AC-4   behavioral tests with accessible queries; ≥ 20 tests; no internal
 *        mocks; clock determinism for "today" — annotated below with
 *        AC-4(letter).
 * AC-5   jest-axe in light + dark via `axeInThemes` — annotated below with
 *        AC-5(letter).
 * AC-6   Brand × Notion (manual cross-check, summarized in PR body and
 *        06-quality-report.md).
 * AC-7   quality gate (typecheck / lint / test / build / docs:build).
 * AC-8   Fernando approval recorded in PR.
 */

// AC-4(z) — clock determinism: fix "today" for the entire suite so the
// component's internal `new Date()` (used by `pickToday` and the initial
// `viewMonth`) is deterministic. Required by lex-test-isolation § 4 — any
// test that asserts on "today" MUST run against a known clock. Scope: entire
// file (other tests use explicit dates and are insensitive to the freeze).
const FROZEN_NOW = new Date(2026, 4, 15, 12, 0, 0); // 2026-05-15 12:00 local

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(FROZEN_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatDateBR", () => {
  // AC-4(a) — pure formatter contract
  it("formata Date como dd/mm/yyyy", () => {
    expect(formatDateBR(new Date(2025, 0, 7))).toBe("07/01/2025");
    expect(formatDateBR(new Date(2025, 11, 31))).toBe("31/12/2025");
  });

  // AC-4(a) — pure formatter contract (null / undefined)
  it("retorna string vazia para null/undefined", () => {
    expect(formatDateBR(null)).toBe("");
    expect(formatDateBR(undefined)).toBe("");
  });
});

describe("DatePicker", () => {
  // AC-4(b) — trigger render + placeholder
  it("renderiza trigger com placeholder padrão", () => {
    render(<DatePicker />);
    expect(screen.getByText("dd/mm/aaaa")).toBeInTheDocument();
  });

  // AC-4(b) — placeholder override
  it("aceita placeholder customizado", () => {
    render(<DatePicker placeholder="Selecione uma data" />);
    expect(screen.getByText("Selecione uma data")).toBeInTheDocument();
  });

  // AC-4(c) — aria contract: haspopup + default label
  it("trigger expõe aria-haspopup=dialog e aria-label default", () => {
    render(<DatePicker />);
    const trigger = screen.getByRole("button", { name: "Selecionar data" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  // AC-4(c) — aria-label customization
  it("aria-label customizada respeitada", () => {
    render(<DatePicker aria-label="Data de vencimento" />);
    expect(
      screen.getByRole("button", { name: "Data de vencimento" }),
    ).toBeInTheDocument();
  });

  // AC-4(d) — open dialog on trigger click
  it("clique no trigger abre o popover (role=dialog)", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DatePicker />);
    await user.click(
      screen.getByRole("button", { name: "Selecionar data" }),
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  // AC-4(e) — defaultValue formatting in trigger
  it("defaultValue aparece no trigger formatado dd/mm/yyyy", () => {
    render(<DatePicker defaultValue={new Date(2025, 2, 15)} />);
    expect(screen.getByText("15/03/2025")).toBeInTheDocument();
  });

  // AC-4(f) — controlled mode respects value prop
  it("modo controlled respeita value", () => {
    const { rerender } = render(<DatePicker value={new Date(2025, 0, 1)} />);
    expect(screen.getByText("01/01/2025")).toBeInTheDocument();
    rerender(<DatePicker value={new Date(2025, 5, 30)} />);
    expect(screen.getByText("30/06/2025")).toBeInTheDocument();
  });

  // AC-4(g) — clear calls onChange(null)
  it("clear (X) chama onChange com null", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(
      <DatePicker
        defaultValue={new Date(2025, 0, 7)}
        onChange={onChange}
        clearable
      />,
    );
    await user.click(screen.getByLabelText("Limpar data"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  // AC-4(g) — clear hidden without value
  it("clear não aparece sem valor", () => {
    render(<DatePicker clearable />);
    expect(screen.queryByLabelText("Limpar data")).not.toBeInTheDocument();
  });

  // AC-4(g) — clearable=false hides clear even with value
  it("clearable=false esconde o X mesmo com valor", () => {
    render(<DatePicker defaultValue={new Date()} clearable={false} />);
    expect(screen.queryByLabelText("Limpar data")).not.toBeInTheDocument();
  });

  // AC-4(h) — disabled blocks open
  it("disabled bloqueia abertura", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DatePicker disabled />);
    await user.click(
      screen.getByRole("button", { name: "Selecionar data" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // AC-4(i) — invalid sets data-invalid
  it("invalid aplica data-invalid", () => {
    // Lex jsx-a11y/role-supports-aria-props proíbe aria-invalid em role=button
    // (implícito em <button>); o trigger usa data-invalid como hook de estilo
    // e o aviso a11y para invalid fica no Field/Form layer (aria-describedby
    // apontando para a mensagem de erro).
    render(<DatePicker invalid />);
    expect(
      screen.getByRole("button", { name: "Selecionar data" }),
    ).toHaveAttribute("data-invalid", "true");
  });

  // AC-4(j) — form submission via hidden ISO input
  it("name renderiza input hidden em formato ISO", () => {
    const { container } = render(
      <DatePicker
        defaultValue={new Date(2025, 2, 15)}
        name="due_date"
      />,
    );
    const hidden = container.querySelector("input[type='hidden']");
    expect(hidden).toHaveAttribute("name", "due_date");
    expect(hidden).toHaveAttribute("value", "2025-03-15");
  });

  // AC-4(j) — hidden input empty when no value
  it("name vazio quando sem valor renderiza input hidden vazio", () => {
    const { container } = render(<DatePicker name="due_date" />);
    const hidden = container.querySelector("input[type='hidden']");
    expect(hidden).toHaveAttribute("value", "");
  });

  // AC-4(k) — size variants emit distinct classes
  it("size=sm aplica h-8", () => {
    render(<DatePicker size="sm" />);
    expect(
      screen.getByRole("button", { name: "Selecionar data" }),
    ).toHaveClass("h-8");
  });

  it("size=lg aplica h-[46px]", () => {
    render(<DatePicker size="lg" />);
    expect(
      screen.getByRole("button", { name: "Selecionar data" }),
    ).toHaveClass("h-[46px]");
  });

  // AC-4(l) — click on day selects + closes (uncontrolled)
  it("clique em dia seleciona e fecha (uncontrolled)", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    /* Force fixed viewMonth so day 15 is visible. */
    render(
      <DatePicker
        onChange={onChange}
        defaultValue={new Date(2025, 5, 1)}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: "Selecionar data" }),
    );
    await screen.findByRole("dialog");
    /* DayPicker renders days as clickable buttons with the day number */
    const day15 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "15");
    expect(day15).toBeDefined();
    await user.click(day15!);
    expect(onChange).toHaveBeenCalled();
    const arg = onChange.mock.calls[0]![0] as Date;
    expect(arg.getDate()).toBe(15);
    expect(arg.getMonth()).toBe(5);
    expect(arg.getFullYear()).toBe(2025);
  });

  // AC-4(m) — today button renders by default
  it("botão 'Hoje' renderizado quando showToday=true (default)", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DatePicker />);
    await user.click(
      screen.getByRole("button", { name: "Selecionar data" }),
    );
    expect(await screen.findByRole("button", { name: "Hoje" }))
      .toBeInTheDocument();
  });

  // AC-4(m) — today button hidden when showToday=false
  it("showToday=false esconde o botão Hoje", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DatePicker showToday={false} />);
    await user.click(
      screen.getByRole("button", { name: "Selecionar data" }),
    );
    await screen.findByRole("dialog");
    expect(screen.queryByRole("button", { name: "Hoje" })).not.toBeInTheDocument();
  });

  // AC-4(n) — "Hoje" picks today and closes — deterministic via FROZEN_NOW
  it("'Hoje' chama onChange com data de hoje e fecha", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} />);
    await user.click(
      screen.getByRole("button", { name: "Selecionar data" }),
    );
    await user.click(await screen.findByRole("button", { name: "Hoje" }));
    expect(onChange).toHaveBeenCalled();
    const arg = onChange.mock.calls[0]![0] as Date;
    // Determinism guarantee: clock frozen at FROZEN_NOW (2026-05-15).
    expect(arg.getDate()).toBe(FROZEN_NOW.getDate());
    expect(arg.getMonth()).toBe(FROZEN_NOW.getMonth());
    expect(arg.getFullYear()).toBe(FROZEN_NOW.getFullYear());
  });

  // AC-4(o) — Escape dismisses dialog
  it("Escape fecha o dialog", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DatePicker />);
    await user.click(screen.getByRole("button", { name: "Selecionar data" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  // AC-4(p) — min/max bounds disable out-of-range days
  it("minDate desabilita dias anteriores ao limite", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // June 2025 view, minDate = June 10 → days 1..9 must be disabled.
    render(
      <DatePicker
        defaultValue={new Date(2025, 5, 15)}
        minDate={new Date(2025, 5, 10)}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Selecionar data" }));
    await screen.findByRole("dialog");
    const day5 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "5") as HTMLButtonElement | undefined;
    expect(day5).toBeDefined();
    expect(day5!.disabled).toBe(true);
  });

  it("maxDate desabilita dias posteriores ao limite", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // June 2025 view, maxDate = June 20 → days 21..30 must be disabled.
    render(
      <DatePicker
        defaultValue={new Date(2025, 5, 15)}
        maxDate={new Date(2025, 5, 20)}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Selecionar data" }));
    await screen.findByRole("dialog");
    const day25 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "25") as HTMLButtonElement | undefined;
    expect(day25).toBeDefined();
    expect(day25!.disabled).toBe(true);
  });

  // AC-4(q) — keyboard month navigation via prev/next nav buttons
  it("navegação de mês via botões prev/next altera o caption do mês", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DatePicker defaultValue={new Date(2025, 5, 15)} />);
    await user.click(screen.getByRole("button", { name: "Selecionar data" }));
    await screen.findByRole("dialog");
    // June 2025 (pt-BR locale) → "junho 2025"
    expect(screen.getByText(/junho 2025/i)).toBeInTheDocument();
    // Click the next-month chevron (DayPicker renders it via button_next class).
    const dialog = screen.getByRole("dialog");
    const navButtons = dialog.querySelectorAll("button[aria-label]");
    const nextBtn = Array.from(navButtons).find((b) =>
      /next|próx/i.test(b.getAttribute("aria-label") ?? ""),
    ) as HTMLButtonElement | undefined;
    expect(nextBtn).toBeDefined();
    await user.click(nextBtn!);
    expect(screen.getByText(/julho 2025/i)).toBeInTheDocument();
  });

  describe("brand-aware tokens", () => {
    // AC-4(r) — trigger uses brand-token classes, no hardcoded palette
    it("trigger usa border-action no hover + estado aberto (sem guardia-purple hardcoded)", () => {
      render(<DatePicker />);
      const trigger = screen.getByRole("button", { name: "Selecionar data" });
      expect(trigger.className).toMatch(/hover:border-action/);
      expect(trigger.className).toMatch(/data-\[state=open\]:border-action/);
      expect(trigger.className).not.toMatch(/guardia-purple-(100|500|700)/);
    });

    // AC-4(r) — hover gated by `enabled:` modifier (per #169)
    it("trigger gates hover via `enabled:` modifier (no `disabled:hover:` override, per #169)", () => {
      // WHY: enabled:hover:border-action substitui o par verboso
      // hover:border-action + disabled:hover:border-border-strong. Ver #169.
      render(<DatePicker />);
      const trigger = screen.getByRole("button", { name: "Selecionar data" });
      expect(trigger.className).toMatch(/enabled:hover:border-action/);
      expect(trigger.className).not.toMatch(/disabled:hover:/);
    });

    // AC-4(s) — selected day uses bg-action + text-button-fg
    it("dia selecionado renderiza com bg-action + text-button-fg", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<DatePicker defaultValue={new Date(2025, 5, 15)} />);
      await user.click(
        screen.getByRole("button", { name: "Selecionar data" }),
      );
      await screen.findByRole("dialog");
      /* DayPicker applies the `selected` class on the <td> (gridcell), which
         carries `bg-action` + `text-button-fg` via the [&_button] selector. */
      const day15Button = screen
        .getAllByRole("button")
        .find((b) => b.textContent?.trim() === "15");
      expect(day15Button).not.toBeUndefined();
      const gridcell = day15Button?.closest("td");
      expect(gridcell).not.toBeNull();
      expect(gridcell?.className ?? "").toMatch(/bg-action/);
      expect(gridcell?.className ?? "").toMatch(/text-button-fg/);
      expect(gridcell?.className ?? "").not.toMatch(/guardia-purple-500/);
      expect(gridcell?.className ?? "").not.toMatch(/\btext-white\b/);
    });

    // AC-4(t) — "Hoje" footer uses text-action + brand-aware hover
    it("botão 'Hoje' usa text-action + hover:bg-bg-hover (sem guardia-purple hardcoded)", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<DatePicker />);
      await user.click(
        screen.getByRole("button", { name: "Selecionar data" }),
      );
      const today = await screen.findByRole("button", { name: "Hoje" });
      expect(today.className).toMatch(/text-action/);
      expect(today.className).toMatch(/hover:bg-bg-hover/);
      expect(today.className).not.toMatch(/guardia-purple-(100|500|700)/);
    });
  });

  describe("a11y", () => {
    // AC-5(a) — closed Default (trigger only) — light + dark
    it("não tem violações WCAG 2.1 AA em light + dark (trigger vazio)", async () => {
      const { container } = render(<DatePicker />);
      await axeInThemes(container);
    });

    // AC-5(b) — closed with value + clear visible — light + dark
    it("não tem violações WCAG 2.1 AA em light + dark (com valor + clear)", async () => {
      const { container } = render(
        <DatePicker
          defaultValue={new Date(2025, 5, 15)}
          aria-label="Data de vencimento"
        />,
      );
      await axeInThemes(container);
    });

    // AC-5(c) — invalid state — light + dark
    it("não tem violações WCAG 2.1 AA em light + dark (invalid)", async () => {
      const { container } = render(
        <DatePicker invalid aria-label="Data de vencimento" />,
      );
      await axeInThemes(container);
    });

    // AC-5(d) — disabled — light + dark
    it("não tem violações WCAG 2.1 AA em light + dark (disabled)", async () => {
      const { container } = render(
        <DatePicker disabled aria-label="Data de vencimento" />,
      );
      await axeInThemes(container);
    });

    // AC-5(e) — open dialog with selected day — light + dark
    it("não tem violações WCAG 2.1 AA em light + dark (dialog aberto com dia selecionado)", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { container } = render(
        <DatePicker defaultValue={new Date(2025, 5, 15)} />,
      );
      await user.click(
        screen.getByRole("button", { name: "Selecionar data" }),
      );
      await screen.findByRole("dialog");
      await axeInThemes(container);
    });

    // AC-5(f) — open dialog without value — light + dark
    it("não tem violações WCAG 2.1 AA em light + dark (dialog aberto sem valor)", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { container } = render(<DatePicker />);
      await user.click(
        screen.getByRole("button", { name: "Selecionar data" }),
      );
      await screen.findByRole("dialog");
      await axeInThemes(container);
    });

    // AC-5(g) — open dialog with min/max bounds (disabled-dates visible) — light + dark
    it("não tem violações WCAG 2.1 AA em light + dark (dialog aberto com min/max)", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { container } = render(
        <DatePicker
          defaultValue={new Date(2025, 5, 15)}
          minDate={new Date(2025, 5, 10)}
          maxDate={new Date(2025, 5, 20)}
          aria-label="Próximos 10 dias"
        />,
      );
      await user.click(
        screen.getByRole("button", { name: "Próximos 10 dias" }),
      );
      await screen.findByRole("dialog");
      await axeInThemes(container);
    });
  });
});

/* =========================================================================
   Range mode — Plan #220 (ADR-004)
   =========================================================================
   Clock determinism: reuses the top-level FROZEN_NOW + global
   beforeEach/afterEach declared at the top of this file (Plan #41 closeout).
   The same clock fixture covers single-mode and range-mode suites — keeping
   one source of truth per `lex-test-isolation` § 1 (known initial state). */

describe("formatRangeBR", () => {
  it("formata range completo como dd/mm/yyyy — dd/mm/yyyy", () => {
    expect(
      formatRangeBR({
        from: new Date(2026, 2, 1),
        to: new Date(2026, 2, 15),
      }),
    ).toBe("01/03/2026 — 15/03/2026");
  });

  it("retorna string vazia para null/undefined", () => {
    expect(formatRangeBR(null)).toBe("");
    expect(formatRangeBR(undefined)).toBe("");
  });

  it("retorna string vazia para range incompleto (defesa em profundidade)", () => {
    /* The public DateRange type requires both endpoints; this asserts the
       defensive guard handles partial shapes that may sneak in via `any`
       at consumer boundaries. */
    expect(
      formatRangeBR({ from: new Date(2026, 2, 1) } as unknown as DateRange),
    ).toBe("");
  });
});

describe("DatePicker — range mode (Plan #220, ADR-004)", () => {
  /* Clock determinism inherited from the top-level beforeEach/afterEach. */

  /* ----------------------------- API surface ------------------------------ */

  it("AC-1: mode default é single — DatePicker sem mode renderiza no formato single", () => {
    render(<DatePicker defaultValue={new Date(2026, 4, 15)} />);
    /* Single mode formats with no em-dash separator. */
    expect(screen.getByText("15/05/2026")).toBeInTheDocument();
    /* aria-label defaults to single-mode copy. */
    expect(
      screen.getByRole("button", { name: "Selecionar data" }),
    ).toBeInTheDocument();
  });

  it("AC-2: range mode aria-label default é 'Selecionar intervalo de datas'", () => {
    render(<DatePicker mode="range" />);
    expect(
      screen.getByRole("button", { name: "Selecionar intervalo de datas" }),
    ).toBeInTheDocument();
  });

  it("AC-2: range mode controlled respeita value (DateRange shape)", () => {
    const range: DateRange = {
      from: new Date(2026, 2, 1),
      to: new Date(2026, 2, 15),
    };
    const { rerender } = render(<DatePicker mode="range" value={range} />);
    expect(screen.getByText("01/03/2026 — 15/03/2026")).toBeInTheDocument();
    rerender(
      <DatePicker
        mode="range"
        value={{ from: new Date(2026, 5, 1), to: new Date(2026, 5, 30) }}
      />,
    );
    expect(screen.getByText("01/06/2026 — 30/06/2026")).toBeInTheDocument();
  });

  it("AC-3: DateRange type é exportada e tipa estado do consumer", () => {
    /* Type-level smoke test — if the type weren't exported, this file
       wouldn't compile. The runtime assertion ensures the type lines up
       with the runtime shape. */
    const r: DateRange = {
      from: new Date(2026, 2, 1),
      to: new Date(2026, 2, 15),
    };
    expect(r.from).toBeInstanceOf(Date);
    expect(r.to).toBeInstanceOf(Date);
  });

  /* --------------------------- Trigger display ---------------------------- */

  it("AC-4: range vazio renderiza placeholder default 'dd/mm/aaaa — dd/mm/aaaa'", () => {
    render(<DatePicker mode="range" />);
    expect(
      screen.getByText("dd/mm/aaaa — dd/mm/aaaa"),
    ).toBeInTheDocument();
  });

  it("AC-4: placeholder customizado em range mode", () => {
    render(
      <DatePicker mode="range" placeholder="Selecione o período" />,
    );
    expect(screen.getByText("Selecione o período")).toBeInTheDocument();
  });

  it("AC-5: range completo formata 'dd/mm/aaaa — dd/mm/aaaa'", () => {
    render(
      <DatePicker
        mode="range"
        defaultValue={{
          from: new Date(2026, 2, 1),
          to: new Date(2026, 2, 15),
        }}
      />,
    );
    expect(screen.getByText("01/03/2026 — 15/03/2026")).toBeInTheDocument();
  });

  it("AC-6: estado parcial formata 'dd/mm/aaaa — ' (em dash + espaço)", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DatePicker mode="range" defaultValue={null} />);
    await user.click(
      screen.getByRole("button", { name: "Selecionar intervalo de datas" }),
    );
    await screen.findByRole("dialog");
    /* Pick day 10 of May/2026 (current view per FROZEN_NOW). */
    const day10 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "10");
    expect(day10).toBeDefined();
    await user.click(day10!);
    /* Trigger should now show partial state. Testing Library normalizes
       whitespace by default — collapses trailing space — so we match
       the rendered text in normalized form: "10/05/2026 —". */
    expect(screen.getByText("10/05/2026 —")).toBeInTheDocument();
  });

  /* ------------------------------ Selection ------------------------------- */

  it("AC-7: primeiro clique commit como pending; onChange NÃO dispara", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(
      <DatePicker mode="range" defaultValue={null} onChange={onChange} />,
    );
    await user.click(
      screen.getByRole("button", { name: "Selecionar intervalo de datas" }),
    );
    await screen.findByRole("dialog");
    const day10 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "10");
    await user.click(day10!);
    expect(onChange).not.toHaveBeenCalled();
    /* Popover stays open awaiting the second click. */
    expect(screen.queryByRole("dialog")).toBeInTheDocument();
  });

  it("AC-8: segundo clique commit range completo, popover permanece aberto pra verificação visual, onChange dispara uma vez", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(
      <DatePicker mode="range" defaultValue={null} onChange={onChange} />,
    );
    await user.click(
      screen.getByRole("button", { name: "Selecionar intervalo de datas" }),
    );
    await screen.findByRole("dialog");
    const day10 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "10");
    await user.click(day10!);
    const day20 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "20");
    await user.click(day20!);
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0]![0] as DateRange;
    expect(arg.from.getDate()).toBe(10);
    expect(arg.to.getDate()).toBe(20);
    expect(arg.from.getMonth()).toBe(4); /* May = 4 */
    expect(arg.to.getMonth()).toBe(4);
    /* WHY: range mode does NOT auto-close after second pick — user needs
     * to verify the highlighted range visually before dismissing via
     * Esc/click-outside. Single mode keeps auto-close because there is
     * nothing to verify after one pick. */
    expect(screen.queryByRole("dialog")).toBeInTheDocument();
  });

  it("AC-9: to < from auto-swap antes de disparar onChange", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(
      <DatePicker mode="range" defaultValue={null} onChange={onChange} />,
    );
    await user.click(
      screen.getByRole("button", { name: "Selecionar intervalo de datas" }),
    );
    await screen.findByRole("dialog");
    /* User picks 20 then 10 — auto-swap should produce { from: 10, to: 20 }. */
    const day20 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "20");
    await user.click(day20!);
    const day10 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "10");
    await user.click(day10!);
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0]![0] as DateRange;
    expect(arg.from.getDate()).toBe(10);
    expect(arg.to.getDate()).toBe(20);
  });

  it("AC-10: Esc com pending descarta seleção parcial e fecha (onChange NÃO dispara)", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(
      <DatePicker mode="range" defaultValue={null} onChange={onChange} />,
    );
    await user.click(
      screen.getByRole("button", { name: "Selecionar intervalo de datas" }),
    );
    await screen.findByRole("dialog");
    const day10 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "10");
    await user.click(day10!);
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(onChange).not.toHaveBeenCalled();
    /* Trigger reverts to placeholder; partial display gone. */
    expect(
      screen.getByText("dd/mm/aaaa — dd/mm/aaaa"),
    ).toBeInTheDocument();
  });

  it("AC-11: clear (X) reseta range para null e dispara onChange", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(
      <DatePicker
        mode="range"
        defaultValue={{
          from: new Date(2026, 2, 1),
          to: new Date(2026, 2, 15),
        }}
        onChange={onChange}
        clearable
      />,
    );
    await user.click(screen.getByLabelText("Limpar intervalo"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  /* ------------------------------ Validation ------------------------------ */

  it("AC-12: minDate / maxDate desabilita dias fora do range em ambos os endpoints", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const minDate = new Date(2026, 4, 10); /* 10/May/2026 */
    const maxDate = new Date(2026, 4, 20); /* 20/May/2026 */
    render(<DatePicker mode="range" minDate={minDate} maxDate={maxDate} />);
    await user.click(
      screen.getByRole("button", { name: "Selecionar intervalo de datas" }),
    );
    await screen.findByRole("dialog");
    /* Day 5 of May falls outside the [10, 20] window — should be disabled. */
    const day5 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "5");
    expect(day5).toBeDefined();
    expect(day5).toBeDisabled();
    /* Day 25 outside as well. */
    const day25 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "25");
    expect(day25).toBeDefined();
    expect(day25).toBeDisabled();
    /* Day 15 inside the window — enabled. */
    const day15 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "15");
    expect(day15).toBeDefined();
    expect(day15).not.toBeDisabled();
  });

  it("AC-13: invalid aplica data-invalid no trigger em range mode", () => {
    render(<DatePicker mode="range" invalid />);
    expect(
      screen.getByRole("button", { name: "Selecionar intervalo de datas" }),
    ).toHaveAttribute("data-invalid", "true");
  });

  /* -------------------------- Brand-aware tokens -------------------------- */

  describe("brand-aware tokens (AC-19, AC-20)", () => {
    it("AC-19: range edges (from/to) usam bg-action + text-button-fg", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <DatePicker
          mode="range"
          defaultValue={{
            from: new Date(2026, 4, 10),
            to: new Date(2026, 4, 20),
          }}
        />,
      );
      await user.click(
        screen.getByRole("button", {
          name: "Selecionar intervalo de datas",
        }),
      );
      await screen.findByRole("dialog");
      const day10 = screen
        .getAllByRole("button")
        .find((b) => b.textContent?.trim() === "10");
      const day20 = screen
        .getAllByRole("button")
        .find((b) => b.textContent?.trim() === "20");
      const startCell = day10?.closest("td");
      const endCell = day20?.closest("td");
      expect(startCell?.className ?? "").toMatch(/bg-action/);
      expect(startCell?.className ?? "").toMatch(/text-button-fg/);
      expect(endCell?.className ?? "").toMatch(/bg-action/);
      expect(endCell?.className ?? "").toMatch(/text-button-fg/);
    });

    it("AC-19: range middle usa bg-bg-hover (soft surface tint)", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <DatePicker
          mode="range"
          defaultValue={{
            from: new Date(2026, 4, 10),
            to: new Date(2026, 4, 20),
          }}
        />,
      );
      await user.click(
        screen.getByRole("button", {
          name: "Selecionar intervalo de datas",
        }),
      );
      await screen.findByRole("dialog");
      const day15 = screen
        .getAllByRole("button")
        .find((b) => b.textContent?.trim() === "15");
      const middleCell = day15?.closest("td");
      expect(middleCell?.className ?? "").toMatch(/bg-bg-hover/);
    });

    it("AC-20: range edges não vazam literais legacy (guardia-purple-*, hardcoded text-white)", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <DatePicker
          mode="range"
          defaultValue={{
            from: new Date(2026, 4, 10),
            to: new Date(2026, 4, 20),
          }}
        />,
      );
      await user.click(
        screen.getByRole("button", {
          name: "Selecionar intervalo de datas",
        }),
      );
      await screen.findByRole("dialog");
      const day10 = screen
        .getAllByRole("button")
        .find((b) => b.textContent?.trim() === "10");
      const startCell = day10?.closest("td");
      expect(startCell?.className ?? "").not.toMatch(/guardia-purple-(100|500|700)/);
      expect(startCell?.className ?? "").not.toMatch(/guardia-violet-(100|500|700)/);
      expect(startCell?.className ?? "").not.toMatch(/\btext-white\b/);
    });
  });

  /* ------------------------------ a11y matrix ----------------------------- */

  describe("a11y (AC-16)", () => {
    it("não tem violações WCAG 2.1 AA em light + dark (range vazio)", async () => {
      const { container } = render(<DatePicker mode="range" />);
      await axeInThemes(container);
    });

    it("não tem violações WCAG 2.1 AA em light + dark (range completo)", async () => {
      const { container } = render(
        <DatePicker
          mode="range"
          defaultValue={{
            from: new Date(2026, 2, 1),
            to: new Date(2026, 2, 15),
          }}
          aria-label="Período de competência"
        />,
      );
      await axeInThemes(container);
    });

    it("não tem violações WCAG 2.1 AA em light + dark (dialog aberto com range destacado)", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { container } = render(
        <DatePicker
          mode="range"
          defaultValue={{
            from: new Date(2026, 4, 10),
            to: new Date(2026, 4, 20),
          }}
        />,
      );
      await user.click(
        screen.getByRole("button", {
          name: "Selecionar intervalo de datas",
        }),
      );
      await screen.findByRole("dialog");
      await axeInThemes(container);
    });
  });
});
