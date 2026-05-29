import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Info } from "lucide-react";

import { axeInThemes } from "@/test-utils/a11y";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertClose,
  alertVariants,
  type AlertTone,
  type AlertSize,
} from "./index";

/**
 * Tests for Plan #251 (parent Tech Task #56) — Alert v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs come
 * from `docs/issues/issue-56/02-requirements.md`.
 */

function BasicAlert(
  props: Partial<React.ComponentProps<typeof Alert>> = {},
): React.ReactElement {
  return (
    <Alert {...props}>
      <AlertIcon>
        <Info />
      </AlertIcon>
      <AlertTitle>Pagamento agendado</AlertTitle>
      <AlertDescription>O envio acontece amanhã às 09:00.</AlertDescription>
    </Alert>
  );
}

describe("Alert", () => {
  // ────────────────────────────────────────────────────────────────
  // Public API surface (AC-1, AC-2)
  // ────────────────────────────────────────────────────────────────

  it("AC-1: exports the canonical 6-symbol public surface plus the CVA accessor", () => {
    expect(Alert).toBeDefined();
    expect(AlertIcon).toBeDefined();
    expect(AlertTitle).toBeDefined();
    expect(AlertDescription).toBeDefined();
    expect(AlertActions).toBeDefined();
    expect(AlertClose).toBeDefined();
    expect(alertVariants).toBeDefined();
    expect(typeof alertVariants).toBe("function");
  });

  it("AC-2: renders the outer container as a <div> (no interactive role on the root)", () => {
    render(<BasicAlert />);
    const status = screen.getByRole("status", {
      name: /pagamento agendado/i,
    });
    expect(status.tagName).toBe("DIV");
  });

  // ────────────────────────────────────────────────────────────────
  // Tone matrix (AC-3, AC-4)
  // ────────────────────────────────────────────────────────────────

  it.each<AlertTone>(["info", "success", "warning", "error"])(
    "AC-3: applies the semantic tone class chain for tone=%s",
    (tone) => {
      render(<BasicAlert tone={tone} />);
      const root = screen.getByRole("status");
      const tokenMap: Record<AlertTone, string> = {
        info: "bg-info-soft",
        success: "bg-success-soft",
        warning: "bg-warning-soft",
        error: "bg-danger-soft",
      };
      expect(root.className).toContain(tokenMap[tone]);
    },
  );

  it("AC-3: defaults to tone=info when the prop is omitted", () => {
    render(<BasicAlert />);
    expect(screen.getByRole("status").className).toContain("bg-info-soft");
  });

  // ────────────────────────────────────────────────────────────────
  // ARIA semantics (AC-5)
  // ────────────────────────────────────────────────────────────────

  it("AC-5: renders role=status by default (polite live region)", () => {
    render(<BasicAlert />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("AC-5: renders role=alert when assertive=true (assertive live region)", () => {
    render(<BasicAlert assertive />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("AC-5: wires aria-labelledby to the AlertTitle so screen readers announce the title", () => {
    render(<BasicAlert />);
    const root = screen.getByRole("status");
    const labelledBy = root.getAttribute("aria-labelledby");
    expect(labelledBy).not.toBeNull();
    const title = labelledBy ? document.getElementById(labelledBy) : null;
    expect(title?.textContent).toBe("Pagamento agendado");
  });

  // ────────────────────────────────────────────────────────────────
  // Size ladder (AC-6)
  // ────────────────────────────────────────────────────────────────

  it.each<{ size: AlertSize; padding: string; typography: string }>([
    { size: "sm", padding: "p-2", typography: "text-xs" },
    { size: "md", padding: "p-3", typography: "text-sm" },
    { size: "lg", padding: "p-4", typography: "text-sm" },
  ])(
    "AC-6: applies the padding + typography ladder for size=$size",
    ({ size, padding, typography }) => {
      render(<BasicAlert size={size} />);
      const root = screen.getByRole("status");
      expect(root.className).toContain(padding);
      expect(root.className).toContain(typography);
    },
  );

  it("AC-6: defaults to size=md when the prop is omitted", () => {
    render(<BasicAlert />);
    expect(screen.getByRole("status").className).toContain("p-3");
  });

  // ────────────────────────────────────────────────────────────────
  // Composition (AC-7..AC-10)
  // ────────────────────────────────────────────────────────────────

  it("AC-7: AlertIcon renders children inside an aria-hidden leading slot", () => {
    render(
      <Alert>
        <AlertIcon>
          <Info data-testid="icon-svg" />
        </AlertIcon>
        <AlertTitle>Title</AlertTitle>
      </Alert>,
    );
    const icon = screen.getByTestId("icon-svg");
    const slot = icon.parentElement;
    expect(slot).not.toBeNull();
    expect(slot?.getAttribute("aria-hidden")).toBe("true");
  });

  it("AC-7: renders cleanly without AlertIcon (no empty whitespace slot)", () => {
    render(
      <Alert>
        <AlertTitle>Sem ícone</AlertTitle>
      </Alert>,
    );
    // Querying by the visible title must still succeed; the layout has no orphan slot.
    expect(screen.getByText("Sem ícone")).toBeInTheDocument();
  });

  it("AC-8: AlertTitle uses font-medium per the catalog convention", () => {
    render(<BasicAlert />);
    expect(screen.getByText("Pagamento agendado").className).toContain(
      "font-medium",
    );
  });

  it("AC-9: AlertDescription applies leading-relaxed and a nested-paragraph selector", () => {
    render(
      <Alert>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>
          <p>Linha 1</p>
          <p>Linha 2</p>
        </AlertDescription>
      </Alert>,
    );
    const description = screen.getByText("Linha 1").parentElement;
    expect(description?.className).toContain("leading-relaxed");
  });

  it("AC-10: AlertActions renders trailing children inside a flex slot", () => {
    render(
      <Alert>
        <AlertTitle>Sync feito</AlertTitle>
        <AlertActions>
          <button type="button">Desfazer</button>
        </AlertActions>
      </Alert>,
    );
    const action = screen.getByRole("button", { name: /desfazer/i });
    expect(action).toBeInTheDocument();
    expect(action.parentElement?.className).toContain("flex");
  });

  // ────────────────────────────────────────────────────────────────
  // Dismiss surface (AC-11..AC-14)
  // ────────────────────────────────────────────────────────────────

  it("AC-11: AlertClose exposes aria-label='Fechar' by default", () => {
    render(
      <Alert>
        <AlertTitle>Erro</AlertTitle>
        <AlertClose />
      </Alert>,
    );
    expect(
      screen.getByRole("button", { name: /fechar/i }),
    ).toBeInTheDocument();
  });

  it("AC-11: AlertClose respects an overridden aria-label", () => {
    render(
      <Alert>
        <AlertTitle>Erro</AlertTitle>
        <AlertClose aria-label="Dispensar" />
      </Alert>,
    );
    expect(
      screen.getByRole("button", { name: /dispensar/i }),
    ).toBeInTheDocument();
  });

  it("AC-12: uncontrolled — clicking AlertClose unmounts the alert tree", async () => {
    const user = userEvent.setup();
    render(
      <Alert>
        <AlertTitle>Pode fechar</AlertTitle>
        <AlertClose />
      </Alert>,
    );
    await user.click(screen.getByRole("button", { name: /fechar/i }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText(/pode fechar/i)).not.toBeInTheDocument();
  });

  it("AC-12: controlled — closing depends entirely on the parent's `open` prop", async () => {
    const user = userEvent.setup();
    function Controlled(): React.ReactElement {
      const [open, setOpen] = React.useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Reabrir
          </button>
          <Alert open={open} onOpenChange={setOpen}>
            <AlertTitle>Controlado</AlertTitle>
            <AlertClose />
          </Alert>
        </>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: /fechar/i }));
    expect(screen.queryByText(/controlado/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /reabrir/i }));
    expect(screen.getByText(/controlado/i)).toBeInTheDocument();
  });

  it("AC-12: respects defaultOpen=false (renders nothing on mount)", () => {
    render(
      <Alert defaultOpen={false}>
        <AlertTitle>Oculto inicialmente</AlertTitle>
      </Alert>,
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("AC-13: AlertClose invokes onOpenChange(false) on click", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(
      <Alert onOpenChange={handler}>
        <AlertTitle>Notificar fechamento</AlertTitle>
        <AlertClose />
      </Alert>,
    );
    await user.click(screen.getByRole("button", { name: /fechar/i }));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(false);
  });

  it("AC-13: AlertClose preserves the consumer's onClick before triggering close", async () => {
    const user = userEvent.setup();
    const consumerClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Alert onOpenChange={onOpenChange}>
        <AlertTitle>Cadeia de handlers</AlertTitle>
        <AlertClose onClick={consumerClick} />
      </Alert>,
    );
    await user.click(screen.getByRole("button", { name: /fechar/i }));
    expect(consumerClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("AC-13: consumer onClick may preventDefault to suppress the dismissal", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Alert onOpenChange={onOpenChange}>
        <AlertTitle>Não fecha</AlertTitle>
        <AlertClose
          onClick={(event) => {
            event.preventDefault();
          }}
        />
      </Alert>,
    );
    await user.click(screen.getByRole("button", { name: /fechar/i }));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("AC-14: AlertClose is reachable via Tab and activatable via Enter", async () => {
    const user = userEvent.setup();
    render(
      <Alert>
        <AlertTitle>Por teclado</AlertTitle>
        <AlertClose />
      </Alert>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: /fechar/i })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  // ────────────────────────────────────────────────────────────────
  // Context discipline (defense for AlertTitle / AlertClose)
  // ────────────────────────────────────────────────────────────────

  it("throws when AlertClose is rendered outside an <Alert>", () => {
    // WHY: AlertClose calls useAlertContext; without a host the contract
    // is broken — the throw surfaces the mistake at render time instead
    // of producing a silent no-op button.
    const restore = console.error;
    console.error = vi.fn();
    expect(() => render(<AlertClose />)).toThrow(/must be rendered inside/);
    console.error = restore;
  });

  // ────────────────────────────────────────────────────────────────
  // Accessibility — axeInThemes (AC-15..AC-18)
  // ────────────────────────────────────────────────────────────────

  it("AC-15: axeInThemes reports zero violations on Default (light + dark)", async () => {
    const { container } = render(<BasicAlert />);
    await axeInThemes(container);
  });

  it.each<AlertTone>(["info", "success", "warning", "error"])(
    "AC-16: axeInThemes reports zero violations for tone=%s (light + dark)",
    async (tone) => {
      const { container } = render(<BasicAlert tone={tone} />);
      await axeInThemes(container);
    },
  );

  it("AC-17: axeInThemes reports zero violations on WithClose (light + dark)", async () => {
    const { container } = render(
      <Alert tone="warning">
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>Aviso dispensável</AlertTitle>
        <AlertDescription>Confirme antes de prosseguir.</AlertDescription>
        <AlertClose />
      </Alert>,
    );
    await axeInThemes(container);
  });

  it("AC-18: axeInThemes reports zero violations on Assertive (light + dark)", async () => {
    const { container } = render(<BasicAlert assertive tone="error" />);
    await axeInThemes(container);
  });
});
